import sys
import os

# Add current dir to path
sys.path.append(os.getcwd())

from agents.langgraph_pipeline import run_langgraph_pipeline

test_text = "Patient with diabetes and cardiac history reporting chest pain. Requires ECG and HbA1c."

try:
    print("🚀 Running LangGraph Test...")
    result = run_langgraph_pipeline(test_text)
    print("✅ Success!")
    print(f"Score: {result.get('score')}")
    print(f"Logs: {result.get('logs')}")
except Exception as e:
    import traceback
    print("❌ Failed!")
    traceback.print_exc()
