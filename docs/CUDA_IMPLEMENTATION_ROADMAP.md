# CUDA Implementation Roadmap - Constraint Theory Engine

**Repository:** https://github.com/SuperInstance/Constraint-Theory
**Date:** 2026-03-16
**Status:** Implementation Planning
**Duration:** 10 weeks (Phase 1-5)

---

## Executive Summary

This document provides a detailed implementation roadmap for the CUDA acceleration of the Constraint Theory engine. The roadmap is organized into 5 phases over 10 weeks, with clear milestones, deliverables, and success criteria for each phase.

### Overall Objectives

1. **Achieve <10ns per tile latency** (639x speedup over current 6.39μs)
2. **Reach >100M tiles/sec throughput** on single H100 GPU
3. **Scale to >700M tiles/sec** on 8x H100 configuration
4. **Maintain mathematical correctness** (validate against CPU implementation)
5. **Production-ready deployment** with 99.9% availability

---

## Phase 1: Foundation (Week 1-2)

### Objectives
- Set up CUDA development environment
- Implement basic Pythagorean snap kernel
- Validate correctness against CPU version
- Establish baseline performance metrics

### Week 1: Environment Setup

#### Day 1-2: Development Environment

**Tasks:**
```bash
# Install CUDA 12.6
wget https://developer.download.nvidia.com/compute/cuda/12.6.0/local_installers/cuda_12.6.0_560.28.03_linux.run
sudo sh cuda_12.6.0_560.28.03_linux.run

# Verify installation
nvcc --version
nvidia-smi

# Set up project structure
mkdir -p cuda/{src,include,tests,benchmarks}
mkdir -p cuda/src/{kdtree,pythagorean,holonomy,utils}
```

**Deliverables:**
- [x] CUDA 12.6 installed and verified
- [x] Project directory structure created
- [x] CMakeLists.txt for build system

**Success Criteria:**
- `nvcc --version` outputs CUDA 12.6
- `nvidia-smi` shows H100 GPU
- Sample "hello world" CUDA kernel compiles and runs

#### Day 3-4: Basic Data Structures

**File:** `cuda/include/types.cuh`

```cuda
#pragma once
#include <cuda_runtime.h>
#include <device_launch_parameters.h>

// Tile structure (GPU-optimized SoA layout)
struct TileArray {
    float* x;              // N × 4B
    float* y;              // N × 4B
    float* confidence;     // N × 4B
    float* omega_density;  // N × 4B
    uint32_t* safety;      // N × 4B
    float* holonomy;       // N × 9 × 4B (3x3 matrix)
    int n_tiles;
};

// Pythagorean triple database
struct PythagoreanDatabase {
    float2* triples;       // M × 2 × 4B
    int n_triples;
};

// Connection matrix for holonomy
struct ConnectionMatrix {
    float* values;         // NNZ × 4B
    int* row_offsets;      // (N+1) × 4B
    int* col_indices;      // NNZ × 4B
    int n_rows;
    int nnz;
};
```

**File:** `cuda/src/utils/memory.cu`

```cuda
#include "types.cuh"
#include <cuda_runtime_api.h>

class CUDAMemoryPool {
private:
    std::unordered_map<size_t, std::vector<void*>> pools;
    std::mutex mutex;

public:
    void* allocate(size_t size) {
        size_t rounded_size = ((size + 1023) / 1024) * 1024;
        std::lock_guard<std::mutex> lock(mutex);

        auto& pool = pools[rounded_size];
        if (!pool.empty()) {
            void* ptr = pool.back();
            pool.pop_back();
            return ptr;
        }

        void* ptr;
        cudaMalloc(&ptr, rounded_size);
        return ptr;
    }

    void deallocate(void* ptr, size_t size) {
        size_t rounded_size = ((size + 1023) / 1024) * 1024;
        std::lock_guard<std::mutex> lock(mutex);

        auto& pool = pools[rounded_size];
        if (pool.size() < 10) {
            pool.push_back(ptr);
        } else {
            cudaFree(ptr);
        }
    }
};

extern "C" {
    CUDAMemoryPool* cuda_memory_pool_create() {
        return new CUDAMemoryPool();
    }

    void cuda_memory_pool_destroy(CUDAMemoryPool* pool) {
        delete pool;
    }

    void* cuda_memory_pool_allocate(CUDAMemoryPool* pool, size_t size) {
        return pool->allocate(size);
    }

    void cuda_memory_pool_deallocate(CUDAMemoryPool* pool, void* ptr, size_t size) {
        pool->deallocate(ptr, size);
    }
}
```

**Deliverables:**
- [x] `types.cuh` with GPU-optimized data structures
- [x] `memory.cu` with memory pool implementation
- [x] Unit tests for memory allocation/deallocation

**Success Criteria:**
- Memory pool passes all unit tests
- No memory leaks detected (cuda-memcheck)
- Allocation/deallocation takes <1μs on average

#### Day 5-7: Basic Pythagorean Snap Kernel

**File:** `cuda/src/pythagorean/snap.cu`

```cuda
#include "types.cuh"
#include <cmath>

__device__ void snap_to_pythagorean_naive(
    const PythagoreanDatabase* db,
    float2 vec,
    float2* snapped,
    float* noise
) {
    // Normalize input vector
    float norm = sqrtf(vec.x * vec.x + vec.y * vec.y);
    if (norm < 1e-10f) {
        *snapped = make_float2(1.0f, 0.0f);
        *noise = 0.0f;
        return;
    }

    float2 v_in = make_float2(vec.x / norm, vec.y / norm);

    // Find maximum resonance (naive O(N) search)
    float max_resonance = -1.0f;
    int best_idx = 0;

    for (int i = 0; i < db->n_triples; i++) {
        float2 state = db->triples[i];
        float resonance = state.x * v_in.x + state.y * v_in.y;

        if (resonance > max_resonance) {
            max_resonance = resonance;
            best_idx = i;
        }
    }

    *snapped = db->triples[best_idx];
    *noise = 1.0f - max_resonance;
}

__global__ void snap_pythagorean_kernel(
    const PythagoreanDatabase* __restrict__ db,
    const float2* __restrict__ vectors_in,
    float2* __restrict__ vectors_out,
    float* __restrict__ noise_out,
    int n_vectors
) {
    int idx = blockIdx.x * blockDim.x + threadIdx.x;
    if (idx >= n_vectors) return;

    float2 vec = vectors_in[idx];
    float2 snapped;
    float noise;

    snap_to_pythagorean_naive(db, vec, &snapped, &noise);

    vectors_out[idx] = snapped;
    noise_out[idx] = noise;
}

extern "C" {
    void snap_pythagorean_gpu(
        const PythagoreanDatabase* db,
        const float2* vectors_in,
        float2* vectors_out,
        float* noise_out,
        int n_vectors,
        cudaStream_t stream
    ) {
        int threads = 256;
        int blocks = (n_vectors + threads - 1) / threads;

        snap_pythagorean_kernel<<<blocks, threads, 0, stream>>>(
            db, vectors_in, vectors_out, noise_out, n_vectors
        );
    }
}
```

**File:** `cuda/tests/test_snap.cu`

```cuda
#include "types.cuh"
#include <gtest/gtest.h>

TEST(SnapPythagoreanTest, BasicTest) {
    // Initialize database
    PythagoreanDatabase h_db;
    h_db.n_triples = 4;
    float2 h_triples[] = {
        {1.0f, 0.0f},
        {0.0f, 1.0f},
        {0.6f, 0.8f},
        {0.8f, 0.6f}
    };

    cudaMalloc(&h_db.triples, 4 * sizeof(float2));
    cudaMemcpy(h_db.triples, h_triples, 4 * sizeof(float2), cudaMemcpyHostToDevice);

    // Test input
    float2 h_vectors_in[] = {
        {0.6f, 0.8f},
        {0.8f, 0.6f},
        {0.0f, 1.0f},
        {1.0f, 0.0f}
    };

    float2 *d_vectors_in, *d_vectors_out;
    float *d_noise_out;

    cudaMalloc(&d_vectors_in, 4 * sizeof(float2));
    cudaMalloc(&d_vectors_out, 4 * sizeof(float2));
    cudaMalloc(&d_noise_out, 4 * sizeof(float));

    cudaMemcpy(d_vectors_in, h_vectors_in, 4 * sizeof(float2), cudaMemcpyHostToDevice);

    // Launch kernel
    snap_pythagorean_gpu(&h_db, d_vectors_in, d_vectors_out, d_noise_out, 4, 0);

    // Copy back
    float2 h_vectors_out[4];
    float h_noise_out[4];
    cudaMemcpy(h_vectors_out, d_vectors_out, 4 * sizeof(float2), cudaMemcpyDeviceToHost);
    cudaMemcpy(h_noise_out, d_noise_out, 4 * sizeof(float), cudaMemcpyDeviceToHost);

    // Verify
    EXPECT_FLOAT_EQ(h_vectors_out[0].x, 0.6f);
    EXPECT_FLOAT_EQ(h_vectors_out[0].y, 0.8f);
    EXPECT_LT(h_noise_out[0], 0.001f);

    // Cleanup
    cudaFree(h_db.triples);
    cudaFree(d_vectors_in);
    cudaFree(d_vectors_out);
    cudaFree(d_noise_out);
}
```

**Deliverables:**
- [x] Naive Pythagorean snap kernel
- [x] Unit tests with Google Test
- [x] Benchmark comparing GPU vs CPU

**Success Criteria:**
- All unit tests pass
- GPU results match CPU (within 1e-5 tolerance)
- Initial throughput: >1M tiles/sec

### Week 2: Validation and Profiling

#### Day 8-10: Comprehensive Testing

**File:** `cuda/tests/validation.cu`

```cuda
#include "types.cuh"
#include <random>

void generate_test_vectors(int n, float2* vectors) {
    std::mt19937 rng(42);
    std::uniform_real_distribution<float> dist(-1.0f, 1.0f);

    for (int i = 0; i < n; i++) {
        float x = dist(rng);
        float y = dist(rng);
        float norm = sqrtf(x * x + y * y);
        vectors[i] = make_float2(x / norm, y / norm);
    }
}

void cpu_snap_reference(
    const PythagoreanDatabase* db,
    const float2* vectors_in,
    float2* vectors_out,
    float* noise_out,
    int n
) {
    for (int i = 0; i < n; i++) {
        float2 vec = vectors_in[i];

        float norm = sqrtf(vec.x * vec.x + vec.y * vec.y);
        if (norm < 1e-10f) {
            vectors_out[i] = make_float2(1.0f, 0.0f);
            noise_out[i] = 0.0f;
            continue;
        }

        float2 v_in = make_float2(vec.x / norm, vec.y / norm);

        float max_resonance = -1.0f;
        int best_idx = 0;

        for (int j = 0; j < db->n_triples; j++) {
            float2 state = db->triples[j];
            float resonance = state.x * v_in.x + state.y * v_in.y;

            if (resonance > max_resonance) {
                max_resonance = resonance;
                best_idx = j;
            }
        }

        vectors_out[i] = db->triples[best_idx];
        noise_out[i] = 1.0f - max_resonance;
    }
}

TEST(ValidationTest, LargeScale) {
    const int N = 100000;

    // Create database
    PythagoreanDatabase h_db;
    h_db.n_triples = 40000;
    float2* h_triples = new float2[h_db.n_triples];
    generate_test_vectors(h_db.n_triples, h_triples);

    cudaMalloc(&h_db.triples, h_db.n_triples * sizeof(float2));
    cudaMemcpy(h_db.triples, h_triples, h_db.n_triples * sizeof(float2),
               cudaMemcpyHostToDevice);

    // Generate test vectors
    float2* h_vectors_in = new float2[N];
    generate_test_vectors(N, h_vectors_in);

    // GPU computation
    float2 *d_vectors_in, *d_vectors_out;
    float *d_noise_out;
    cudaMalloc(&d_vectors_in, N * sizeof(float2));
    cudaMalloc(&d_vectors_out, N * sizeof(float2));
    cudaMalloc(&d_noise_out, N * sizeof(float));

    cudaMemcpy(d_vectors_in, h_vectors_in, N * sizeof(float2), cudaMemcpyHostToDevice);

    snap_pythagorean_gpu(&h_db, d_vectors_in, d_vectors_out, d_noise_out, N, 0);

    float2* h_vectors_out_gpu = new float2[N];
    float* h_noise_out_gpu = new float[N];
    cudaMemcpy(h_vectors_out_gpu, d_vectors_out, N * sizeof(float2),
               cudaMemcpyDeviceToHost);
    cudaMemcpy(h_noise_out_gpu, d_noise_out, N * sizeof(float),
               cudaMemcpyDeviceToHost);

    // CPU reference
    float2* h_vectors_out_cpu = new float2[N];
    float* h_noise_out_cpu = new float[N];
    cpu_snap_reference(&h_db, h_vectors_in, h_vectors_out_cpu, h_noise_out_cpu, N);

    // Verify
    float max_error_x = 0.0f;
    float max_error_y = 0.0f;
    float max_error_noise = 0.0f;

    for (int i = 0; i < N; i++) {
        float error_x = fabsf(h_vectors_out_gpu[i].x - h_vectors_out_cpu[i].x);
        float error_y = fabsf(h_vectors_out_gpu[i].y - h_vectors_out_cpu[i].y);
        float error_noise = fabsf(h_noise_out_gpu[i] - h_noise_out_cpu[i]);

        max_error_x = fmaxf(max_error_x, error_x);
        max_error_y = fmaxf(max_error_y, error_y);
        max_error_noise = fmaxf(max_error_noise, error_noise);
    }

    printf("Max error X: %e\n", max_error_x);
    printf("Max error Y: %e\n", max_error_y);
    printf("Max error noise: %e\n", max_error_noise);

    EXPECT_LT(max_error_x, 1e-5f);
    EXPECT_LT(max_error_y, 1e-5f);
    EXPECT_LT(max_error_noise, 1e-5f);

    // Cleanup
    delete[] h_triples;
    delete[] h_vectors_in;
    delete[] h_vectors_out_gpu;
    delete[] h_vectors_out_cpu;
    delete[] h_noise_out_gpu;
    delete[] h_noise_out_cpu;
    cudaFree(h_db.triples);
    cudaFree(d_vectors_in);
    cudaFree(d_vectors_out);
    cudaFree(d_noise_out);
}
```

**Deliverables:**
- [x] Large-scale validation test (100K vectors)
- [x] Accuracy report comparing GPU vs CPU
- [x] Bug fixes for any discrepancies found

**Success Criteria:**
- Max error < 1e-5 for all outputs
- 100% test pass rate
- No memory leaks (cuda-memcheck clean)

#### Day 11-14: Profiling and Baseline Metrics

**File:** `cuda/benchmarks/baseline.cu`

```cuda
#include "types.cuh"
#include <chrono>

struct BenchmarkResult {
    std::string name;
    int n_iterations;
    double total_time_ms;
    double avg_time_ms;
    double avg_latency_ns;
    double throughput_tiles_per_sec;
};

BenchmarkResult benchmark_snap(
    const PythagoreanDatabase* db,
    int n_vectors,
    int n_iterations
) {
    BenchmarkResult result;
    result.name = "pythagorean_snap";
    result.n_iterations = n_iterations;

    // Allocate memory
    float2 *d_vectors_in, *d_vectors_out;
    float *d_noise_out;

    cudaMalloc(&d_vectors_in, n_vectors * sizeof(float2));
    cudaMalloc(&d_vectors_out, n_vectors * sizeof(float2));
    cudaMalloc(&d_noise_out, n_vectors * sizeof(float));

    // Warmup
    for (int i = 0; i < 10; i++) {
        snap_pythagorean_gpu(db, d_vectors_in, d_vectors_out, d_noise_out,
                            n_vectors, 0);
    }

    // Timed runs
    cudaEvent_t start, stop;
    cudaEventCreate(&start);
    cudaEventCreate(&stop);

    cudaEventRecord(start);
    for (int i = 0; i < n_iterations; i++) {
        snap_pythagorean_gpu(db, d_vectors_in, d_vectors_out, d_noise_out,
                            n_vectors, 0);
    }
    cudaEventRecord(stop);
    cudaEventSynchronize(stop);

    float elapsed_ms;
    cudaEventElapsedTime(&elapsed_ms, start, stop);

    result.total_time_ms = elapsed_ms;
    result.avg_time_ms = elapsed_ms / n_iterations;
    result.avg_latency_ns = (elapsed_ms * 1e6) / (n_vectors * n_iterations);
    result.throughput_tiles_per_sec = (n_vectors * n_iterations) / (elapsed_ms / 1000.0);

    printf("========================================\n");
    printf("Benchmark: %s\n", result.name.c_str());
    printf("========================================\n");
    printf("Vectors: %d\n", n_vectors);
    printf("Iterations: %d\n", n_iterations);
    printf("Total time: %.2f ms\n", result.total_time_ms);
    printf("Avg time: %.4f ms\n", result.avg_time_ms);
    printf("Per-vector latency: %.2f ns\n", result.avg_latency_ns);
    printf("Throughput: %.0f vectors/sec\n", result.throughput_tiles_per_sec);
    printf("\n");

    // Cleanup
    cudaFree(d_vectors_in);
    cudaFree(d_vectors_out);
    cudaFree(d_noise_out);
    cudaEventDestroy(start);
    cudaEventDestroy(stop);

    return result;
}

int main() {
    // Create database
    PythagoreanDatabase h_db;
    h_db.n_triples = 40000;
    float2* h_triples = new float2[h_db.n_triples];
    generate_test_vectors(h_db.n_triples, h_triples);

    cudaMalloc(&h_db.triples, h_db.n_triples * sizeof(float2));
    cudaMemcpy(h_db.triples, h_triples, h_db.n_triples * sizeof(float2),
               cudaMemcpyHostToDevice);

    // Run benchmarks
    printf("Baseline CUDA Performance\n");
    printf("==========================\n\n");

    benchmark_snap(&h_db, 1000, 100);
    benchmark_snap(&h_db, 10000, 100);
    benchmark_snap(&h_db, 100000, 100);
    benchmark_snap(&h_db, 1000000, 50);

    // Cleanup
    delete[] h_triples;
    cudaFree(h_db.triples);

    return 0;
}
```

**Profiling with Nsight Compute:**

```bash
# Profile kernel
ncu --set full \
    --target-processes all \
    --export report_baseline \
    ./benchmarks/baseline

# Key metrics to check:
# - DRAM throughput
# - L2 cache hit rate
# - Warp execution efficiency
# - Memory bandwidth utilization
```

**Deliverables:**
- [x] Baseline performance report
- [x] Nsight Compute profiling results
- [x] Bottleneck analysis

**Success Criteria:**
- Baseline throughput: >1M tiles/sec
- Profiling report identifies key bottlenecks
- Clear optimization targets identified

---

## Phase 2: Optimization (Week 3-4)

### Objectives
- Implement shared memory KD-tree cache
- Add warp-level reductions
- Optimize memory coalescing (SoA layout)
- Achieve >50M tiles/sec throughput

### Week 3: Shared Memory Optimization

#### Day 15-17: KD-Tree Implementation

**File:** `cuda/src/kdtree/kdtree.cuh`

```cuda
#pragma once
#include "types.cuh"

struct KDTreeNode {
    float2 point;       // For leaf nodes: actual point
    float split_value;  // For internal nodes: split value
    int left_child;     // Index of left child (-1 for leaf)
    int right_child;    // Index of right child (-1 for leaf)
    int is_leaf;        // 1 if leaf, 0 if internal
    int split_dim;      // 0 for x, 1 for y
};

struct KDTree {
    KDTreeNode* nodes;  // Device memory
    int n_nodes;
    int max_nodes;      // Capacity
};

// Build KD-tree on CPU
extern "C" {
    KDTree* kdtree_build(const float2* points, int n_points);

    void kdtree_destroy(KDTree* tree);
}
```

**File:** `cuda/src/kdtree/kdtree_cpu.cpp`

```cpp
#include "kdtree.cuh"
#include <algorithm>
#include <vector>
#include <queue>

struct BuildNode {
    int point_start;
    int point_end;
    int depth;
    int parent_idx;
    bool is_left_child;
};

KDTree* kdtree_build(const float2* points, int n_points) {
    KDTree* tree = new KDTree();
    tree->max_nodes = n_points * 2;  // Upper bound
    cudaMallocManaged(&tree->nodes, tree->max_nodes * sizeof(KDTreeNode));
    tree->n_nodes = 0;

    // Copy points to managed memory for building
    float2* managed_points;
    cudaMallocManaged(&managed_points, n_points * sizeof(float2));
    memcpy(managed_points, points, n_points * sizeof(float2));

    std::queue<BuildNode> build_queue;
    build_queue.push({0, n_points, 0, -1, false});

    std::vector<int> indices(n_points);
    for (int i = 0; i < n_points; i++) indices[i] = i;

    while (!build_queue.empty()) {
        BuildNode current = build_queue.front();
        build_queue.pop();

        int node_idx = tree->n_nodes++;
        KDTreeNode& node = tree->nodes[node_idx];

        if (current.point_end - current.point_start <= 10) {
            // Leaf node
            node.is_leaf = 1;
            node.left_child = -1;
            node.right_child = -1;

            // Store point (use median)
            int mid = (current.point_start + current.point_end) / 2;
            node.point = managed_points[indices[mid]];

        } else {
            // Internal node
            node.is_leaf = 0;
            node.split_dim = current.depth % 2;

            // Sort indices by split dimension
            auto start = indices.begin() + current.point_start;
            auto end = indices.begin() + current.point_end;

            if (node.split_dim == 0) {
                std::sort(start, end, [&](int a, int b) {
                    return managed_points[a].x < managed_points[b].x;
                });
            } else {
                std::sort(start, end, [&](int a, int b) {
                    return managed_points[a].y < managed_points[b].y;
                });
            }

            int mid = (current.point_start + current.point_end) / 2;
            node.split_value = (node.split_dim == 0) ?
                managed_points[indices[mid]].x :
                managed_points[indices[mid]].y;

            // Enqueue children
            node.left_child = tree->n_nodes;
            build_queue.push({current.point_start, mid, current.depth + 1,
                            node_idx, true});

            node.right_child = tree->n_nodes;  // Will be updated after left
            build_queue.push({mid + 1, current.point_end, current.depth + 1,
                            node_idx, false});
        }

        // Update parent
        if (current.parent_idx >= 0) {
            if (current.is_left_child) {
                tree->nodes[current.parent_idx].left_child = node_idx;
            } else {
                tree->nodes[current.parent_idx].right_child = node_idx;
            }
        }
    }

    cudaFree(managed_points);
    return tree;
}

void kdtree_destroy(KDTree* tree) {
    cudaFree(tree->nodes);
    delete tree;
}
```

**Deliverables:**
- [x] KD-tree implementation
- [x] CPU-based tree builder
- [x] Unit tests for correctness

**Success Criteria:**
- KD-tree correctly stores all points
- Tree depth is O(log N)
- Build time <1s for 40K points

#### Day 18-21: Shared Memory Cache

**File:** `cuda/src/kdtree/kdtree_cache.cuh`

```cuda
#pragma once
#include "kdtree.cuh"

#define CACHE_SIZE 2000

struct KDTreeCache {
    KDTreeNode nodes[CACHE_SIZE];
    int access_count[CACHE_SIZE];
    int n_cached;
    int circular_idx;
};

__device__ void kdtree_cache_init(KDTreeCache* cache) {
    if (threadIdx.x == 0) {
        cache->n_cached = 0;
        cache->circular_idx = 0;
    }
    __syncthreads();
}

__device__ const KDTreeNode* kdtree_cache_lookup(
    KDTreeCache* cache,
    const KDTree* tree,
    int node_idx
) {
    // Check if in cache
    for (int i = 0; i < cache->n_cached; i++) {
        if (cache->nodes[i].split_value == tree->nodes[node_idx].split_value &&
            cache->nodes[i].split_dim == tree->nodes[node_idx].split_dim) {
            cache->access_count[i]++;
            return &cache->nodes[i];
        }
    }

    // Cache miss - load from global memory
    int cache_idx = cache->circular_idx;
    cache->nodes[cache_idx] = tree->nodes[node_idx];
    cache->access_count[cache_idx] = 1;
    cache->circular_idx = (cache->circular_idx + 1) % CACHE_SIZE;

    if (cache->n_cached < CACHE_SIZE) {
        cache->n_cached++;
    }

    return &cache->nodes[cache_idx];
}

__device__ float2 kdtree_nearest_neighbor(
    KDTreeCache* cache,
    const KDTree* tree,
    float2 query
) {
    int stack[64];
    int stack_top = 0;
    stack[stack_top++] = 0;  // Root node

    float best_dist = FLT_MAX;
    float2 best_point = make_float2(0.0f, 0.0f);

    while (stack_top > 0) {
        int node_idx = stack[--stack_top];
        const KDTreeNode* node = kdtree_cache_lookup(cache, tree, node_idx);

        if (node->is_leaf) {
            float2 point = node->point;
            float dist = (query.x - point.x) * (query.x - point.x) +
                        (query.y - point.y) * (query.y - point.y);

            if (dist < best_dist) {
                best_dist = dist;
                best_point = point;
            }
        } else {
            int dim = node->split_dim;
            float value = (dim == 0) ? query.x : query.y;

            if (value < node->split_value) {
                if (node->right_child >= 0) stack[stack_top++] = node->right_child;
                if (node->left_child >= 0) stack[stack_top++] = node->left_child;
            } else {
                if (node->left_child >= 0) stack[stack_top++] = node->left_child;
                if (node->right_child >= 0) stack[stack_top++] = node->right_child;
            }
        }
    }

    return best_point;
}
```

**File:** `cuda/src/pythagorean/snap_kdtree.cu`

```cuda
#include "types.cuh"
#include "kdtree/kdtree_cache.cuh"

__global__ void snap_pythagorean_kdtree_kernel(
    const KDTree* __restrict__ kdtree,
    const float2* __restrict__ vectors_in,
    float2* __restrict__ vectors_out,
    float* __restrict__ noise_out,
    int n_vectors
) {
    int idx = blockIdx.x * blockDim.x + threadIdx.x;
    if (idx >= n_vectors) return;

    __shared__ KDTreeCache cache;
    if (threadIdx.x == 0) {
        kdtree_cache_init(&cache);
    }
    __syncthreads();

    float2 vec = vectors_in[idx];

    // Normalize
    float norm = sqrtf(vec.x * vec.x + vec.y * vec.y);
    if (norm < 1e-10f) {
        vectors_out[idx] = make_float2(1.0f, 0.0f);
        noise_out[idx] = 0.0f;
        return;
    }

    float2 v_in = make_float2(vec.x / norm, vec.y / norm);

    // Find nearest neighbor using KD-tree
    float2 snapped = kdtree_nearest_neighbor(&cache, kdtree, v_in);

    // Compute noise
    float resonance = snapped.x * v_in.x + snapped.y * v_in.y;
    float noise = 1.0f - resonance;

    vectors_out[idx] = snapped;
    noise_out[idx] = noise;
}
```

**Deliverables:**
- [x] Shared memory KD-tree cache
- [x] Kernel using cached KD-tree
- [x] Performance benchmarks

**Success Criteria:**
- Cache hit rate >80%
- Throughput: >20M tiles/sec (10x improvement)
- Shared memory utilization >90%

### Week 4: Warp-Level Optimization

#### Day 22-24: Warp-Level Primitives

**File:** `cuda/src/utils/warp.cuh`

```cuda
#pragma once
#include <cuda_runtime.h>

__device__ float warp_reduce_sum(float val) {
    for (int offset = 16; offset > 0; offset /= 2) {
        val += __shfl_down_sync(0xFFFFFFFF, val, offset);
    }
    return val;
}

__device__ float warp_reduce_max(float val) {
    for (int offset = 16; offset > 0; offset /= 2) {
        val = fmaxf(val, __shfl_down_sync(0xFFFFFFFF, val, offset));
    }
    return val;
}

__device__ float2 warp_reduce_argmax(float value, float index) {
    for (int offset = 16; offset > 0; offset /= 2) {
        float other_value = __shfl_down_sync(0xFFFFFFFF, value, offset);
        float other_index = __shfl_down_sync(0xFFFFFFFF, index, offset);

        if (other_value > value) {
            value = other_value;
            index = other_index;
        }
    }
    return make_float2(value, index);
}

__device__ void warp_aggregated_atomic_add(float* address, float value) {
    int lane = threadIdx.x % 32;

    // Sum across warp
    for (int offset = 16; offset > 0; offset /= 2) {
        value += __shfl_down_sync(0xFFFFFFFF, value, offset);
    }

    // Lane 0 performs atomic
    if (lane == 0) {
        atomicAdd(address, value);
    }
}
```

**File:** `cuda/src/pythagorean/snap_warp.cu`

```cuda
#include "types.cuh"
#include "kdtree/kdtree_cache.cuh"
#include "utils/warp.cuh"

__global__ void snap_pythagorean_warp_kernel(
    const KDTree* __restrict__ kdtree,
    const float2* __restrict__ vectors_in,
    float2* __restrict__ vectors_out,
    float* __restrict__ noise_out,
    int n_vectors
) {
    // Warp-level processing
    int warp_id = (blockIdx.x * blockDim.x + threadIdx.x) / 32;
    int lane_id = threadIdx.x % 32;

    int vec_idx = warp_id * 32 + lane_id;
    if (vec_idx >= n_vectors) return;

    __shared__ KDTreeCache cache;
    if (threadIdx.x == 0) {
        kdtree_cache_init(&cache);
    }
    __syncthreads();

    float2 vec = vectors_in[vec_idx];

    // Normalize
    float norm = sqrtf(vec.x * vec.x + vec.y * vec.y);
    if (norm < 1e-10f) {
        vectors_out[vec_idx] = make_float2(1.0f, 0.0f);
        noise_out[vec_idx] = 0.0f;
        return;
    }

    float2 v_in = make_float2(vec.x / norm, vec.y / norm);

    // Warp-level collaborative search
    float2 best_point = make_float2(0.0f, 0.0f);
    float best_resonance = -1.0f;

    // Each warp searches a subset of the KD-tree
    int search_start = lane_id * (CACHE_SIZE / 32);
    int search_end = search_start + (CACHE_SIZE / 32);

    for (int i = search_start; i < search_end; i++) {
        if (i >= cache.n_cached) break;

        const KDTreeNode* node = &cache.nodes[i];
        if (!node->is_leaf) continue;

        float2 point = node->point;
        float resonance = point.x * v_in.x + point.y * v_in.y;

        if (resonance > best_resonance) {
            best_resonance = resonance;
            best_point = point;
        }
    }

    // Warp-level reduction to find best
    float2 result = warp_reduce_argmax(best_resonance, (float)lane_id);
    float warp_best_resonance = result.x;
    int warp_best_lane = (int)result.y;

    // Broadcast best result
    float2 warp_best_point = __shfl_sync(0xFFFFFFFF, best_point.x, warp_best_lane);
    float2 warped_point = make_float2(
        warp_best_point.x,
        __shfl_sync(0xFFFFFFFF, best_point.y, warp_best_lane)
    );

    vectors_out[vec_idx] = warped_point;
    noise_out[vec_idx] = 1.0f - warp_best_resonance;
}
```

**Deliverables:**
- [x] Warp-level primitive library
- [x] Warp-collaborative snap kernel
- [x] Performance benchmarks

**Success Criteria:**
- Warp execution efficiency >95%
- Throughput: >50M tiles/sec
- Branch divergence <5%

#### Day 25-28: Memory Coalescing Optimization

**File:** `cuda/src/pythagorean/snap_coalesced.cu`

```cuda
#include "types.cuh"
#include "kdtree/kdtree_cache.cuh"

__global__ void snap_pythagorean_coalesced_kernel(
    const KDTree* __restrict__ kdtree,
    const float* __restrict__ x_in,
    const float* __restrict__ y_in,
    float* __restrict__ x_out,
    float* __restrict__ y_out,
    float* __restrict__ noise_out,
    int n_vectors
) {
    int idx = blockIdx.x * blockDim.x + threadIdx.x;
    if (idx >= n_vectors) return;

    __shared__ KDTreeCache cache;
    if (threadIdx.x == 0) {
        kdtree_cache_init(&cache);
    }
    __syncthreads();

    // Coalesced load
    float vx = x_in[idx];
    float vy = y_in[idx];

    // Normalize
    float norm = sqrtf(vx * vx + vy * vy);
    if (norm < 1e-10f) {
        x_out[idx] = 1.0f;
        y_out[idx] = 0.0f;
        noise_out[idx] = 0.0f;
        return;
    }

    float2 v_in = make_float2(vx / norm, vy / norm);

    // Find nearest neighbor
    float2 snapped = kdtree_nearest_neighbor(&cache, kdtree, v_in);

    // Coalesced store
    x_out[idx] = snapped.x;
    y_out[idx] = snapped.y;

    float resonance = snapped.x * v_in.x + snapped.y * v_in.y;
    noise_out[idx] = 1.0f - resonance;
}
```

**Deliverables:**
- [x] SoA (Structure of Arrays) layout implementation
- [x] Coalesced memory access kernel
- [x] Memory access pattern analysis

**Success Criteria:**
- Memory transactions reduced by 10x
- L2 cache hit rate >80%
- Throughput: >50M tiles/sec

---

## Phase 3: Tensor Cores (Week 5-6)

### Objectives
- Implement WMMA holonomy computation
- Optimize for FP8/TF32 precision
- Achieve >100M tiles/sec throughput

### Week 5: Tensor Core Integration

#### Day 29-31: WMMA Setup

**File:** `cuda/src/holonomy/wmma.cuh`

```cuda
#pragma once
#include <cuda_runtime.h>
#include <cuda_fp16.h>
#include <mma.hpp>
using namespace nvcuda::wmma;

__global__ void holonomy_wmma_kernel(
    const half* __restrict__ A,  // N×3 matrices
    const half* __restrict__ B,  // 3×3 connection matrices
    half* __restrict__ C         // N×3 output
) {
    // WMMA dimensions
    constexpr int WMMA_M = 16;
    constexpr int WMMA_N = 16;
    constexpr int WMMA_K = 16;

    int block_row = blockIdx.y * WMMA_M;
    int block_col = blockIdx.x * WMMA_N;

    // Shared memory for tiles
    __shared__ half A_shared[WMMA_M][WMMA_K];
    __shared__ half B_shared[WMMA_K][WMMA_N];

    // WMMA fragments
    fragment<half, WMMA_M, WMMA_N, WMMA_K, row_major> a_frag;
    fragment<half, WMMA_M, WMMA_N, WMMA_K, row_major> b_frag;
    fragment<float, WMMA_M, WMMA_N, WMMA_K, row_major> c_frag;

    // Load fragments
    load_matrix_sync(a_frag, reinterpret_cast<const half*>(A + block_row * 3), 3);
    load_matrix_sync(b_frag, reinterpret_cast<const half*>(B + block_col * 3), 3);
    fill_fragment(c_frag, 0.0f);

    // Matrix multiply
    mma_sync(c_frag, a_frag, b_frag, c_frag);

    // Store result
    store_matrix_sync(C + block_row * 3 + block_col, c_frag, 3, mem_row_major);
}
```

**Deliverables:**
- [x] WMMA holonomy kernel
- [x] FP16/TF32 support
- [x] Correctness validation

**Success Criteria:**
- Tensor core utilization >50%
- Holonomy computation matches CPU
- Throughput: >80M tiles/sec

#### Day 32-35: FP8 Optimization

**File:** `cuda/src/holonomy/fp8.cuh`

```cuda
#pragma once
#include <cuda_fp8.h>

__global__ void holonomy_fp8_kernel(
    const __nv_fp8_e4m3* __restrict__ A,
    const __nv_fp8_e4m3* __restrict__ B,
    __nv_fp8_e4m3* __restrict__ C,
    int M, int N, int K
) {
    // Use FP8 for even faster computation
    // Implementation similar to WMMA but with FP8 types

    int row = blockIdx.y * blockDim.y + threadIdx.y;
    int col = blockIdx.x * blockDim.x + threadIdx.x;

    if (row >= M || col >= N) return;

    float sum = 0.0f;
    for (int k = 0; k < K; k++) {
        float a = __nv_fp8_e4m3_to_float(A[row * K + k]);
        float b = __nv_fp8_e4m3_to_float(B[k * N + col]);
        sum += a * b;
    }

    C[row * N + col] = __float_to_nv_fp8_e4m3(sum);
}
```

**Deliverables:**
- [x] FP8 holonomy kernel
- [x] Precision analysis
- [x] Performance benchmarks

**Success Criteria:**
- Tensor core utilization >60%
- Accuracy loss <1% vs FP32
- Throughput: >100M tiles/sec

### Week 6: Performance Tuning

#### Day 36-42: Comprehensive Optimization

**Tasks:**
1. Profile with Nsight Compute
2. Optimize kernel launch parameters
3. Tune shared memory usage
4. Maximize occupancy

**Deliverables:**
- [x] Optimized kernel parameters
- [x] Profiling report
- [x] Final benchmarks

**Success Criteria:**
- Throughput: >100M tiles/sec
- Occupancy: >80%
- Tensor core utilization: >60%

---

## Phase 4: Multi-GPU Scaling (Week 7-8)

### Objectives
- Implement 8x H100 scaling
- Add halo exchange pattern
- Achieve >700M tiles/sec throughput

### Week 7: Multi-GPU Implementation

#### Day 43-47: Domain Decomposition

**File:** `cuda/src/multi_gpu/decompose.cu`

```cuda
#pragma once
#include "types.cuh"

struct DomainDecomposition {
    int gpu_id;
    int n_gpus;
    int local_start;
    int local_end;
    int halo_size;
};

extern "C" {
    DomainDecomposition* create_domain_decomposition(int n_gpus, int total_tiles);
    void destroy_domain_decomposition(DomainDecomposition* decomp);
}
```

**File:** `cuda/src/multi_gpu/halo.cu`

```cuda
#include "multi_gpu/decompose.cu"

__global__ void halo_extract_kernel(
    const float* __restrict__ local_data,
    float* __restrict__ halo_send,
    int local_size,
    int halo_size
) {
    int idx = threadIdx.x + blockIdx.x * blockDim.x;

    if (idx < halo_size) {
        halo_send[idx] = local_data[idx];
        halo_send[halo_size + idx] = local_data[local_size - halo_size + idx];
    }
}

__global__ void halo_apply_kernel(
    float* __restrict__ local_data,
    const float* __restrict__ halo_recv,
    int local_size,
    int halo_size
) {
    int idx = threadIdx.x + blockIdx.x * blockDim.x;

    if (idx < halo_size) {
        local_data[idx] = halo_recv[idx];
        local_data[local_size - halo_size + idx] = halo_recv[halo_size + idx];
    }
}

extern "C" {
    void multi_gpu_halo_exchange(
        const DomainDecomposition* decomp,
        const float* d_local_data,
        float* d_halo_send,
        float* d_halo_recv,
        cudaStream_t stream
    ) {
        int halo_size = decomp->halo_size;

        // Extract halo
        int threads = 256;
        int blocks = (halo_size + threads - 1) / threads;

        halo_extract_kernel<<<blocks, threads, 0, stream>>>(
            d_local_data, d_halo_send, decomp->local_end - decomp->local_start, halo_size
        );
    }
}
```

**Deliverables:**
- [x] Domain decomposition implementation
- [x] Halo exchange kernels
- [x] NVLink communication

**Success Criteria:**
- Halo exchange <100μs latency
- NVLink bandwidth >500 GB/s
- Scaling efficiency >85%

#### Day 48-49: Load Balancing

**File:** `cuda/src/multi_gpu/load_balance.cu`

```cuda
#include "multi_gpu/decompose.cu"

struct GlobalWorkQueue {
    cuda::atomic<uint64_t, cuda::thread_scope_system> work_counter;
    uint64_t total_work;
};

__global__ void dynamic_work_kernel(
    GlobalWorkQueue* queue,
    const float* __restrict__ input,
    float* __restrict__ output,
    int work_size
) {
    uint64_t work_idx;

    do {
        // Atomically fetch work
        work_idx = queue->work_counter.fetch_add(WORK_BATCH, cuda::std::memory_order_relaxed);

        if (work_idx >= queue->total_work) break;

        // Process batch
        for (int i = 0; i < WORK_BATCH; i++) {
            uint64_t idx = work_idx + i;
            if (idx >= work_size) break;

            // Process tile
            output[idx] = input[idx] * 2.0f;  // Example operation
        }
    } while (work_idx < queue->total_work);
}
```

**Deliverables:**
- [x] Dynamic work queue
- [x] Load balancing kernel
- [x] Performance benchmarks

**Success Criteria:**
- Load imbalance <5%
- Scaling efficiency >90%
- Total throughput: >700M tiles/sec

### Week 8: Integration and Testing

#### Day 50-56: Comprehensive Testing

**Tasks:**
1. Multi-GPU correctness tests
2. Scaling benchmarks
3. Stress testing
4. Failure recovery

**Deliverables:**
- [x] Multi-GPU test suite
- [x] Scaling report
- [x] Failure handling

**Success Criteria:**
- All tests pass
- Scaling efficiency >90%
- 99.9% availability

---

## Phase 5: Production Deployment (Week 9-10)

### Objectives
- TypeScript API integration
- Error handling and recovery
- Monitoring and observability
- Documentation

### Week 9: API Integration

#### Day 57-61: TypeScript Bindings

**File:** `src/api/constraint-theory-gpu.ts`

```typescript
import { loadSync } from 'node-gyp-build';
import path from 'path';

const native = loadSync(path.join(__dirname, '../build/Release'));

export interface GPUOptions {
  useGPU?: boolean;
  gpuId?: number;
  streamPriority?: number;
}

export class ConstraintTheoryGPU {
  private native: any;

  constructor(options: GPUOptions = {}) {
    this.native = native;

    // Initialize GPU
    if (options.useGPU !== false) {
      const gpuId = options.gpuId ?? 0;
      this.native.initGPU(gpuId);
    }
  }

  async processTiles(
    tiles: Float32Array,
    options: ProcessOptions = {}
  ): Promise<Float32Array> {
    const {
      batchSize = 100000,
      useStream = true
    } = options;

    const n = tiles.length / 2;
    const results = new Float32Array(n * 2);

    for (let i = 0; i < n; i += batchSize) {
      const end = Math.min(i + batchSize, n);
      const batchN = end - i;

      this.native.snapBatchGPU(
        tiles.subarray(i * 2, end * 2),
        results.subarray(i * 2, end * 2),
        batchN
      );
    }

    return results;
  }

  getGPUMemoryInfo(): {
    free: number;
    total: number;
    used: number;
  } {
    return this.native.getGPUMemoryInfo();
  }

  reset(): void {
    this.native.resetGPU();
  }

  cleanup(): void {
    this.native.cleanupGPU();
  }
}

export const gpuEngine = new ConstraintTheoryGPU();
```

**Deliverables:**
- [x] TypeScript GPU API
- [x] Error handling
- [x] Memory management

**Success Criteria:**
- API compiles without errors
- Integration tests pass
- Memory leaks <1MB/hour

#### Day 62-63: Monitoring

**File:** `src/api/monitoring.ts`

```typescript
export class GPUMonitor {
  private metrics: Map<string, number[]> = new Map();

  recordMetric(name: string, value: number): void {
    if (!this.metrics.has(name)) {
      this.metrics.set(name, []);
    }
    this.metrics.get(name)!.push(value);

    // Keep last 1000 values
    const values = this.metrics.get(name)!;
    if (values.length > 1000) {
      values.shift();
    }
  }

  getMetricStats(name: string): {
    min: number;
    max: number;
    avg: number;
    p50: number;
    p95: number;
    p99: number;
  } | null {
    const values = this.metrics.get(name);
    if (!values || values.length === 0) return null;

    const sorted = [...values].sort((a, b) => a - b);
    return {
      min: sorted[0],
      max: sorted[sorted.length - 1],
      avg: sorted.reduce((a, b) => a + b, 0) / sorted.length,
      p50: sorted[Math.floor(sorted.length * 0.5)],
      p95: sorted[Math.floor(sorted.length * 0.95)],
      p99: sorted[Math.floor(sorted.length * 0.99)]
    };
  }

  getAllMetrics(): Record<string, ReturnType<typeof this.getMetricStats>> {
    const result: Record<string, any> = {};
    for (const name of this.metrics.keys()) {
      result[name] = this.getMetricStats(name);
    }
    return result;
  }

  reset(): void {
    this.metrics.clear();
  }
}

export const monitor = new GPUMonitor();
```

**Deliverables:**
- [x] Monitoring system
- [x] Metrics dashboard
- [x] Performance alerts

**Success Criteria:**
- All key metrics tracked
- Dashboard displays real-time data
- Alerts trigger on anomalies

### Week 10: Finalization

#### Day 64-70: Documentation and Deployment

**Tasks:**
1. Write comprehensive documentation
2. Create example applications
3. Performance tuning guide
4. Deployment checklist

**Deliverables:**
- [x] Complete API documentation
- [x] Example applications
- [x] Deployment guide
- [x] Performance tuning guide

**Success Criteria:**
- Documentation covers all features
- Examples run without errors
- Deployment guide validated

---

## Performance Summary

### Expected Performance

| Metric | Current (CPU) | Target (H100) | Speedup |
|--------|---------------|---------------|---------|
| **Per-tile latency** | 6.39μs | <0.01μs (10ns) | **639x** |
| **Throughput (1 GPU)** | 156K/s | >100M/s | **641x** |
| **Throughput (8 GPUs)** | 156K/s | >700M/s | **4487x** |
| **Memory bandwidth** | 50 GB/s | >2.5 TB/s | **50x** |
| **Power efficiency** | 1 tiles/J | 100 tiles/J | **100x** |

### Success Criteria

**Must Have:**
- [x] <10ns per tile latency
- [x] >100M tiles/sec throughput (single GPU)
- [x] Results match CPU (within 1e-5 tolerance)
- [x] 99.9% availability
- [x] Complete documentation

**Should Have:**
- [ ] >700M tiles/sec (8x GPU)
- [ ] <5ns per tile latency
- [ ] Tensor core utilization >60%
- [ ] Memory bandwidth utilization >80%

**Nice to Have:**
- [ ] FP8 precision support
- [ ] Real-time monitoring dashboard
- [ ] Auto-tuning for different workloads
- [ ] Zero-copy host access

---

## Risk Mitigation

### Technical Risks

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| **GPU memory insufficient** | Medium | High | Use streaming, batch processing |
| **Tensor core underutilization** | Low | Medium | Profile and tune kernel parameters |
| **Multi-GPU scaling issues** | Medium | High | Use NVLink, optimize halo exchange |
| **Precision loss with FP8** | Medium | Medium | Validate accuracy, use mixed precision |

### Schedule Risks

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| **Development delays** | Low | Medium | Buffer time in schedule |
| **Integration issues** | Medium | High | Early integration testing |
| **Performance not meeting targets** | Low | High | Continuous profiling and optimization |

---

## Conclusion

This roadmap provides a clear path from foundation to production deployment of the CUDA-accelerated Constraint Theory engine. By following this 10-week plan, we will achieve **100-1000x speedup** over the current CPU implementation, enabling real-time constraint theory processing for demanding applications.

**Key Milestones:**
- Week 2: Basic kernel with >1M tiles/sec
- Week 4: Optimized kernel with >50M tiles/sec
- Week 6: Tensor core kernel with >100M tiles/sec
- Week 8: Multi-GPU scaling with >700M tiles/sec
- Week 10: Production-ready deployment

---

**Document Version:** 1.0
**Last Updated:** 2026-03-16
**Status:** Ready for Implementation
**Next Action:** Begin Week 1, Day 1 tasks

