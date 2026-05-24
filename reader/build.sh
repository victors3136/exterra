#!/usr/bin/env bash

set -euo pipefail

MODULE_NAME="gccc"
BINARY_NAME="bootstrap"
ZIP_PATH="../handlers/reader.zip"

DEPENDENCIES=(
  "github.com/aws/aws-lambda-go/events"
  "github.com/aws/aws-lambda-go/lambda"
  "github.com/aws/aws-sdk-go-v2/aws"
  "github.com/aws/aws-sdk-go-v2/config"
  "github.com/aws/aws-sdk-go-v2/service/dynamodb"
  "github.com/aws/aws-sdk-go-v2/service/dynamodb/types"
)

if [ ! -f "go.mod" ]; then
  echo "Initializing go module: ${MODULE_NAME}"
  go mod init "${MODULE_NAME}"
else
  echo "go.mod already exists - skipping init"
fi

echo "Tidying modules..."

if ! go mod tidy; then

  echo "Installing missing dependencies..."

  for dep in "${DEPENDENCIES[@]}"; do
    go get "$dep"
  done

  go mod tidy
fi

export GOOS=linux
export GOARCH=amd64
export CGO_ENABLED=0

echo "Building binary..."

rm -f "${BINARY_NAME}"

go build -o "${BINARY_NAME}" main.go

echo "Creating zip package..."

rm -f "${ZIP_PATH}"

zip -j "${ZIP_PATH}" "${BINARY_NAME}"

echo "Done: ${ZIP_PATH}"