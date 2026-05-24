#!/usr/bin/env bash

set -euo pipefail

ZIP_PATH="../handlers/processor.zip"

DEPENDENCIES=(
  "@aws-sdk/client-dynamodb"
  "@aws-sdk/lib-dynamodb"
)

if [ ! -f "package.json" ]; then
  echo "Initializing npm project..."
  npm init -y >/dev/null 2>&1
else
  echo "package.json already exists - skipping init"
fi

for dep in "${DEPENDENCIES[@]}"; do

  package_dir="node_modules/${dep/@/}"

  if [ ! -d "$package_dir" ]; then
    echo "Installing dependency: $dep"
    npm install "$dep"
  else
    echo "Dependency already installed: $dep"
  fi
done

echo "Creating zip package..."

rm -f "$ZIP_PATH"

zip -r "$ZIP_PATH" \
  index.js \
  package.json \
  package-lock.json \
  node_modules

echo "Done: $ZIP_PATH"