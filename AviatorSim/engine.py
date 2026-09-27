import hashlib
import hmac
import secrets

class CrashEngine:
    def __init__(self):
        # 1. Server generates a secret seed and its public hash (Commitment)
        self.server_seed = secrets.token_hex(32) # 64 character hex string
        self.server_seed_hash = hashlib.sha256(self.server_seed.encode()).hexdigest()
        
    def get_server_seed_hash(self):
        """Returns the hash the player sees BEFORE the round starts."""
        return self.server_seed_hash

    def calculate_crash_point(self, client_seed: str, nonce: int) -> float:
        """
        Calculates the crash point using the Server Seed, Client Seed, and Nonce.
        """
        # 2. Combine Server Seed + Client Seed + Nonce
        message = f"{client_seed}-{nonce}".encode()
        
        # 3. Create HMAC-SHA512 hash
        hmac_hash = hmac.new(self.server_seed.encode(), message, hashlib.sha512).hexdigest()
        
        # 4. Convert first 13 hex characters to a decimal (0 to 1 range)
        hex_substring = hmac_hash[:13]
        decimal_value = int(hex_substring, 16)
        max_value = 16**13 
        
        # Normalize to a float between 0 and 1
        normalized = decimal_value / max_value
        
        # 5. Apply the House Edge Formula (97% RTP)
        house_edge = 0.97 
        
        # The standard crash formula
        crash_point = house_edge / (1 - normalized)
        
        # 6. Cap the maximum multiplier and set minimum to 1.00x
        crash_point = max(1.00, min(crash_point, 10000.0))
        
        return round(crash_point, 2)

# --- TESTING THE SIMULATION ---
# --- LARGE SCALE SIMULATION ---
if __name__ == "__main__":
    engine = CrashEngine()
    
    total_rounds = 10000
    total_multiplier = 0
    low_crash_count = 0 # Counts rounds under 2.0x
    
    print(f"Running {total_rounds} rounds simulation... Please wait.")
    
    for i in range(1, total_rounds + 1):
        crash = engine.calculate_crash_point("player_123", i)
        total_multiplier += crash
        
        if crash < 2.0:
            low_crash_count += 1
            
    average_multiplier = total_multiplier / total_rounds
    low_crash_percentage = (low_crash_count / total_rounds) * 100
    
    print("\n--- SIMULATION RESULTS ---")
    print(f"Total Rounds Played: {total_rounds}")
    print(f"Average Multiplier: {average_multiplier:.2f}x")
    print(f"Rounds that crashed BELOW 2.0x: {low_crash_count} ({low_crash_percentage:.2f}%)")
    print(f"Rounds that crashed ABOVE 2.0x: {total_rounds - low_crash_count} ({(100 - low_crash_percentage):.2f}%)")
    engine = CrashEngine()
    print(f"Server Seed Hash (Public): {engine.get_server_seed_hash()}")
    
    # Simulate 20 rounds to see the math
    print("\n--- 20 Rounds Simulation ---")
    for i in range(1, 21):
        crash = engine.calculate_crash_point("player_123", i)
        print(f"Round {i}: {crash}x")
