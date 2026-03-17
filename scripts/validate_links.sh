#!/bin/bash
# Quick Link Validation Script for constrainttheory repository
# Usage: bash scripts/validate_links.sh

set -e

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$REPO_ROOT"

echo "=== Constraint Theory Link Validation ==="
echo "Repository: $REPO_ROOT"
echo "Date: $(date)"
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Counters
TOTAL=0
PASSED=0
FAILED=0

check_url() {
    local url="$1"
    local name="$2"

    TOTAL=$((TOTAL + 1))
    echo -n "Checking $name... "

    STATUS=$(curl -s -o /dev/null -w "%{http_code}" --max-time 10 "$url" 2>/dev/null || echo "000")

    if [ "$STATUS" = "200" ] || [ "$STATUS" = "302" ]; then
        echo -e "${GREEN}✅ HTTP $STATUS${NC}"
        PASSED=$((PASSED + 1))
        return 0
    else
        echo -e "${RED}❌ HTTP $STATUS${NC}"
        FAILED=$((FAILED + 1))
        return 1
    fi
}

echo "=== Production URLs ==="
check_url "https://constraint-theory.superinstance.ai" "Main site"
check_url "https://constraint-theory.superinstance.ai/simulators/pythagorean/" "Pythagorean"
check_url "https://constraint-theory.superinstance.ai/simulators/rigidity/" "Rigidity"
check_url "https://constraint-theory.superinstance.ai/simulators/voxel/" "Voxel"
check_url "https://constraint-theory.superinstance.ai/simulators/holonomy/" "Holonomy"
check_url "https://constraint-theory.superinstance.ai/simulators/entropy/" "Entropy"
check_url "https://constraint-theory.superinstance.ai/simulators/flow/" "Flow"
check_url "https://constraint-theory.superinstance.ai/simulators/benchmark/" "Benchmark"

echo ""
echo "=== GitHub Repositories ==="
check_url "https://github.com/SuperInstance/Constraint-Theory" "Main repo"
check_url "https://github.com/SuperInstance/claw" "Claw"
check_url "https://github.com/SuperInstance/spreadsheet-moment" "Spreadsheet-moment"
check_url "https://github.com/SuperInstance/SuperInstance-papers" "Papers"
check_url "https://github.com/SuperInstance/dodecet-encoder" "Dodecet-encoder"

echo ""
echo "=== CDN Resources ==="
check_url "https://cdn.tailwindcss.com" "Tailwind CSS"
check_url "https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.css" "KaTeX CSS"
check_url "https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.js" "KaTeX JS"
check_url "https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js" "Three.js"

echo ""
echo "=== Documentation Files ==="
DOCS=(
    "docs/THEORETICAL_GUARANTEES.md"
    "docs/MATHEMATICAL_FOUNDATIONS_DEEP_DIVE.md"
    "docs/GEOMETRIC_INTERPRETATION.md"
    "docs/OPEN_QUESTIONS_RESEARCH.md"
    "docs/BASELINE_BENCHMARKS.md"
    "docs/IMPLEMENTATION_GUIDE.md"
)

for doc in "${DOCS[@]}"; do
    TOTAL=$((TOTAL + 1))
    echo -n "Checking $doc... "

    if [ -f "$doc" ]; then
        echo -e "${GREEN}✅ Exists${NC}"
        PASSED=$((PASSED + 1))
    else
        echo -e "${RED}❌ Missing${NC}"
        FAILED=$((FAILED + 1))
    fi
done

echo ""
echo "=== Summary ==="
echo "Total checks: $TOTAL"
echo -e "Passed: ${GREEN}$PASSED${NC}"
echo -e "Failed: ${RED}$FAILED${NC}"

if [ $FAILED -eq 0 ]; then
    echo ""
    echo -e "${GREEN}✅ ALL LINKS VALIDATED${NC}"
    echo "Ready for HN launch!"
    exit 0
else
    echo ""
    echo -e "${RED}❌ $FAILED link(s) failed${NC}"
    echo "Please fix before launching!"
    exit 1
fi
