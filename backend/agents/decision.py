from typing import List, Dict

def evaluate_scenarios(scenarios: List[Dict], domain: str = "Healthcare"):
    """
    Agent 2: Decision Agent. Evaluates outcomes and provides Smart Validation Checks.
    """
    outcomes = []
    
    # Domain-specific validation criteria
    checks = []
    if domain == "Banking":
        checks = [
            {"label": "Income Verification", "status": "CHECK"},
            {"label": "DTI Ratio (Deb-to-Income)", "status": "CHECK"},
            {"label": "Asset Liquidity", "status": "FAIL"}
        ]
    else: # Healthcare
        checks = [
            {"label": "Diagnosis Validity", "status": "CHECK"},
            {"label": "Prerequisite Therapy", "status": "FAIL"},
            {"label": "Procedure Appropriateness", "status": "CHECK"}
        ]

    for s in scenarios:
        # Probability calculation logic (simplified simulation)
        if s["id"] == "A":
            prob = int(s["confidence"] * 100) + 15
            res = "APPROVED (Optimized)" if prob > 80 else "POTENTIAL"
            risk = "Low"
        elif s["id"] == "B":
            prob = 15
            res = "DENIED (Formal Prerequisite Gap)"
            risk = "High"
        else:
            prob = 45
            res = "PEER REVIEW (Clinical Necessity)"
            risk = "Medium"
            
        outcomes.append({
            **s,
            "calculated_probability": min(prob, 98),
            "simulated_outcome": res,
            "risk_evaluation": risk
        })
        
    best_path = max(outcomes, key=lambda x: x["calculated_probability"])
    
    return {
        "outcomes": outcomes,
        "best_decision": best_path,
        "checks": checks,
        "recommendation": f"To match '{best_path['title']}', focus on resolving the '{[c['label'] for c in checks if c['status'] == 'FAIL'][0]}' requirement."
    }
