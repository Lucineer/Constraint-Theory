# Constraint Theory

**Geometric substrate for deterministic computation and spatial agent coordination**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![docs](https://img.shields.io/badge/docs-rigorous-blue)](docs/)
[![crate](https://img.shields.io/badge/crates.io-v0.1.0-orange)](https://crates.io/crates/constraint-theory-core)

**Live Demo:** https://constraint-theory.superinstance.ai

---

## Overview

Constraint Theory is a geometric computation framework that provides **deterministic output guarantees** through discrete manifold snapping. It enables O(log n) spatial queries via KD-tree indexing and supports efficient coordination of distributed agents through geometric positioning.

### Key Features

- **Pythagorean Manifold**: Discrete lattice of exact rational coordinates
- **Φ-Folding Operator**: Maps continuous vectors to valid geometric states in O(log n)
- **KD-tree Indexing**: Fast spatial queries for neighbor discovery
- **Deterministic Guarantees**: Invalid outputs excluded by construction
- **12-bit Dodecet Encoding**: Efficient geometric state representation

---

## Quick Start

### Installation

```bash
# Clone the repository
git clone https://github.com/SuperInstance/constrainttheory.git
cd constrainttheory

# Run tests
cd crates/constraint-theory-core
cargo test --release
```

### Basic Usage

```rust
use constraint_theory_core::{PythagoreanManifold, snap};

// Create manifold with 200 Pythagorean triples
let manifold = PythagoreanManifold::new(200);

// Snap continuous vector to nearest valid state
let vec = [0.6f32, 0.8];
let (snapped, noise) = snap(&manifold, vec);

assert!(noise < 0.001);  // Guaranteed exact result
println!("Snapped: ({}, {})", snapped[0], snapped[1]);
// Output: (0.6, 0.8) = (3/5, 4/5) exactly
```

---

## How It Works

### 1. Geometric State Space

All computation occurs in a discrete geometric manifold of Pythagorean triples:

```
G = {g | C(g) = true}
```

Valid states satisfy constraints by construction, eliminating invalid outputs.

### 2. Φ-Folding Operation

The Φ-folding operator maps continuous vectors to discrete valid states:

```
Φ(v) = argmin_{g ∈ G} ||v - g||
```

Implemented via O(log n) KD-tree nearest-neighbor search.

### 3. Spatial Indexing

Agents and data points are indexed in geometric space, enabling:
- O(log n) neighbor queries
- Automatic perspective-based filtering
- Natural parallelization

### Architecture

```
┌─────────────────────────────────────────────┐
│  Input: Continuous Vector v in R^n         │
└────────────────┬────────────────────────────┘
                 ↓
┌─────────────────────────────────────────────┐
│  Φ-Folding: Map to geometric region        │
└────────────────┬────────────────────────────┘
                 ↓
┌─────────────────────────────────────────────┐
│  KD-tree Lookup: O(log n) search           │
└────────────────┬────────────────────────────┘
                 ↓
┌─────────────────────────────────────────────┐
│  Snap to Manifold: Exact quantization      │
└────────────────┬────────────────────────────┘
                 ↓
┌─────────────────────────────────────────────┐
│  Output: Discrete Geometric State g in G   │
└─────────────────────────────────────────────┘
```

---

## Use Cases

### 1. Spatial Agent Coordination

Enable thousands of agents to coordinate via geometric proximity:

```rust
// Spawn 10,000 agents
for i in 0..10_000 {
    let position = Dodecet::random();
    agents.push(Agent::new(position));
}

// Each agent queries local neighborhood O(log n)
for agent in &agents {
    let neighbors = manifold.neighbors(agent.position, radius);
    // Process only nearby agents
}
```

### 2. Deterministic Constraint Satisfaction

Guarantee valid outputs by construction:

```rust
// Traditional approach: validate after computation
let result = compute(input);
if !is_valid(result) {
    // Handle invalid case
}

// Constraint Theory: invalidity impossible
let result = snap(&manifold, input);
// Always valid by construction
```

### 3. Geometric Memory Systems

Use rigid structures as stable memory states:

```rust
// Laman rigidity ↔ Zero Ricci curvature
// Rigid graphs = geometric attractors
let memory_state = manifold.snap_to_rigid(data);
// Guaranteed stable retrieval
```
🚀 Quick Start: Enforce Constraints on Your Agents
The constraint-theory-core engine allows you to define "Super-Constraints" that govern agent behavior.
1. Add the Crate
bash

cargo add constraint_theory_core

Use code with caution.
2. Define a Geometric Constraint
Ensure your agent stays within a 2D "logical" boundary (e.g., preventing it from over-engineering beyond a specific architecture depth).
rust

use constraint_theory_core::{ConstraintEngine, Point};

fn main() {
    let mut engine = ConstraintEngine::new();
    
    // Define the 'Safe Zone' for code complexity
    engine.add_boundary("complexity_cap", vec![Point(0,0), Point(10,10)]);
    
    // Audit an agent's current state (e.g., from a Claude Code log)
    let agent_state = Point(12, 5); // This agent is drifting!
    
    if let Err(drift) = engine.check_constraint(agent_state) {
        println!("⚠️ Constraint Violation: Agent drifted by {} units", drift.magnitude);
        // Trigger OpenClaw to 'pull' the agent back
    }
}


3. Run the Watchdog Example
To see how this integrates with live Claude Code logs:
bash

cargo run --example claude_watchdog

---

## Performance

### Benchmarks

| Operation | Time | Complexity | Speedup vs NumPy |
|-----------|------|------------|------------------|
| Manifold creation | 50 μs | O(n log n) | - |
| Pythagorean snap | 0.1 μs | O(log n) | ~109× |
| Batch snapping | 74 ns/op | O(log n) | ~147× |
| Spatial query | 0.1 μs | O(log n) | ~100× |

**System:** Apple M1 Pro, 200-point manifold, release build

**Reproduce:**
```bash
cd crates/constraint-theory-core
cargo run --release --example bench
```

---

## Mathematical Foundations

### Core Theorems

**1. Deterministic Output Theorem**
```
P(hallucination | constraint_system) = 0
```
Invalid outputs are mathematically impossible within the geometric constraint engine.

**2. Laman Rigidity ↔ Zero Ricci Curvature**
```
Rigid structure ⇔ κ_ij = 0
```
Rigid structures are geometric attractors, providing stable memory states.

**3. Holonomy-Information Equivalence**
```
H(γ) ↔ I_loss(γ)
```
Zero holonomy implies zero information loss, enabling perfect memory recall.

> **Important:** These guarantees apply ONLY within the geometric constraint engine, not to LLMs or AI systems generally. See [DISCLAIMERS.md](docs/DISCLAIMERS.md) for clarifications.

---

## Project Structure

```
constrainttheory/
├── crates/
│   ├── constraint-theory-core/    # Core geometric engine (Rust)
│   │   ├── src/
│   │   │   ├── manifold.rs        # PythagoreanManifold + KD-tree
│   │   │   ├── kdtree.rs          # Spatial indexing
│   │   │   ├── simd.rs            # AVX2 vectorization
│   │   │   ├── curvature.rs       # Ricci flow evolution
│   │   │   ├── cohomology.rs      # Sheaf cohomology
│   │   │   ├── percolation.rs     # Rigidity percolation
│   │   │   └── gauge.rs           # Holonomy transport
│   │   └── Cargo.toml
│   └── gpu-simulation/            # GPU simulation framework
├── web/                           # Interactive demonstrations
│   └── simulators/                # Web-based visualizations
├── tools/                         # Utility tools
│   ├── coord_converter/           # Dodecet encoding converter
│   └── multiagent_sim/            # Multi-agent simulator
├── docs/                          # Research documents
│   ├── MATHEMATICAL_FOUNDATIONS_DEEP_DIVE.md
│   ├── THEORETICAL_GUARANTEES.md
│   ├── GEOMETRIC_INTERPRETATION.md
│   └── BENCHMARKS.md
└── README.md
```

---

## Documentation

### Getting Started

- **[TUTORIAL.md](docs/TUTORIAL.md)** - Step-by-step guide for beginners
- **[DISCLAIMERS.md](docs/DISCLAIMERS.md)** - Important clarifications about scope and limitations
- **[BENCHMARKS.md](docs/BENCHMARKS.md)** - Performance methodology and comparisons

### Core Mathematical Documents

1. **[MATHEMATICAL_FOUNDATIONS_DEEP_DIVE.md](docs/MATHEMATICAL_FOUNDATIONS_DEEP_DIVE.md)** (45 pages)
   - Rigorous mathematical treatment
   - Complete theorem proofs
   - Ω-geometry, Φ-folding, discrete differential geometry

2. **[THEORETICAL_GUARANTEES.md](docs/THEORETICAL_GUARANTEES.md)** (30 pages)
   - Deterministic Output Theorem proof
   - Complexity analysis: O(log n)
   - Optimality results

3. **[GEOMETRIC_INTERPRETATION.md](docs/GEOMETRIC_INTERPRETATION.md)** (25 pages)
   - Visual explanations
   - Physical analogies
   - Accessible to non-specialists

4. **[OPEN_QUESTIONS_RESEARCH.md](docs/OPEN_QUESTIONS_RESEARCH.md)** (15 pages)
   - Scaling to higher dimensions
   - Calabi-Yau connections
   - Quantum analogies

---

## Limitations and Open Questions

This is early-stage research with several open questions:

### Current Limitations

- **Scaling to higher dimensions** - Current implementation focuses on ℝ² (2D Pythagorean lattice)
- **Constraint selection strategies** - Optimal constraint choice for arbitrary problems is an open question
- **Empirical validation on ML tasks** - Theoretical guarantees proven, but not yet validated on machine learning workloads

### Active Research Areas

- **3D rigidity** - Extending Laman's theorem to three dimensions
- **n-dimensional generalization** - Characterizing rigidity percolation in arbitrary dimensions
- **Physical realization** - Photonic and FPGA implementations
- **Quantum connections** - Formalizing classical-quantum correspondence

**See:** [`docs/OPEN_QUESTIONS_RESEARCH.md`](docs/OPEN_QUESTIONS_RESEARCH.md) for complete discussion.

---

## Contributing

We welcome contributions! Please see [`docs/IMPLEMENTATION_GUIDE.md`](docs/IMPLEMENTATION_GUIDE.md) for development guidelines.

Areas of particular interest:
- Higher-dimensional generalizations (3D, nD)
- Empirical validation on ML tasks
- GPU implementations (CUDA, WebGPU)
- Application case studies

---

## Related Projects

This library is part of the SuperInstance ecosystem:

- **[claw](https://github.com/SuperInstance/claw)** - Cellular agent engine that uses constrainttheory for spatial positioning
- **[spreadsheet-moment](https://github.com/SuperInstance/spreadsheet-moment)** - Agentic spreadsheet platform
- **[dodecet-encoder](https://github.com/SuperInstance/dodecet-encoder)** - 12-bit geometric encoding library
- **[constrainttheory-ml-demo](https://github.com/SuperInstance/constrainttheory-ml-demo)** - Interactive ML demonstrations

See [https://github.com/SuperInstance](https://github.com/SuperInstance) for the full ecosystem.

---

## Citation

If you use this work in your research, please cite:

```bibtex
@software{constraint_theory,
  title={Constraint Theory: Geometric Infrastructure for Spatial Computing},
  author={SuperInstance Team},
  year={2026},
  url={https://github.com/SuperInstance/constrainttheory},
  version={1.0.0}
}
```

---

## License

MIT License - see [LICENSE](LICENSE) for details.

---

**Last Updated:** 2026-03-19
**Version:** 1.0.0
**Status:** Research Release
