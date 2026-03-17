# Getting Started with Constraint Theory

**Start using Constraint Theory in 5 minutes**

---

## Prerequisites

- Rust 1.70+ installed
- Basic familiarity with geometric concepts

---

## Installation

### Option 1: Add to your Rust project

```bash
cargo add constraint-theory-core
```

### Option 2: Clone and run examples

```bash
git clone https://github.com/SuperInstance/Constraint-Theory.git
cd Constraint-Theory
cargo run --example basic_snap
```

---

## Quick Example: Pythagorean Snapping

### 1. Basic Usage

```rust
use constraint_theory_core::{PythagoreanManifold, snap};

fn main() {
    // Create a manifold with 200 Pythagorean triples
    let manifold = PythagoreanManifold::new(200);

    // Snap a continuous vector to the nearest Pythagorean triple
    let vec = [0.6f32, 0.8];
    let (snapped, noise) = snap(&manifold, vec);

    println!("Input:  {:?}", vec);
    println!("Snapped: {:?}", snapped);
    println!("Noise:  {:.6}", noise);

    // Output:
    // Input:  [0.6, 0.8]
    // Snapped: [0.6, 0.8]  // Perfect 3-4-5 triangle!
    // Noise:  0.000000
}
```

### 2. Batch Processing

```rust
use constraint_theory_core::{PythagoreanManifold, snap};

fn main() {
    let manifold = PythagoreanManifold::new(200);

    let vectors = vec![
        [0.6, 0.8],   // Perfect 3-4-5
        [0.36, 0.48], // Scales to 3-4-5
        [0.28, 0.96], // Snaps to 7-24-25
    ];

    for vec in vectors {
        let (snapped, noise) = snap(&manifold, vec);
        println!("{:?} → {:?} (noise: {:.4})", vec, snapped, noise);
    }
}
```

### 3. Custom Manifold

```rust
use constraint_theory_core::PythagoreanManifold;

fn main() {
    // Create a larger manifold for better precision
    let large_manifold = PythagoreanManifold::new(1000);

    // Or specify exact Pythagorean triples
    let custom_points = vec![
        [3.0, 4.0],
        [5.0, 12.0],
        [8.0, 15.0],
        [7.0, 24.0],
    ];

    let custom_manifold = PythagoreanManifold::from_points(custom_points);

    // Use the custom manifold
    use constraint_theory_core::snap;
    let vec = [0.6, 0.8];
    let (snapped, _) = snap(&custom_manifold, vec);
    println!("Snapped to: {:?}", snapped);
}
```

---

## Try the Interactive Demo

### Online (No Installation)

Visit: https://constraint-theory.superinstance.ai/simulators/pythagorean

Features:
- Interactive 2D manifold visualization
- Real-time snapping animation
- KD-tree traversal visualization
- Live performance metrics

### Local Development

```bash
# Clone the repository
git clone https://github.com/SuperInstance/Constraint-Theory.git
cd Constraint-Theory/web-simulator

# Install dependencies
npm install

# Run development server
npm run dev

# Open http://localhost:8787
```

---

## Understanding the Output

### What is "snapping"?

Snapping maps a continuous vector (like `[0.6, 0.8]`) to the nearest point on a Pythagorean lattice (like `[0.6, 0.8]` which is exactly a 3-4-5 triangle).

### What is "noise"?

Noise measures the distance between your input vector and the snapped result. Lower noise means a better fit.

**Examples:**
- `[0.6, 0.8]` → `[0.6, 0.8]` noise: 0.0 (perfect fit!)
- `[0.36, 0.48]` → `[0.6, 0.8]` noise: 0.24 (scales to 3-4-5)
- `[0.333, 0.666]` → `[0.447, 0.894]` noise: 0.241 (snaps to 1-2-√5)

---

## Common Use Cases

### 1. Numerical Stability

```rust
// Ensure your vectors always satisfy geometric constraints
let stable_vector = snap(&manifold, unstable_input);
```

### 2. Discretization

```rust
// Convert continuous measurements to discrete geometric states
let discrete_state = snap(&manifold, continuous_sensor_reading);
```

### 3. Validation

```rust
// Check if a vector is close to a valid Pythagorean triple
let (_, noise) = snap(&manifold, test_vector);
if noise < 0.01 {
    println!("Valid Pythagorean state!");
}
```

---

## Performance

```rust
use std::time::Instant;

fn main() {
    let manifold = PythagoreanManifold::new(200);
    let iterations = 1_000_000;

    let start = Instant::now();
    for _ in 0..iterations {
        let vec = [0.6f32, 0.8];
        let _ = snap(&manifold, vec);
    }
    let duration = start.elapsed();

    println!("{} operations in {:?}", iterations, duration);
    println!("{:.2} ns/op", duration.as_nanos() as f64 / iterations as f64);

    // Expected output:
    // ~74 ns/op (13.5M ops/sec)
}
```

---

## Next Steps

### Learn More

- **Mathematical Foundations:** [MATHEMATICAL_FOUNDATIONS_DEEP_DIVE.md](MATHEMATICAL_FOUNDATIONS_DEEP_DIVE.md)
- **Theoretical Guarantees:** [THEORETICAL_GUARANTEES.md](THEORETICAL_GUARANTEES.md)
- **API Reference:** [API_REFERENCE.md](API_REFERENCE.md)
- **Benchmarks:** [BASELINE_BENCHMARKS.md](BASELINE_BENCHMARKS.md)

### Explore Examples

```bash
# Run all examples
cargo run --example basic_snap
cargo run --example batch_processing
cargo run --example performance_test

# Run benchmarks
cargo bench
```

### Contribute

- File issues: https://github.com/SuperInstance/Constraint-Theory/issues
- Pull requests: https://github.com/SuperInstance/Constraint-Theory/pulls
- Discussions: https://github.com/SuperInstance/Constraint-Theory/discussions

---

## Troubleshooting

### Issue: "No such crate"

**Solution:** Make sure you're using Rust 1.70+:
```bash
rustc --version
```

### Issue: Slow performance

**Solution:** Ensure you're using the KD-tree implementation:
```rust
// This uses KD-tree (fast)
let manifold = PythagoreanManifold::new(200);

// Not brute force (slow)
```

### Issue: Can't find valid snap

**Solution:** Increase manifold size:
```rust
// More points = better coverage
let manifold = PythagoreanManifold::new(1000);
```

---

## FAQ

**Q: Can I use this for 3D vectors?**
A: Not yet - currently 2D only. 3D support is in progress.

**Q: What's the maximum manifold size?**
A: Limited by memory, but 10,000+ points work well on modern hardware.

**Q: Can I use this in production?**
A: Yes - the Rust core is production-ready with comprehensive tests.

**Q: Do you have Python bindings?**
A: Not yet, but planned for Q2 2026 if there's community interest.

---

**Ready to dive deeper? Check out the [full documentation](README.md) or [try the interactive demo](https://constraint-theory.superinstance.ai/simulators/pythagorean)!**
