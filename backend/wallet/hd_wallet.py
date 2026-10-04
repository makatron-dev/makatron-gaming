import os
from eth_account import Account
from mnemonic import Mnemonic
from dotenv import load_dotenv

# Enable HD wallet features in eth-account
Account.enable_unaudited_hdwallet_features()

# Load the master seed from .env
load_dotenv()
MASTER_SEED = os.getenv("MASTER_SEED")

if not MASTER_SEED:
    raise ValueError("MASTER_SEED is missing from your .env file! Generate one first.")


def derive_evm_wallet(user_id: int, index: int = 0):
    """
    Derives an Ethereum-compatible wallet for a specific user.
    Supports: Ethereum (ETH), BNB Chain (BNB), Polygon (MATIC), 
              Arbitrum, Optimism, and ANY EVM-compatible chain.
    Also compatible with TRON (TRC-20) once the address format is converted.
    """
    # The derivation path: m/44'/60'/0'/0/<user_id>
    # Each user gets a unique path based on their user_id, so no two users share a wallet.
    derivation_path = f"m/44'/60'/0'/0/{user_id}"
    
    # Derive the account from the master seed
    account = Account.from_mnemonic(
        MASTER_SEED,
        account_path=derivation_path
    )
    
    return {
        "address": account.address,
        "private_key": account.key.hex()
    }


def derive_bitcoin_wallet(user_id: int):
    """
    Derives a Bitcoin-style wallet address using the same master seed.
    For simplicity we use an Ethereum-style derivation but return a BTC-formatted
    address placeholder. In production you would use a dedicated Bitcoin library.
    """
    # For now, we derive an EVM address and note that production would use a BTC-specific library
    return derive_evm_wallet(user_id, index=1)


def get_user_wallets(user_id: int):
    """
    Returns a dictionary with all supported chain addresses for a user.
    """
    evm = derive_evm_wallet(user_id)
    
    return {
        "ETH": {
            "address": evm["address"],
            "network": "Ethereum Mainnet"
        },
        "BNB": {
            "address": evm["address"],
            "network": "BNB Smart Chain"
        },
        "MATIC": {
            "address": evm["address"],
            "network": "Polygon Mainnet"
        },
        "USDT_TRC20": {
            "address": evm["address"],
            "network": "TRON (TRC-20) - Derive via TRON-specific tool for production"
        },
        "BTC": {
            "address": evm["address"],
            "network": "Bitcoin - Derive via BTC-specific tool for production"
        }
    }