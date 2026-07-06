@echo off
setlocal
set "ROOT=%~dp0.."
cd /d "%ROOT%"

where node >nul 2>&1
if errorlevel 1 (
  echo Node.js is required. Install from https://nodejs.org
  pause
  exit /b 1
)

powershell -NoProfile -ExecutionPolicy Bypass -File "%ROOT%\scripts\Sync-RankingsOnLogin.ps1" -SyncOnly -Quiet

for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":8787" ^| findstr "LISTENING"') do (
  start "" "http://127.0.0.1:8787/rankings.html"
  exit /b 0
)

start "Ranking Dashboard" /MIN node "%ROOT%\scripts\serve-dashboard.mjs"
timeout /t 2 /nobreak >nul
start "" "http://127.0.0.1:8787/rankings.html"
