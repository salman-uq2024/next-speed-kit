set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT_DIR"

pnpm build

mkdir -p dist
ARCHIVE="dist/next-speed-kit-$(date +%F).zip"
rm -f "$ARCHIVE"

zip -9 -r "$ARCHIVE" $(git ls-files) dist -x "dist/next-speed-kit-*.zip"

echo "Wrote $ARCHIVE"
