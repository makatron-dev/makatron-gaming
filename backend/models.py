from sqlalchemy import Column, Integer, String, Numeric, DateTime, Boolean, ForeignKey
from datetime import datetime
from backend.database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    is_active = Column(Boolean, default=True)
    is_admin = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)


class Balance(Base):
    __tablename__ = "balances"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), index=True, nullable=False)
    asset = Column(String, nullable=False)
    available = Column(Numeric(36, 18), default=0)
    locked = Column(Numeric(36, 18), default=0)


class Wallet(Base):
    __tablename__ = "wallets"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), index=True, nullable=False)
    chain = Column(String, nullable=False)
    address = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)


class Order(Base):
    __tablename__ = "orders"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), index=True, nullable=False)
    symbol = Column(String, nullable=False, index=True)
    side = Column(String, nullable=False)
    order_type = Column(String, nullable=False)
    price = Column(Numeric(36, 18), nullable=True)
    quantity = Column(Numeric(36, 18), nullable=False)
    filled_quantity = Column(Numeric(36, 18), default=0)
    status = Column(String, default="pending", index=True)
    created_at = Column(DateTime, default=datetime.utcnow, index=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class Trade(Base):
    __tablename__ = "trades"

    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(Integer, ForeignKey("orders.id"), index=True, nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), index=True, nullable=False)
    symbol = Column(String, nullable=False, index=True)
    side = Column(String, nullable=False)
    price = Column(Numeric(36, 18), nullable=False)
    quantity = Column(Numeric(36, 18), nullable=False)
    total_value = Column(Numeric(36, 18), nullable=False)
    fee = Column(Numeric(36, 18), default=0)
    realized_pnl = Column(Numeric(36, 18), default=0)
    executed_at = Column(DateTime, default=datetime.utcnow, index=True)


class Position(Base):
    __tablename__ = "positions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), index=True, nullable=False)
    asset = Column(String, nullable=False, index=True)
    quantity = Column(Numeric(36, 18), default=0)
    avg_buy_price = Column(Numeric(36, 18), default=0)
    realized_pnl = Column(Numeric(36, 18), default=0)

    # FUTURES-READY COLUMNS (default to spot values for now)
    market_type = Column(String, default="spot", nullable=False)       # "spot" | "futures"
    side = Column(String, default="long", nullable=False)              # "long" | "short"
    leverage = Column(Numeric(10, 2), default=1)                       # 1 for spot, up to 100 for futures
    margin_used = Column(Numeric(36, 18), default=0)                   # cost for spot, cost/leverage for futures

    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
