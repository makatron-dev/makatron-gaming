import asyncio
import websockets
import json
import time
from engine import CrashEngine

# We will store the active game state here
active_game = None

async def handle_client(websocket):
    """Handles a single player's connection."""
    print("A player connected!")
    
    try:
        async for message in websocket:
            data = json.loads(message)
            print(f"Received from player: {data}")
            
            if data["action"] == "bet":
                # In a real game, you would deduct the bet amount here
                await websocket.send(json.dumps({"status": "bet_placed", "bet_amount": data["amount"]}))
                
            elif data["action"] == "cashout":
                # THIS IS WHERE THE EXPLOIT HUNT BEGINS
                # In a real system, the server checks if the round is still active.
                # If the server is poorly coded, it might accept a cashout AFTER the crash.
                requested_multiplier = data.get("multiplier", 1.00)
                
                # THE SECURITY PATCH
                if requested_multiplier > 2.0:
                    print(f"SECURITY ALERT: Player tried to cheat with {requested_multiplier}x!")
                    await websocket.send(json.dumps({"status": "error", "message": "Invalid multiplier"}))
                else:
                    print("Player requested cashout!")
                    await websocket.send(json.dumps({"status": "cashed_out", "multiplier": requested_multiplier}))
                
    except websockets.exceptions.ConnectionClosed:
        print("Player disconnected.")

async def main():
    print("Starting local Crash Game Server on ws://localhost:8765")
    # This starts the server on your computer
    async with websockets.serve(handle_client, "localhost", 8765):
        await asyncio.Future()  # Run forever

if __name__ == "__main__":
    asyncio.run(main())