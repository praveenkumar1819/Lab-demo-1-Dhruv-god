Write-Host "==================================================" -ForegroundColor Cyan
Write-Host "Starting SOC L1 Training Dashboard" -ForegroundColor Cyan
Write-Host "==================================================" -ForegroundColor Cyan

$root = $PSScriptRoot

Start-Process powershell -ArgumentList "-NoExit", "-Command", "& '$root\backend\.venv\Scripts\python.exe' -m uvicorn main:app --host 127.0.0.1 --port 8000 --reload" -WorkingDirectory "$root\backend"
Start-Sleep -Seconds 2
Start-Process powershell -ArgumentList "-NoExit", "-Command", "npm run dev" -WorkingDirectory "$root\frontend"

Write-Host "Both services started!" -ForegroundColor Green
Write-Host "Backend API:  http://127.0.0.1:8000" -ForegroundColor Yellow
Write-Host "Frontend App: http://127.0.0.1:5173" -ForegroundColor Yellow
