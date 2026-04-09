#!/usr/bin/env bash
# Build pipeline for cba-theme:
#   1) Compile theme Sass -> lms-main.css + cms-main.css (npm run build:css from repo root)
#   2) Sync django-theme/ -> Tutor env (also automatic on `tutor images build` via plugin)
#   3) Optional: MFE brand package if it defines npm run build
#   4) Optional: edx-platform compile-sass + collectstatic in running LMS (dev workflow)
#
# Usage (from repo root):
#   bash django-theme/scripts/build-theme.sh              # sync + live assets if LMS container exists
#   bash django-theme/scripts/build-theme.sh --sync-only  # only sync (use before Docker image build)
# Or: npm run build / npm run build:sync
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
TUTOR_ROOT="${TUTOR_ROOT:-$HOME/.local/share/tutor}"
DEST="${TUTOR_ROOT}/env/build/openedx/themes/cba-theme"
SYNC_ONLY=false
SKIP_LIVE=false

for arg in "$@"; do
  case "$arg" in
    --sync-only) SYNC_ONLY=true ;;
    --skip-live) SKIP_LIVE=true ;;
  esac
done

# Sass: same as `npm run build:css` from repo root (django-theme/package-lock.json + npm run build)
if [[ -f "${REPO_ROOT}/package.json" ]] && grep -q '"build:css"' "${REPO_ROOT}/package.json" 2>/dev/null && command -v npm >/dev/null 2>&1; then
  echo "==> Theme CSS (LMS + CMS): npm run build:css (repo root)"
  (cd "${REPO_ROOT}" && npm run build:css)
elif [[ -f "${REPO_ROOT}/django-theme/package.json" ]] && command -v npm >/dev/null 2>&1; then
  echo "==> Theme CSS (LMS + CMS): npm ci && npm run build (django-theme/)"
  (cd "${REPO_ROOT}/django-theme" && npm ci --no-audit --no-fund && npm run build)
elif [[ -f "${REPO_ROOT}/django-theme/package.json" ]]; then
  echo "==> Warning: npm not found; skipping Sass (relying on committed lms-main.css / cms-main.css)."
fi

echo "==> Sync django-theme/ -> ${DEST}"
mkdir -p "$DEST"
rsync -a --delete "${REPO_ROOT}/django-theme/" "$DEST/"
echo "    OK ($(find "${DEST}" -type f 2>/dev/null | wc -l) files)"

if [[ -f "${REPO_ROOT}/mfe-brand/package.json" ]] && grep -q '"build"' "${REPO_ROOT}/mfe-brand/package.json" 2>/dev/null; then
  echo "==> mfe-brand: npm run build"
  (cd "${REPO_ROOT}/mfe-brand" && npm run build)
fi

if $SYNC_ONLY; then
  echo "==> Done (--sync-only). Next: tutor images build openedx"
  exit 0
fi

if $SKIP_LIVE; then
  echo "==> Skipped LMS compile (--skip-live)."
  exit 0
fi

LMS_CID=""
if docker container inspect tutor_local-lms-1 >/dev/null 2>&1; then
  LMS_CID="tutor_local-lms-1"
elif docker container inspect tutor_dev-lms-1 >/dev/null 2>&1; then
  LMS_CID="tutor_dev-lms-1"
fi

if [[ -z "$LMS_CID" ]]; then
  echo "==> No LMS container (tutor_local-lms-1 / tutor_dev-lms-1); skipped edx-platform Sass + collectstatic."
  echo "    Theme CSS was built above (npm). After 'tutor local start', run this script again for collectstatic."
  exit 0
fi

echo "==> edx-platform compile-sass in ${LMS_CID} (platform bundles; theme CSS is built via npm)"
docker exec "$LMS_CID" bash -c 'cd /openedx/edx-platform && npm run compile-sass -- --skip-default'

echo "==> collectstatic (LMS)"
docker exec "$LMS_CID" bash -lc \
  'cd /openedx/edx-platform && SERVICE_VARIANT=lms DJANGO_SETTINGS_MODULE=lms.envs.tutor.production ./manage.py lms collectstatic --noinput'

echo "==> Theme build finished."
