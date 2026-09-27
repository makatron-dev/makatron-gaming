import asyncio
import websockets
import json

async def play_game():
    # Connect to the local server we just started
    uri = "ws://localhost:8765"
    
    print("Connecting to the game server...")
    
    async with websockets.connect(uri) as websocket:
        print("Connected! Sending a bet request...")
        
        # 1. Send a bet request
        bet_message = json.dumps({"action": "bet", "amount": 30})
        await websocket.send(bet_message)
        
        # Wait for the server's response to the bet
        response = await websocket.recv()
        print(f"Server replied to bet: {response}")
        
        # 2. Simulate waiting for the plane to fly (you would do this manually in a real game)
        print("Waiting for a good multiplier...")
        await asyncio.sleep(3) 
        
        # 3. Send a cashout request
        print("Sending CASHOUT request!")
        cashout_message = json.dumps({"action": "cashout", "multiplier": 500.0})
        await websocket.send(cashout_message)
        
        # Wait for the server's response to the cashout
        response = await websocket.recv()
        print(f"Server replied to cashout: {response}")

if __name__ == "__main__":
    asyncio.run(play_game())