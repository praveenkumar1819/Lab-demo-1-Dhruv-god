@echo off
echo ==================================================
echo Starting SOC L1 Training Dashboard (Both Services)
echo ==================================================
start "SOC Backend (FastAPI)" cmd /k "%~dp0start-backend.bat"
timeout /t 2 >nul
start "SOC Frontend (Vite/React)" cmd /k "%~dp0start-frontend.bat"
echo.
echo Both servers have been launched in separate windows:
echo - Backend:  http://127.0.0.1:8000 (API & Docs at /docs)
echo - Frontend: http://127.0.0.1:5173
echo.
