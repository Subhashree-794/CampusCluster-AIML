# CampusCluster PowerShell Startup Script
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host " Starting CampusCluster (Flask Backend + Vite Frontend)   " -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host ""

$rootDir = Split-Path -Parent $MyInvocation.MyCommand.Path

Write-Host "[1/2] Starting Flask Backend (Port 5000)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$rootDir\backend'; python app.py"

Write-Host "[2/2] Starting Vite React Frontend (Port 5173)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$rootDir\frontend'; npm run dev"

Write-Host ""
Write-Host "============================================================" -ForegroundColor Green
Write-Host " Both servers launched in separate PowerShell windows!     " -ForegroundColor Green
Write-Host " Frontend: http://localhost:5173                            " -ForegroundColor White
Write-Host " Backend:  http://127.0.0.1:5000                            " -ForegroundColor White
Write-Host "============================================================" -ForegroundColor Green

