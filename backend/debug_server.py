import sys
import os

# Add current dir to path
sys.path.append(os.getcwd())

try:
    print("🚀 Starting Main Server Debug...")
    from main import app
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8001) # Use different port for debug
except Exception as e:
    import traceback
    print("❌ Server Initialization Failed!")
    traceback.print_exc()
