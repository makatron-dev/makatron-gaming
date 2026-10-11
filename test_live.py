import urllib.request, json, urllib.parse

BASE = "https://makatron-broker-api.onrender.com"

# 1. Login
print("Logging in...")
login_data = urllib.parse.urlencode({
    "username": "distinct.nfts@gmail.com",
    "password": "De08063438279####"      # <-- use your actual password (with # signs)
}).encode()
req = urllib.request.Request(f"{BASE}/token", data=login_data)
req.add_header("Content-Type", "application/x-www-form-urlencoded")
token = json.loads(urllib.request.urlopen(req).read())["access_token"]
print(f"Token: {token[:30]}...\n")

# 2. Fetch wallets
print("=== LIVE WALLET ADDRESSES ===")
req = urllib.request.Request(f"{BASE}/wallets/my-addresses")
req.add_header("Authorization", f"Bearer {token}")
wallets = json.loads(urllib.request.urlopen(req).read())
print(json.dumps(wallets, indent=2))

# 3. Fetch balances
print("\n=== LIVE BALANCES ===")
req = urllib.request.Request(f"{BASE}/users/me/balances")
req.add_header("Authorization", f"Bearer {token}")
balances = json.loads(urllib.request.urlopen(req).read())
print(json.dumps(balances, indent=2))