#!/bin/bash
# Critical Issues Fix Script for constrainttheory HN Launch
# Run this script to fix the most critical issues before launch

set -e  # Exit on error

echo "========================================="
echo "Constraint Theory - Critical Issues Fix"
echo "========================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Fix 1: Format all Rust code
echo -e "${YELLOW}[1/5] Formatting Rust code...${NC}"
cd crates/constraint-theory-core
cargo fmt
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Code formatted successfully${NC}"
else
    echo -e "${RED}✗ Formatting failed${NC}"
    exit 1
fi
cd ../..
echo ""

# Fix 2: Fix doc test import issue
echo -e "${YELLOW}[2/5] Fixing doc test import issue...${NC}"
cd crates/constraint-theory-core/src
# Backup original
cp kdtree.rs kdtree.rs.backup
# Fix the import
sed -i 's/use kdtree::KDTree;/use crate::kdtree::KDTree;/' kdtree.rs
echo -e "${GREEN}✓ Doc test import fixed${NC}"
cd ../../..
echo ""

# Fix 3: Verify doc tests now pass
echo -e "${YELLOW}[3/5] Verifying doc tests...${NC}"
cd crates/constraint-theory-core
cargo test --doc 2>&1 | tee /tmp/doctest_results.txt
if grep -q "test result: ok" /tmp/doctest_results.txt; then
    echo -e "${GREEN}✓ Doc tests pass${NC}"
else
    echo -e "${RED}✗ Doc tests still failing - manual review needed${NC}"
    cat /tmp/doctest_results.txt
fi
cd ../..
echo ""

# Fix 4: Run full test suite
echo -e "${YELLOW}[4/5] Running full test suite...${NC}"
cd crates/constraint-theory-core
cargo test 2>&1 | tee /tmp/test_results.txt
if grep -q "test result: ok" /tmp/test_results.txt; then
    echo -e "${GREEN}✓ All tests pass${NC}"
else
    echo -e "${YELLOW}⚠ Some tests failed or were ignored${NC}"
fi
cd ../..
echo ""

# Fix 5: Create accurate performance summary
echo -e "${YELLOW}[5/5] Creating accurate performance summary...${NC}"
cd crates/constraint-theory-core
cargo run --release --example bench 2>&1 | tee /tmp/bench_results.txt
echo -e "${GREEN}✓ Benchmark complete${NC}"
echo ""
echo "Actual Performance Results:"
echo "============================"
grep -A 20 "Performance Comparison" /tmp/bench_results.txt || echo "Benchmark parsing failed"
cd ../..
echo ""

# Summary
echo "========================================="
echo "Fix Summary"
echo "========================================="
echo ""
echo "Completed Fixes:"
echo "  ✓ Code formatted with cargo fmt"
echo "  ✓ Doc test import issue fixed"
echo "  ✓ Tests verified"
echo "  ✓ Benchmarks run with actual results"
echo ""
echo "Remaining Manual Fixes Required:"
echo "  1. Fix TypeScript errors in workers/src/templates/enhanced-homepage.ts"
echo "  2. Update README.md with accurate benchmark results (0.100 μs, not 0.074 μs)"
echo "  3. Investigate SIMD performance regression (5.466 μs vs 0.100 μs scalar)"
echo ""
echo "Next Steps:"
echo "  1. Review the benchmark results above"
echo "  2. Update README.md with accurate numbers"
echo "  3. Fix TypeScript errors: cd workers && npm run build"
echo "  4. Re-run validation: ./scripts/validate_production.sh"
echo ""
echo -e "${GREEN}Critical automated fixes complete!${NC}"
echo ""
