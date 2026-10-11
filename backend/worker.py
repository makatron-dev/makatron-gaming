"""
MAKATRON BROKER — MATCHING WORKER

Runs as a background process (separate from the FastAPI app).
Every SCAN_INTERVAL seconds:
  1. Fetches live prices from Bybit public API
  2. Finds all pending limit orders
  3. Fills orders whose limit price has been crossed by the market
  4. Updates balances, positions, and writes Trade records

Run locally:  python -m backend.worker
On Render:    set as a separate Background Worker service
"""

import asyncio
import httpx
from datetime import datetime
from decimal import Decimal
from sqlalchemy.orm import Session

from backend.database import SessionLocal
from backend import models


# ============================================
# CONFIG
# ============================================

SCAN_INTERVAL = 5  # seconds between scans
BYBIT_BASE = "https://api.bytick.com"
TRADE_FEE_RATE = Decimal("0.001")

# Map our symbols to Bybit spot ticker symbols
SYMBOL_TO_BYBIT = {
    "BTC/USDT": "BTCUSDT",
    "ETH/USDT": "ETHUSDT",
    "BNB/USDT": "BNBUSDT",
    "SOL/USDT": "SOLUSDT",
    "XRP/USDT": "XRPUSDT",
}


# ============================================
# PRICE FETCH
# ============================================

async def fetch_prices() -> dict:
    """
    Fetch live spot prices from Bybit.
    Returns dict like { "ETH/USDT": Decimal("2500.12"), ... }
    """
    url = f"{BYBIT_BASE}/v5/market/tickers?category=spot"
    async with httpx.AsyncClient(timeout=10) as client:
        res = await client.get(url)
        res.raise_for_status()
        data = res.json()

    if data.get("retCode") != 0:
        raise RuntimeError(f"Bybit error: {data.get('retMsg')}")

    tickers = data.get("result", {}).get("list", [])
    by_symbol = {t["symbol"]: t for t in tickers}

    prices = {}
    for our_symbol, bybit_symbol in SYMBOL_TO_BYBIT.items():
        t = by_symbol.get(bybit_symbol)
        if t and t.get("lastPrice"):
            try:
                prices[our_symbol] = Decimal(t["lastPrice"])
            except Exception:
                continue
    return prices


# ============================================
# BALANCE HELPERS  (mirror main.py)
# ============================================

def get_asset_balance(db: Session, user_id: int, asset: str):
    bal = (
        db.query(models.Balance)
        .filter(models.Balance.user_id == user_id, models.Balance.asset == asset)
        .first()
    )
    if not bal:
        bal = models.Balance(user_id=user_id, asset=asset, available=0, locked=0)
        db.add(bal)
        db.commit()
        db.refresh(bal)
    return bal


def get_position(db: Session, user_id: int, asset: str):
    pos = (
        db.query(models.Position)
        .filter(models.Position.user_id == user_id, models.Position.asset == asset)
        .first()
    )
    if not pos:
        pos = models.Position(
            user_id=user_id,
            asset=asset,
            quantity=Decimal("0"),
            avg_buy_price=Decimal("0"),
            realized_pnl=Decimal("0"),
            market_type="spot",
            side="long",
            leverage=Decimal("1"),
            margin_used=Decimal("0"),
        )
        db.add(pos)
        db.commit()
        db.refresh(pos)
    return pos


# ============================================
# FILL LOGIC  (mirror execute_trade from main.py)
# ============================================

def execute_fill(db: Session, order: models.Order, fill_price: Decimal):
    """
    Fill a limit order at fill_price.
    Unlocks the user's locked balance, credits the received asset,
    updates the position, and writes a Trade record.
    """
    base, quote = order.symbol.split("/")
    qty = Decimal(order.quantity)
    gross = qty * fill_price
    fee = gross * TRADE_FEE_RATE
    realized_pnl = Decimal("0")

    if order.side == "buy":
        # Received base asset (minus fee taken in base)
        received_base = qty * (Decimal("1") - TRADE_FEE_RATE)

        # Credit base
        base_bal = get_asset_balance(db, order.user_id, base)
        base_bal.available = Decimal(base_bal.available) + received_base

        # Unlock quote (locked at order placement as qty * limit_price)
        quote_bal = get_asset_balance(db, order.user_id, quote)
        locked_amount = qty * Decimal(order.price)
        quote_bal.locked = Decimal(quote_bal.locked) - locked_amount
        if quote_bal.locked < 0:
            quote_bal.locked = Decimal("0")
        db.commit()

        # Update position (weighted avg cost)
        pos = get_position(db, order.user_id, base)
        old_qty = Decimal(pos.quantity)
        old_cost = Decimal(pos.avg_buy_price)
        new_qty = old_qty + received_base
        if new_qty > 0:
            new_avg = (old_qty * old_cost + received_base * fill_price) / new_qty
        else:
            new_avg = Decimal("0")
        pos.quantity = new_qty
        pos.avg_buy_price = new_avg
        pos.margin_used = new_qty * new_avg
        db.commit()

    else:  # sell
        received_quote = gross * (Decimal("1") - TRADE_FEE_RATE)

        # Credit quote
        quote_bal = get_asset_balance(db, order.user_id, quote)
        quote_bal.available = Decimal(quote_bal.available) + received_quote

        # Unlock base (locked at order placement as qty)
        base_bal = get_asset_balance(db, order.user_id, base)
        base_bal.locked = Decimal(base_bal.locked) - qty
        if base_bal.locked < 0:
            base_bal.locked = Decimal("0")
        db.commit()

        # Update position
        pos = get_position(db, order.user_id, base)
        cost_basis = Decimal(pos.avg_buy_price)
        realized_pnl = (fill_price - cost_basis) * qty - fee
        pos.realized_pnl = Decimal(pos.realized_pnl) + realized_pnl
        pos.quantity = Decimal(pos.quantity) - qty
        if pos.quantity <= 0:
            pos.quantity = Decimal("0")
            pos.avg_buy_price = Decimal("0")
            pos.margin_used = Decimal("0")
        else:
            pos.margin_used = Decimal(pos.quantity) * Decimal(pos.avg_buy_price)
        db.commit()

    # Write Trade
    trade = models.Trade(
        order_id=order.id,
        user_id=order.user_id,
        symbol=order.symbol,
        side=order.side,
        price=fill_price,
        quantity=qty,
        total_value=gross,
        fee=fee,
        realized_pnl=realized_pnl,
    )
    db.add(trade)

    # Mark order filled
    order.status = "filled"
    order.filled_quantity = qty
    order.updated_at = datetime.utcnow()
    db.commit()

    print(
        f"[FILL] Order #{order.id} {order.side.upper()} {qty} {order.symbol} "
        f"@ {fill_price} | user {order.user_id} | PnL {realized_pnl}"
    )


# ============================================
# MAIN SCAN
# ============================================

def should_fill(order: models.Order, market_price: Decimal) -> bool:
    if order.order_type != "limit":
        return False
    if order.price is None:
        return False
    limit_price = Decimal(order.price)
    if order.side == "buy":
        return market_price <= limit_price
    elif order.side == "sell":
        return market_price >= limit_price
    return False


async def scan_once(db: Session):
    try:
        prices = await fetch_prices()
    except Exception as e:
        print(f"[WARN] Price fetch failed: {e}")
        return

    if not prices:
        print("[WARN] No prices returned")
        return

    # Only consider orders on symbols we have prices for
    pending = (
        db.query(models.Order)
        .filter(
            models.Order.status == "pending",
            models.Order.order_type == "limit",
            models.Order.symbol.in_(list(prices.keys())),
        )
        .all()
    )

    if not pending:
        return

    filled_count = 0
    for order in pending:
        market_price = prices.get(order.symbol)
        if market_price is None:
            continue
        if should_fill(order, market_price):
            try:
                # Fill at the user's limit price (standard behavior)
                execute_fill(db, order, Decimal(order.price))
                filled_count += 1
            except Exception as e:
                print(f"[ERROR] Failed to fill order #{order.id}: {e}")
                db.rollback()

    if filled_count:
        print(f"[SCAN] Filled {filled_count} order(s).")


async def matching_loop():
    print("[WORKER] Matching engine started.")
    print(f"[WORKER] Scanning every {SCAN_INTERVAL}s...\n")

    while True:
        db: Session = SessionLocal()
        try:
            await scan_once(db)
        except Exception as e:
            print(f"[WORKER ERROR] {e}")
            try:
                db.rollback()
            except Exception:
                pass
        finally:
            db.close()

        await asyncio.sleep(SCAN_INTERVAL)


if __name__ == "__main__":
    asyncio.run(matching_loop())