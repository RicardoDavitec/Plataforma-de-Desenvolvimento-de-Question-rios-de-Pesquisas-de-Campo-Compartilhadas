# Script para parar TODOS os processos da aplicação Research Quest
# Uso: .\stop-all.ps1

Write-Host "`n=== PARANDO APLICACAO RESEARCH QUEST ===" -ForegroundColor Yellow

# 1. Parar todos os processos Node.js
Write-Host "`n[1/4] Parando processos Node.js..." -ForegroundColor Cyan
$nodeProcesses = Get-Process | Where-Object {$_.ProcessName -like '*node*'}
if ($nodeProcesses) {
    $nodeProcesses | Stop-Process -Force -ErrorAction SilentlyContinue
    Write-Host "  ✓ $($nodeProcesses.Count) processos Node.js finalizados" -ForegroundColor Green
} else {
    Write-Host "  ℹ Nenhum processo Node.js encontrado" -ForegroundColor Gray
}

Start-Sleep -Seconds 2

# 2. Liberar porta 3001 (Backend)
Write-Host "`n[2/4] Liberando porta 3001 (Backend)..." -ForegroundColor Cyan
$port3001 = Get-NetTCPConnection -LocalPort 3001 -ErrorAction SilentlyContinue
if ($port3001) {
    Stop-Process -Id $port3001.OwningProcess -Force -ErrorAction SilentlyContinue
    Write-Host "  ✓ Porta 3001 liberada" -ForegroundColor Green
} else {
    Write-Host "  ✓ Porta 3001 já está livre" -ForegroundColor Green
}

# 3. Liberar porta 3000 (Frontend)
Write-Host "`n[3/4] Liberando porta 3000 (Frontend)..." -ForegroundColor Cyan
$port3000 = Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue
if ($port3000) {
    Stop-Process -Id $port3000.OwningProcess -Force -ErrorAction SilentlyContinue
    Write-Host "  ✓ Porta 3000 liberada" -ForegroundColor Green
} else {
    Write-Host "  ✓ Porta 3000 já está livre" -ForegroundColor Green
}

# 4. Aguardar liberação completa
Write-Host "`n[4/4] Aguardando liberação completa..." -ForegroundColor Cyan
Start-Sleep -Seconds 3

# Verificação final
$backend = Get-NetTCPConnection -LocalPort 3001 -ErrorAction SilentlyContinue
$frontend = Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue
$nodeCount = (Get-Process | Where-Object {$_.ProcessName -like '*node*'}).Count

Write-Host "`n=== STATUS FINAL ===" -ForegroundColor Yellow
Write-Host "Porta 3001: " -NoNewline
if ($backend) { 
    Write-Host "OCUPADA" -ForegroundColor Red 
} else { 
    Write-Host "LIVRE" -ForegroundColor Green 
}

Write-Host "Porta 3000: " -NoNewline
if ($frontend) { 
    Write-Host "OCUPADA" -ForegroundColor Red 
} else { 
    Write-Host "LIVRE" -ForegroundColor Green 
}

Write-Host "Processos Node.js ativos: $nodeCount" -ForegroundColor $(if($nodeCount -eq 0){'Green'}else{'Yellow'})

Write-Host ""
Write-Host "Aplicação parada com sucesso!" -ForegroundColor Green
Write-Host "Execute .\start-all.ps1 para iniciar novamente." -ForegroundColor Cyan
Write-Host ""
