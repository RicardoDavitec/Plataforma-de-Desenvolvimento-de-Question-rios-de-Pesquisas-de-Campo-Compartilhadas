# Script de inicio
Write-Host ""
Write-Host "=== INICIANDO APLICACAO ===" -ForegroundColor Green

# Parar processos
Get-Process | Where-Object {$_.ProcessName -like '*node*'} | Stop-Process -Force -ErrorAction SilentlyContinue
Start-Sleep -Seconds 2

# Backend
Write-Host "Iniciando Backend..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd D:\Research_Quest\backend; npm run start:dev"

# Aguardar
Write-Host "Aguardando backend (40 segundos)..." -ForegroundColor Yellow
Start-Sleep -Seconds 40

# Frontend  
Write-Host "Iniciando Frontend..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd D:\Research_Quest\frontend; npm start"

Write-Host ""
Write-Host "PRONTO!" -ForegroundColor Green
Write-Host "Frontend: http://localhost:3000" -ForegroundColor White
Write-Host "Backend: http://localhost:3001" -ForegroundColor White
Write-Host "Login: admin@teste.com / senha123" -ForegroundColor White
Write-Host ""
