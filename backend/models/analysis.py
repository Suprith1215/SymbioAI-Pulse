from pydantic import BaseModel
from typing import List, Optional

class ExtractedData(BaseModel):
    patient_name: str = "Anonymous"
    age: Optional[int] = None
    diagnosis: str
    symptoms: List[str]
    treatment: str
    lab_values: List[str]

class PolicyCheck(BaseModel):
    label: str
    status: str  # "CHECK" or "FAIL"

class AnalysisResult(BaseModel):
    extracted: ExtractedData
    checks: List[PolicyCheck]
    probability: int
    missing_data: List[str]
    recommendation: str
    risk_level: str
