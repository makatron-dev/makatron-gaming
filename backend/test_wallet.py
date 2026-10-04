import urllib.request, json, urllib.parse

BASE = "http://localhost:8000"

# 1. Register a fresh user
print("Registering user...")
reg_data = urllib.parse.urlencode({"email": "user1@test.com", "password": "pass123"}).encode()
req1 = urllib.request.Request(f"{BASE}/register", data=reg_data)
req1.add_header("Content-Type", "application/x-www-form-urlencoded")
try:
    resp = urllib.request.urlopen(req1)
    print("Register response:", resp.status)
except Exception as e:
    print("Register error:", e)
    if hasattr(e, 'read'):
        print("Error body:", e.read().decode())

# 2. Login to get token
print("\nLogging in...")
login_data = urllib.parse.urlencode({"username": "user1@test.com", "password": "pass123"}).encode()
req2 = urllib.request.Request(f"{BASE}/token", data=login_data)
req2.add_header("Content-Type", "application/x-www-form-urlencoded")
try:
    login_resp = json.loads(urllib.request.urlopen(req2).read())
    token = login_resp["access_token"]
    print(f"Got token: {token[:30]}...")
except Exception as e:
    print("Login error:", e)
    if hasattr(e, 'read'):
        print("Error body:", e.read().decode())
    exit()

# 3. Fetch wallets using the token
print("\nFetching wallets...")
req3 = urllib.request.Request(f"{BASE}/wallets/my-addresses")
req3.add_header("Authorization", f"Bearer {token}")
wallets_resp = json.loads(urllib.request.urlopen(req3).read())

print("\n=== WALLET ADDRESSES ===")
print(json.dumps(wallets_resp, indent=2))