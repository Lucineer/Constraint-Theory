# CUDA Quick Reference - Constraint Theory Engine

**Repository:** https://github.com/SuperInstance/Constraint-Theory
**Last Updated:** 2026-03-16

---

## Quick Start

### Environment Setup

```bash
# Install CUDA 12.6
wget https://developer.download.nvidia.com/compute/cuda/12.6.0/local_installers/cuda_12.6.0_560.28.03_linux.run
sudo sh cuda_12.6.0_560.28.03_linux.run

# Verify installation
nvcc --version
nvidia-smi

# Build project
cd constrainttheory/cuda
mkdir build && cd build
cmake ..
make -j$(nproc)

# Run tests
./tests/test_snap
./benchmarks/baseline
```

### Basic Usage

```cpp
#include "types.cuh"
#include "pythagorean/snap.cu"

// Create database
PythagoreanDatabase h_db;
h_db.n_triples = 40000;
cudaMalloc(&h_db.triples, h_db.n_triples * sizeof(float2));
cudaMemcpy(h_db.triples, h_triples, h_db.n_triples * sizeof(float2),
           cudaMemcpyHostToDevice);

// Allocate memory
float2 *d_vectors_in, *d_vectors_out;
float *d_noise_out;
cudaMalloc(&d_vectors_in, N * sizeof(float2));
cudaMalloc(&d_vectors_out, N * sizeof(float2));
cudaMalloc(&d_noise_out, N * sizeof(float));

// Launch kernel
snap_pythagorean_gpu(&h_db, d_vectors_in, d_vectors_out, d_noise_out, N, 0);

// Copy results
cudaMemcpy(h_vectors_out, d_vectors_out, N * sizeof(float2),
           cudaMemcpyDeviceToHost);
```

---

## Kernel Optimization Checklist

### Memory Coalescing

- [x] Use Structure of Arrays (SoA) layout
- [x] Ensure contiguous memory access
- [x] Align data to 128-byte boundaries
- [x] Use `__restrict__` pointers
- [x] Prefer `float2`/`float4` for small vectors

### Shared Memory

- [x] Cache hot data in shared memory
- [x] Use shared memory for KD-tree
- [x] Pad arrays to avoid bank conflicts
- [x] Use `__shared__` for frequently accessed data
- [x] Target >90% shared memory utilization

### Warp-Level Primitives

- [x] Use `__shfl_sync` for data exchange
- [x] Implement warp-level reductions
- [x] Use warp-aggregated atomics
- [x] Target >95% warp execution efficiency
- [x] Minimize branch divergence

### Tensor Cores

- [x] Use WMMA API for matrix ops
- [x] Target >60% tensor core utilization
- [x] Use FP16/TF32 for better performance
- [x] Validate precision requirements
- [x] Profile with Nsight Compute

---

## Performance Targets

| Phase | Throughput | Latency | Utilization |
|-------|-----------|---------|-------------|
| **Week 2** | >1M/s | <1μs | >20% |
| **Week 4** | >50M/s | <100ns | >80% |
| **Week 6** | >100M/s | <10ns | >90% |
| **Week 8** | >700M/s | <5ns | >90% |

---

## Common Issues

### Memory Leaks

```bash
# Check for memory leaks
cuda-memcheck --leak-check full ./tests/test_snap
```

### Kernel Errors

```bash
# Enable error checking
cudaGetLastError();
cudaDeviceSynchronize();

# Check for race conditions
cuda-memcheck --racecheck check ./tests/test_snap
```

### Performance Issues

```bash
# Profile with Nsight Compute
ncu --set full --export report ./benchmarks/baseline

# Key metrics to check:
# - dram__throughput.avg.pct_of_peak
# - lts__t_sector_hit_rate.pct
# - sm__pipe_tensor_cycles_active.avg.pct
```

---

## Code Snippets

### Warp Reduction

```cuda
__device__ float warp_reduce_sum(float val) {
    for (int offset = 16; offset > 0; offset /= 2) {
        val += __shfl_down_sync(0xFFFFFFFF, val, offset);
    }
    return val;
}
```

### Shared Memory Initialization

```cuda
__shared__ KDTreeCache cache;
if (threadIdx.x == 0) {
    kdtree_cache_init(&cache);
}
__syncthreads();
```

### Coalesced Load/Store

```cuda
// Load
float vx = x_in[idx];
float vy = y_in[idx];

// Store
x_out[idx] = result.x;
y_out[idx] = result.y;
```

### Atomic Add

```cuda
atomicAdd(&counter, 1);
```

---

## Profiling Commands

```bash
# Basic profiling
nvprof ./benchmarks/baseline

# Nsight Compute
ncu --set full --export report ./benchmarks/baseline

# Nsight Systems
nsys profile --stats=true ./benchmarks/baseline

# Memory check
cuda-memcheck ./tests/test_snap
```

---

## Optimization Tips

1. **Maximize occupancy:** Use 256-1024 threads per block
2. **Minimize global memory:** Use shared memory cache
3. **Use warp-level primitives:** Faster than global atomics
4. **Overlap computation and memory:** Use CUDA streams
5. **Profile first:** Optimize bottlenecks, not everything

---

## Performance Metrics

### Good Performance

- Memory bandwidth: >2 TB/s
- L2 cache hit rate: >80%
- Warp execution efficiency: >95%
- Tensor core utilization: >60%
- Occupancy: >80%

### Needs Optimization

- Memory bandwidth: <1 TB/s
- L2 cache hit rate: <50%
- Warp execution efficiency: <80%
- Tensor core utilization: <30%
- Occupancy: <50%

---

## Debugging

### Print from Kernel

```cuda
printf("Tile %d: snapped to (%.2f, %.2f)\n", idx, result.x, result.y);
```

### Error Checking

```cpp
#define CUDA_CHECK(call) \
    do { \
        cudaError_t err = call; \
        if (err != cudaSuccess) { \
            fprintf(stderr, "CUDA error at %s:%d: %s\n", \
                    __FILE__, __LINE__, cudaGetErrorString(err)); \
            exit(1); \
        } \
    } while (0)

CUDA_CHECK(cudaMalloc(&ptr, size));
```

---

## Resources

- **CUDA Programming Guide:** https://docs.nvidia.com/cuda/cuda-c-programming-guide
- **CUDA Best Practices:** https://docs.nvidia.com/cuda/cuda-c-best-practices-guide
- **Nsight Compute:** https://developer.nvidia.com/nsight-compute
- **WMMA API:** https://docs.nvidia.com/cuda/cuda-c-programming-guide/index.html#wmma

---

## Contact

For questions or issues, please refer to:
- `CUDA_ARCHITECTURE.md` - Detailed architecture
- `CUDA_IMPLEMENTATION_ROADMAP.md` - Implementation plan
- GitHub Issues: https://github.com/SuperInstance/Constraint-Theory/issues

