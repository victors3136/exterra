$ErrorActionPreference = "Stop"

$ModuleName = "gccc"
$BinaryName = "bootstrap"
$ZipPath = "../handlers/reader.zip"

$Dependencies = @(
    "github.com/aws/aws-lambda-go/events",
    "github.com/aws/aws-lambda-go/lambda",
    "github.com/aws/aws-sdk-go-v2/config",
    "github.com/aws/aws-sdk-go-v2/service/dynamodb"
)

if (-not (Test-Path "go.mod")) {
    Write-Host "Initializing go module: $ModuleName"
    go mod init $ModuleName
}
else {
    Write-Host "go.mod already exists - skipping init"
}

Write-Host "Tidying modules..."

$tidyWorked = $true

try {
    go mod tidy
}
catch {
    $tidyWorked = $false
}

if (-not $tidyWorked) {

    Write-Host "Installing missing dependencies..."

    foreach ($dep in $Dependencies) {
        go get $dep
    }

    go mod tidy
}

$env:GOOS = "linux"
$env:GOARCH = "amd64"
$env:CGO_ENABLED = "0"

Write-Host "Building binary..."

if (Test-Path $BinaryName) {
    Remove-Item $BinaryName -Force
}

go build -o $BinaryName main.go

Write-Host "Creating zip package..."

if (Test-Path $ZipPath) {
    Remove-Item $ZipPath -Force
}

Compress-Archive -Path $BinaryName -DestinationPath $ZipPath -Force

Write-Host "Done: $ZipPath"