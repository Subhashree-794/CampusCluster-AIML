@echo off
TITLE CampusCluster Runner
echo ============================================================
echo Starting CampusCluster (Flask Backend + Vite React Frontend)
echo ============================================================
echo.

echo [1/2] Starting Flask Backend Server (Port 5000)...
start "CampusCluster Backend" cmd /k "cd /d %~dp0backend && python app.py"

echo [2/2] Starting Vite Frontend Server (Port 5173)...
start "CampusCluster Frontend" cmd /k "cd /d %~dp0frontend && npm run dev"

echo.
echo ============================================================
echo Both servers have been launched in separate command windows!
echo Backend:  http://127.0.0.1:5000
echo Frontend: http://localhost:5173
echo ============================================================
echo.
pause

