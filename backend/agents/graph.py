# SymbioAI Stateful Agent Graph (Lightweight LangGraph-style)

# Simple state container
class State(dict):
    pass

POLICY = {
    "Diabetes": {"required": ["HbA1c", "Treatment history"], "base": 80},
    "Cardiac": {"required": ["ECG", "Blood Pressure"], "base": 75},
    "Hypertension": {"required": ["BP Logs", "Renal Function"], "base": 75}
}

SUGGEST = {
    "HbA1c": "Attach latest HbA1c lab report (≤90 days history)",
    "Treatment history": "Add ≥3 months past treatment records for clinical context",
    "ECG": "Include recent ECG waveform and cardiologist interpretation",
    "Blood Pressure": "Attach daily BP logs for the preceding 14 days",
    "BP Logs": "Provide missing blood pressure logs for validation",
    "Renal Function": "Include recent kidney function test (Creatinine/GFR) reports",
    "Specialist referral": "Attach the required specialist referral documentation"
}

def ingest(state):
    state["logs"] = ["📥 Ingested clinical report"]
    return state

def extract(state):
    text = state["text"].lower()
    data = {
        "diagnosis": None,
        "hba1c": "hba1c" in text,
        "history": "history" in text or "past" in text,
        "ecg": "ecg" in text or "electrocardiogram" in text,
        "bp": "bp" in text or "blood pressure" in text
    }

    if "diabetes" in text:
        data["diagnosis"] = "Diabetes"
    elif "cardiac" in text or "heart" in text:
        data["diagnosis"] = "Cardiac"
    elif "hypertension" in text:
        data["diagnosis"] = "Hypertension"

    state["extracted"] = data
    state["logs"].append("🧠 Extracted clinical entities (Diagnosis, Symptoms)")
    return state

def normalize(state):
    d = state["extracted"]
    state["normalized"] = {
        "condition": d["diagnosis"],
        "docs": {
            "HbA1c": d["hba1c"],
            "Treatment history": d["history"],
            "ECG": d["ecg"],
            "Blood Pressure": d["bp"],
            "BP Logs": d["bp"],
            "Renal Function": False, # Mocked
            "Specialist referral": False # Mocked
        }
    }
    state["logs"].append("🔧 Normalized clinical metadata")
    return state

def policy_match(state):
    cond = state["normalized"]["condition"]
    state["policy"] = POLICY.get(cond, {"required": [], "base": 50})
    state["logs"].append(f"📚 Matched against {cond if cond else 'General'} Policy")
    return state

def gap_detect(state):
    req = state["policy"].get("required", [])
    docs = state["normalized"]["docs"]
    
    # Check for gaps (and handle simulation override)
    missing = [r for r in req if not docs.get(r)]
    
    if state.get("simulate_complete"):
        state["missing"] = []
    else:
        state["missing"] = missing
        
    state["logs"].append(f"🧩 Gaps detected: {len(state['missing'])} missing items")
    return state

def risk_score(state):
    base = state["policy"].get("base", 50)
    penalty = 20 * len(state["missing"])
    score = max(10, base - penalty)
    state["score"] = score
    state["logs"].append(f"📊 Authorization Probability computed: {score}%")
    return state

def strategy(state):
    missing_items = state["missing"]
    recs = [SUGGEST.get(m, f"Add {m} documentation") for m in missing_items]
    state["recommendations"] = recs if recs else ["Clinical evidence is complete. Proceed to submission."]
    state["logs"].append("🚀 Intelligence Strategy generated")
    return state

def explain(state):
    state["explanation"] = {
        "valid": [k for k, v in state["normalized"]["docs"].items() if v and k in state["policy"].get("required", [])],
        "missing": state["missing"],
        "reason": "Missing required documents reduce approval likelihood based on carrier policy."
    }
    state["logs"].append("🔍 Explanation synthesis ready")
    return state

def run_graph(state):
    """Orchestrates the modular agent steps."""
    state = ingest(state)
    state = extract(state)
    state = normalize(state)
    state = policy_match(state)
    state = gap_detect(state)
    state = risk_score(state)
    state = strategy(state)
    state = explain(state)
    return state
