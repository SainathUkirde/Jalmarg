@echo off
title Jalmarg Launcher
color 0A

cd /d "%~dp0"

echo.
echo  =========================================================
echo   Jalmarg - Quantum-Inspired Jalmarg Optimization
echo   Smart India Hackathon - Ministry of Ports and Shipping
echo  =========================================================
echo.

REM Check Python
python --version >nul 2>&1
if errorlevel 1 (
    echo  [ERROR] Python not found. Install Python 3.11+ from python.org
    pause
    exit /b 1
)
echo  [OK] Python found

REM Check Node
node --version >nul 2>&1
if errorlevel 1 (
    echo  [ERROR] Node.js not found. Install Node.js 18+ from nodejs.org
    pause
    exit /b 1
)
echo  [OK] Node.js found

REM Install Python packages if missing
echo  [1/5] Checking Python packages...
python -c "import numpy, pandas, sklearn, xgboost, fastapi, uvicorn" >nul 2>&1
if errorlevel 1 (
    echo  [...] Installing Python packages - please wait...
    pip install numpy pandas scikit-learn xgboost joblib fastapi "uvicorn[standard]" --quiet
)
echo  [OK] Python packages ready

REM Install Node packages if missing
echo  [2/5] Checking Node packages...
if not exist "frontend\node_modules" (
    echo  [...] Installing frontend packages - first run takes ~1 minute...
    cd frontend
    npm install
    cd ..
)
echo  [OK] Node packages ready

REM Generate datasets if missing
echo  [3/5] Checking datasets...
if not exist "data\raw\fuel_consumption.csv" (
    echo  [...] Generating datasets...
    python backend\data_pipeline\generate_datasets.py
    python backend\data_pipeline\preprocess.py
)
echo  [OK] Datasets ready

REM Train models if missing
echo  [4/5] Checking trained models...
if not exist "backend\models\quantum_inspired.pkl" (
    echo  [...] Training ML models - takes about 30 seconds...
    python -c "import sys; sys.path.insert(0,'backend'); from models.prediction import train_all_models; train_all_models()"
)
echo  [OK] Models ready

REM Launch backend
echo  [5/5] Starting servers...
echo.
start "Jalmarg Backend" cmd /k "cd /d %~dp0backend && echo Backend starting on http://localhost:8000 ... && python main.py"

echo  [...] Waiting for backend to start...
timeout /t 4 /nobreak >nul

REM Launch frontend
start "Jalmarg Frontend" cmd /k "cd /d %~dp0frontend && echo Frontend starting on http://localhost:5173 ... && npm run dev"

echo  [...] Waiting for frontend to compile...
timeout /t 8 /nobreak >nul

REM Open browser
echo  [...] Opening browser...
start "" "http://localhost:5173"

echo.
echo  =========================================================
echo   Jalmarg is running!
echo   Frontend : http://localhost:5173
echo   Backend  : http://localhost:8000
echo  =========================================================
echo.
echo  Two server windows are open - keep them running.
echo  Close those windows to stop the servers.
echo.
pause
