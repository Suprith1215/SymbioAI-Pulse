from fastapi import FastAPI, HTTPException, Body, UploadFile, File, Query
from fastapi.middleware.cors import CORSMiddleware
import json
import os
from services.pipeline import run_intelligence_pipeline
from services.analyzer import extract_text_from_pdf, analyze_report_content
from services.generator import generate_synthetic_case
from services.memory import get_memory_history, save_case_to_memory
from services.simulation import simulate_granular_fix
from agents.policy_config import WAITING_PERIODS, update_rule
from pydantic import BaseModel
from typing import Optional, Dict, Any, List

app = FastAPI(title="SymbioAI Decision Intelligence System V5.f (Synthea-MIMIC Edition)")

# Setup CORS for Frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class PatientCase(BaseModel):
    case_data: str
    domain: Optional[str] = "Healthcare"

class SimulateRequest(BaseModel):
    current_data: Dict[str, Any]
    fix_type: str

class RuleUpdateRequest(BaseModel):
    key: str
    value: int

# 🟢 New Endpoint: Synthea Cases (GET)
@app.get("/api/synthea-cases")
async def get_synthea_cases():
    """Returns the 5 high-fidelity demo cases from Synthea/MIMIC data."""
    path = "data/synthea_patients.json"
    if os.path.exists(path):
        with open(path, "r") as f:
            return json.load(f)
    return []

# 🟢 New Endpoint: Analyze Synthea (POST)
@app.post("/api/analyze-synthea")
async def analyze_synthea(req: Dict[str, Any]):
    """Processes a specific clinical note from the Synthea demo set."""
    try:
        text = req.get("text", "")
        # Use existing analyzer which now includes MIMIC logic
        result = analyze_report_content(text)
        save_case_to_memory(result)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/simulate")
async def simulate(req: SimulateRequest):
    try:
        optimized = simulate_granular_fix(req.current_data, req.fix_type)
        return optimized
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/batch-generate")
async def batch_generate(count: int = 5):
    cases = []
    for _ in range(count):
        raw = generate_synthetic_case()
        res = run_intelligence_pipeline(raw["text"])
        cases.append(res)
        save_case_to_memory(res)
    return cases

@app.get("/api/rules")
async def get_rules():
    return WAITING_PERIODS

@app.post("/api/rules")
async def edit_rule(req: RuleUpdateRequest):
    success = update_rule(req.key, req.value)
    if not success:
        raise HTTPException(status_code=400, detail="Invalid rule key.")
    return {"status": "Rule Updated", "key": req.key, "value": req.value}

@app.get("/api/generate")
async def generate_case():
    return generate_synthetic_case()

@app.get("/api/history")
async def get_history():
    return get_memory_history()

@app.post("/api/process")
async def process_case(case: PatientCase):
    try:
        result = run_intelligence_pipeline(case.case_data, domain=case.domain)
        save_case_to_memory(result)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/analyze-report")
async def analyze_report(
    file: UploadFile = File(...),
    simulate_complete: bool = Query(False)
):
    try:
        content = await file.read()
        if file.filename.endswith(".pdf"):
            text = extract_text_from_pdf(content)
        else:
            text = content.decode("utf-8")
        
        result = analyze_report_content(text, simulate_complete=simulate_complete)
        save_case_to_memory(result)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/")
async def root():
    return {"message": "SymbioAI V5.f Decision Intelligence Engine Online."}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)
