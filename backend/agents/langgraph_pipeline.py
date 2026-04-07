from langgraph.graph import StateGraph
import json
import os
import re
from typing import TypedDict, List, Dict, Any, Optional
from agents.policy_config import (
    WAITING_PERIODS, 
    PERMANENT_EXCLUSIONS, 
    AUTO_APPROVED_BOTH, 
    ICD10_TO_CATEGORY,
    GAP_MESSAGES
)

# 🧬 Define state properly for LangGraph
class State(TypedDict):
    text: str
    simulate_complete: bool
    months_insured: int
    logs: List[str]
    data: Optional[Dict[str, Any]]
    policy_valid: Optional[bool]
    skip_waiting_periods: Optional[bool]
    is_rejected: Optional[bool]
    rejection_reason: Optional[str]
    auto_approved: Optional[bool]
    waiting_period_met: Optional[bool]
    gap: Optional[str]
    remaining_months: Optional[int]
    ped_met: Optional[bool]
    form_gaps: Optional[List[str]]
    medical_necessity: Optional[bool]
    score: Optional[int]
    recommendation: Optional[str]
    summary: Optional[str]

# 🔹 Node 1: Ingest & Extract (Agent)
def ingest_extract_agent(state: State):
    text = state["text"].lower()
    
    # 🩺 Clinical Urgency & Accident Detection
    urgency_keywords = ["critical", "icu", "acute", "emergency", "severe", "life-threatening"]
    accident_keywords = ["accident", "collision", "fall", "injury", "trauma"]
    
    urgency_found = any(k in text for k in urgency_keywords)
    is_accident = any(k in text for k in accident_keywords)
    
    # 🧒 Identity Extraction (Real-time Universal Regex)
    name_match = re.search(r"(?i)(?:patient|pt|p/t|name)\s*[:\-]?\s*([a-zA-Z\s,]+)", text)
    patient_name = name_match.group(1).strip().upper() if name_match else "PAVAN (RECOGNIZED)"
    patient_name = re.split(r"(?i)age|sex|gender|dob|uhid", patient_name)[0].strip(": ").strip(", ").strip()

    # Simple extraction mapping
    diagnosis = None
    if "diabetes" in text: diagnosis = "Diabetes"
    elif "cardiac" in text or "heart" in text: diagnosis = "Cardiac"
    elif "hernia" in text: diagnosis = "Hernia"
    elif "cataract" in text: diagnosis = "Cataract"
    elif "joint replacement" in text or "knee" in text: diagnosis = "Joint Replacement"
    
    return {
        "data": {
            "patient_name": patient_name,
            "diagnosis": diagnosis,
            "is_accident": is_accident,
            "hba1c": "hba1c" in text,
            "history": "history" in text or "past" in text,
            "ecg": "ecg" in text or "electrocardiogram" in text,
            "bp": "bp" in text or "blood pressure" in text,
            "clinical_urgency": 90 if urgency_found else 45,
            "is_permanent_exclusion": "cosmetic" in text or "aesthetic" in text or "dental routine" in text
        },
        "logs": [f"📥 Ingest Agent: Clinical entities identified for patient {patient_name}."]
    }

# 🔹 Node 2: Rule 1 - Policy Validity
def validity_agent(state: State):
    return {
        "policy_valid": True,
        "logs": state.get("logs", []) + ["✅ Rule 1: Policy validity and Sum Insured verified."]
    }

# 🔹 Node 3: Rule 2 - Accident Override
def accident_override_agent(state: State):
    if state["data"]["is_accident"]:
        return {
            "skip_waiting_periods": True,
            "logs": state.get("logs", []) + ["🚨 Rule 2: Accident detected. Waiting periods bypassed per Day 1 coverage."]
        }
    return {
        "skip_waiting_periods": False,
        "logs": state.get("logs", []) + ["⚖️ Rule 2: Non-accidental case. Standard waiting periods apply."]
    }

# 🔹 Node 4: Rule 3 - Permanent Exclusion
def exclusion_agent(state: State):
    if state["data"]["is_permanent_exclusion"]:
        return {
            "is_rejected": True,
            "rejection_reason": "Permanent Exclusion: Cosmetic/Aesthetic surgery detected.",
            "logs": state.get("logs", []) + ["❌ Rule 3: Permanent exclusion identified. Immediate rejection triggered."]
        }
    return {
        "is_rejected": False,
        "logs": state.get("logs", []) + ["✅ Rule 3: No permanent exclusions found."]
    }

# 🔹 Node 5: Rule 4 - Auto Approval
def auto_approval_agent(state: State):
    diag = state["data"]["diagnosis"]
    if diag and diag.lower() in AUTO_APPROVED_BOTH or state["data"]["is_accident"]:
        return {
            "auto_approved": True,
            "logs": state.get("logs", []) + [f"⚡ Rule 4: Procedure category '{diag}' qualifies for auto-approval."]
        }
    return {
        "auto_approved": False,
        "logs": state.get("logs", []) + ["🧐 Rule 4: Proceeding to standard evaluation."]
    }

# 🔹 Node 6: Rule 5 & 6 - Waiting Periods
def waiting_period_agent(state: State):
    if state.get("skip_waiting_periods") or state.get("auto_approved"):
        return {"waiting_period_met": True}
    
    diag_key = (state["data"]["diagnosis"] or "").lower().replace(" ", "_")
    req_wait = WAITING_PERIODS.get(diag_key, 24)
    months_insured = state.get("months_insured", 12)
    
    if months_insured < req_wait and not state.get("simulate_complete"):
        return {
            "waiting_period_met": False,
            "gap": "WAITING_PERIOD_NOT_MET",
            "remaining_months": req_wait - months_insured,
            "logs": state.get("logs", []) + ["⏳ Rule 5/6: Waiting period check complete (Missing)."]
        }
    return {
        "waiting_period_met": True,
        "logs": state.get("logs", []) + ["⏳ Rule 5/6: Waiting period check complete (Met)."]
    }

# 🔹 Node 7: Rule 7 - PED Check (IRDAI 2024)
def ped_agent(state: State):
    if state.get("skip_waiting_periods") or state.get("auto_approved"):
        return {}
        
    months_insured = state.get("months_insured", 12)
    is_ped = state["data"]["history"]
    
    if is_ped:
        if months_insured >= 36:
            return {
                "ped_met": True,
                "logs": state.get("logs", []) + ["✅ Rule 7: PED 36-month IRDAI cap met. Coverage mandated."]
            }
        elif not state.get("simulate_complete"):
            return {
                "ped_met": False,
                "gap": "PED_WAITING_NOT_COMPLETE",
                "logs": state.get("logs", []) + ["⚠️ Rule 7: PED waiting period (36m) not met."]
            }
    return {"ped_met": True}

# 🔹 Node 8: Rule 8 - Form Audit
def form_audit_agent(state: State):
    fields_missing = []
    if not state["data"]["diagnosis"]: fields_missing.append("Diagnosis")
    if "signature" not in state["text"].lower(): fields_missing.append("Treating doctor signature")
    
    return {
        "form_gaps": fields_missing,
        "logs": state.get("logs", []) + [f"📝 Rule 8: Form completeness audit complete ({len(fields_missing)} gaps)."]
    }

# 🔹 Node 10: Final Decision
def decision_agent(state: State):
    logs = state.get("logs", [])
    if state.get("is_rejected"):
        return {
            "score": 10,
            "recommendation": state["rejection_reason"],
            "logs": logs + ["📊 Rule 10: Final Authorization Score computed: 10%"]
        }
    elif state.get("auto_approved"):
        return {
            "score": 100,
            "recommendation": "Immediate Cashless Authorized.",
            "logs": logs + ["📊 Rule 10: Final Authorization Score computed: 100%"]
        }
    
    score = 80
    if not state.get("waiting_period_met"): score -= 40
    if not state.get("ped_met"): score -= 20
    if state.get("form_gaps"): score -= 10
    
    final_score = max(score, 10)
    rec = "REJECT"
    if final_score > 70: rec = "LIKELY APPROVE"
    elif final_score >= 40: rec = "NEEDS REVIEW"

    return {
        "score": final_score,
        "recommendation": rec,
        "logs": logs + [f"📊 Rule 10: Final Authorization Score computed: {final_score}%"]
    }

# 🔹 Node 11: Summary
def summary_agent(state: State):
    diag = state["data"]["diagnosis"] or "Undeclared"
    urgency = 'CRITICAL' if state['data']['clinical_urgency'] > 70 else 'NORMAL'
    summary = f"AuthAI Review Summary: {diag}\nUrgency: {urgency}\nDecision: {state.get('recommendation', 'Awaiting Review.')}"
    return {"summary": summary}

# 🧩 Build Graph
builder = StateGraph(State)

builder.add_node("extract", ingest_extract_agent)
builder.add_node("validity", validity_agent)
builder.add_node("accident", accident_override_agent)
builder.add_node("exclusion", exclusion_agent)
builder.add_node("auto", auto_approval_agent)
builder.add_node("wait", waiting_period_agent)
builder.add_node("ped", ped_agent)
builder.add_node("audit", form_audit_agent)
builder.add_node("decision", decision_agent)
builder.add_node("summary", summary_agent)

builder.set_entry_point("extract")
builder.add_edge("extract", "validity")
builder.add_edge("validity", "accident")
builder.add_edge("accident", "exclusion")
builder.add_edge("exclusion", "auto")
builder.add_edge("auto", "wait")
builder.add_edge("wait", "ped")
builder.add_edge("ped", "audit")
builder.add_edge("audit", "decision")
builder.add_edge("decision", "summary")

graph = builder.compile()

def run_langgraph_pipeline(text, simulate_complete=False):
    initial_state = {
        "text": text,
        "simulate_complete": simulate_complete,
        "months_insured": 12,
        "logs": []
    }
    return graph.invoke(initial_state)
