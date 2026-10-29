@echo off
title Kirana Flow - Small Business Brain Launcher
echo ========================================================
echo   Starting Small Business Brain (Backend + Frontend)
echo ========================================================

:: Determine paths
set "BASE_DIR=%~dp0"
if exist "%BASE_DIR%Kirana-Flow-main\backend" (
    set "PROJECT_DIR=%BASE_DIR%Kirana-Flow-main"
) else (
    set "PROJECT_DIR=%BASE_DIR%"
)

set "BACKEND_DIR=%PROJECT_DIR%\backend"
set "FRONTEND_DIR=%PROJECT_DIR%\frontend"

:: Check Backend (Port 8000)
netstat -ano | findstr :8000 | findstr LISTENING >nul
if %errorlevel% equ 0 (
    echo [Backend] Server already running on http://localhost:8000
) else (
    echo [1/3] Starting Backend Server on http://localhost:8000 ...
    if exist "%BACKEND_DIR%\.venv\Scripts\python.exe" (
        start "Backend - Small Business Brain" cmd /k "cd /d \"%BACKEND_DIR%\" && .venv\Scripts\python.exe -m uvicorn app.main:app --reload --port 8000 --host 0.0.0.0"
    ) else (
        start "Backend - Small Business Brain" cmd /k "cd /d \"%BACKEND_DIR%\" && py -m uvicorn app.main:app --reload --port 8000 --host 0.0.0.0"
    )
    timeout /t 3 /nobreak >nul
)

:: Check Frontend (Port 5173)
netstat -ano | findstr :5173 | findstr LISTENING >nul
if %errorlevel% equ 0 (
    echo [Frontend] Server already running on http://localhost:5173
) else (
    echo [2/3] Starting Frontend Server on http://localhost:5173 ...
    start "Frontend - Small Business Brain" cmd /k "cd /d \"%FRONTEND_DIR%\" && npm run dev -- --host 0.0.0.0"
    timeout /t 3 /nobreak >nul
)

echo [3/3] Opening Browser at http://localhost:5173 ...
start http://localhost:5173

echo ========================================================
echo   Both services are ready!
echo   Frontend : http://localhost:5173
echo   Backend  : http://localhost:8000
echo   API Docs : http://localhost:8000/docs
echo ========================================================
