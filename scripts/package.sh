#!/bin/bash
set -euo pipefail

export TZ=UTC

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT_DIR"

pnpm build

mkdir -p dist
ARCHIVE="dist/next-speed-kit-$(date -u +%Y-%m-%d).zip"
rm -f dist/next-speed-kit-*.zip

git ls-files | zip -X -9 -@ "$ARCHIVE"

echo "Wrote $ARCHIVE"