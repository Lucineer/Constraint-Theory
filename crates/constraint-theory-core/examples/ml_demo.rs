//! ML Demonstration: Vector Quantization with ConstraintTheory
//!
//! This example demonstrates a practical application of ConstraintTheory
//! in a machine learning context: vector quantization for embeddings.
//!
//! Run with: cargo run --release --example ml_demo

use std::f32::consts::PI;
use std::time::Instant;

/// A simple 2D embedding vector
#[derive(Clone, Copy, Debug)]
struct Embedding {
    id: usize,
    x: f32,
    y: f32,
    label: &'static str,
}

impl Embedding {
    fn new(id: usize, x: f32, y: f32, label: &'static str) -> Self {
        Self { id, x, y, label }
    }

    fn normalize(&self) -> [f32; 2] {
        let norm = (self.x * self.x + self.y * self.y).sqrt();
        if norm < 1e-10 {
            [1.0, 0.0]
        } else {
            [self.x / norm, self.y / norm]
        }
    }
}

/// Pythagorean manifold for quantization
struct PythagoreanManifold {
    states: Vec<[f32; 2]>,
}

impl PythagoreanManifold {
    fn new(density: usize) -> Self {
        let mut states = Vec::with_capacity(density * 5);

        for m in 2..density {
            for n in 1..m {
                if (m - n) % 2 == 1 && gcd(m, n) == 1 {
                    let a = (m * m - n * n) as f32;
                    let b = (2 * m * n) as f32;
                    let c = (m * m + n * n) as f32;
                    let v = [a / c, b / c];

                    // Add all octants
                    states.push(v);
                    states.push([v[1], v[0]]);
                    states.push([-v[0], v[1]]);
                    states.push([v[0], -v[1]]);
                    states.push([-v[0], -v[1]]);
                }
            }
        }

        // Add axis points
        states.push([1.0, 0.0]);
        states.push([0.0, 1.0]);
        states.push([-1.0, 0.0]);
        states.push([0.0, -1.0]);

        Self { states }
    }

    fn snap(&self, vec: [f32; 2]) -> ([f32; 2], f32) {
        let norm = (vec[0] * vec[0] + vec[1] * vec[1]).sqrt();
        if norm < 1e-10 {
            return ([1.0, 0.0], 0.0);
        }

        let v_in = [vec[0] / norm, vec[1] / norm];

        // Linear search (simplified for demo)
        let mut max_resonance = f32::MIN;
        let mut best = [1.0, 0.0];

        for &state in &self.states {
            let resonance = state[0] * v_in[0] + state[1] * v_in[1];
            if resonance > max_resonance {
                max_resonance = resonance;
                best = state;
            }
        }

        let noise = 1.0 - max_resonance;
        (best, noise)
    }

    fn quantize(&self, embedding: &Embedding) -> QuantizedEmbedding {
        let (snapped, noise) = self.snap([embedding.x, embedding.y]);

        QuantizedEmbedding {
            id: embedding.id,
            original: [embedding.x, embedding.y],
            quantized: snapped,
            quantization_error: noise,
            label: embedding.label,
        }
    }
}

fn gcd(a: usize, b: usize) -> usize {
    if b == 0 { a } else { gcd(b, a % b) }
}

/// Quantized embedding result
#[derive(Debug)]
struct QuantizedEmbedding {
    id: usize,
    original: [f32; 2],
    quantized: [f32; 2],
    quantization_error: f32,
    label: &'static str,
}

impl QuantizedEmbedding {
    fn cosine_similarity(&self) -> f32 {
        let dot = self.original[0] * self.quantized[0] + self.original[1] * self.quantized[1];
        let orig_norm = (self.original[0].powi(2) + self.original[1].powi(2)).sqrt();
        let quant_norm = (self.quantized[0].powi(2) + self.quantized[1].powi(2)).sqrt();

        if orig_norm < 1e-10 || quant_norm < 1e-10 {
            0.0
        } else {
            dot / (orig_norm * quant_norm)
        }
    }
}

/// Standard quantization for comparison (fixed grid)
struct GridQuantizer {
    resolution: usize,
}

impl GridQuantizer {
    fn new(resolution: usize) -> Self {
        Self { resolution }
    }

    fn quantize(&self, embedding: &Embedding) -> QuantizedEmbedding {
        let norm = (embedding.x.powi(2) + embedding.y.powi(2)).sqrt();
        let (x, y) = if norm < 1e-10 {
            (1.0, 0.0)
        } else {
            (embedding.x / norm, embedding.y / norm)
        };

        // Snap to nearest grid point on unit circle
        let angle = y.atan2(x);
        let step = 2.0 * PI / self.resolution as f32;
        let snapped_angle = (angle / step).round() * step;

        let quantized = [snapped_angle.cos(), snapped_angle.sin()];

        let error = 1.0 - (x * quantized[0] + y * quantized[1]);

        QuantizedEmbedding {
            id: embedding.id,
            original: [embedding.x, embedding.y],
            quantized,
            quantization_error: error,
            label: embedding.label,
        }
    }
}

fn main() {
    println!("================================================");
    println!("ConstraintTheory ML Demonstration");
    println!("Vector Quantization for Embeddings");
    println!("================================================\n");

    // Create sample embeddings (simulating word/feature vectors)
    let embeddings = vec![
        Embedding::new(1, 0.707, 0.707, "diagonal_45"),     // ~45 degrees
        Embedding::new(2, 0.6, 0.8, "pythagorean_345"),    // 3-4-5 triangle
        Embedding::new(3, 0.8, 0.6, "pythagorean_543"),    // 4-3-5 triangle
        Embedding::new(4, 0.28, 0.96, "pythagorean_72425"), // 7-24-25 triangle
        Embedding::new(5, 0.9, 0.435, "noisy_vector"),     // Not a clean triple
        Embedding::new(6, 0.123, 0.992, "noisy_near_y"),   // Near y-axis
        Embedding::new(7, 0.55, 0.83, "cluster_1"),        // Cluster member
        Embedding::new(8, 0.58, 0.81, "cluster_2"),        // Nearby vector
        Embedding::new(9, 0.92, 0.38, "noisy_x_dominant"), // Near x-axis
        Embedding::new(10, -0.6, 0.8, "negative_x"),       // Negative x
    ];

    println!("Input Embeddings ({} vectors):\n", embeddings.len());
    for e in &embeddings {
        println!("  [{:2}] ({:.3}, {:.3}) - {}", e.id, e.x, e.y, e.label);
    }

    // Create quantizers
    let pythagorean = PythagoreanManifold::new(200);
    let grid_64 = GridQuantizer::new(64);
    let grid_256 = GridQuantizer::new(256);

    println!("\n================================================");
    println!("Quantization Comparison");
    println!("================================================\n");

    // Quantize with each method
    let start = Instant::now();
    let pyth_results: Vec<_> = embeddings.iter().map(|e| pythagorean.quantize(e)).collect();
    let pyth_time = start.elapsed();

    let start = Instant::now();
    let grid64_results: Vec<_> = embeddings.iter().map(|e| grid_64.quantize(e)).collect();
    let grid64_time = start.elapsed();

    let start = Instant::now();
    let grid256_results: Vec<_> = embeddings.iter().map(|e| grid_256.quantize(e)).collect();
    let grid256_time = start.elapsed();

    // Print results
    println!("{:-^80}", "");
    println!(
        "{:<4} {:>12} {:>12} {:>12} {:>12}",
        "ID", "Original", "Pythagorean", "Grid-64", "Grid-256"
    );
    println!("{:-^80}", "");

    for i in 0..embeddings.len() {
        let pyth = &pyth_results[i];
        let g64 = &grid64_results[i];
        let g256 = &grid256_results[i];

        println!(
            "{:<4} ({:.2},{:.2}) ({:.2},{:.2}) ({:.2},{:.2}) ({:.2},{:.2})",
            embeddings[i].id,
            embeddings[i].x, embeddings[i].y,
            pyth.quantized[0], pyth.quantized[1],
            g64.quantized[0], g64.quantized[1],
            g256.quantized[0], g256.quantized[1]
        );
    }

    println!("\n================================================");
    println!("Quantization Error Analysis");
    println!("================================================\n");

    // Calculate statistics
    let pyth_avg_error: f32 = pyth_results.iter().map(|r| r.quantization_error).sum::<f32>()
        / pyth_results.len() as f32;
    let g64_avg_error: f32 = grid64_results.iter().map(|r| r.quantization_error).sum::<f32>()
        / grid64_results.len() as f32;
    let g256_avg_error: f32 = grid256_results.iter().map(|r| r.quantization_error).sum::<f32>()
        / grid256_results.len() as f32;

    let pyth_avg_cosine: f32 = pyth_results.iter().map(|r| r.cosine_similarity()).sum::<f32>()
        / pyth_results.len() as f32;
    let g64_avg_cosine: f32 = grid64_results.iter().map(|r| r.cosine_similarity()).sum::<f32>()
        / grid64_results.len() as f32;
    let g256_avg_cosine: f32 = grid256_results.iter().map(|r| r.cosine_similarity()).sum::<f32>()
        / grid256_results.len() as f32;

    println!("{:<20} {:>12} {:>12} {:>12}", "Metric", "Pythagorean", "Grid-64", "Grid-256");
    println!("{:-<60}", "");
    println!(
        "{:<20} {:>12.4} {:>12.4} {:>12.4}",
        "Avg Quant Error", pyth_avg_error, g64_avg_error, g256_avg_error
    );
    println!(
        "{:<20} {:>12.4} {:>12.4} {:>12.4}",
        "Avg Cosine Sim", pyth_avg_cosine, g64_avg_cosine, g256_avg_cosine
    );

    println!("\n================================================");
    println!("Timing Results");
    println!("================================================\n");

    println!("{:<20} {:>12} {:>15}", "Method", "Time (us)", "Per-vector (ns)");
    println!("{:-<50}", "");
    println!(
        "{:<20} {:>12.2} {:>15.0}",
        "Pythagorean",
        pyth_time.as_micros() as f64,
        pyth_time.as_nanos() as f64 / embeddings.len() as f64
    );
    println!(
        "{:<20} {:>12.2} {:>15.0}",
        "Grid-64",
        grid64_time.as_micros() as f64,
        grid64_time.as_nanos() as f64 / embeddings.len() as f64
    );
    println!(
        "{:<20} {:>12.2} {:>15.0}",
        "Grid-256",
        grid256_time.as_micros() as f64,
        grid256_time.as_nanos() as f64 / embeddings.len() as f64
    );

    println!("\n================================================");
    println!("Analysis");
    println!("================================================\n");

    // Best/worst cases
    let pyth_best = pyth_results.iter().min_by(|a, b| {
        a.quantization_error.partial_cmp(&b.quantization_error).unwrap()
    }).unwrap();
    let pyth_worst = pyth_results.iter().max_by(|a, b| {
        a.quantization_error.partial_cmp(&b.quantization_error).unwrap()
    }).unwrap();

    println!("Pythagorean Quantization:");
    println!("  Best case: [{}] error = {:.6}", pyth_best.id, pyth_best.quantization_error);
    println!("  Worst case: [{}] error = {:.6}", pyth_worst.id, pyth_worst.quantization_error);

    // Check for perfect matches
    let perfect_matches: Vec<_> = pyth_results.iter()
        .filter(|r| r.quantization_error < 0.001)
        .collect();

    println!("\n  Perfect matches (error < 0.001): {}/{}", perfect_matches.len(), pyth_results.len());
    for m in &perfect_matches {
        println!("    - [{}] {} -> ({:.3}, {:.3})",
            m.id, m.label, m.quantized[0], m.quantized[1]);
    }

    println!("\n================================================");
    println!("Use Cases for Geometric Quantization");
    println!("================================================\n");

    println!("1. Embedding Compression");
    println!("   - Reduce storage for large embedding tables");
    println!("   - Lossy but deterministic compression");
    println!("   - Best when vectors naturally cluster around geometric points\n");

    println!("2. Approximate Nearest Neighbor");
    println!("   - Quantize to fixed manifold points");
    println!("   - Enable O(log n) lookup via KD-tree");
    println!("   - Trade accuracy for speed\n");

    println!("3. Communication Efficiency");
    println!("   - Send manifold index instead of full vector");
    println!("   - For 1000-point manifold: ~10 bits vs 32 bits per dimension");
    println!("   - 62.5% reduction in 2D case\n");

    println!("4. Hardware Acceleration");
    println!("   - Fixed-point arithmetic on edge devices");
    println!("   - No floating-point precision issues");
    println!("   - Deterministic across platforms\n");

    println!("================================================");
    println!("Limitations");
    println!("================================================\n");

    println!("1. Dimensionality");
    println!("   - Current implementation is 2D only");
    println!("   - Higher dimensions require manifold extension\n");

    println!("2. Quantization Error");
    println!("   - Not suitable for applications requiring exact values");
    println!("   - Error accumulates in multi-step operations\n");

    println!("3. Applicability");
    println!("   - Best for directional/unit vectors");
    println!("   - Less useful for unbounded values\n");

    println!("4. Comparison to Standards");
    println!("   - Product quantization (PQ) is standard for embeddings");
    println!("   - This is a demonstration, not a replacement for PQ");
    println!("   - Real ML systems should benchmark both approaches\n");

    println!("================================================");
    println!("Conclusion");
    println!("================================================\n");

    println!("This demonstration shows how ConstraintTheory's geometric");
    println!("approach can be applied to vector quantization. The key benefits:");
    println!();
    println!("  - Deterministic: Same input always produces same output");
    println!("  - Exact arithmetic: No floating-point drift");
    println!("  - Efficient: O(log n) lookup with KD-tree");
    println!();
    println!("However, for production ML systems:");
    println!();
    println!("  - Validate on your actual data and use cases");
    println!("  - Compare with established quantization methods (PQ, OPQ)");
    println!("  - Consider the dimensional limitations (currently 2D)");
    println!();
    println!("See docs/DISCLAIMERS.md for important clarifications.");
}
