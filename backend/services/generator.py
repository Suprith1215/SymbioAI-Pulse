import random

def generate_synthetic_case():
    """
    Generates a randomized medical case for demonstration.
    """
    scenarios = [
        {
            "diagnosis": "Diabetes",
            "narrative": "Patient presented with polyuria and fatigue. History of Type 2 Diabetes for 5 years. Lab reports show HbA1c of 8.5%. Conservative treatment failed; requires specialist consultation.",
            "indicators": ["hba1c", "history"]
        },
        {
            "diagnosis": "Cardiac",
            "narrative": "65-year-old patient with sudden chest pain and palpitations. History of hypertension. ECG shows ST-segment elevation. Requires immediate stabilization and admission.",
            "indicators": ["ecg", "bp", "history"]
        },
        {
            "diagnosis": "Hernia",
            "narrative": "Patient with abdominal swelling and discomfort. Diagnosis of Inguinal Hernia confirmed. No prior surgical history. Requires surgical repair.",
            "indicators": []
        },
        {
            "diagnosis": "Cataract",
            "narrative": "Elderly patient reporting blurred vision and glare. Bilateral cataract diagnosed. Requires phacoemulsification surgery.",
            "indicators": ["history"]
        }
    ]

    scenario = random.choice(scenarios)
    
    # Introduce some "Gaps" randomly to show Decision Intelligence
    if random.random() > 0.5:
        # Intentionally remove an indicator from the narrative to create a GAP
        if scenario["indicators"]:
            missing = scenario["indicators"].pop()
            scenario["narrative"] = scenario["narrative"].replace(missing.upper(), "[DATA REDACTED]")

    return {
        "text": scenario["narrative"],
        "metadata": {
            "predicted_diagnosis": scenario["diagnosis"],
            "synthetic": True
        }
    }
