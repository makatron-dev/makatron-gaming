import asyncio
import websockets
import json
import hashlib
import hmac
import secrets
import random

connected_clients = set()
player_balances = {}
active_bets = {}

# --- PROVABLY FAIR CRYPTO ENGINE ---
class CrashEngine:
    def __init__(self):
        self.server_seed = secrets.token_hex(32) 
        self.server_seed_hash = hashlib.sha256(self.server_seed.encode()).hexdigest()
        
    def get_server_seed_hash(self):
        return self.server_seed_hash

    def calculate_crash_point(self, client_seed: str, nonce: int) -> float:
        message = f"{client_seed}-{nonce}".encode()
        hmac_hash = hmac.new(self.server_seed.encode(), message, hashlib.sha512).hexdigest()
        
        hex_substring = hmac_hash[:13]
        decimal_value = int(hex_substring, 16)
        max_value = 16**13 
        normalized = decimal_value / max_value
        
        # Aviator-style formula (adjusting the 0.97 house edge if desired)
        crash_point = 0.97 / (1 - normalized)
        crash_point = max(1.00, min(crash_point, 100.0))
        return round(crash_point, 2)

    def reveal_server_seed(self):
        return self.server_seed

# --- GAME LOGIC ---
async def game_loop():
    while True:
        print("--- New Round Starting ---")
        
        # 1. COMMIT PHASE
        engine = CrashEngine()
        commit_message = json.dumps({"type": "commit", "server_seed_hash": engine.get_server_seed_hash()})
        if connected_clients:
            await asyncio.gather(*[client.send(commit_message) for client in connected_clients])
            
        wait_message = json.dumps({"type": "waiting", "duration": 5})
        if connected_clients:
            await asyncio.gather(*[client.send(wait_message) for client in connected_clients])
        
        await asyncio.sleep(5) 
        
        # 2. CALCULATE CRASH POINT
        crash_point = engine.calculate_crash_point("makatron_player", 1) # Using a static client seed for the fun path
        print(f"Provably Fair Crash at: {crash_point}x")
        
        current_multiplier = 1.00
        while current_multiplier < crash_point:
            increment = 0.01 if current_multiplier < 2.0 else 0.05 if current_multiplier < 10.0 else 0.1
            current_multiplier += increment 
            if current_multiplier > crash_point:
                current_multiplier = crash_point
                
            message = json.dumps({"type": "tick", "multiplier": current_multiplier})
            if connected_clients:
                await asyncio.gather(*[client.send(message) for client in connected_clients])
            await asyncio.sleep(0.1)
        
        # 3. REVEAL PHASE
        reveal_message = json.dumps({
            "type": "crash", 
            "multiplier": crash_point, 
            "server_seed": engine.reveal_server_seed()
        })
        if connected_clients:
            await asyncio.gather(*[client.send(reveal_message) for client in connected_clients])
        
        for client in list(active_bets.keys()):
            active_bets[client] = {"panel1": 0, "panel2": 0}
        await asyncio.sleep(3)

async def handle_client(websocket):
    connected_clients.add(websocket)
    player_balances[websocket] = 10000
    active_bets[websocket] = {"panel1": 0, "panel2": 0}
    await websocket.send(json.dumps({"type": "balance", "amount": player_balances[websocket]}))
    
    try:
        async for message in websocket:
            data = json.loads(message)
            if data["action"] == "bet":
                amount = data["amount"]
                if player_balances[websocket] >= amount:
                    player_balances[websocket] -= amount
                    active_bets[websocket]["panel1"] = amount 
                    await websocket.send(json.dumps({"type": "balance", "amount": player_balances[websocket]}))
            elif data["action"] == "cashout":
                multiplier = data["multiplier"]
                bet_amount = active_bets[websocket].get("panel1", 0)
                if bet_amount > 0:
                    winnings = int(bet_amount * multiplier)
                    player_balances[websocket] += winnings
                    active_bets[websocket]["panel1"] = 0
                    await websocket.send(json.dumps({"type": "balance", "amount": player_balances[websocket]}))
            elif data["action"] == "deposit":
                player_balances[websocket] += data["amount"]
                await websocket.send(json.dumps({"type": "balance", "amount": player_balances[websocket]}))
    except websockets.exceptions.ConnectionClosed:
        pass
    finally:
        connected_clients.remove(websocket)
        del player_balances[websocket]
        del active_bets[websocket]

async def main():
    asyncio.create_task(game_loop())
    print("MAKATRON GAMING Server on ws://localhost:8765")
    async with websockets.serve(handle_client, "localhost", 8765):
        await asyncio.Future()

if __name__ == "__main__":
    asyncio.run(main())