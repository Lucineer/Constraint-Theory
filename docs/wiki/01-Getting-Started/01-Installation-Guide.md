# Installation Guide

**Constraint Theory Installation Guide**
**Version:** 1.0.0
**Last Updated:** 2026-03-16

---

## Overview

This guide will help you install the Constraint Theory geometric computation engine on your system. Constraint Theory is available for multiple platforms and can be installed using various methods depending on your needs.

---

## Table of Contents

1. [System Requirements](#system-requirements)
2. [Installation Methods](#installation-methods)
3. [Method 1: Cargo Install](#method-1-cargo-install)
4. [Method 2: Build from Source](#method-2-build-from-source)
5. [Method 3: Pre-built Binaries](#method-3-pre-built-binaries)
6. [Method 4: Docker](#method-4-docker)
7. [Verification](#verification)
8. [Troubleshooting](#troubleshooting)
9. [Next Steps](#next-steps)

---

## System Requirements

### Minimum Requirements

| Component | Minimum | Recommended |
|-----------|---------|-------------|
| **Operating System** | Windows 10+, Linux (kernel 3.2+), macOS 10.15+ | Latest stable release |
| **CPU** | x86_64 or ARM64 | x86_64 with AVX2, ARM64 with NEON |
| **Memory** | 2 GB RAM | 4 GB RAM or more |
| **Disk Space** | 100 MB | 500 MB or more |
| **Rust** | 1.70.0 | 1.75.0 or later |

### Supported Platforms

- **Linux:** Ubuntu 20.04+, Debian 11+, Fedora 35+, Arch Linux
- **macOS:** Big Sur (11.0)+, Monterey (12.0+), Ventura (13.0+)
- **Windows:** Windows 10+, Windows 11
- **ARM:** Raspberry Pi 4+, Apple Silicon (M1/M2/M3)

### Optional Requirements

For GPU acceleration:
- **NVIDIA GPU:** CUDA 11.0+ compatible
- **AMD GPU:** ROCm 4.0+ compatible
- **Intel GPU:** OneAPI 2023.01+ compatible

---

## Installation Methods

Choose the installation method that best fits your needs:

| Method | Difficulty | Flexibility | Performance | Use Case |
|--------|-----------|-------------|-------------|----------|
| **Cargo Install** | Easy | High | Optimized | General use, Rust developers |
| **Build from Source** | Medium | Maximum | Maximum | Custom builds, developers |
| **Pre-built Binaries** | Easy | Low | Optimized | Quick start, production |
| **Docker** | Easy | Medium | Good | Isolated environments, CI/CD |

---

## Method 1: Cargo Install

### Prerequisites

Install Rust toolchain:

```bash
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
source $HOME/.cargo/env
```

### Installation Steps

1. **Install the core library:**

```bash
cargo install constraint-theory-core
```

2. **Install optional GPU acceleration:**

```bash
cargo install constraint-theory-cuda --features cuda
```

3. **Verify installation:**

```bash
constraint-theory --version
```

### Cargo Features

Install with specific features:

```bash
# Basic installation
cargo install constraint-theory-core

# With SIMD optimizations (default)
cargo install constraint-theory-core --features simd

# With GPU support
cargo install constraint-theory-core --features cuda

# With all features
cargo install constraint-theory-core --features "simd cuda opencl"
```

### Updating

```bash
cargo install constraint-theory-core --force
```

---

## Method 2: Build from Source

### Prerequisites

1. **Install Rust:**

```bash
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
```

2. **Install system dependencies:**

**Ubuntu/Debian:**

```bash
sudo apt-get update
sudo apt-get install -y \
    build-essential \
    pkg-config \
    libssl-dev \
    clang \
    cmake
```

**macOS:**

```bash
brew install rust cmake pkg-config
```

**Windows:**

```powershell
# Install Visual Studio Build Tools
winget install Microsoft.VisualStudio.2022.BuildTools
```

### Build Steps

1. **Clone the repository:**

```bash
git clone https://github.com/SuperInstance/Constraint-Theory.git
cd Constraint-Theory
```

2. **Build the core library:**

```bash
cd crates/constraint-theory-core
cargo build --release
```

3. **Build with GPU support (optional):**

```bash
cd ../gpu-simulation
cargo build --release --features cuda
```

4. **Run tests:**

```bash
cd ../constraint-theory-core
cargo test --release
```

5. **Install locally:**

```bash
cargo install --path .
```

### Build Options

```bash
# Debug build (faster compilation, slower execution)
cargo build

# Release build (optimized)
cargo build --release

# With specific features
cargo build --release --features "simd cuda"

# For target platform
cargo build --release --target x86_64-unknown-linux-gnu
```

### Build Output

The compiled binaries will be in:
- **Debug:** `target/debug/`
- **Release:** `target/release/`

---

## Method 3: Pre-built Binaries

### Download

1. **Visit the releases page:**

```
https://github.com/SuperInstance/Constraint-Theory/releases
```

2. **Download the appropriate binary for your platform:**

| Platform | Binary |
|----------|--------|
| Linux x86_64 | `constraint-theory-linux-x86_64.tar.gz` |
| Linux ARM64 | `constraint-theory-linux-arm64.tar.gz` |
| macOS x86_64 | `constraint-theory-darwin-x86_64.tar.gz` |
| macOS ARM64 | `constraint-theory-darwin-arm64.tar.gz` |
| Windows x86_64 | `constraint-theory-windows-x86_64.zip` |

### Installation

**Linux/macOS:**

```bash
# Extract
tar -xzf constraint-theory-linux-x86_64.tar.gz

# Move to PATH
sudo mv constraint-theory /usr/local/bin/

# Verify
constraint-theory --version
```

**Windows:**

```powershell
# Extract
Expand-Archive constraint-theory-windows-x86_64.zip

# Add to PATH (PowerShell)
$env:PATH += ";C:\path\to\constraint-theory"

# Verify
constraint-theory --version
```

### System Integration

**Linux systemd Service:**

```bash
sudo cp constraint-theory.service /etc/systemd/system/
sudo systemctl enable constraint-theory
sudo systemctl start constraint-theory
```

**macOS LaunchAgent:**

```bash
cp com.constrainttheory.agent.plist ~/Library/LaunchAgents/
launchctl load ~/Library/LaunchAgents/com.constrainttheory.agent.plist
```

**Windows Service:**

```powershell
# Install as service
constraint-theory --install-service

# Start service
Start-Service constraint-theory
```

---

## Method 4: Docker

### Docker Image

1. **Pull the official image:**

```bash
docker pull ghcr.io/superinstance/constraint-theory:latest
```

2. **Run the container:**

```bash
docker run -it --rm constraint-theory --version
```

### Dockerfile

**Basic Dockerfile:**

```dockerfile
FROM rust:1.75 as builder
WORKDIR /app
COPY . .
RUN cargo build --release

FROM debian:bookworm-slim
RUN apt-get update && apt-get install -y \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*
COPY --from=builder /app/target/release/constraint-theory /usr/local/bin/
ENTRYPOINT ["constraint-theory"]
```

**Build and run:**

```bash
docker build -t constraint-theory .
docker run -it constraint-theory
```

### Docker Compose

**docker-compose.yml:**

```yaml
version: '3.8'
services:
  constraint-theory:
    image: ghcr.io/superinstance/constraint-theory:latest
    ports:
      - "8080:8080"
    environment:
      - RUST_LOG=info
    volumes:
      - ./data:/app/data
```

**Run with compose:**

```bash
docker-compose up -d
```

### GPU Support with Docker

**NVIDIA Docker:**

```bash
docker run --gpus all -it constraint-theory-cuda
```

**AMD Docker:**

```bash
docker run --device=/dev/kfd -it constraint-theory-rocm
```

---

## Verification

After installation, verify that everything is working correctly:

### Basic Verification

```bash
# Check version
constraint-theory --version

# Run basic test
constraint-theory test

# Check system info
constraint-theory system-info
```

### Performance Test

```bash
# Run performance benchmark
constraint-theory benchmark

# Expected output:
# Single-threaded: ~13.5M ops/sec
# SIMD (AVX2): ~15M ops/sec
# GPU (CUDA): ~100M+ ops/sec (if available)
```

### Full Test Suite

```bash
# Run all tests
cargo test --all-features

# Run with output
cargo test --all-features -- --nocapture

# Run specific test
cargo test test_snap_accuracy
```

---

## Troubleshooting

### Common Issues

#### 1. Rust Not Found

**Problem:** `rustc: command not found`

**Solution:**
```bash
# Install Rust
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
source $HOME/.cargo/env
```

#### 2. SSL Certificate Error

**Problem:** Failed to fetch dependencies

**Solution:**

**Ubuntu/Debian:**
```bash
sudo apt-get install libssl-dev pkg-config
```

**macOS:**
```bash
brew install openssl pkg-config
export OPENSSL_DIR=$(brew --prefix openssl)
```

#### 3. GPU Not Detected

**Problem:** GPU acceleration not available

**Solution:**

**NVIDIA:**
```bash
# Check CUDA installation
nvcc --version
nvidia-smi

# Install CUDA if missing
# Ubuntu
sudo apt-get install nvidia-cuda-toolkit
```

**AMD:**
```bash
# Check ROCm installation
rocminfo
```

#### 4. Permission Denied

**Problem:** Permission denied when installing

**Solution:**

**Linux/macOS:**
```bash
# Use sudo (not recommended for cargo install)
sudo cargo install constraint-theory-core

# Or fix permissions
sudo chown -R $USER:$(id -gn $USER) ~/.cargo
```

#### 5. Compilation Errors

**Problem:** Build fails with errors

**Solution:**

```bash
# Clean and rebuild
cargo clean
cargo build --release

# Update dependencies
cargo update

# Check Rust version
rustc --version  # Should be 1.70.0 or later
```

### Platform-Specific Issues

#### Windows

**Problem:** MSVC not found

**Solution:**
```powershell
# Install Visual Studio Build Tools
winget install Microsoft.VisualStudio.2022.BuildTools
```

#### macOS

**Problem:** Xcode command line tools not found

**Solution:**
```bash
xcode-select --install
```

#### Linux

**Problem:** Missing system libraries

**Solution:**

**Ubuntu/Debian:**
```bash
sudo apt-get install build-essential pkg-config libssl-dev
```

**Fedora:**
```bash
sudo dnf install gcc pkg-config openssl-devel
```

**Arch:**
```bash
sudo pacman -S base-devel pkg-config openssl
```

---

## Next Steps

After successful installation:

1. **Quick Start:** Read the [Quick Start Tutorial](02-Quick-Start-Tutorial.md)
2. **First Steps:** Follow the [First Steps Walkthrough](03-First-Steps-Walkthrough.md)
3. **Learn Concepts:** Study [Basic Concepts](04-Basic-Concepts.md)
4. **Try Examples:** Run the [Hello World Example](05-Hello-World-Example.md)
5. **API Reference:** Consult the [API Reference](../04-API-Reference/)

---

## Getting Help

If you encounter issues during installation:

1. **Check the documentation:** [https://superinstance.github.io/Constraint-Theory](https://superinstance.github.io/Constraint-Theory)
2. **Search issues:** [GitHub Issues](https://github.com/SuperInstance/Constraint-Theory/issues)
3. **Ask the community:** [Discord Server](https://discord.gg/constraint-theory)
4. **Open an issue:** [File a bug report](https://github.com/SuperInstance/Constraint-Theory/issues/new)

---

## Additional Resources

- [Quick Start Tutorial](02-Quick-Start-Tutorial.md)
- [API Reference](../04-API-Reference/)
- [Development Guide](../08-Development/)
- [Deployment Guide](../10-Deployment/)
- [Troubleshooting FAQ](../04-API-Reference/18-Troubleshooting.md)

---

**Installation Guide Version:** 1.0.0
**Last Updated:** 2026-03-16
**Maintained By:** Constraint Theory Documentation Team
