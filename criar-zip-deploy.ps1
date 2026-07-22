# Script para criar ZIP de deploy para SquareCloud
Write-Host "🚀 Criando pacote de deploy para SquareCloud..." -ForegroundColor Cyan

$pasta = Get-Location
$zipName = "easycheats-deploy.zip"
$zipPath = Join-Path $pasta $zipName

# Remove ZIP antigo se existir
if (Test-Path $zipPath) {
    Remove-Item $zipPath -Force
    Write-Host "✓ ZIP antigo removido" -ForegroundColor Yellow
}

# Cria novo ZIP
Write-Host "📦 Compactando arquivos..." -ForegroundColor Cyan

# Lista de arquivos para incluir
$arquivos = @(
    "server.js",
    "package.json",
    "squarecloud.app",
    "public"
)

# Cria o ZIP
Compress-Archive -Path $arquivos -DestinationPath $zipPath -Force

Write-Host ""
Write-Host "✅ Deploy criado com sucesso!" -ForegroundColor Green
Write-Host "📁 Arquivo: $zipName" -ForegroundColor White
Write-Host ""
Write-Host "📋 Próximos passos:" -ForegroundColor Yellow
Write-Host "1. Acesse https://squarecloud.app" -ForegroundColor White
Write-Host "2. Faça login e adicione créditos via PIX" -ForegroundColor White
Write-Host "3. Clique em 'Novo aplicativo'" -ForegroundColor White
Write-Host "4. Faça upload do arquivo $zipName" -ForegroundColor White
Write-Host ""
Write-Host "⚙️  Lembre-se de configurar a variável:" -ForegroundColor Yellow
Write-Host "   ADMIN_PASSWORD=EasyCheats@2024" -ForegroundColor White
Write-Host ""

# Abre o explorador na pasta
Start-Process explorer.exe -ArgumentList $pasta
