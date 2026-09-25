@echo off
echo ==================================================
echo Starting SOC L1 Training Dashboard - Backend
echo ==================================================
cd /d "%~dp0backend"
if exist ".venv\Scripts\python.exe" (
    ".venv\Scripts\python.exe" -m uvicorn main:app --host 127.0.0.1 --port 8000 --reload
) else (
    python -m uvicorn main:app --host 127.0.0.1 --port 8000 --reload
)
pause
