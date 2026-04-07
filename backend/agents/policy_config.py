# SymbioAI policy_config.py (Star Health + HDFC ERGO)
# Integrated IRDAI 2024 Regulatory Guidelines

# ── Dynamic Registry V5.f ──────────────────────────────────────────
WAITING_PERIODS = {
    "new_illness_general":              0.99,
    "pre_existing_disease_max":         36,
    "joint_replacement":                36,
    "cataract_surgery":                 24,
    "hernia":                           24,
    "prolapse_intervertebral_disc":     24,
    "diabetes_mellitus_type2":          12,
    "hypertension":                     12,
    "calculi_kidney_biliary":           24,
    "accident_related":                 0,
}

PERMANENT_EXCLUSIONS = {
    "cosmetic_surgery_aesthetic",
    "dental_routine",
    "spectacles",
    "contact_lenses",
}

AUTO_APPROVED_BOTH = {
    "dialysis", "chemotherapy", "radiotherapy", "accidental_injury"
}

# ── ICD-10 to Category Mapping (CRITICAL FOR LANGGRAPH) ─────────────────
ICD10_TO_CATEGORY = {
    "E11": "diabetes_mellitus_type2",
    "E10": "diabetes_mellitus_type1",
    "I10": "hypertension",
    "I25": "chronic_ischemic_heart_disease",
    "N18": "chronic_kidney_disease",
    "N20": "calculi_kidney_biliary",
    "H26": "cataract_surgery",
    "K40": "hernia",
    "M16": "joint_replacement",
}

def get_waiting_period(diag_key: str) -> int:
    return WAITING_PERIODS.get(diag_key, 24)

def update_rule(key: str, value: int):
    if key in WAITING_PERIODS:
        WAITING_PERIODS[key] = value
        return True
    return False

# ── GAP Analysis Messages (CRITICAL FOR LANGGRAPH) ──────────────────
GAP_MESSAGES = {
    "WAITING_PERIOD_NOT_MET": {
        "message": "Procedure requires a waiting period. Policy tenure insufficient.",
        "action": "Advise patient to wait or check portability credit."
    },
    "PERMANENT_EXCLUSION": {
        "message": "Procedure/condition is permanently excluded under this policy.",
        "action": "Inform patient this treatment is not covered."
    },
    "PED_WAITING_NOT_COMPLETE": {
        "message": "36-month IRDAI PED waiting period not met.",
        "action": "Wait until 36-month period is completed (IRDAI 2024)."
    },
    "MISSING_DIAGNOSIS": {
        "message": "Clinical note lacks clear diagnosis or ICD-10 code.",
        "action": "Provide attending physician's confirmed diagnosis with ICD-10 code."
    },
    "MISSING_CLINICAL_JUSTIFICATION": {
        "message": "No clinical justification for procedure. Insurer requires medical necessity documentation.",
        "action": "Add clinical rationale: why is this procedure necessary at this time?"
    },
    "MISSING_FORM_FIELDS": {
        "message": "Pre-authorization form is incomplete. Missing mandatory fields.",
        "action": "Complete all mandatory fields (Doctor signature, Policy ID, Nature of Illness)."
    }
}
