@echo off
echo Starting MiCamp Backend and Frontend Servers...
echo.

start "MiCamp Backend" cmd /k "cd /d %~dp0backend && node node_modules\.bin\ts-node-dev --respawn --pretty src/index.ts"
timeout /t 2 /nobreak >nul

start "MiCamp Frontend" cmd /k "cd /d %~dp0 && python -m http.server 8080"

echo.
echo Both servers are starting...
echo Backend: http://localhost:4000
echo Frontend: http://localhost:8080
echo.
echo Press any key to exit this window (servers will keep running)...
pause >nul

