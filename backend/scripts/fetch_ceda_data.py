import os
import json
import requests
from dotenv import load_dotenv

load_dotenv()

API_KEY = os.getenv("CEDA_API_KEY")
BASE_URL = "https://api.ceda.gov.in/api/v1"  # Assumed base URL, needs verification
DATA_DIR = "data"

def fetch_and_save(endpoint, filename):
    print(f"Fetching data from {endpoint}...")
    headers = {"Authorization": f"Bearer {API_KEY}"}
    try:
        response = requests.get(f"{BASE_URL}/{endpoint}", headers=headers)
        response.raise_for_status()
        data = response.json()
        
        file_path = os.path.join(DATA_DIR, filename)
        with open(file_path, "w", encoding="utf-8") as f:
            json.dump(data, f, indent=4, ensure_ascii=False)
        print(f"Successfully saved to {file_path}")
    except Exception as e:
        print(f"Error fetching {endpoint}: {e}")

if __name__ == "__main__":
    if not os.path.exists(DATA_DIR):
        os.makedirs(DATA_DIR)
        
    endpoints = {
        "states": "states.json",
        "districts": "districts.json",
        "apmcs": "apmcs.json",
        "commodities": "commodities.json"
    }
    
    for endpoint, filename in endpoints.items():
        fetch_and_save(endpoint, filename)
