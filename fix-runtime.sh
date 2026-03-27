#!/bin/bash
# Runtime fix - izvršava se direktno u running container-u
# Ovo je backup rešenje ako build-time hook ne radi

set -e

echo "🔧 Runtime fix za USE_COMPREHENSIVE_THEMING..."

# Proveri da li container postoji (koristi ime umesto ID-a)
LMS_CONTAINER_NAME="tutor_local-lms-1"
if ! docker ps --format "{{.Names}}" | grep -q "^${LMS_CONTAINER_NAME}$"; then
    echo "❌ LMS container ne postoji"
    exit 1
fi
echo "✅ LMS container: $LMS_CONTAINER_NAME"

# Kreiraj Python script lokalno
cat > /tmp/cba-theme-fix.py << 'PYEOF'
import re
import os
import sys

file_path = "/openedx/edx-platform/lms/envs/tutor/production.py"

try:
    if not os.path.exists(file_path):
        print(f"❌ File {file_path} does not exist", file=sys.stderr)
        sys.exit(1)
    
    with open(file_path, "r") as f:
        content = f.read()
    
    if 'FEATURES["USE_COMPREHENSIVE_THEMING"]' not in content and "FEATURES['USE_COMPREHENSIVE_THEMING']" not in content:
        # Pronađi ENABLE_AUTHN_MICROFRONTEND i dodaj posle njega
        if 'FEATURES["ENABLE_AUTHN_MICROFRONTEND"]' in content:
            content = re.sub(
                r'(FEATURES\["ENABLE_AUTHN_MICROFRONTEND"\].*?)(\n)',
                r'\1\nFEATURES["USE_COMPREHENSIVE_THEMING"] = True\2',
                content,
                count=1
            )
        elif "FEATURES['ENABLE_AUTHN_MICROFRONTEND']" in content:
            content = re.sub(
                r"(FEATURES\['ENABLE_AUTHN_MICROFRONTEND'\].*?)(\n)",
                r"\1\nFEATURES['USE_COMPREHENSIVE_THEMING'] = True\2",
                content,
                count=1
            )
        elif 'FEATURES[' in content:
            # Dodaj posle prve FEATURES linije
            match = re.search(r'(FEATURES\[[^\]]+\].*?\n)', content)
            if match:
                pos = match.end()
                content = content[:pos] + 'FEATURES["USE_COMPREHENSIVE_THEMING"] = True\n' + content[pos:]
            else:
                content += '\nFEATURES["USE_COMPREHENSIVE_THEMING"] = True\n'
        else:
            # Dodaj na kraju fajla
            content += '\nFEATURES["USE_COMPREHENSIVE_THEMING"] = True\n'
        
        with open(file_path, "w") as f:
            f.write(content)
        print("✅ Added USE_COMPREHENSIVE_THEMING to production.py")
    else:
        print("✅ USE_COMPREHENSIVE_THEMING already exists")
    
    # Proveri da li je dodat
    if 'FEATURES["USE_COMPREHENSIVE_THEMING"]' in content or "FEATURES['USE_COMPREHENSIVE_THEMING']" in content:
        print("✅ Verification: USE_COMPREHENSIVE_THEMING is in production.py")
        sys.exit(0)
    else:
        print("❌ Verification failed", file=sys.stderr)
        sys.exit(1)
        
except Exception as e:
    print(f"❌ Error: {e}", file=sys.stderr)
    import traceback
    traceback.print_exc(file=sys.stderr)
    sys.exit(1)
PYEOF

# Kopiraj script u container i izvrši ga
echo "📋 Kopiranje script-a u container..."
docker cp /tmp/cba-theme-fix.py "${LMS_CONTAINER_NAME}:/tmp/cba-theme-fix.py"

echo "🔧 Izvršavanje fix-a..."
docker exec "${LMS_CONTAINER_NAME}" python3 /tmp/cba-theme-fix.py

# Očisti
rm -f /tmp/cba-theme-fix.py

echo ""
echo "✅ Runtime fix završen!"
echo ""
echo "Sledeći koraci:"
echo "  1. Restartuj LMS: tutor local restart lms"
echo "  2. Proveri da li tema radi u browser-u"

