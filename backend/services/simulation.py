from typing import Dict, Any

def simulate_granular_fix(current_data: Dict[str, Any], fix_type: str) -> Dict[str, Any]:
    """
    Simulates a clinical evidence injection into the existing adjudication result.
    Moves Score from baseline to optimized based on 'fixed' gaps.
    """
    # Clone for deep mutation
    optimized = current_data.copy()
    
    # Identify which gap to 'resolve'
    if fix_type == "hba1c":
        optimized["extracted"]["lab_values"] = ["HbA1c: 6.8% (Normal-Stable)"]
        optimized["checks"] = [c if c["label"] != "Medical Necessity" else {"label": "Medical Necessity", "status": "CHECK"} for c in optimized["checks"]]
        optimized["probability"] = min(optimized["probability"] + 25, 95)
        optimized["recommendation"] = "Evidence Gap Resolved: HbA1c history confirms glycemic control. CASE AUTHORIZED."
        optimized["missing_data"] = [m for m in optimized["missing_data"] if "HbA1c" not in m]

    elif fix_type == "history":
        optimized["extracted"]["history"] = "Verified 36-month Clinical History Found."
        # Update specific check logic
        optimized["checks"] = [c if c["label"] != "36m PED Cap" else {"label": "36m PED Cap", "status": "CHECK"} for c in optimized["checks"]]
        optimized["probability"] = min(optimized["probability"] + 20, 92)
        optimized["recommendation"] = "PED Wait Period Resolved: Documentation confirms compliance with IRDAI 2024 (36m cap met)."
        optimized["missing_data"] = [m for m in optimized["missing_data"] if "Waiting" not in m]

    elif fix_type == "signature":
        optimized["checks"] = [c if c["label"] != "Policy Validity" else {"label": "Policy Validity", "status": "CHECK"} for c in optimized["checks"]]
        optimized["probability"] = min(optimized["probability"] + 10, 88)
        optimized["recommendation"] = "Administrative Gap Resolved: Digital Signature verified with Physician Registry."
        optimized["missing_data"] = [m for m in optimized["missing_data"] if "signature" not in m.lower()]

    # Sync Summary
    optimized["summary"] = f"OPTIMIZED ADJUDICATION: {optimized['recommendation']}\nProbability: {optimized['probability']}%"
    
    return optimized
