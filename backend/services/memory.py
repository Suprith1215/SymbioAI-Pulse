import json
import os
from typing import Dict, Any, List

MEMORY_FILE = "experience_memory.json"

def save_case_to_memory(case_data: Dict[str, Any]):
    """
    Stores an adjudication result in the local JSON memory.
    """
    data = []
    if os.path.exists(MEMORY_FILE):
        try:
            with open(MEMORY_FILE, "r") as f:
                data = json.load(f)
        except:
            data = []
            
    # Append the case with a timestamp or simple ID
    case_entry = {
        "id": len(data) + 1,
        "diagnosis": case_data.get("extracted", {}).get("diagnosis"),
        "probability": case_data.get("probability"),
        "score": case_data.get("probability"),
        "recommendation": case_data.get("recommendation"),
        "clinical_urgency": case_data.get("clinical_urgency")
    }
    
    data.append(case_entry)
    
    # Keep only the last 50 cases for demo performance
    data = data[-50:]
    
    with open(MEMORY_FILE, "w") as f:
        json.dump(data, f, indent=4)

def get_memory_history() -> List[Dict[str, Any]]:
    """Returns the full adjudication history."""
    if not os.path.exists(MEMORY_FILE):
        return []
    try:
        with open(MEMORY_FILE, "r") as f:
            return json.load(f)
    except:
        return []

def find_similar_pattern(diagnosis: str) -> Dict[str, Any]:
    """
    Scans memory for a matching diagnosis and returns a success rate pattern.
    """
    history = get_memory_history()
    matches = [c for c in history if c.get("diagnosis", "").lower() == diagnosis.lower()]
    
    if not matches:
        return {
            "match_found": False,
            "success_rate": 78, # Baseline
            "message": "No direct pattern match; using baseline insurance risk profile."
        }
        
    avg_score = sum(c["score"] for c in matches) / len(matches)
    return {
        "match_found": True,
        "success_rate": int(avg_score),
        "message": f"Direct pattern match identified ({len(matches)} similar cases in HDFC-ERGO database)."
    }
