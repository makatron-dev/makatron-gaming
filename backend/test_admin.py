import urllib.request, json, urllib.parse

BASE = "http://localhost:8000"

# CHANGE THESE TO YOUR ADMIN LOGIN CREDENTIALS
ADMIN_EMAIL = "distinct.nfts@gmail.com"
ADMIN_PASSWORD = "De08063438279####"   # <-- your actual password (use plain characters, no %23)

# 1. Login as admin
print("Logging in as admin...")
login_data = urllib.parse.urlencode({"username": ADMIN_EMAIL, "password": ADMIN_PASSWORD}).encode()
req = urllib.request.Request(f"{BASE}/token", data=login_data)
req.add_header("Content-Type", "application/x-www-form-urlencoded")
try:
    token = json.loads(urllib.request.urlopen(req).read())["access_token"]
    print(f"Admin token: {token[:30]}...\n")
except Exception as e:
    print(f"Login failed: {e}")
    if hasattr(e, 'read'):
        print("Error:", e.read().decode())
    exit()

# 2. Get platform stats
print("=== PLATFORM STATS ===")
req = urllib.request.Request(f"{BASE}/admin/stats")
req.add_header("Authorization", f"Bearer {token}")
stats = json.loads(urllib.request.urlopen(req).read())
print(json.dumps(stats, indent=2))

# 3. List all users
print("\n=== ALL USERS ===")
req = urllib.request.Request(f"{BASE}/admin/users")
req.add_header("Authorization", f"Bearer {token}")
users = json.loads(urllib.request.urlopen(req).read())
print(json.dumps(users, indent=2))

# 4. Credit a user (if there is at least one)
if users:
    target_id = users[0]["id"]
    print(f"\n=== CREDITING USER {target_id} 10 USDT ===")
    credit_data = urllib.parse.urlencode({"asset": "USDT", "amount": "10"}).encode()
    req = urllib.request.Request(f"{BASE}/admin/users/{target_id}/credit", data=credit_data)
    req.add_header("Content-Type", "application/x-www-form-urlencoded")
    req.add_header("Authorization", f"Bearer {token}")
    result = json.loads(urllib.request.urlopen(req).read())
    print(json.dumps(result, indent=2))