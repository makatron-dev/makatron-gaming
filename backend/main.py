from fastapi import FastAPI, Depends, HTTPException, status, Form
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from passlib.context import CryptContext
from datetime import datetime, timedelta
from jose import JWTError, jwt
from backend import models
from backend.database import engine, get_db

models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="MAKATRON BROKER API")

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
