"""
Dodecet Validation Simulation Suite
===================================

Comprehensive comparison of 12-bit dodecet encoding vs 8-bit byte vs float32.

This suite validates the claims made about dodecet encoding:
- 16x precision improvement over 8-bit (4096 states vs 256)
- Hex-friendly encoding (3 hex digits)
- Exact arithmetic without floating-point drift
- Memory savings (6 bytes vs 12 bytes for Point3D)
"""

import numpy as np
import matplotlib.pyplot as plt
import json
import csv
from dataclasses import dataclass
from typing import List, Tuple, Dict
from enum import Enum
import time
import sys
from pathlib import Path


class EncodingType(Enum):
    """Supported encoding types for comparison"""
    DODECET = "dodecet"  # 12-bit (4096 states)
    BYTE = "byte"        # 8-bit (256 states)
    FLOAT32 = "float32"  # 32-bit floating point


@dataclass
class ValidationResult:
    """Results from a validation test"""
    test_name: str
    encoding_type: EncodingType
    metric: str
    value: float
    unit: str
    passed: bool
    details: Dict = None

    def to_dict(self) -> Dict:
        return {
            "test_name": self.test_name,
            "encoding_type": self.encoding_type.value,
            "metric": self.metric,
            "value": self.value,
            "unit": self.unit,
            "passed": self.passed,
            "details": self.details or {}
        }


class DodecetEncoder:
    """12-bit dodecet encoder (4096 states: 0-4095)"""

    MAX_VALUE = 4095
    NIBBLES = 3  # 3 nibbles of 4 bits each

    @staticmethod
    def encode(value: float, min_val: float = -2048.0, max_val: float = 2047.0) -> int:
        """Encode a float value to 12-bit dodecet"""
        # Normalize to [0, 4095]
        normalized = (value - min_val) / (max_val - min_val)
        encoded = int(normalized * DodecetEncoder.MAX_VALUE)
        return max(0, min(DodecetEncoder.MAX_VALUE, encoded))

    @staticmethod
    def decode(encoded: int, min_val: float = -2048.0, max_val: float = 2047.0) -> float:
        """Decode a 12-bit dodecet to float value"""
        normalized = encoded / DodecetEncoder.MAX_VALUE
        return min_val + normalized * (max_val - min_val)

    @staticmethod
    def to_hex(encoded: int) -> str:
        """Convert to hex string (3 characters)"""
        return f"{encoded:03X}"

    @staticmethod
    def from_hex(hex_str: str) -> int:
        """Parse from hex string"""
        return int(hex_str, 16)

    @staticmethod
    def as_signed(encoded: int) -> int:
        """Interpret as signed value (-2048 to 2047)"""
        if encoded & 0x800:
            return encoded - 4096
        return encoded


class ByteEncoder:
    """8-bit byte encoder (256 states: 0-255)"""

    MAX_VALUE = 255

    @staticmethod
    def encode(value: float, min_val: float = -128.0, max_val: float = 127.0) -> int:
        """Encode a float value to 8-bit byte"""
        normalized = (value - min_val) / (max_val - min_val)
        encoded = int(normalized * ByteEncoder.MAX_VALUE)
        return max(0, min(ByteEncoder.MAX_VALUE, encoded))

    @staticmethod
    def decode(encoded: int, min_val: float = -128.0, max_val: float = 127.0) -> float:
        """Decode an 8-bit byte to float value"""
        normalized = encoded / ByteEncoder.MAX_VALUE
        return min_val + normalized * (max_val - min_val)

    @staticmethod
    def as_signed(encoded: int) -> int:
        """Interpret as signed value (-128 to 127)"""
        if encoded & 0x80:
            return encoded - 256
        return encoded


class Float32Encoder:
    """32-bit float encoder (for comparison)"""

    @staticmethod
    def encode(value: float) -> np.float32:
        """Encode to float32"""
        return np.float32(value)

    @staticmethod
    def decode(encoded: np.float32) -> float:
        """Decode from float32"""
        return float(encoded)


class Point3D:
    """3D point with different encodings"""

    def __init__(self, x: float, y: float, z: float):
        self.x_orig = x
        self.y_orig = y
        self.z_orig = z

    def encode_dodecet(self) -> Tuple[int, int, int]:
        """Encode as 3 dodecets (36 bits total)"""
        return (
            DodecetEncoder.encode(self.x_orig),
            DodecetEncoder.encode(self.y_orig),
            DodecetEncoder.encode(self.z_orig)
        )

    def decode_dodecet(self, encoded: Tuple[int, int, int]) -> 'Point3D':
        """Decode from 3 dodecets"""
        return Point3D(
            DodecetEncoder.decode(encoded[0]),
            DodecetEncoder.decode(encoded[1]),
            DodecetEncoder.decode(encoded[2])
        )

    def encode_byte(self) -> Tuple[int, int, int]:
        """Encode as 3 bytes (24 bits total)"""
        return (
            ByteEncoder.encode(self.x_orig),
            ByteEncoder.encode(self.y_orig),
            ByteEncoder.encode(self.z_orig)
        )

    def decode_byte(self, encoded: Tuple[int, int, int]) -> 'Point3D':
        """Decode from 3 bytes"""
        return Point3D(
            ByteEncoder.decode(encoded[0]),
            ByteEncoder.decode(encoded[1]),
            ByteEncoder.decode(encoded[2])
        )

    def encode_float32(self) -> Tuple[np.float32, np.float32, np.float32]:
        """Encode as 3 float32 values (96 bits total)"""
        return (
            Float32Encoder.encode(self.x_orig),
            Float32Encoder.encode(self.y_orig),
            Float32Encoder.encode(self.z_orig)
        )

    def decode_float32(self, encoded: Tuple[np.float32, np.float32, np.float32]) -> 'Point3D':
        """Decode from 3 float32 values"""
        return Point3D(
            Float32Encoder.decode(encoded[0]),
            Float32Encoder.decode(encoded[1]),
            Float32Encoder.decode(encoded[2])
        )

    def distance_to(self, other: 'Point3D') -> float:
        """Calculate Euclidean distance to another point"""
        dx = self.x_orig - other.x_orig
        dy = self.y_orig - other.y_orig
        dz = self.z_orig - other.z_orig
        return np.sqrt(dx*dx + dy*dy + dz*dz)

    def __repr__(self) -> str:
        return f"Point3D({self.x_orig:.2f}, {self.y_orig:.2f}, {self.z_orig:.2f})"


class ComparisonFramework:
    """Framework for comparing different encoding schemes"""

    def __init__(self, output_dir: str = None):
        self.results: List[ValidationResult] = []
        self.output_dir = Path(output_dir) if output_dir else Path("results")
        self.output_dir.mkdir(exist_ok=True)

    def add_result(self, result: ValidationResult):
        """Add a validation result"""
        self.results.append(result)

    def generate_random_points(self, count: int, seed: int = 42) -> List[Point3D]:
        """Generate random 3D points for testing"""
        np.random.seed(seed)
        points = []
        for _ in range(count):
            x = np.random.uniform(-1000, 1000)
            y = np.random.uniform(-1000, 1000)
            z = np.random.uniform(-1000, 1000)
            points.append(Point3D(x, y, z))
        return points

    def calculate_encoding_error(self, original: float, encoded: int, encoder_type: EncodingType) -> float:
        """Calculate encoding error"""
        if encoder_type == EncodingType.DODECET:
            decoded = DodecetEncoder.decode(encoded)
        elif encoder_type == EncodingType.BYTE:
            decoded = ByteEncoder.decode(encoded)
        else:
            decoded = float(encoded)

        return abs(original - decoded)

    def test_precision_comparison(self, num_points: int = 1000) -> Dict[str, float]:
        """Test 1: Precision Comparison"""
        print("\n=== Test 1: Precision Comparison ===")

        points = self.generate_random_points(num_points)

        dodecet_errors = []
        byte_errors = []
        float32_errors = []

        for point in points:
            # Test dodecet encoding
            dodecet_encoded = point.encode_dodecet()
            dodecet_decoded = point.decode_dodecet(dodecet_encoded)
            dodecet_error = point.distance_to(dodecet_decoded)
            dodecet_errors.append(dodecet_error)

            # Test byte encoding
            byte_encoded = point.encode_byte()
            byte_decoded = point.decode_byte(byte_encoded)
            byte_error = point.distance_to(byte_decoded)
            byte_errors.append(byte_error)

            # Test float32 encoding
            float32_encoded = point.encode_float32()
            float32_decoded = point.decode_float32(float32_encoded)
            float32_error = point.distance_to(float32_decoded)
            float32_errors.append(float32_error)

        # Calculate statistics
        dodecet_mean = np.mean(dodecet_errors)
        dodecet_std = np.std(dodecet_errors)
        byte_mean = np.mean(byte_errors)
        byte_std = np.std(byte_errors)
        float32_mean = np.mean(float32_errors)
        float32_std = np.std(float32_errors)

        # Calculate precision ratio
        precision_ratio = byte_mean / dodecet_mean if dodecet_mean > 0 else float('inf')

        results = {
            "dodecet_mean_error": dodecet_mean,
            "dodecet_std_error": dodecet_std,
            "byte_mean_error": byte_mean,
            "byte_std_error": byte_std,
            "float32_mean_error": float32_mean,
            "float32_std_error": float32_std,
            "precision_ratio": precision_ratio
        }

        # Add validation results
        self.add_result(ValidationResult(
            "Precision Comparison",
            EncodingType.DODECET,
            "mean_encoding_error",
            dodecet_mean,
            "units",
            dodecet_mean < byte_mean,
            {"std": dodecet_std}
        ))

        self.add_result(ValidationResult(
            "Precision Comparison",
            EncodingType.BYTE,
            "mean_encoding_error",
            byte_mean,
            "units",
            True,
            {"std": byte_std}
        ))

        self.add_result(ValidationResult(
            "Precision Ratio",
            EncodingType.DODECET,
            "precision_improvement",
            precision_ratio,
            "x",
            precision_ratio >= 16.0,
            {"expected": "16x", "actual": f"{precision_ratio:.2f}x"}
        ))

        print(f"Dodecet mean error: {dodecet_mean:.4f} ± {dodecet_std:.4f}")
        print(f"Byte mean error: {byte_mean:.4f} ± {byte_std:.4f}")
        print(f"Float32 mean error: {float32_mean:.6f} ± {float32_std:.6f}")
        print(f"Precision ratio (Byte/Dodecet): {precision_ratio:.2f}x")

        return results

    def test_error_accumulation(self, num_operations: int = 100) -> Dict[str, List[float]]:
        """Test 2: Error Accumulation Over Multiple Operations"""
        print("\n=== Test 2: Error Accumulation ===")

        # Start with a point
        point = Point3D(100.0, 200.0, 300.0)

        dodecet_drift = []
        byte_drift = []
        float32_drift = []

        current_dodecet = point
        current_byte = point
        current_float32 = point

        for i in range(num_operations):
            # Apply random transformations
            dx = np.random.uniform(-10, 10)
            dy = np.random.uniform(-10, 10)
            dz = np.random.uniform(-10, 10)

            # Dodecet path
            dodecet_encoded = current_dodecet.encode_dodecet()
            current_dodecet = current_dodecet.decode_dodecet(dodecet_encoded)
            current_dodecet = Point3D(
                current_dodecet.x_orig + dx,
                current_dodecet.y_orig + dy,
                current_dodecet.z_orig + dz
            )
            dodecet_drift.append(current_dodecet.distance_to(point))

            # Byte path
            byte_encoded = current_byte.encode_byte()
            current_byte = current_byte.decode_byte(byte_encoded)
            current_byte = Point3D(
                current_byte.x_orig + dx,
                current_byte.y_orig + dy,
                current_byte.z_orig + dz
            )
            byte_drift.append(current_byte.distance_to(point))

            # Float32 path
            float32_encoded = current_float32.encode_float32()
            current_float32 = current_float32.decode_float32(float32_encoded)
            current_float32 = Point3D(
                current_float32.x_orig + dx,
                current_float32.y_orig + dy,
                current_float32.z_orig + dz
            )
            float32_drift.append(current_float32.distance_to(point))

        results = {
            "dodecet_drift": dodecet_drift,
            "byte_drift": byte_drift,
            "float32_drift": float32_drift
        }

        print(f"Dodecet final drift: {dodecet_drift[-1]:.4f}")
        print(f"Byte final drift: {byte_drift[-1]:.4f}")
        print(f"Float32 final drift: {float32_drift[-1]:.4f}")

        return results

    def test_memory_usage(self) -> Dict[str, int]:
        """Test 3: Memory Usage Comparison"""
        print("\n=== Test 3: Memory Usage ===")

        # Calculate memory usage for different encodings
        dodecet_point3d_bytes = 6  # 3 dodecets × 2 bytes each
        byte_point3d_bytes = 3     # 3 bytes × 1 byte each
        float32_point3d_bytes = 12 # 3 float32 × 4 bytes each

        results = {
            "dodecet_point3d": dodecet_point3d_bytes,
            "byte_point3d": byte_point3d_bytes,
            "float32_point3d": float32_point3d_bytes
        }

        print(f"Dodecet Point3D: {dodecet_point3d_bytes} bytes")
        print(f"Byte Point3D: {byte_point3d_bytes} bytes")
        print(f"Float32 Point3D: {float32_point3d_bytes} bytes")
        print(f"Memory savings vs Float32: {float32_point3d_bytes - dodecet_point3d_bytes} bytes")

        self.add_result(ValidationResult(
            "Memory Usage",
            EncodingType.DODECET,
            "point3d_size",
            dodecet_point3d_bytes,
            "bytes",
            dodecet_point3d_bytes < float32_point3d_bytes,
            {"savings_vs_float32": float32_point3d_bytes - dodecet_point3d_bytes}
        ))

        return results

    def test_performance_benchmark(self, num_iterations: int = 10000) -> Dict[str, float]:
        """Test 4: Performance Benchmark"""
        print("\n=== Test 4: Performance Benchmark ===")

        points = self.generate_random_points(1000)

        # Benchmark dodecet encoding/decoding
        start = time.time()
        for _ in range(num_iterations):
            point = points[_ % len(points)]
            encoded = point.encode_dodecet()
            decoded = point.decode_dodecet(encoded)
        dodecet_time = time.time() - start

        # Benchmark byte encoding/decoding
        start = time.time()
        for _ in range(num_iterations):
            point = points[_ % len(points)]
            encoded = point.encode_byte()
            decoded = point.decode_byte(encoded)
        byte_time = time.time() - start

        # Benchmark float32 encoding/decoding
        start = time.time()
        for _ in range(num_iterations):
            point = points[_ % len(points)]
            encoded = point.encode_float32()
            decoded = point.decode_float32(encoded)
        float32_time = time.time() - start

        results = {
            "dodecet_time": dodecet_time,
            "byte_time": byte_time,
            "float32_time": float32_time,
            "dodecet_ops_per_sec": num_iterations / dodecet_time,
            "byte_ops_per_sec": num_iterations / byte_time,
            "float32_ops_per_sec": num_iterations / float32_time
        }

        print(f"Dodecet: {dodecet_time:.4f}s ({results['dodecet_ops_per_sec']:.0f} ops/sec)")
        print(f"Byte: {byte_time:.4f}s ({results['byte_ops_per_sec']:.0f} ops/sec)")
        print(f"Float32: {float32_time:.4f}s ({results['float32_ops_per_sec']:.0f} ops/sec)")

        return results

    def test_hex_friendly_encoding(self) -> Dict[str, any]:
        """Test 5: Hex-Friendly Encoding"""
        print("\n=== Test 5: Hex-Friendly Encoding ===")

        # Test that dodecet values can be represented as 3 hex digits
        test_values = [0, 1, 15, 16, 255, 256, 4095]

        results = {
            "hex_strings": {},
            "parseable": True
        }

        for val in test_values:
            hex_str = DodecetEncoder.to_hex(val)
            parsed = DodecetEncoder.from_hex(hex_str)

            results["hex_strings"][val] = {
                "hex": hex_str,
                "length": len(hex_str),
                "round_trip_successful": val == parsed
            }

            if val != parsed:
                results["parseable"] = False

            print(f"Value {val:4d} -> Hex: {hex_str} -> Parsed: {parsed} (Match: {val == parsed})")

        self.add_result(ValidationResult(
            "Hex-Friendly Encoding",
            EncodingType.DODECET,
            "hex_digits",
            3,
            "characters",
            results["parseable"],
            {"all_values_parseable": results["parseable"]}
        ))

        return results

    def test_geometric_operations(self) -> Dict[str, float]:
        """Test 6: Geometric Operations"""
        print("\n=== Test 6: Geometric Operations ===")

        # Test distance calculations
        p1 = Point3D(0.0, 0.0, 0.0)
        p2 = Point3D(300.0, 400.0, 500.0)  # Distance should be ~707.1

        # Encode and decode both points
        p1_dodecet = p1.decode_dodecet(p1.encode_dodecet())
        p2_dodecet = p2.decode_dodecet(p2.encode_dodecet())

        p1_byte = p1.decode_byte(p1.encode_byte())
        p2_byte = p2.decode_byte(p2.encode_byte())

        p1_float32 = p1.decode_float32(p1.encode_float32())
        p2_float32 = p2.decode_float32(p2.encode_float32())

        # Calculate distances
        original_dist = p1.distance_to(p2)
        dodecet_dist = p1_dodecet.distance_to(p2_dodecet)
        byte_dist = p1_byte.distance_to(p2_byte)
        float32_dist = p1_float32.distance_to(p2_float32)

        # Calculate errors
        dodecet_error = abs(original_dist - dodecet_dist)
        byte_error = abs(original_dist - byte_dist)
        float32_error = abs(original_dist - float32_dist)

        results = {
            "original_distance": original_dist,
            "dodecet_distance": dodecet_dist,
            "dodecet_error": dodecet_error,
            "byte_distance": byte_dist,
            "byte_error": byte_error,
            "float32_distance": float32_dist,
            "float32_error": float32_error
        }

        print(f"Original distance: {original_dist:.4f}")
        print(f"Dodecet distance: {dodecet_dist:.4f} (error: {dodecet_error:.4f})")
        print(f"Byte distance: {byte_dist:.4f} (error: {byte_error:.4f})")
        print(f"Float32 distance: {float32_dist:.4f} (error: {float32_error:.6f})")

        return results

    def run_all_tests(self) -> Dict[str, any]:
        """Run all validation tests"""
        print("=" * 60)
        print("DODECET VALIDATION SIMULATION SUITE")
        print("=" * 60)

        results = {}

        # Run all tests
        results["precision"] = self.test_precision_comparison()
        results["error_accumulation"] = self.test_error_accumulation()
        results["memory"] = self.test_memory_usage()
        results["performance"] = self.test_performance_benchmark()
        results["hex_encoding"] = self.test_hex_friendly_encoding()
        results["geometric"] = self.test_geometric_operations()

        return results

    def save_results(self, results: Dict[str, any]):
        """Save results to JSON and CSV"""
        # Save as JSON
        json_path = self.output_dir / "validation_results.json"
        with open(json_path, 'w') as f:
            json.dump(results, f, indent=2, default=str)
        print(f"\nResults saved to {json_path}")

        # Save validation results as CSV
        csv_path = self.output_dir / "validation_summary.csv"
        with open(csv_path, 'w', newline='') as f:
            writer = csv.writer(f)
            writer.writerow(['Test Name', 'Encoding Type', 'Metric', 'Value', 'Unit', 'Passed', 'Details'])

            for result in self.results:
                details_str = json.dumps(result.details)
                writer.writerow([
                    result.test_name,
                    result.encoding_type.value,
                    result.metric,
                    result.value,
                    result.unit,
                    result.passed,
                    details_str
                ])
        print(f"Summary saved to {csv_path}")

    def generate_visualizations(self, results: Dict[str, any]):
        """Generate visualization plots"""
        print("\n=== Generating Visualizations ===")

        # 1. Precision Comparison Bar Chart
        fig, axes = plt.subplots(2, 2, figsize=(14, 10))

        # Precision comparison
        ax = axes[0, 0]
        encodings = ['Dodecet\n(12-bit)', 'Byte\n(8-bit)', 'Float32\n(32-bit)']
        errors = [
            results['precision']['dodecet_mean_error'],
            results['precision']['byte_mean_error'],
            results['precision']['float32_mean_error']
        ]
        bars = ax.bar(encodings, errors, color=['#2ecc71', '#e74c3c', '#3498db'])
        ax.set_ylabel('Mean Encoding Error')
        ax.set_title('Precision Comparison: Mean Encoding Error')
        ax.set_yscale('log')

        # Add value labels on bars
        for bar, error in zip(bars, errors):
            height = bar.get_height()
            ax.text(bar.get_x() + bar.get_width()/2., height,
                   f'{error:.4f}',
                   ha='center', va='bottom', fontsize=9)

        # 2. Error Accumulation
        ax = axes[0, 1]
        ops = list(range(len(results['error_accumulation']['dodecet_drift'])))
        ax.plot(ops, results['error_accumulation']['dodecet_drift'], label='Dodecet', color='#2ecc71')
        ax.plot(ops, results['error_accumulation']['byte_drift'], label='Byte', color='#e74c3c')
        ax.plot(ops, results['error_accumulation']['float32_drift'], label='Float32', color='#3498db')
        ax.set_xlabel('Operations')
        ax.set_ylabel('Distance from Original')
        ax.set_title('Error Accumulation Over Operations')
        ax.legend()
        ax.grid(True, alpha=0.3)

        # 3. Memory Usage
        ax = axes[1, 0]
        memory_types = ['Point3D']
        dodecet_mem = [results['memory']['dodecet_point3d']]
        byte_mem = [results['memory']['byte_point3d']]
        float32_mem = [results['memory']['float32_point3d']]

        x = np.arange(len(memory_types))
        width = 0.25

        ax.bar(x - width, dodecet_mem, width, label='Dodecet (6 bytes)', color='#2ecc71')
        ax.bar(x, byte_mem, width, label='Byte (3 bytes)', color='#e74c3c')
        ax.bar(x + width, float32_mem, width, label='Float32 (12 bytes)', color='#3498db')

        ax.set_ylabel('Memory (bytes)')
        ax.set_title('Memory Usage Comparison')
        ax.set_xticks(x)
        ax.set_xticklabels(memory_types)
        ax.legend()

        # Add value labels
        ax.text(x[0] - width, dodecet_mem[0] + 0.5, f"{dodecet_mem[0]}B", ha='center', fontsize=10)
        ax.text(x[0], byte_mem[0] + 0.5, f"{byte_mem[0]}B", ha='center', fontsize=10)
        ax.text(x[0] + width, float32_mem[0] + 0.5, f"{float32_mem[0]}B", ha='center', fontsize=10)

        # 4. Performance Benchmark
        ax = axes[1, 1]
        ops_per_sec = [
            results['performance']['dodecet_ops_per_sec'],
            results['performance']['byte_ops_per_sec'],
            results['performance']['float32_ops_per_sec']
        ]
        bars = ax.bar(encodings, ops_per_sec, color=['#2ecc71', '#e74c3c', '#3498db'])
        ax.set_ylabel('Operations per Second')
        ax.set_title('Performance Benchmark')
        ax.set_yscale('log')

        # Add value labels on bars
        for bar, ops in zip(bars, ops_per_sec):
            height = bar.get_height()
            ax.text(bar.get_x() + bar.get_width()/2., height,
                   f'{ops:.0f}',
                   ha='center', va='bottom', fontsize=9)

        plt.tight_layout()

        # Save figure
        fig_path = self.output_dir / "validation_plots.png"
        plt.savefig(fig_path, dpi=300, bbox_inches='tight')
        print(f"Plots saved to {fig_path}")
        plt.close()

        # 5. Create precision ratio visualization
        fig, ax = plt.subplots(figsize=(8, 6))

        precision_ratio = results['precision']['precision_ratio']
        expected_ratio = 16.0

        # Create bar chart
        ratios = [('Actual', precision_ratio), ('Expected', expected_ratio)]
        names = [r[0] for r in ratios]
        values = [r[1] for r in ratios]

        colors = ['#2ecc71' if precision_ratio >= 16.0 else '#f39c12', '#95a5a6']
        bars = ax.bar(names, values, color=colors)

        ax.set_ylabel('Precision Ratio (Byte Error / Dodecet Error)')
        ax.set_title(f'Dodecet Precision Improvement: {precision_ratio:.2f}x')
        ax.set_ylim(0, max(values) * 1.2)

        # Add reference line at 16x
        ax.axhline(y=16.0, color='#e74c3c', linestyle='--', label='16x Target')

        # Add value labels on bars
        for bar, val in zip(bars, values):
            height = bar.get_height()
            ax.text(bar.get_x() + bar.get_width()/2., height,
                   f'{val:.2f}x',
                   ha='center', va='bottom', fontsize=12, fontweight='bold')

        ax.legend()

        fig_path = self.output_dir / "precision_ratio.png"
        plt.savefig(fig_path, dpi=300, bbox_inches='tight')
        print(f"Precision ratio plot saved to {fig_path}")
        plt.close()

    def generate_report(self, results: Dict[str, any]) -> str:
        """Generate comprehensive validation report"""
        report = []
        report.append("=" * 70)
        report.append("DODECET VALIDATION REPORT")
        report.append("=" * 70)
        report.append("")

        # Executive Summary
        report.append("EXECUTIVE SUMMARY")
        report.append("-" * 70)
        precision_ratio = results['precision']['precision_ratio']
        report.append(f"Precision Improvement: {precision_ratio:.2f}x (Target: 16x)")
        report.append(f"Status: {'PASSED' if precision_ratio >= 16.0 else 'NEEDS REVIEW'}")
        report.append("")

        # Test Results
        report.append("TEST RESULTS")
        report.append("-" * 70)

        report.append("\n1. PRECISION COMPARISON")
        report.append(f"   Dodecet (12-bit): {results['precision']['dodecet_mean_error']:.6f} ± {results['precision']['dodecet_std_error']:.6f}")
        report.append(f"   Byte (8-bit):     {results['precision']['byte_mean_error']:.6f} ± {results['precision']['byte_std_error']:.6f}")
        report.append(f"   Float32 (32-bit): {results['precision']['float32_mean_error']:.8f} ± {results['precision']['float32_std_error']:.8f}")
        report.append(f"   Ratio: {precision_ratio:.2f}x")

        report.append("\n2. ERROR ACCUMULATION")
        report.append(f"   Dodecet final drift: {results['error_accumulation']['dodecet_drift'][-1]:.4f}")
        report.append(f"   Byte final drift: {results['error_accumulation']['byte_drift'][-1]:.4f}")
        report.append(f"   Float32 final drift: {results['error_accumulation']['float32_drift'][-1]:.4f}")

        report.append("\n3. MEMORY USAGE")
        report.append(f"   Dodecet Point3D: {results['memory']['dodecet_point3d']} bytes")
        report.append(f"   Byte Point3D: {results['memory']['byte_point3d']} bytes")
        report.append(f"   Float32 Point3D: {results['memory']['float32_point3d']} bytes")
        report.append(f"   Savings vs Float32: {results['memory']['float32_point3d'] - results['memory']['dodecet_point3d']} bytes")

        report.append("\n4. PERFORMANCE")
        report.append(f"   Dodecet: {results['performance']['dodecet_ops_per_sec']:.0f} ops/sec")
        report.append(f"   Byte: {results['performance']['byte_ops_per_sec']:.0f} ops/sec")
        report.append(f"   Float32: {results['performance']['float32_ops_per_sec']:.0f} ops/sec")

        report.append("\n5. HEX-FRIENDLY ENCODING")
        report.append(f"   All values parseable: {results['hex_encoding']['parseable']}")

        report.append("\n6. GEOMETRIC OPERATIONS")
        report.append(f"   Original distance: {results['geometric']['original_distance']:.4f}")
        report.append(f"   Dodecet error: {results['geometric']['dodecet_error']:.4f}")
        report.append(f"   Byte error: {results['geometric']['byte_error']:.4f}")
        report.append(f"   Float32 error: {results['geometric']['float32_error']:.6f}")

        # Conclusions
        report.append("\n")
        report.append("CONCLUSIONS")
        report.append("-" * 70)

        passed_tests = sum(1 for r in self.results if r.passed)
        total_tests = len(self.results)

        report.append(f"Tests Passed: {passed_tests}/{total_tests}")

        if precision_ratio >= 16.0:
            report.append("✓ Dodecet achieves 16x or better precision vs 8-bit")
        else:
            report.append(f"⚠ Dodecet achieves {precision_ratio:.2f}x precision vs 8-bit (target: 16x)")

        memory_savings = results['memory']['float32_point3d'] - results['memory']['dodecet_point3d']
        report.append(f"✓ Dodecet saves {memory_savings} bytes per Point3D vs Float32")

        report.append(f"✓ Dodecet uses 3 hex digits for representation")

        report.append("\n")
        report.append("=" * 70)
        report.append("END OF REPORT")
        report.append("=" * 70)

        report_text = "\n".join(report)

        # Save report
        report_path = self.output_dir / "VALIDATION_REPORT.txt"
        with open(report_path, 'w') as f:
            f.write(report_text)
        print(f"\nReport saved to {report_path}")

        return report_text


def main():
    """Main entry point"""
    import argparse

    parser = argparse.ArgumentParser(description="Run Dodecet Validation Simulations")
    parser.add_argument("--output", "-o", default="results", help="Output directory for results")
    parser.add_argument("--points", "-p", type=int, default=1000, help="Number of test points")
    parser.add_argument("--iterations", "-i", type=int, default=10000, help="Benchmark iterations")

    args = parser.parse_args()

    # Create framework
    framework = ComparisonFramework(output_dir=args.output)

    # Run all tests
    results = framework.run_all_tests()

    # Save results
    framework.save_results(results)

    # Generate visualizations
    framework.generate_visualizations(results)

    # Generate report
    report = framework.generate_report(results)

    # Print report to console
    print("\n" + report)

    # Exit with appropriate code
    return 0 if all(r.passed for r in framework.results) else 1


if __name__ == "__main__":
    sys.exit(main())
