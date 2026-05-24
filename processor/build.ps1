$ErrorActionPreference = "Stop"

$ZipPath = "../handlers/processor.zip"

$Dependencies = @(
    "@aws-sdk/client-dynamodb",
    "@aws-sdk/lib-dynamodb"
)

if (-not (Test-Path "package.json")) {
    Write-Host "Initializing npm project..."
    npm init -y | Out-Null
}
else {
    Write-Host "package.json already exists - skipping init"
}

foreach ($dep in $Dependencies) {

    $packagePath = "node_modules/" + ($dep -replace "@", "" -replace "/", "\")

    if (-not (Test-Path $packagePath)) {
        Write-Host "Installing dependency: $dep"
        npm install $dep
    }
    else {
        Write-Host "Dependency already installed: $dep"
    }
}

Write-Host "Creating zip package..."

if (Test-Path $ZipPath) {
    Remove-Item $ZipPath -Force
}

Compress-Archive `
    -Path index.js, package.json, package-lock.json, node_modules `
    -DestinationPath $ZipPath `
    -Force

Write-Host "Done: $ZipPath"