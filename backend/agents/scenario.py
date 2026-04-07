def generate_scenarios(case_data: str, domain: str = "Healthcare"):
    """
    Agent 1: Scenario Generator. Supports multiple domains (Healthcare, Banking, Supply Chain).
    """
    if domain == "Banking":
        return [
            {
                "id": "A",
                "title": "Collateral-Backed Assumption",
                "assumption": "Assuming the undocumented secondary property appraisal meets the LTV (Loan-to-Value) thresholds.",
                "confidence": 0.88,
                "status": "High Stability"
            },
            {
                "id": "B",
                "title": "Strict Credit Check",
                "assumption": "Assuming no further income verification is available; strictly relying on the current soft-pull credit score.",
                "confidence": 0.94,
                "status": "Credit Compliance"
            },
            {
                "id": "C",
                "title": "Future Earnings Potential",
                "assumption": "Assuming the applicant's recent promotion letter offsets the missing 2-year tax return history.",
                "confidence": 0.55,
                "status": "Strategic Risk"
            }
        ]
    
    # Default: Healthcare
    return [
        {
            "id": "A",
            "title": "History of Conservative Therapy",
            "assumption": "Assuming the patient completed prerequisite physical therapy based on clinical timeline.",
            "confidence": 0.82,
            "status": "Clinical Confidence"
        },
        {
            "id": "B",
            "title": "Strict Evidence Compliance",
            "assumption": "Assuming no prior therapy was performed due to lack of explicit mention in the case.",
            "confidence": 0.95,
            "status": "Regulatory Formal"
        },
        {
            "id": "C",
            "title": "Acute Symptom Escalation",
            "assumption": "Assuming the radiculopathy is acute enough to bypass step-therapy requirements.",
            "confidence": 0.45,
            "status": "Edge Case Logic"
        }
    ]
