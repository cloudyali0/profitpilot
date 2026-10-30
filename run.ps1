$baseDir = $PSScriptRoot
if (Test-Path "$baseDir\backend") {
    $projectDir = $baseDir
} elseif (Test-Path "$baseDir\ProfitPilot\backend") {
    $projectDir = "$baseDir\ProfitPilot"
} elseif (Test-Path "$baseDir\Kirana-Flow-main\backend") {
    $projectDir = "$baseDir\Kirana-Flow-main"
} else {
    $projectDir = $baseDir
}

$backendDir = "$projectDir\backend"
$frontendDir = "$projectDir\frontend"

Write-Host "========================================================" -ForegroundColor Cyan
Write-Host "  Starting Small Business Brain (Backend + Frontend)" -ForegroundColor Cyan
Write-Host "========================================================" -ForegroundColor Cyan

# Check port 8000
$port8000 = Get-NetTCPConnection -LocalPort 8000 -ErrorAction SilentlyContinue
if ($port8000) {
    Write-Host "[Backend] Server already running on http://localhost:8000" -ForegroundColor Yellow
} else {
    Write-Host "[1/3] Starting Backend Server on http://localhost:8000..." -ForegroundColor Green
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$backendDir'; if (Test-Path .\.venv\Scripts\python.exe) { & .\.venv\Scripts\python.exe -m uvicorn app.main:app --reload --port 8000 --host 0.0.0.0 } else { py -m uvicorn app.main:app --reload --port 8000 --host 0.0.0.0 }"
    Start-Sleep -Seconds 3
}

# Check port 5173
$port5173 = Get-NetTCPConnection -LocalPort 5173 -ErrorAction SilentlyContinue
if ($port5173) {
    Write-Host "[Frontend] Server already running on http://localhost:5173" -ForegroundColor Yellow
} else {
    Write-Host "[2/3] Starting Frontend Server on http://localhost:5173..." -ForegroundColor Green
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$frontendDir'; npm run dev -- --host 0.0.0.0"
    Start-Sleep -Seconds 3
}

Write-Host "[3/3] Opening Browser at http://localhost:5173..." -ForegroundColor Cyan
Start-Process "http://localhost:5173"

Write-Host "========================================================" -ForegroundColor Cyan
Write-Host "  Both services are ready!" -ForegroundColor Yellow
Write-Host "  Frontend : http://localhost:5173" -ForegroundColor Yellow
Write-Host "  Backend  : http://localhost:8000" -ForegroundColor Yellow
Write-Host "  API Docs : http://localhost:8000/docs" -ForegroundColor Yellow
Write-Host "========================================================" -ForegroundColor Cyan
