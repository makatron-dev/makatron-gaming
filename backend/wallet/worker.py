import asyncio
import time
from datetime import datetime
from decimal import Decimal
from sqlalchemy.orm import Session
from backend.database import SessionLocal
from backend import models

# --- CONFIGURATION ---
SCAN_INTERVAL = 10          # Scan every 10 seconds
DEPOSIT_EVERY_N_SCANS = 2   # Simulate a deposit every 2 scans (so every ~20s)
PROCESSED_TX_HASHES = set() # Prevent double-crediting

scan_counter = 0            # Tracks how many scans we've done


def credit_user_balance(db: Session, user_id: int, asset: str, amount: Decimal):
    """Credit a user's balance after a deposit."""
    balance = db.query(models.Balance).filter(
        models.Balance.user_id == user_id,
        models.Balance.asset == asset
    ).first()
    
    if balance:
        balance.available = Decimal(balance.available) + amount
        db.commit()
        print(f"[CREDIT] User {user_id} +{amount} {asset} | New balance: {balance.available}")
    else:
        new_balance = models.Balance(user_id=user_id, asset=asset, available=amount)
        db.add(new_balance)
        db.commit()
        print(f"[CREDIT] Created new balance for user {user_id}: +{amount} {asset}")


def simulate_incoming_deposits(db: Session, scan_count: int):
    """Simulate a deposit every N scans."""
    if scan_count % DEPOSIT_EVERY_N_SCANS != 0:
        return
    
    wallets = db.query(models.Wallet).limit(1).all()
    if not wallets:
        print("[SIMULATION] No wallets found in the database.")
        return
    
    test_wallet = wallets[0]
    test_amount = Decimal("0.05")
    print(f"\n[SIMULATION] Detected deposit of {test_amount} {test_wallet.chain} to {test_wallet.address}")
    credit_user_balance(db, test_wallet.user_id, test_wallet.chain, test_amount)


async def blockchain_listener():
    global scan_counter
    print("[WORKER] Blockchain listener started.")
    print(f"[WORKER] Scanning every {SCAN_INTERVAL} seconds...\n")
    
    while True:
        try:
            db: Session = SessionLocal()
            scan_counter += 1
            print(f"[SCAN #{scan_counter}] Checking blockchain...")
            
            simulate_incoming_deposits(db, scan_counter)
            
            db.close()
        except Exception as e:
            print(f"[WORKER ERROR] {e}")
        
        await asyncio.sleep(SCAN_INTERVAL)


if __name__ == "__main__":
    asyncio.run(blockchain_listener())