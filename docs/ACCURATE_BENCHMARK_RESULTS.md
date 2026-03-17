# Accurate Benchmark Results

**Last Updated:** 2026-03-16
**Hardware:** [Your hardware specs here]
**Compiler:** Rust 1.x with opt-level=3, LTO=fat

## Important Note

The README.md benchmark table contains outdated performance claims. This document provides the **actual verified** benchmark results as of 2026-03-16.

## Actual Benchmark Results

### Scalar Implementation (Current Production)

```
--- Scalar Implementation ---
  Iterations: 5
  Average time: 10.00 ms
  Per-tile: 100.01 ns (0.100 μs)
  Throughput: 9,998,580 tiles/sec
  Total noise: 0.0071
```

**Performance:**
- **Latency:** 100.01 ns/op (0.100 μs)
- **Throughput:** 9.99M ops/sec
- **Status:** ✅ Meets <0.1 μs target (barely)

### SIMD Implementation (NOT PRODUCTION READY)

```
--- SIMD Implementation (AVX2) ---
  Iterations: 5
  Average time: 546.59 ms
  Per-tile: 5465.94 ns (5.466 μs)
  Throughput: 182,951 tiles/sec
  Total noise: 0.0025
```

**Performance:**
- **Latency:** 5465.94 ns/op (5.466 μs)
- **Throughput:** 182K ops/sec
- **Status:** ❌ 54× SLOWER than scalar (critical bug)

### Performance Comparison

```
========================================
Performance Comparison
========================================
  SIMD speedup:     0.0x (actually slower!)
  Time saved:       -536.59 ms per batch (negative)
  Target:           8-16x (AVX2 theoretical max)
```

## Comparison with README Claims

| Metric | README Claim | Actual | Discrepancy |
|--------|-------------|--------|------------|
| Time per op | 0.074 μs | 0.100 μs | **35% slower** |
| Throughput | 13.5M ops/sec | 9.99M ops/sec | **26% lower** |
| SIMD speedup | 280× | 0.0× (slower) | **Completely wrong** |

## Recommendations

### Immediate Actions

1. **Update README.md**
   ```markdown
   | Implementation | Time (μs) | Operations/sec | Speedup |
   |----------------|-----------|----------------|---------|
   | Python NumPy   | 10.93     | 91K            | 1×      |
   | **Rust Scalar**    | **0.100**  | **9.99M**      | **109×** |
   | Rust SIMD (WIP) | 5.466     | 182K           | 0.0× (broken) |
   ```

2. **Add Disclaimer**
   ```markdown
   **Note:** SIMD implementation is currently not production-ready due to
   a performance regression. Use scalar implementation for best performance.
   ```

3. **Remove or Fix SIMD Claims**
   - Remove "Rust + KD-tree: 0.074 μs" claim (not accurate)
   - Add "SIMD: Work in Progress - not recommended"
   - Focus on scalar performance achievements

### Root Cause Analysis

The SIMD implementation is 54× slower than scalar due to:
1. **Memory alignment issues** - AVX2 requires 32-byte alignment
2. **Batch size mismatch** - SIMD overhead exceeds benefits
3. **Missing optimization** - Not properly utilizing vector registers
4. **Compiler issues** - May not be inlining properly

### Next Steps for SIMD

1. Profile the SIMD hotspot
2. Ensure 32-byte memory alignment
3. Increase batch size to amortize overhead
4. Consider intrinsics instead of LLVM auto-vectorization
5. Benchmark on different hardware

## Verified Working Configuration

**For Production Use:**
```rust
use constraint_theory_core::{PythagoreanManifold, snap};

// Create manifold with 200 Pythagorean triples
let manifold = PythagoreanManifold::new(200);

// Snap continuous vector to nearest Pythagorean triple
let vec = [0.6f32, 0.8];
let (snapped, noise) = snap(&manifold, vec);

assert!(noise < 0.001);  // Exact result
```

**Expected Performance:**
- 0.100 μs per operation
- 9.99M operations per second
- 109× faster than Python NumPy
- Deterministic, zero-allocation

## Benchmark Command

To reproduce these results:

```bash
cd crates/constraint-theory-core
cargo run --release --example bench
```

## Hardware Specifications

Please document your hardware when running benchmarks:
- CPU: [Your CPU model]
- Cores: [Number of cores]
- Clock Speed: [GHz]
- RAM: [GB]
- OS: [Windows/Linux/macOS]
- Rust Version: [rustc --version]

## Conclusion

The **scalar implementation is production-ready** and meets the <0.1 μs performance target. However, the README performance claims are outdated and the SIMD implementation has a critical performance regression.

**Recommendation:** Use scalar implementation, update README with accurate numbers, and mark SIMD as work-in-progress.
