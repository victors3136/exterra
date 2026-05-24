#!/usr/bin/env bash

set -euo pipefail

ZIP_PATH="../handlers/generator.zip"

echo "Creating zip package..."

rm -f "$ZIP_PATH"

zip -j "$ZIP_PATH" index.py

echo "Done: $ZIP_PATH"