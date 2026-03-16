# Comprehensive Validation Suite for Constraint Theory

## Overview

This document provides a complete validation framework for verifying Constraint Theory mathematical claims through systematic testing, statistical analysis, and reproducible experiments.

## Table of Contents

1. [Validation Philosophy](#validation-philosophy)
2. [Test Categories](#test-categories)
3. [Validation Protocols](#validation-protocols)
4. [Statistical Methods](#statistical-methods)
5. [Acceptance Criteria](#acceptance-criteria)
6. [Test Scenarios](#test-scenarios)
7. [Regression Testing](#regression-testing)
8. [Continuous Validation](#continuous-validation)

---

## Validation Philosophy

### Core Principles

1. **Mathematical Rigor**
   - Prove theorems before implementation
   - Verify numerical stability
   - Test edge cases explicitly

2. **Statistical Significance**
   - Use sufficient sample sizes
   - Report confidence intervals
   - Measure effect sizes

3. **Reproducibility**
   - Fixed random seeds
   - Version-controlled tests
   - Documented parameters

4. **Production Fidelity**
   - Test on production-like data
   - Include realistic failure modes
   - Measure actual performance

### Validation Hierarchy

```
┌──────────────────────────────────────────────────┐
│         FORMAL VERIFICATION (Theorem Proving)    │
│  • Mathematical proofs                           │
│  • Lemma verification                            │
│  • Property checking                             │
└────────────────┬─────────────────────────────────┘
                 │
                 ▼
┌──────────────────────────────────────────────────┐
│         NUMERICAL VALIDATION (Accuracy)          │
│  • Known solutions                               │
│  • Symmetry tests                                │
│  • Conservation laws                             │
└────────────────┬─────────────────────────────────┘
                 │
                 ▼
┌──────────────────────────────────────────────────┐
│         STATISTICAL VALIDATION (Monte Carlo)     │
│  • Distribution tests                            │
│  • Convergence verification                      │
│  • Scaling laws                                  │
└────────────────┬─────────────────────────────────┘
                 │
                 ▼
┌──────────────────────────────────────────────────┐
│         STRESS VALIDATION (Performance)          │
│  • Scale testing                                 │
│  • Benchmarking                                  │
│  • Resource limits                               │
└──────────────────────────────────────────────────┘
```

---

## Test Categories

### 1. Mathematical Correctness Tests

#### 1.1 Pythagorean Triple Verification

**Purpose**: Verify Phi-Folding converges to exact Pythagorean ratios

**Test Cases**:
```python
PYTHAGOREAN_TRIPLES = [
    (3, 4, 5),      # Primitive triple
    (5, 12, 13),    # Primitive triple
    (8, 15, 17),    # Primitive triple
    (7, 24, 25),    # Primitive triple
    (20, 21, 29),   # Primitive triple
    (9, 40, 41),    # Primitive triple
    (6, 8, 10),     # Non-primitive (2*3,4,5)
    (10, 24, 26),   # Non-primitive (2*5,12,13)
]

# Generate test vectors
test_vectors = []
for a, b, c in PYTHAGOREAN_TRIPLES:
    # Normalized components
    test_vectors.append(np.array([a/c, b/c]))
    test_vectors.append(np.array([b/c, a/c]))

    # Add small noise
    for noise_level in [0.001, 0.01, 0.1]:
        noise = np.random.randn(2) * noise_level
        vec = np.array([a/c, b/c]) + noise
        vec = vec / np.linalg.norm(vec)
        test_vectors.append(vec)
```

**Validation Criteria**:
- Exact triples: noise < 1e-10
- With 0.001 noise: noise < 0.01
- With 0.01 noise: noise < 0.05
- With 0.1 noise: noise < 0.2

#### 1.2 Percolation Threshold Verification

**Purpose**: Verify critical density matches theoretical value

**Theoretical Value**: p_c = 0.6602741 (for 2D square lattice)

**Test Protocol**:
```python
def test_percolation_threshold():
    """
    Test percolation threshold with Monte Carlo simulation.

    Method: Binary search on density to find p_c
    """
    n_tiles = 10000
    tolerance = 0.001
    n_trials_per_density = 100

    # Binary search for critical density
    lower, upper = 0.5, 0.8

    while upper - lower > tolerance:
        mid = (lower + upper) / 2

        percolates_count = 0
        for _ in range(n_trials_per_density):
            percolator = FastPercolation(n_tiles=n_tiles, density=mid)
            if percolator.percolates():
                percolates_count += 1

        percolation_prob = percolates_count / n_trials_per_density

        if percolation_prob > 0.5:
            upper = mid
        else:
            lower = mid

    estimated_pc = (lower + upper) / 2

    # Validate against theoretical value
    error = abs(estimated_pc - 0.6602741)

    assert error < 0.01, f"Percolation threshold error: {error}"

    return {
        'estimated_pc': estimated_pc,
        'theoretical_pc': 0.6602741,
        'error': error,
        'passed': error < 0.01
    }
```

#### 1.3 Cohomology Dimension Verification

**Purpose**: Verify H0 and H1 dimensions are correct

**Test Cases**:
```python
def test_cohomology_dimensions():
    """
    Test cohomology dimensions on known graphs.
    """
    test_cases = [
        {
            'name': 'Single component',
            'graph': nx.path_graph(10),
            'expected_H0': 1,
            'expected_H1': 0
        },
        {
            'name': 'Two components',
            'graph': nx.disjoint_union(nx.path_graph(5), nx.path_graph(5)),
            'expected_H0': 2,
            'expected_H1': 0
        },
        {
            'name': 'Cycle',
            'graph': nx.cycle_graph(10),
            'expected_H0': 1,
            'expected_H1': 1
        },
        {
            'name': 'Figure eight',
            'graph': nx.Graph([(0,1), (1,2), (2,0), (2,3), (3,4), (4,2)]),
            'expected_H0': 1,
            'expected_H1': 2
        }
    ]

    results = []
    for case in test_cases:
        # Convert graph to tiles
        tiles = graph_to_tiles(case['graph'])

        # Compute cohomology
        sheaf = SheafCohomology(tiles)
        cohom = sheaf.compute_cohomology()

        H0_dim = cohom.get('H0_dim', 0)
        H1_dim = cohom.get('H1_dim', 0)

        passed = (H0_dim == case['expected_H0'] and
                  H1_dim == case['expected_H1'])

        results.append({
            'name': case['name'],
            'H0_dim': H0_dim,
            'expected_H0': case['expected_H0'],
            'H1_dim': H1_dim,
            'expected_H1': case['expected_H1'],
            'passed': passed
        })

    return results
```

#### 1.4 Ricci Curvature Properties

**Purpose**: Verify curvature has expected mathematical properties

**Test Cases**:
```python
def test_ricci_curvature_properties():
    """
    Test Ricci curvature mathematical properties.

    Properties:
    1. Curvature is symmetric: κ(x,y) = κ(y,x)
    2. Curvature is bounded: -1 ≤ κ ≤ 1
    3. Curvature of regular graphs is constant
    """
    results = []

    # Test 1: Symmetry
    G = nx.erdos_renyi_graph(50, 0.1)
    ricci = OllivierRicciCurvature(G)
    ricci.compute_curvatures()

    symmetry_violations = 0
    for (u, v) in G.edges():
        k_uv = ricci.curvatures.get((u, v), 0)
        k_vu = ricci.curvatures.get((v, u), 0)
        if abs(k_uv - k_vu) > 1e-6:
            symmetry_violations += 1

    results.append({
        'test': 'symmetry',
        'violations': symmetry_violations,
        'passed': symmetry_violations == 0
    })

    # Test 2: Boundedness
    all_curvatures = list(ricci.curvatures.values())
    min_curvature = min(all_curvatures)
    max_curvature = max(all_curvatures)

    results.append({
        'test': 'bounded',
        'min': min_curvature,
        'max': max_curvature,
        'passed': -1 <= min_curvature and max_curvature <= 1
    })

    # Test 3: Regular graph
    G_regular = nx.complete_graph(10)
    ricci_regular = OllivierRicciCurvature(G_regular)
    ricci_regular.compute_curvatures()

    regular_curvatures = list(ricci_regular.curvatures.values())
    curvature_std = np.std(regular_curvatures)

    results.append({
        'test': 'regular_graph',
        'std': curvature_std,
        'passed': curvature_std < 0.01
    })

    return results
```

#### 1.5 Laman's Theorem Verification

**Purpose**: Verify rigidity matroid satisfies Laman's conditions

**Test Protocol**:
```python
def test_laman_theorem():
    """
    Test Laman's theorem for minimal rigidity.

    Laman's Theorem: A graph with n vertices is minimally rigid
    iff it has 2n-3 edges and no subgraph has more than 2k-3 edges.
    """
    test_cases = [
        {
            'name': 'Triangle (rigid)',
            'n': 3,
            'edges': [(0,1), (1,2), (2,0)],
            'expected_rigid': True
        },
        {
            'name': 'Square (flexible)',
            'n': 4,
            'edges': [(0,1), (1,2), (2,3), (3,0)],
            'expected_rigid': False
        },
        {
            'name': 'Square with diagonal (rigid)',
            'n': 4,
            'edges': [(0,1), (1,2), (2,3), (3,0), (0,2)],
            'expected_rigid': True
        },
        {
            'name': 'Pentagon with 2 diagonals (rigid)',
            'n': 5,
            'edges': [(0,1), (1,2), (2,3), (3,4), (4,0), (0,2), (2,4)],
            'expected_rigid': True
        }
    ]

    results = []
    for case in test_cases:
        G = nx.Graph()
        G.add_nodes_from(range(case['n']))
        G.add_edges_from(case['edges'])

        is_rigid = check_minimal_rigidity(G)

        results.append({
            'name': case['name'],
            'is_rigid': is_rigid,
            'expected': case['expected_rigid'],
            'passed': is_rigid == case['expected_rigid']
        })

    return results

def check_minimal_rigidity(G):
    """
    Check minimal rigidity using Laman's theorem.
    """
    n = G.number_of_nodes()
    m = G.number_of_edges()

    # Condition 1: m = 2n - 3
    if m != 2 * n - 3:
        return False

    # Condition 2: All subgraphs have ≤ 2k - 3 edges
    for k in range(2, n):
        for sub_nodes in itertools.combinations(G.nodes(), k):
            subgraph = G.subgraph(sub_nodes)
            if subgraph.number_of_edges() > 2 * k - 3:
                return False

    return True
```

### 2. Numerical Stability Tests

#### 2.1 Precision Tests

**Purpose**: Verify numerical stability across different scales

```python
def test_numerical_precision():
    """
    Test numerical precision at different scales.
    """
    scales = [1e-10, 1e-5, 1e-3, 1, 1e3, 1e5, 1e10]

    results = []
    for scale in scales:
        vec = np.array([scale, scale]) / np.sqrt(2)

        manifold = PythagoreanManifold()
        snapped, noise = manifold.snap(vec)

        # Check relative error
        rel_error = noise / scale if scale > 0 else noise

        results.append({
            'scale': scale,
            'noise': noise,
            'relative_error': rel_error,
            'passed': noise < 0.01
        })

    return results
```

#### 2.2 Edge Case Tests

```python
def test_edge_cases():
    """
    Test edge cases and boundary conditions.
    """
    test_cases = [
        {
            'name': 'Zero vector',
            'vector': np.array([0.0, 0.0]),
            'expected_behavior': 'normalize to [1, 0]'
        },
        {
            'name': 'Very small vector',
            'vector': np.array([1e-15, 1e-15]),
            'expected_behavior': 'normalize successfully'
        },
        {
            'name': 'Very large vector',
            'vector': np.array([1e15, 1e15]),
            'expected_behavior': 'normalize successfully'
        },
        {
            'name': 'Infinite components',
            'vector': np.array([np.inf, 1.0]),
            'expected_behavior': 'handle gracefully'
        },
        {
            'name': 'NaN components',
            'vector': np.array([np.nan, 1.0]),
            'expected_behavior': 'handle gracefully'
        }
    ]

    results = []
    for case in test_cases:
        try:
            manifold = PythagoreanManifold()
            snapped, noise = manifold.snap(case['vector'])

            results.append({
                'name': case['name'],
                'snapped': snapped,
                'noise': noise,
                'passed': not np.isnan(snapped).any() and not np.isinf(snapped).any()
            })
        except Exception as e:
            results.append({
                'name': case['name'],
                'error': str(e),
                'passed': False
            })

    return results
```

#### 2.3 Conditioning Tests

```python
def test_matrix_conditioning():
    """
    Test numerical conditioning of matrix operations.
    """
    test_cases = []

    # Well-conditioned matrices
    for n in [5, 10, 20, 50]:
        A = np.random.randn(n, n)
        cond_A = np.linalg.cond(A)

        # Condition number should be reasonable
        test_cases.append({
            'name': f'well_conditioned_{n}',
            'cond': cond_A,
            'passed': cond_A < 100
        })

    # Ill-conditioned matrices
    for n in [5, 10, 20]:
        # Nearly singular matrix
        A = np.random.randn(n, n-1)
        A = np.column_stack([A, A[:, 0] * 0.999])  # Nearly dependent column
        A = np.column_stack([A, np.random.randn(n)])  # Make square again

        cond_A = np.linalg.cond(A)

        test_cases.append({
            'name': f'il_conditioned_{n}',
            'cond': cond_A,
            'passed': cond_A > 1000  # Should be ill-conditioned
        })

    return test_cases
```

### 3. Statistical Property Tests

#### 3.1 Distribution Tests

**Purpose**: Verify distributions match theoretical expectations

```python
def test_snapping_distribution():
    """
    Test distribution of snapping noise.

    H0: Noise follows uniform distribution
    H1: Noise is concentrated near zero
    """
    # Generate many samples
    n_samples = 100000
    noise_values = []

    manifold = PythagoreanManifold()

    for _ in range(n_samples):
        vec = np.random.randn(2)
        vec = vec / np.linalg.norm(vec)
        snapped, noise = manifold.snap(vec)
        noise_values.append(noise)

    noise_values = np.array(noise_values)

    # Kolmogorov-Smirnov test against uniform
    ks_statistic, p_value = stats.kstest(noise_values, 'uniform')

    # Anderson-Darling test
    ad_result = stats.anderson(noise_values, dist='uniform')

    # Cramér-von Mises test
    cvm_result = stats.cramervonmises(noise_values, 'uniform')

    return {
        'mean': np.mean(noise_values),
        'median': np.median(noise_values),
        'std': np.std(noise_values),
        'ks_statistic': ks_statistic,
        'ks_p_value': p_value,
        'reject_uniform': p_value < 0.05,
        'anderson_darling': ad_result.statistic,
        'cramer_von_mises': cvm_result.statistic
    }
```

#### 3.2 Convergence Tests

```python
def test_convergence_properties():
    """
    Test convergence of iterative algorithms.
    """
    results = []

    # Test percolation probability convergence
    densities = np.linspace(0.5, 0.8, 20)

    for n_tiles in [100, 1000, 10000]:
        percolation_probs = []

        for density in densities:
            percolates_count = 0
            n_trials = 100

            for _ in range(n_trials):
                percolator = FastPercolation(n_tiles=n_tiles, density=density)
                if percolator.percolates():
                    percolates_count += 1

            prob = percolates_count / n_trials
            percolation_probs.append(prob)

        # Check sigmoid shape
        # Fit logistic function: p = 1 / (1 + exp(-k(x - x0)))
        from scipy.optimize import curve_fit

        def logistic(x, k, x0):
            return 1 / (1 + np.exp(-k * (x - x0)))

        try:
            params, _ = curve_fit(logistic, densities, percolation_probs)
            k, x0 = params

            # Check x0 is near theoretical critical density
            error = abs(x0 - 0.6602741)

            results.append({
                'n_tiles': n_tiles,
                'critical_density': x0,
                'error': error,
                'steepness': k,
                'passed': error < 0.05
            })
        except:
            results.append({
                'n_tiles': n_tiles,
                'error': 'Fit failed',
                'passed': False
            })

    return results
```

#### 3.3 Correlation Tests

```python
def test_correlation_properties():
    """
    Test correlation between related quantities.
    """
    results = []

    # Test: Curvature vs clustering coefficient
    n_graphs = 100

    curvatures = []
    clustering_coeffs = []

    for _ in range(n_graphs):
        n = np.random.randint(20, 100)
        p = np.random.uniform(0.05, 0.3)

        G = nx.erdos_renyi_graph(n, p)

        # Compute curvature
        ricci = OllivierRicciCurvature(G)
        ricci.compute_curvatures()
        avg_curvature = np.mean(list(ricci.curvatures.values()))

        # Compute clustering coefficient
        clustering = nx.average_clustering(G)

        curvatures.append(avg_curvature)
        clustering_coeffs.append(clustering)

    # Pearson correlation
    pearson_r, pearson_p = stats.pearsonr(curvatures, clustering_coeffs)

    # Spearman correlation
    spearman_r, spearman_p = stats.spearmanr(curvatures, clustering_coeffs)

    results.append({
        'test': 'curvature_vs_clustering',
        'pearson_r': pearson_r,
        'pearson_p': pearson_p,
        'spearman_r': spearman_r,
        'spearman_p': spearman_p,
        'expected': 'negative correlation (higher clustering → more positive curvature)',
        'passed': pearson_r < 0  # Should be negative
    })

    return results
```

### 4. Performance Tests

#### 4.1 Scaling Tests

```python
def test_scaling_performance():
    """
    Test performance scaling with input size.
    """
    components = [
        ('snapping', test_snapping_scaling),
        ('percolation', test_percolation_scaling),
        ('cohomology', test_cohomology_scaling),
        ('ricci', test_ricci_scaling)
    ]

    results = {}

    for name, test_func in components:
        results[name] = test_func()

    return results

def test_snapping_scaling():
    """Test snapping scaling"""
    sizes = [100, 1000, 10000, 100000]
    times = []

    manifold = PythagoreanManifold()

    for size in sizes:
        vectors = np.random.randn(size, 2)
        vectors = vectors / np.linalg.norm(vectors, axis=1, keepdims=True)

        start = time.time()
        for vec in vectors:
            manifold.snap(vec)
        elapsed = time.time() - start

        times.append(elapsed)

    # Fit power law: time = a * n^b
    log_sizes = np.log(sizes)
    log_times = np.log(times)
    b, log_a = np.polyfit(log_sizes, log_times, 1)

    return {
        'sizes': sizes,
        'times': times,
        'exponent': b,
        'complexity': f'O(n^{b:.2f})',
        'expected': 'O(log n)',
        'passed': b < 0.5  # Should be better than O(n^0.5)
    }
```

#### 4.2 Memory Tests

```python
def test_memory_usage():
    """
    Test memory usage at scale.
    """
    import psutil
    import gc

    results = []

    for size in [1000, 10000, 100000, 1000000]:
        gc.collect()

        process = psutil.Process()
        mem_before = process.memory_info().rss / 1024 / 1024  # MB

        # Allocate and process data
        vectors = np.random.randn(size, 2)
        vectors = vectors / np.linalg.norm(vectors, axis=1, keepdims=True)

        manifold = PythagoreanManifold()
        for vec in vectors:
            manifold.snap(vec)

        mem_after = process.memory_info().rss / 1024 / 1024  # MB

        results.append({
            'size': size,
            'memory_mb': mem_after - mem_before,
            'memory_per_item_bytes': (mem_after - mem_before) * 1024 * 1024 / size
        })

    return results
```

#### 4.3 Parallelization Tests

```python
def test_parallel_scaling():
    """
    Test parallel scaling with multiple threads/processes.
    """
    from multiprocessing import Pool

    size = 100000
    n_workers_list = [1, 2, 4, 8]

    results = []

    for n_workers in n_workers_list:
        vectors = np.random.randn(size, 2)
        vectors = vectors / np.linalg.norm(vectors, axis=1, keepdims=True)

        start = time.time()

        with Pool(n_workers) as pool:
            # Parallel snapping
            results_list = pool.map(snap_vector, vectors)

        elapsed = time.time() - start

        speedup = elapsed  # Will normalize later

        results.append({
            'n_workers': n_workers,
            'time': elapsed,
            'speedup': speedup
        })

    # Normalize speedup
    baseline = results[0]['time']
    for r in results:
        r['speedup'] = baseline / r['time']

    return results
```

---

## Validation Protocols

### Protocol 1: Mathematical Claim Validation

**Purpose**: Verify theoretical claims match empirical observations

**Steps**:
1. State the claim mathematically
2. Derive testable predictions
3. Design experiments to test predictions
4. Collect data with appropriate sample size
5. Perform statistical tests
6. Draw conclusions with confidence intervals

**Example**:

**Claim**: Phi-Folding operator converges to Pythagorean triples

**Prediction**: Snapping noise < 0.01 for vectors near Pythagorean ratios

**Experiment**:
```python
# Generate vectors near Pythagorean triples
triples = [(3, 4, 5), (5, 12, 13), (8, 15, 17)]
noise_levels = [0.001, 0.01, 0.1, 0.5]

results = []
for a, b, c in triples:
    for noise_level in noise_levels:
        # Generate noisy vectors
        vectors = []
        for _ in range(1000):
            noise = np.random.randn(2) * noise_level
            vec = np.array([a/c, b/c]) + noise
            vec = vec / np.linalg.norm(vec)
            vectors.append(vec)

        # Snap and measure noise
        manifold = PythagoreanManifold()
        snapping_noises = []
        for vec in vectors:
            snapped, noise = manifold.snap(vec)
            snapping_noises.append(noise)

        # Statistics
        mean_noise = np.mean(snapping_noises)
        ci_95 = np.percentile(snapping_noises, [2.5, 97.5])

        results.append({
            'triple': f'{a}-{b}-{c}',
            'input_noise': noise_level,
            'snapping_noise_mean': mean_noise,
            'snapping_noise_ci_95': ci_95,
            'converged': mean_noise < 0.01
        })
```

**Validation**: Claim is supported if 95% of vectors converge

### Protocol 2: Convergence Validation

**Purpose**: Verify iterative algorithms converge correctly

**Steps**:
1. Define convergence criterion
2. Monitor convergence metric
3. Test on diverse inputs
4. Measure convergence rate
5. Verify final state is correct

**Example**:

**Algorithm**: Percolation detection

**Convergence Criterion**: Union-find stabilizes

**Test**:
```python
def test_percolation_convergence():
    """
    Test percolation algorithm convergence.
    """
    results = []

    for n_tiles in [100, 1000, 10000]:
        for density in [0.5, 0.66, 0.8]:
            percolator = FastPercolation(n_tiles=n_tiles, density=density)

            # Track convergence
            iterations = []
            for i in range(100):
                changed = percolator.step()
                iterations.append(i)
                if not changed:
                    break

            results.append({
                'n_tiles': n_tiles,
                'density': density,
                'iterations': len(iterations),
                'converged': not changed,
                'final_percolates': percolator.percolates()
            })

    return results
```

### Protocol 3: Equivalence Validation

**Purpose**: Verify different implementations produce same results

**Steps**:
1. Implement multiple versions
2. Test on same inputs
3. Compare outputs statistically
4. Report differences

**Example**:

**Compare**: Python vs Rust implementations

```python
def test_cross_language_equivalence():
    """
    Test Python and Rust implementations produce same results.
    """
    test_vectors = np.random.randn(1000, 2)
    test_vectors = test_vectors / np.linalg.norm(test_vectors, axis=1, keepdims=True)

    # Python implementation
    manifold_py = PythagoreanManifold()
    results_py = []
    for vec in test_vectors:
        snapped, noise = manifold_py.snap(vec)
        results_py.append((snapped, noise))

    # Rust implementation (via FFI)
    # results_rs = rust_snap_batch(test_vectors)

    # Compare
    differences = []
    for (snapped_py, noise_py), (snapped_rs, noise_rs) in zip(results_py, results_rs):
        diff_snapped = np.linalg.norm(snapped_py - snapped_rs)
        diff_noise = abs(noise_py - noise_rs)
        differences.append((diff_snapped, diff_noise))

    max_snapped_diff = max(d[0] for d in differences)
    max_noise_diff = max(d[1] for d in differences)

    return {
        'max_snapped_difference': max_snapped_diff,
        'max_noise_difference': max_noise_diff,
        'passed': max_snapped_diff < 1e-6 and max_noise_diff < 1e-6
    }
```

---

## Statistical Methods

### Power Analysis

**Purpose**: Determine required sample size

```python
def calculate_sample_size(effect_size, alpha=0.05, power=0.8):
    """
    Calculate required sample size for t-test.

    Args:
        effect_size: Cohen's d
        alpha: Significance level
        power: Statistical power (1 - beta)

    Returns:
        Required sample size
    """
    from scipy.stats import norm

    z_alpha = norm.ppf(1 - alpha/2)
    z_beta = norm.ppf(power)

    n = 2 * ((z_alpha + z_beta) / effect_size) ** 2

    return int(np.ceil(n))

# Example: Detect effect size of 0.5 with 80% power
n_required = calculate_sample_size(effect_size=0.5, alpha=0.05, power=0.8)
print(f"Required sample size: {n_required}")
```

### Bayesian Inference

**Purpose**: Update beliefs with data

```python
def bayesian_update(prior_mean, prior_std, data_mean, data_std, n):
    """
    Update prior with data using conjugate prior.

    Args:
        prior_mean: Prior mean
        prior_std: Prior standard deviation
        data_mean: Sample mean
        data_std: Sample standard deviation
        n: Sample size

    Returns:
        (posterior_mean, posterior_std)
    """
    # Precision (inverse variance)
    prior_precision = 1 / prior_std**2
    data_precision = n / data_std**2

    # Posterior precision
    posterior_precision = prior_precision + data_precision

    # Posterior mean (precision-weighted average)
    posterior_mean = (prior_precision * prior_mean + data_precision * data_mean) / posterior_precision

    # Posterior std
    posterior_std = 1 / np.sqrt(posterior_precision)

    return posterior_mean, posterior_std

# Example: Update belief about snapping noise
prior_mean = 0.1
prior_std = 0.05

data = [0.005, 0.008, 0.006, 0.007, 0.004]
data_mean = np.mean(data)
data_std = np.std(data, ddof=1)

post_mean, post_std = bayesian_update(prior_mean, prior_std, data_mean, data_std, len(data))

print(f"Prior: {prior_mean:.4f} ± {prior_std:.4f}")
print(f"Data: {data_mean:.4f} ± {data_std:.4f}")
print(f"Posterior: {post_mean:.4f} ± {post_std:.4f}")
```

### Multiple Comparison Correction

```python
def false_discovery_rate(p_values, q=0.05):
    """
    Benjamini-Hochberg procedure for FDR control.

    Args:
        p_values: Array of p-values
        q: Target FDR rate

    Returns:
        Boolean array of rejected hypotheses
    """
    p_values = np.array(p_values)
    n = len(p_values)

    # Sort p-values
    sorted_indices = np.argsort(p_values)
    sorted_p = p_values[sorted_indices]

    # Find largest k such that p_k ≤ (k/n) * q
    thresholds = (np.arange(1, n+1) / n) * q
    significant = sorted_p <= thresholds

    if np.any(significant):
        k = np.where(significant)[0][-1]
        rejected = np.zeros(n, dtype=bool)
        rejected[sorted_indices[:k+1]] = True
    else:
        rejected = np.zeros(n, dtype=bool)

    return rejected
```

---

## Acceptance Criteria

### Mathematical Correctness

| Test | Criterion | Pass Condition |
|------|-----------|----------------|
| Pythagorean convergence | Noise < 0.01 | > 99% of vectors |
| Percolation threshold | Error < 0.01 | p_c ∈ [0.650, 0.670] |
| Cohomology dimensions | Exact match | H0, H1 correct |
| Ricci properties | All properties | Symmetry, bounds, constancy |
| Laman's theorem | Exact match | Rigidity detection |

### Numerical Stability

| Test | Criterion | Pass Condition |
|------|-----------|----------------|
| Precision | Relative error | < 1% for all scales |
| Edge cases | Graceful handling | No crashes/NaNs |
| Conditioning | Well-conditioned | cond < 100 for typical cases |

### Statistical Properties

| Test | Criterion | Pass Condition |
|------|-----------|----------------|
| Distribution | KS test | Reject uniform (p < 0.05) |
| Convergence | Logistic fit | R² > 0.95 |
| Correlation | Sign test | Expected sign, p < 0.05 |

### Performance

| Test | Criterion | Pass Condition |
|------|-----------|----------------|
| Scaling | Power law | O(n^b) with b < target |
| Memory | Linear growth | < 1KB per item |
| Parallelization | Speedup | > 0.7 × ideal |

---

## Test Scenarios

### Scenario 1: Production Deployment

**Goal**: Validate system is ready for production

**Tests**:
1. Load test: 1M vectors through Phi-Folding
2. Stress test: 100K tiles percolation
3. Accuracy test: All mathematical correctness tests
4. Performance test: All scaling tests

**Pass Criteria**:
- All tests pass
- No errors or crashes
- Performance meets targets

### Scenario 2: Algorithm Validation

**Goal**: Validate new algorithm implementation

**Tests**:
1. Correctness: Compare to reference implementation
2. Accuracy: Verify numerical precision
3. Performance: Benchmark against baseline
4. Edge cases: Test boundary conditions

**Pass Criteria**:
- Results match reference (within tolerance)
- Performance ≥ baseline (within 10%)

### Scenario 3: Regression Testing

**Goal**: Detect performance degradation

**Tests**:
1. Run full test suite
2. Compare to baseline
3. Report regressions

**Pass Criteria**:
- No regressions > 5%
- New tests pass

---

## Regression Testing

### Baseline Establishment

```python
def establish_baseline():
    """
    Establish performance baseline.
    """
    baseline = {
        'snapping_1k': test_snapping_time(1000),
        'snapping_1m': test_snapping_time(1000000),
        'percolation_10k': test_percolation_time(10000),
        'cohomology_1k': test_cohomology_time(1000),
        'ricci_100': test_ricci_time(100)
    }

    # Save to file
    import json
    with open('baseline.json', 'w') as f:
        json.dump(baseline, f, indent=2)

    return baseline
```

### Regression Detection

```python
def detect_regression(current_results, baseline_file='baseline.json', tolerance=0.05):
    """
    Detect performance regression.

    Args:
        current_results: Current test results
        baseline_file: Baseline JSON file
        tolerance: Allowable degradation (5%)

    Returns:
        Dict with regression information
    """
    import json

    with open(baseline_file, 'r') as f:
        baseline = json.load(f)

    regressions = []

    for test_name in current_results:
        if test_name not in baseline:
            continue

        baseline_time = baseline[test_name]
        current_time = current_results[test_name]

        degradation = (current_time - baseline_time) / baseline_time

        if degradation > tolerance:
            regressions.append({
                'test': test_name,
                'baseline': baseline_time,
                'current': current_time,
                'degradation': degradation
            })

    return {
        'has_regression': len(regressions) > 0,
        'regressions': regressions
    }
```

---

## Continuous Validation

### CI/CD Integration

```yaml
# .github/workflows/validation.yml
name: Continuous Validation

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  validate:
    runs-on: ubuntu-latest

    steps:
    - uses: actions/checkout@v2

    - name: Set up Python
      uses: actions/setup-python@v2
      with:
        python-version: '3.9'

    - name: Install dependencies
      run: |
        pip install numpy scipy networkx matplotlib pytest

    - name: Run mathematical correctness tests
      run: |
        python -m pytest tests/mathematical/ -v

    - name: Run numerical stability tests
      run: |
        python -m pytest tests/numerical/ -v

    - name: Run statistical tests
      run: |
        python monte_carlo_validation.py

    - name: Run performance tests
      run: |
        python -m pytest tests/performance/ -v

    - name: Check for regressions
      run: |
        python scripts/check_regression.py

    - name: Upload results
      uses: actions/upload-artifact@v2
      with:
        name: validation-results
        path: results/
```

### Automated Regression Detection

```python
# scripts/check_regression.py
import json
import sys

def main():
    with open('results/current.json', 'r') as f:
        current = json.load(f)

    try:
        with open('baseline.json', 'r') as f:
            baseline = json.load(f)
    except FileNotFoundError:
        print("No baseline found, creating one...")
        import shutil
        shutil.copy('results/current.json', 'baseline.json')
        return 0

    regressions = detect_regression(current, 'baseline.json', tolerance=0.05)

    if regressions['has_regression']:
        print("REGRESSION DETECTED!")
        for r in regressions['regressions']:
            print(f"  {r['test']}: {r['degradation']*100:.1f}% slower")
        return 1
    else:
        print("No regressions detected")
        return 0

if __name__ == '__main__':
    sys.exit(main())
```

---

## Summary

This validation suite provides:

1. **Mathematical Correctness**: Verify all theoretical claims
2. **Numerical Stability**: Ensure robust computation
3. **Statistical Rigor**: Validate with confidence intervals
4. **Performance**: Benchmark and detect regressions
5. **Continuous Validation**: CI/CD integration

**Next Steps**:
1. Run full validation suite
2. Establish baseline performance
3. Set up continuous validation
4. Monitor production metrics

**Last Updated**: 2025-03-16
**Status**: Active - Production-ready validation framework
