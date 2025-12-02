#!/usr/bin/env pwsh
# Script para iniciar o backend em desenvolvimento
# Carrega variáveis de ambiente do .env e inicia o Nest

$ErrorActionPreference = "Stop"

# Garante que está executando de dentro do backend
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $ScriptDir
Write-Host "Diretorio de trabalho: $(Get-Location)" -ForegroundColor Cyan

# Carrega .env
if (Test-Path ".\.env") {
    Write-Host "Carregando variaveis de ambiente do .env..." -ForegroundColor Cyan
    Get-Content ".\.env" | ForEach-Object {
        if ($_ -match '^([^#][^=]+)=(.*)$') {
            $key = $matches[1].Trim()
            $value = $matches[2].Trim().Trim('"')
            [Environment]::SetEnvironmentVariable($key, $value, "Process")
            Write-Host "  OK: $key definida" -ForegroundColor Green
        }
    }
} else {
    Write-Host "Aviso: Arquivo .env nao encontrado!" -ForegroundColor Yellow
}

# Inicia o Nest
Write-Host ""
Write-Host "Iniciando backend NestJS..." -ForegroundColor Cyan
npx nest start --watch
