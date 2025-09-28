set -euo pipefail
mkdir -p dist
git ls-files | zip -9 -@ "dist/next-speed-kit-$(date +%F).zip"
echo "Wrote dist/*.zip"
