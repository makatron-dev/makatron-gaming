from fastapi import FastAPI, Depends, HTTPException, status, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from passlib.context import CryptContext
from datetime import datetime, timedelta
from jose import JWTError, jwt
from backend import models
from backend.database import engine, get_db
from decimal import Decimal
from datetime import datetime, timedelta

models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="MAKATRON BROKER API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins (we'll restrict this later)
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
SECRET_KEY = "YOUR_SUPER_SECRET_KEY_CHANGE_THIS_LATER"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 * 7

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

def get_current_admin(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    """Dependency that ensures the current user is an admin."""
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")
    
    user = db.query(models.User).filter(models.User.email == email).first()
    if user is None:
        raise HTTPException(status_code=404, detail="User not found")
    if not user.is_admin:
        raise HTTPException(status_code=403, detail="Admin access required")
    
    return user


# ==========================================
# PUBLIC ENDPOINTS
# ==========================================

@app.get("/")
def read_root():
    return {"status": "MAKATRON BROKER API is running"}


@app.post("/register")
def register(
    email: str = Form(...),
    password: str = Form(...),
    db: Session = Depends(get_db)
):
    user = db.query(models.User).filter(models.User.email == email).first()
    if user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    hashed_pw = get_password_hash(password)
    new_user = models.User(email=email, hashed_password=hashed_pw)
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    for asset in ["BTC", "ETH", "USDT"]:
        new_balance = models.Balance(user_id=new_user.id, asset=asset, available=0)
        db.add(new_balance)
    db.commit()
    
    from backend.wallet.hd_wallet import get_user_wallets
    wallets = get_user_wallets(new_user.id)
    for chain, wallet_info in wallets.items():
        new_wallet = models.Wallet(
            user_id=new_user.id,
            chain=chain,
            address=wallet_info["address"]
        )
        db.add(new_wallet)
    db.commit()
    
    return {"message": "User created successfully", "user_id": new_user.id}


@app.post("/token")
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.email == form_data.username).first()
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Incorrect email or password")
    
    access_token = create_access_token(data={"sub": user.email, "id": user.id})
    return {"access_token": access_token, "token_type": "bearer"}


# ==========================================
# USER ENDPOINTS (Protected)
# ==========================================

@app.get("/users/me")
def read_users_me(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise HTTPException(status_code=401, detail="Invalid token")
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")
    
    user = db.query(models.User).filter(models.User.email == email).first()
    if user is None:
        raise HTTPException(status_code=404, detail="User not found")
    return {"id": user.id, "email": user.email, "is_admin": user.is_admin}


@app.get("/users/me/balances")
def get_my_balances(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = payload.get("id")
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")
    
    balances = db.query(models.Balance).filter(models.Balance.user_id == user_id).all()
    return [{"asset": b.asset, "available": str(b.available), "locked": str(b.locked)} for b in balances]


@app.get("/wallets/my-addresses")
def get_my_wallets(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = payload.get("id")
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")
    
    wallets = db.query(models.Wallet).filter(models.Wallet.user_id == user_id).all()
    return [
        {
            "chain": w.chain,
            "address": w.address
        }
        for w in wallets
    ]


# ==========================================
# ADMIN ENDPOINTS
# ==========================================

@app.get("/admin/users")
def admin_list_users(admin = Depends(get_current_admin), db: Session = Depends(get_db)):
    """List all users with their balances."""
    users = db.query(models.User).all()
    result = []
    for user in users:
        balances = db.query(models.Balance).filter(models.Balance.user_id == user.id).all()
        result.append({
            "id": user.id,
            "email": user.email,
            "is_active": user.is_active,
            "is_admin": user.is_admin,
            "created_at": str(user.created_at),
            "balances": [
                {"asset": b.asset, "available": str(b.available), "locked": str(b.locked)}
                for b in balances
            ]
        })
    return result


@app.post("/admin/users/{user_id}/freeze")
def admin_freeze_user(user_id: int, admin = Depends(get_current_admin), db: Session = Depends(get_db)):
    """Freeze (deactivate) a user's account."""
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    user.is_active = False
    db.commit()
    print(f"[ADMIN] {admin.email} froze user {user.email}")
    return {"message": f"User {user.email} frozen"}


@app.post("/admin/users/{user_id}/unfreeze")
def admin_unfreeze_user(user_id: int, admin = Depends(get_current_admin), db: Session = Depends(get_db)):
    """Unfreeze a user's account."""
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    user.is_active = True
    db.commit()
    print(f"[ADMIN] {admin.email} unfroze user {user.email}")
    return {"message": f"User {user.email} unfrozen"}


@app.post("/admin/users/{user_id}/credit")
def admin_credit_user(
    user_id: int,
    asset: str = Form(...),
    amount: str = Form(...),
    admin = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Manually credit a user's balance (for customer support)."""
    from decimal import Decimal
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    balance = db.query(models.Balance).filter(
        models.Balance.user_id == user_id,
        models.Balance.asset == asset
    ).first()
    
    if not balance:
        raise HTTPException(status_code=404, detail=f"No balance account for {asset}")
    
    balance.available = Decimal(balance.available) + Decimal(amount)
    db.commit()
    print(f"[ADMIN] {admin.email} credited {amount} {asset} to {user.email}")
    return {"message": f"Credited {amount} {asset} to {user.email}", "new_balance": str(balance.available)}


@app.get("/admin/stats")
def admin_stats(admin = Depends(get_current_admin), db: Session = Depends(get_db)):
    """Get overall platform statistics."""
    total_users = db.query(models.User).count()
    total_wallets = db.query(models.Wallet).count()
    
    from sqlalchemy import func
    balance_sums = db.query(
        models.Balance.asset,
        func.sum(models.Balance.available).label("total")
    ).group_by(models.Balance.asset).all()
    
    return {
        "total_users": total_users,
        "total_wallets": total_wallets,
        "total_balances": {asset: str(total) for asset, total in balance_sums}
    }
@app.post("/promote-to-admin")
def promote_to_admin(
    email: str = Form(...),
    secret: str = Form(...),
    db: Session = Depends(get_db)
):
    if secret != "makatron_promote_secret_2026":
        raise HTTPException(status_code=403, detail="Invalid secret")

    user = db.query(models.User).filter(models.User.email == email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    user.is_admin = True
    db.commit()
    print(f"[PROMOTE] {email} is now an admin")
    return {"message": f"{email} is now an admin"}
# ============================================
# ORDER ENGINE
# ============================================

from decimal import Decimal
from datetime import datetime, timedelta

# Fee: 0.10% taken from the receive side
TRADE_FEE_RATE = Decimal("0.001")

# Supported pairs (base/quote). For now, all against USDT.
SUPPORTED_PAIRS = {
    "BTC/USDT": "BTC",
    "ETH/USDT": "ETH",
    "BNB/USDT": "BNB",
    "SOL/USDT": "SOL",
    "XRP/USDT": "XRP",
}

# Fee account — where fees accumulate (user_id 0 = platform)
PLATFORM_USER_ID = 0


def get_asset_balance(db: Session, user_id: int, asset: str):
    """Get a Balance row for (user, asset). Creates it if missing."""
    balance = db.query(models.Balance).filter(
        models.Balance.user_id == user_id,
        models.Balance.asset == asset,
    ).first()
    if not balance:
        balance = models.Balance(user_id=user_id, asset=asset, available=0, locked=0)
        db.add(balance)
        db.commit()
        db.refresh(balance)
    return balance


def deduct_available(db: Session, user_id: int, asset: str, amount: Decimal):
    """Deduct from available balance. Raises if insufficient."""
    balance = get_asset_balance(db, user_id, asset)
    if Decimal(balance.available) < amount:
        raise HTTPException(
            status_code=400,
            detail=f"Insufficient {asset} balance. Need {amount}, have {balance.available}"
        )
    balance.available = Decimal(balance.available) - amount
    db.commit()


def credit_available(db: Session, user_id: int, asset: str, amount: Decimal):
    """Add to available balance."""
    balance = get_asset_balance(db, user_id, asset)
    balance.available = Decimal(balance.available) + amount
    db.commit()


def lock_balance(db: Session, user_id: int, asset: str, amount: Decimal):
    """Move from available → locked."""
    balance = get_asset_balance(db, user_id, asset)
    if Decimal(balance.available) < amount:
        raise HTTPException(
            status_code=400,
            detail=f"Insufficient {asset} balance to lock. Need {amount}, have {balance.available}"
        )
    balance.available = Decimal(balance.available) - amount
    balance.locked = Decimal(balance.locked) + amount
    db.commit()


def unlock_balance(db: Session, user_id: int, asset: str, amount: Decimal):
    """Move from locked → available."""
    balance = get_asset_balance(db, user_id, asset)
    if Decimal(balance.locked) < amount:
        amount = Decimal(balance.locked)  # safety: don't unlock more than locked
    balance.locked = Decimal(balance.locked) - amount
    balance.available = Decimal(balance.available) + amount
    db.commit()


def parse_pair(symbol: str):
    """Split 'ETH/USDT' into ('ETH', 'USDT')."""
    if "/" not in symbol:
        raise HTTPException(status_code=400, detail="Invalid symbol format")
    base, quote = symbol.split("/")
    return base.upper(), quote.upper()


def execute_trade(db: Session, order: models.Order, fill_price: Decimal):
    """
    Fill an entire order at fill_price.
    Updates balances, creates a Trade row, marks order filled.
    """
    base, quote = parse_pair(order.symbol)
    qty = Decimal(order.quantity)
    gross = qty * fill_price
    fee = gross * TRADE_FEE_RATE

    if order.side == "buy":
        # User locked 'gross' in quote asset. On fill: they receive base - fee, spend gross.
        # Unlock nothing (it's already locked in quote).
        received_base = qty * (Decimal("1") - TRADE_FEE_RATE)
        credit_available(db, order.user_id, base, received_base)
        # The locked quote is spent (remove from locked)
        quote_bal = get_asset_balance(db, order.user_id, quote)
        quote_bal.locked = Decimal(quote_bal.locked) - gross
        if quote_bal.locked < 0:
            quote_bal.locked = Decimal("0")
        db.commit()
    else:
        # sell: user locked 'qty' of base. On fill: they receive gross - fee in quote.
        received_quote = gross * (Decimal("1") - TRADE_FEE_RATE)
        credit_available(db, order.user_id, quote, received_quote)
        base_bal = get_asset_balance(db, order.user_id, base)
        base_bal.locked = Decimal(base_bal.locked) - qty
        if base_bal.locked < 0:
            base_bal.locked = Decimal("0")
        db.commit()

    # Record the trade
    trade = models.Trade(
        order_id=order.id,
        user_id=order.user_id,
        symbol=order.symbol,
        side=order.side,
        price=fill_price,
        quantity=qty,
        total_value=gross,
        fee=fee,
    )
    db.add(trade)

    # Mark order as filled
    order.status = "filled"
    order.filled_quantity = qty
    order.updated_at = datetime.utcnow()
    db.commit()


@app.post("/orders")
def place_order(
    symbol: str = Form(...),
    side: str = Form(...),          # "buy" | "sell"
    order_type: str = Form(...),    # "market" | "limit"
    quantity: str = Form(...),
    price: str = Form(None),        # required for limit
    current_market_price: str = Form(...),   # frontend passes the live price
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db),
):
    # Auth
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = payload.get("id")
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")

    symbol = symbol.upper().replace(" ", "")
    if symbol not in SUPPORTED_PAIRS:
        raise HTTPException(status_code=400, detail=f"Symbol {symbol} not supported")

    side = side.lower()
    order_type = order_type.lower()
    if side not in ("buy", "sell"):
        raise HTTPException(status_code=400, detail="Side must be 'buy' or 'sell'")
    if order_type not in ("market", "limit"):
        raise HTTPException(status_code=400, detail="Order type must be 'market' or 'limit'")

    try:
        qty = Decimal(str(quantity))
        market_price = Decimal(str(current_market_price))
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid quantity or market price")

    if qty <= 0:
        raise HTTPException(status_code=400, detail="Quantity must be positive")

    base, quote = parse_pair(symbol)

    # Determine fill/lock price
    if order_type == "market":
        effective_price = market_price
    else:
        if price is None or price == "":
            raise HTTPException(status_code=400, detail="Limit orders require a price")
        effective_price = Decimal(str(price))
        if effective_price <= 0:
            raise HTTPException(status_code=400, detail="Price must be positive")

    # Create the order row first (so we have an id for the trade)
    new_order = models.Order(
        user_id=user_id,
        symbol=symbol,
        side=side,
        order_type=order_type,
        price=effective_price if order_type == "limit" else None,
        quantity=qty,
        filled_quantity=Decimal("0"),
        status="pending",
    )
    db.add(new_order)
    db.commit()
    db.refresh(new_order)

    # --- MARKET ORDER: fill immediately ---
    if order_type == "market":
        if side == "buy":
            # User spends qty * effective_price of quote
            cost = qty * effective_price
            deduct_available(db, user_id, quote, cost)
        else:
            # User spends qty of base
            deduct_available(db, user_id, base, qty)

        execute_trade(db, new_order, effective_price)
        return {
            "message": "Market order filled",
            "order_id": new_order.id,
            "status": "filled",
            "fill_price": str(effective_price),
            "quantity": str(qty),
        }

    # --- LIMIT ORDER: lock funds, stay pending ---
    if side == "buy":
        lock_amount = qty * effective_price
        lock_balance(db, user_id, quote, lock_amount)
    else:
        lock_balance(db, user_id, base, qty)

    return {
        "message": "Limit order placed",
        "order_id": new_order.id,
        "status": "pending",
        "price": str(effective_price),
        "quantity": str(qty),
    }


@app.get("/orders")
def list_orders(
    status_filter: str = None,   # "pending" | "filled" | "cancelled"
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db),
):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = payload.get("id")
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")

    q = db.query(models.Order).filter(models.Order.user_id == user_id)
    if status_filter:
        q = q.filter(models.Order.status == status_filter)

    orders = q.order_by(models.Order.created_at.desc()).all()

    return [
        {
            "id": o.id,
            "symbol": o.symbol,
            "side": o.side,
            "order_type": o.order_type,
            "price": str(o.price) if o.price is not None else None,
            "quantity": str(o.quantity),
            "filled_quantity": str(o.filled_quantity),
            "status": o.status,
            "created_at": o.created_at.isoformat() if o.created_at else None,
            "updated_at": o.updated_at.isoformat() if o.updated_at else None,
        }
        for o in orders
    ]


@app.post("/orders/{order_id}/cancel")
def cancel_order(
    order_id: int,
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db),
):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = payload.get("id")
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")

    order = db.query(models.Order).filter(
        models.Order.id == order_id,
        models.Order.user_id == user_id,
    ).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    if order.status != "pending":
        raise HTTPException(status_code=400, detail="Only pending orders can be cancelled")

    base, quote = parse_pair(order.symbol)
    qty = Decimal(order.quantity)

    # Refund the locked amount
    if order.side == "buy":
        if order.price is not None:
            refund = qty * Decimal(order.price)
            unlock_balance(db, user_id, quote, refund)
    else:
        unlock_balance(db, user_id, base, qty)

    order.status = "cancelled"
    order.updated_at = datetime.utcnow()
    db.commit()

    return {"message": "Order cancelled", "order_id": order.id}


@app.get("/trades")
def list_trades(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db),
):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = payload.get("id")
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")

    trades = db.query(models.Trade).filter(
        models.Trade.user_id == user_id
    ).order_by(models.Trade.executed_at.desc()).all()

    return [
        {
            "id": t.id,
            "order_id": t.order_id,
            "symbol": t.symbol,
            "side": t.side,
            "price": str(t.price),
            "quantity": str(t.quantity),
            "total_value": str(t.total_value),
            "fee": str(t.fee),
            "executed_at": t.executed_at.isoformat() if t.executed_at else None,
        }
        for t in trades
    ]
    @app.post("/admin/reset-order-tables")
def reset_order_tables(secret: str = Form(...), db: Session = Depends(get_db)):
    """TEMPORARY: Drops and recreates the orders and trades tables. Delete this endpoint after use."""
    if secret != "makatron_reset_2026":
        raise HTTPException(status_code=403, detail="Invalid secret")
    
    from sqlalchemy import text
    try:
        db.execute(text("DROP TABLE IF EXISTS trades CASCADE"))
        db.execute(text("DROP TABLE IF EXISTS orders CASCADE"))
        db.commit()
        
        # Recreate using the current models
        models.Order.__table__.create(bind=db.get_bind(), checkfirst=True)
        models.Trade.__table__.create(bind=db.get_bind(), checkfirst=True)
        
        return {"message": "Order tables reset successfully"}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))
