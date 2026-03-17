# Dodecet Validation Simulation Suite

Comprehensive validation simulations for the 12-bit dodecet encoding system, comparing against 8-bit byte and 32-bit float encodings.

## Overview

This suite validates the key claims about dodecet encoding:

- **16x Precision Improvement**: 4096 states (12-bit) vs 256 states (8-bit)
- **Hex-Friendly**: 3 hex digits per dodecet (e.g., `ABC` = 2748)
- **Memory Efficient**: 6 bytes per Point3D vs 12 bytes for float32
- **Exact Arithmetic**: No floating-point drift accumulation

## Structure

```
dodecet_validation/
├── README.md                    # This file
├── requirements.txt             # Python dependencies
├── dodecet_validation.py        # Main validation suite
├── geometric_validation.py      # Geometric operation tests
└── results/                     # Output directory (auto-created)
    ├── validation_results.json
    ├── validation_summary.csv
    ├── VALIDATION_REPORT.txt
    ├── validation_plots.png
    ├── precision_ratio.png
    ├── geometric_validation_results.json
    └── geometric_validation_plots.png
```

## Installation

```bash
cd research/dodecet_validation
pip install -r requirements.txt
```

## Usage

### Run All Validations

```bash
# Main validation suite
python dodecet_validation.py

# With custom parameters
python dodecet_validation.py --output results --points 10000 --iterations 50000

# Geometric validation
python geometric_validation.py

# With custom parameters
python geometric_validation.py --output results --points 5000
```

### Command-Line Options

**dodecet_validation.py:**
- `--output, -o`: Output directory (default: "results")
- `--points, -p`: Number of test points (default: 1000)
- `--iterations, -i`: Benchmark iterations (default: 10000)

**geometric_validation.py:**
- `--output, -o`: Output directory (default: "results")
- `--points, -p`: Number of test points (default: 1000)

## Test Categories

### Main Validation Suite (`dodecet_validation.py`)

1. **Precision Comparison**
   - Encoding/decoding error for random 3D points
   - Mean error, standard deviation, precision ratio
   - Validates 16x precision improvement

2. **Error Accumulation**
   - Multi-operation precision tracking
   - 100 operations with random transformations
   - Measures drift from original values

3. **Memory Usage**
   - Point3D memory footprint comparison
   - Dodecet: 6 bytes (2 per coordinate)
   - Byte: 3 bytes (1 per coordinate)
   - Float32: 12 bytes (4 per coordinate)

4. **Performance Benchmark**
   - Encoding/decoding speed (ops/sec)
   - Comparison across all three encodings

5. **Hex-Friendly Encoding**
   - Validates 3-hex-digit representation
   - Round-trip encoding/decoding tests

6. **Geometric Operations**
   - Distance calculation accuracy
   - Euclidean distance precision

### Geometric Validation Suite (`geometric_validation.py`)

1. **Pythagorean Snapping**
   - Distance calculation precision
   - Tests right triangle constraint validation

2. **Rigidity Detection**
   - Bar-and-joint structure analysis
   - Edge length calculation accuracy
   - Tests for consistent rigidity matroid detection

3. **Holonomy Transport**
   - Parallel transport around closed loops
   - Closure error measurement
   - Validates geometric consistency

4. **Entropy Calculation**
   - Spatial entropy precision
   - Histogram bin accuracy
   - Information preservation measurement

5. **KD-Tree Spatial Partitioning**
   - Nearest neighbor query accuracy
   - Spatial partitioning precision
   - Tests for consistent spatial indexing

## Expected Results

### Precision Comparison
- Dodecet mean error: ~0.5-1.0 units
- Byte mean error: ~8-16 units
- **Precision ratio: 16x or better**

### Memory Usage
- Dodecet Point3D: 6 bytes
- Byte Point3D: 3 bytes
- Float32 Point3D: 12 bytes
- **Savings vs Float32: 6 bytes (50%)**

### Performance
- Dodecet: ~50,000-100,000 ops/sec
- Byte: ~100,000-200,000 ops/sec
- Float32: ~500,000-1,000,000 ops/sec

**Note**: Float32 is faster but uses 2x memory and has floating-point drift. Dodecet offers exact arithmetic with hex-friendly representation.

## Output Files

### JSON Results
- `validation_results.json`: Complete numerical results
- `geometric_validation_results.json`: Geometric test results

### CSV Summary
- `validation_summary.csv`: Test-by-test summary with pass/fail

### Text Report
- `VALIDATION_REPORT.txt`: Comprehensive human-readable report

### Visualizations
- `validation_plots.png`: 4-panel comparison (precision, drift, memory, performance)
- `precision_ratio.png`: Precision improvement visualization
- `geometric_validation_plots.png`: 6-panel geometric validation

## Key Findings

### Advantages of Dodecet Encoding

1. **16x Better Precision Than 8-Bit**
   - 4096 states vs 256 states
   - Significantly lower encoding error
   - Better for geometric calculations

2. **Hex-Friendly Representation**
   - Exactly 3 hex digits
   - Easy to read and debug
   - Compatible with hex editors

3. **Memory Efficient**
   - 50% smaller than float32 for Point3D
   - Compact storage for large datasets
   - Better cache utilization

4. **Exact Arithmetic**
   - No floating-point drift
   - Predictable error bounds
   - Suitable for constraint theory

### When to Use Dodecet

**Use Dodecet when:**
- Working with geometric constraints
- Need hex-friendly debugging
- Memory is at a premium
- Exact arithmetic is required
- Building constraint theory visualizations

**Use Float32 when:**
- Performance is critical
- Memory is not a constraint
- Floating-point precision is acceptable
- Hardware acceleration is available

**Use Byte when:**
- Maximum compression is needed
- Precision requirements are low
- Storage is extremely limited
- Approximate results are acceptable

## Integration with Constraint Theory

These validations support the constraint theory research by demonstrating:

1. **Geometric Precision**: Dodecet encoding maintains sufficient precision for:
   - Pythagorean snapping (right angle constraints)
   - Rigidity matroid detection
   - Holonomy transport closure

2. **Spatial Operations**: Accurate enough for:
   - KD-Tree spatial partitioning
   - Entropy calculations
   - Distance measurements

3. **Visualization**: Hex-friendly encoding enables:
   - Easy debugging
   - Clear representation
   - Educational demonstrations

## References

- Dodecet Encoder Implementation: `/c/Users/casey/polln/dodecet-encoder/`
- Constraint Theory: `https://constraint-theory.superinstance.ai`
- Research Papers: `/c/Users/casey/polln/SuperInstance-papers/`

## License

MIT License - See repository root for details.

## Contributing

To add new validation tests:

1. Create a new method in the appropriate validator class
2. Follow the existing pattern for results structure
3. Add visualization support if needed
4. Update this README with test description

## Contact

For questions or issues, please open an issue in the constrainttheory repository.
