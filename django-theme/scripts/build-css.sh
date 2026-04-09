#!/usr/bin/env bash
# Compile SCSS → lms-main.css without a local Node/npm install (uses Docker).
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
docker run --rm -v "$ROOT":/work -w /work node:20-alpine sh -c "npm ci && npm run build"
echo "Built: $ROOT/lms/static/css/lms-main.css"
