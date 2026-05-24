$ErrorActionPreference = "Stop"

$ZipPath = "../handlers/generator.zip"

Write-Host "Creating zip package..."

if (Test-Path $ZipPath) {
    Remove-Item $ZipPath -Force
}

Compress-Archive `
    -Path index.py `
    -DestinationPath $ZipPath `
    -Force

Write-Host "Done: $ZipPath"