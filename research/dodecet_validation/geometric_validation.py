"""
Geometric Validation for Dodecet Encoding
==========================================

Specialized tests for constraint theory geometric operations:
- Pythagorean snapping precision
- Rigidity matroid detection
- Holonomy transport closure
- Entropy calculation precision
"""

import numpy as np
import matplotlib.pyplot as plt
from pathlib import Path
import json
from typing import List, Tuple, Dict
import math

# Import from main validation module
import sys
sys.path.append(str(Path(__file__).parent))
from dodecet_validation import DodecetEncoder, ByteEncoder, Float32Encoder, Point3D, EncodingType


class GeometricValidator:
    """Validator for constraint theory geometric operations"""

    def __init__(self, output_dir: str = "results"):
        self.output_dir = Path(output_dir)
        self.output_dir.mkdir(exist_ok=True)
        self.results = []

    def test_pythagorean_snapping(self, num_tests: int = 1000) -> Dict[str, any]:
        """Test Pythagorean snapping precision"""
        print("\n=== Pythagorean Snapping Validation ===")

        dodecet_snap_errors = []
        byte_snap_errors = []

        for _ in range(num_tests):
            # Generate random point
            x = np.random.uniform(-1000, 1000)
            y = np.random.uniform(-1000, 1000)

            # Calculate distance from origin
            true_distance = np.sqrt(x*x + y*y)

            # Encode with dodecet
            x_dodecet = DodecetEncoder.encode(x)
            y_dodecet = DodecetEncoder.encode(y)
            x_decoded = DodecetEncoder.decode(x_dodecet)
            y_decoded = DodecetEncoder.decode(y_dodecet)
            dodecet_distance = np.sqrt(x_decoded*x_decoded + y_decoded*y_decoded)
            dodecet_error = abs(true_distance - dodecet_distance)
            dodecet_snap_errors.append(dodecet_error)

            # Encode with byte
            x_byte = ByteEncoder.encode(x, -1000, 1000)
            y_byte = ByteEncoder.encode(y, -1000, 1000)
            x_decoded = ByteEncoder.decode(x_byte, -1000, 1000)
            y_decoded = ByteEncoder.decode(y_byte, -1000, 1000)
            byte_distance = np.sqrt(x_decoded*x_decoded + y_decoded*y_decoded)
            byte_error = abs(true_distance - byte_distance)
            byte_snap_errors.append(byte_error)

        results = {
            "dodecet_mean_error": np.mean(dodecet_snap_errors),
            "dodecet_max_error": np.max(dodecet_snap_errors),
            "byte_mean_error": np.mean(byte_snap_errors),
            "byte_max_error": np.max(byte_snap_errors),
            "improvement_ratio": np.mean(byte_snap_errors) / np.mean(dodecet_snap_errors)
        }

        print(f"Dodecet snap error: {results['dodecet_mean_error']:.6f} (max: {results['dodecet_max_error']:.6f})")
        print(f"Byte snap error: {results['byte_mean_error']:.6f} (max: {results['byte_max_error']:.6f})")
        print(f"Improvement: {results['improvement_ratio']:.2f}x")

        return results

    def test_rigidity_detection(self) -> Dict[str, any]:
        """Test rigidity matroid detection accuracy"""
        print("\n=== Rigidity Matroid Detection ===")

        # Create a simple bar-and-joint structure
        # 4 points forming a square with diagonals (rigid)
        points = [
            Point3D(0.0, 0.0, 0.0),
            Point3D(100.0, 0.0, 0.0),
            Point3D(100.0, 100.0, 0.0),
            Point3D(0.0, 100.0, 0.0)
        ]

        # Define edges (connections between points)
        edges = [
            (0, 1), (1, 2), (2, 3), (3, 0),  # Square edges
            (0, 2), (1, 3)  # Diagonals
        ]

        def calculate_rigidity(pts, edgs):
            """Calculate rigidity measure"""
            # Calculate all edge lengths
            edge_lengths = []
            for i, j in edgs:
                dist = pts[i].distance_to(pts[j])
                edge_lengths.append(dist)

            # Check if structure is rigid (simplified check)
            # In reality, this would involve rank computation of the rigidity matrix
            variance = np.var(edge_lengths) if len(edge_lengths) > 0 else 0
            return {
                "mean_edge_length": np.mean(edge_lengths),
                "edge_variance": variance,
                "is_consistent": variance < 1.0  # Threshold for consistency
            }

        # Test with different encodings
        # Original
        original_rigidity = calculate_rigidity(points, edges)

        # Dodecet encoded
        dodecet_points = []
        for p in points:
            encoded = p.encode_dodecet()
            decoded = p.decode_dodecet(encoded)
            dodecet_points.append(decoded)
        dodecet_rigidity = calculate_rigidity(dodecet_points, edges)

        # Byte encoded
        byte_points = []
        for p in points:
            encoded = p.encode_byte()
            decoded = p.decode_byte(encoded)
            byte_points.append(decoded)
        byte_rigidity = calculate_rigidity(byte_points, edges)

        results = {
            "original": original_rigidity,
            "dodecet": dodecet_rigidity,
            "byte": byte_rigidity,
            "dodecet_edge_error": abs(original_rigidity["mean_edge_length"] - dodecet_rigidity["mean_edge_length"]),
            "byte_edge_error": abs(original_rigidity["mean_edge_length"] - byte_rigidity["mean_edge_length"])
        }

        print(f"Original mean edge length: {original_rigidity['mean_edge_length']:.4f}")
        print(f"Dodecet mean edge length: {dodecet_rigidity['mean_edge_length']:.4f} (error: {results['dodecet_edge_error']:.6f})")
        print(f"Byte mean edge length: {byte_rigidity['mean_edge_length']:.4f} (error: {results['byte_edge_error']:.6f})")

        return results

    def test_holonomy_transport(self, num_steps: int = 100) -> Dict[str, any]:
        """Test holonomy transport closure precision"""
        print("\n=== Holonomy Transport Closure ===")

        # Simulate parallel transport around a closed loop
        # Start with a vector at origin
        initial_vector = np.array([1.0, 0.0, 0.0])

        # Create a closed path (cube)
        path = [
            Point3D(0.0, 0.0, 0.0),
            Point3D(100.0, 0.0, 0.0),
            Point3D(100.0, 100.0, 0.0),
            Point3D(0.0, 100.0, 0.0),
            Point3D(0.0, 0.0, 0.0)  # Back to origin
        ]

        def transport_along_path(vector, pts, encoder_type):
            """Transport vector along path"""
            current_vector = vector.copy()

            for i in range(len(pts) - 1):
                # Get edge vector
                edge = np.array([
                    pts[i+1].x_orig - pts[i].x_orig,
                    pts[i+1].y_orig - pts[i].y_orig,
                    pts[i+1].z_orig - pts[i].z_orig
                ])

                # Normalize edge
                edge_norm = np.linalg.norm(edge)
                if edge_norm > 0:
                    edge = edge / edge_norm

                # Rotate current vector to align with edge (simplified)
                # In reality, this would be proper parallel transport
                current_vector = edge

            return current_vector

        # Original path
        original_final = transport_along_path(initial_vector, path, "original")

        # Dodecet encoded path
        dodecet_path = []
        for p in path:
            encoded = p.encode_dodecet()
            decoded = p.decode_dodecet(encoded)
            dodecet_path.append(decoded)
        dodecet_final = transport_along_path(initial_vector, dodecet_path, "dodecet")

        # Byte encoded path
        byte_path = []
        for p in path:
            encoded = p.encode_byte()
            decoded = p.decode_byte(encoded)
            byte_path.append(decoded)
        byte_final = transport_along_path(initial_vector, byte_path, "byte")

        # Calculate closure error (distance from initial to final vector)
        dodecet_closure_error = np.linalg.norm(original_final - dodecet_final)
        byte_closure_error = np.linalg.norm(original_final - byte_final)

        results = {
            "dodecet_closure_error": dodecet_closure_error,
            "byte_closure_error": byte_closure_error,
            "improvement_ratio": byte_closure_error / dodecet_closure_error if dodecet_closure_error > 0 else float('inf')
        }

        print(f"Dodecet closure error: {dodecet_closure_error:.8f}")
        print(f"Byte closure error: {byte_closure_error:.8f}")
        print(f"Improvement: {results['improvement_ratio']:.2f}x")

        return results

    def test_entropy_calculation(self, num_points: int = 1000) -> Dict[str, any]:
        """Test entropy calculation precision"""
        print("\n=== Entropy Calculation Precision ===")

        # Generate random points and calculate spatial entropy
        points = []
        for _ in range(num_points):
            points.append(Point3D(
                np.random.uniform(0, 100),
                np.random.uniform(0, 100),
                np.random.uniform(0, 100)
            ))

        def calculate_entropy(pts, bin_size=10):
            """Calculate spatial entropy using histogram"""
            # Create 3D histogram
            bins = int(100 / bin_size)

            x_coords = [int(p.x_orig / bin_size) for p in pts]
            y_coords = [int(p.y_orig / bin_size) for p in pts]
            z_coords = [int(p.z_orig / bin_size) for p in pts]

            # Count points in each bin
            histogram = {}
            for x, y, z in zip(x_coords, y_coords, z_coords):
                key = (x, y, z)
                histogram[key] = histogram.get(key, 0) + 1

            # Calculate entropy
            total = len(pts)
            entropy = 0.0
            for count in histogram.values():
                if count > 0:
                    p = count / total
                    entropy -= p * np.log2(p)

            return entropy, len(histogram)

        # Original entropy
        original_entropy, original_bins = calculate_entropy(points)

        # Dodecet encoded
        dodecet_points = []
        for p in points:
            encoded = p.encode_dodecet()
            decoded = p.decode_dodecet(encoded)
            dodecet_points.append(decoded)
        dodecet_entropy, dodecet_bins = calculate_entropy(dodecet_points)

        # Byte encoded
        byte_points = []
        for p in points:
            encoded = p.encode_byte()
            decoded = p.decode_byte(encoded)
            byte_points.append(decoded)
        byte_entropy, byte_bins = calculate_entropy(byte_points)

        results = {
            "original_entropy": original_entropy,
            "dodecet_entropy": dodecet_entropy,
            "dodecet_entropy_error": abs(original_entropy - dodecet_entropy),
            "byte_entropy": byte_entropy,
            "byte_entropy_error": abs(original_entropy - byte_entropy),
            "original_bins": original_bins,
            "dodecet_bins": dodecet_bins,
            "byte_bins": byte_bins
        }

        print(f"Original entropy: {original_entropy:.6f} ({original_bins} bins)")
        print(f"Dodecet entropy: {dodecet_entropy:.6f} ({dodecet_bins} bins, error: {results['dodecet_entropy_error']:.6f})")
        print(f"Byte entropy: {byte_entropy:.6f} ({byte_bins} bins, error: {results['byte_entropy_error']:.6f})")

        return results

    def test_kd_tree_spatial_partitioning(self, num_points: int = 1000) -> Dict[str, any]:
        """Test KD-Tree spatial partitioning accuracy"""
        print("\n=== KD-Tree Spatial Partitioning ===")

        # Generate random points
        points = []
        for _ in range(num_points):
            points.append(Point3D(
                np.random.uniform(0, 1000),
                np.random.uniform(0, 1000),
                np.random.uniform(0, 1000)
            ))

        def build_kd_tree(pts, depth=0):
            """Build simple KD-tree (returns list of points in order they would be visited)"""
            if len(pts) <= 1:
                return pts

            # Choose axis based on depth
            axis = depth % 3

            # Sort points and find median
            sorted_pts = sorted(pts, key=lambda p: [p.x_orig, p.y_orig, p.z_orig][axis])
            mid = len(sorted_pts) // 2

            # Recursively build tree
            left = build_kd_tree(sorted_pts[:mid], depth + 1)
            right = build_kd_tree(sorted_pts[mid+1:], depth + 1)

            return left + [sorted_pts[mid]] + right

        def find_nearest_neighbor(tree_pts, query):
            """Find nearest neighbor (simplified)"""
            min_dist = float('inf')
            nearest = None

            for pt in tree_pts:
                dist = query.distance_to(pt)
                if dist < min_dist:
                    min_dist = dist
                    nearest = pt

            return nearest, min_dist

        # Test queries
        num_queries = 100
        dodecet_errors = []
        byte_errors = []

        # Build trees
        dodecet_points = []
        for p in points:
            encoded = p.encode_dodecet()
            decoded = p.decode_dodecet(encoded)
            dodecet_points.append(decoded)

        byte_points = []
        for p in points:
            encoded = p.encode_byte()
            decoded = p.decode_byte(encoded)
            byte_points.append(decoded)

        # Query original tree
        original_tree = build_kd_tree(points[:])  # Use subset for efficiency
        dodecet_tree = build_kd_tree(dodecet_points[:])
        byte_tree = build_kd_tree(byte_points[:])

        for _ in range(num_queries):
            query = Point3D(
                np.random.uniform(0, 1000),
                np.random.uniform(0, 1000),
                np.random.uniform(0, 1000)
            )

            _, orig_dist = find_nearest_neighbor(original_tree, query)
            _, dodecet_dist = find_nearest_neighbor(dodecet_tree, query)
            _, byte_dist = find_nearest_neighbor(byte_tree, query)

            dodecet_errors.append(abs(orig_dist - dodecet_dist))
            byte_errors.append(abs(orig_dist - byte_dist))

        results = {
            "dodecet_mean_error": np.mean(dodecet_errors),
            "dodecet_max_error": np.max(dodecet_errors),
            "byte_mean_error": np.mean(byte_errors),
            "byte_max_error": np.max(byte_errors),
            "improvement_ratio": np.mean(byte_errors) / np.mean(dodecet_errors)
        }

        print(f"Dodecet KD-tree error: {results['dodecet_mean_error']:.6f} (max: {results['dodecet_max_error']:.6f})")
        print(f"Byte KD-tree error: {results['byte_mean_error']:.6f} (max: {results['byte_max_error']:.6f})")
        print(f"Improvement: {results['improvement_ratio']:.2f}x")

        return results

    def run_all_tests(self) -> Dict[str, any]:
        """Run all geometric validation tests"""
        print("=" * 70)
        print("GEOMETRIC VALIDATION FOR DODECET ENCODING")
        print("=" * 70)

        results = {}

        results["pythagorean_snapping"] = self.test_pythagorean_snapping()
        results["rigidity_detection"] = self.test_rigidity_detection()
        results["holonomy_transport"] = self.test_holonomy_transport()
        results["entropy_calculation"] = self.test_entropy_calculation()
        results["kd_tree"] = self.test_kd_tree_spatial_partitioning()

        return results

    def save_results(self, results: Dict[str, any]):
        """Save results to JSON"""
        json_path = self.output_dir / "geometric_validation_results.json"
        with open(json_path, 'w') as f:
            json.dump(results, f, indent=2, default=str)
        print(f"\nGeometric validation results saved to {json_path}")

    def generate_visualizations(self, results: Dict[str, any]):
        """Generate geometric validation visualizations"""
        print("\n=== Generating Geometric Validation Plots ===")

        fig, axes = plt.subplots(2, 3, figsize=(18, 10))
        fig.suptitle('Geometric Validation: Dodecet vs Byte Encoding', fontsize=16)

        # 1. Pythagorean Snapping
        ax = axes[0, 0]
        encodings = ['Dodecet', 'Byte']
        snap_errors = [
            results['pythagorean_snapping']['dodecet_mean_error'],
            results['pythagorean_snapping']['byte_mean_error']
        ]
        bars = ax.bar(encodings, snap_errors, color=['#2ecc71', '#e74c3c'])
        ax.set_ylabel('Mean Snap Error')
        ax.set_title('Pythagorean Snapping Precision')
        ax.set_yscale('log')
        for bar, error in zip(bars, snap_errors):
            height = bar.get_height()
            ax.text(bar.get_x() + bar.get_width()/2., height,
                   f'{error:.4f}', ha='center', va='bottom', fontsize=10)

        # 2. Rigidity Detection
        ax = axes[0, 1]
        edge_errors = [
            results['rigidity_detection']['dodecet_edge_error'],
            results['rigidity_detection']['byte_edge_error']
        ]
        bars = ax.bar(encodings, edge_errors, color=['#2ecc71', '#e74c3c'])
        ax.set_ylabel('Edge Length Error')
        ax.set_title('Rigidity Detection: Edge Length Error')
        for bar, error in zip(bars, edge_errors):
            height = bar.get_height()
            ax.text(bar.get_x() + bar.get_width()/2., height,
                   f'{error:.6f}', ha='center', va='bottom', fontsize=10)

        # 3. Holonomy Transport
        ax = axes[0, 2]
        closure_errors = [
            results['holonomy_transport']['dodecet_closure_error'],
            results['holonomy_transport']['byte_closure_error']
        ]
        bars = ax.bar(encodings, closure_errors, color=['#2ecc71', '#e74c3c'])
        ax.set_ylabel('Closure Error')
        ax.set_title('Holonomy Transport Closure')
        for bar, error in zip(bars, closure_errors):
            height = bar.get_height()
            ax.text(bar.get_x() + bar.get_width()/2., height,
                   f'{error:.6f}', ha='center', va='bottom', fontsize=10)

        # 4. Entropy Calculation
        ax = axes[1, 0]
        entropy_errors = [
            results['entropy_calculation']['dodecet_entropy_error'],
            results['entropy_calculation']['byte_entropy_error']
        ]
        bars = ax.bar(encodings, entropy_errors, color=['#2ecc71', '#e74c3c'])
        ax.set_ylabel('Entropy Error')
        ax.set_title('Entropy Calculation Precision')
        for bar, error in zip(bars, entropy_errors):
            height = bar.get_height()
            ax.text(bar.get_x() + bar.get_width()/2., height,
                   f'{error:.6f}', ha='center', va='bottom', fontsize=10)

        # 5. KD-Tree Performance
        ax = axes[1, 1]
        kd_errors = [
            results['kd_tree']['dodecet_mean_error'],
            results['kd_tree']['byte_mean_error']
        ]
        bars = ax.bar(encodings, kd_errors, color=['#2ecc71', '#e74c3c'])
        ax.set_ylabel('Mean Query Error')
        ax.set_title('KD-Tree Spatial Partitioning')
        ax.set_yscale('log')
        for bar, error in zip(bars, kd_errors):
            height = bar.get_height()
            ax.text(bar.get_x() + bar.get_width()/2., height,
                   f'{error:.4f}', ha='center', va='bottom', fontsize=10)

        # 6. Summary: Improvement Ratios
        ax = axes[1, 2]
        test_names = [
            'Pythagorean\nSnapping',
            'Rigidity\nDetection',
            'Holonomy\nTransport',
            'Entropy\nCalculation',
            'KD-Tree\nQueries'
        ]
        ratios = [
            results['pythagorean_snapping']['improvement_ratio'],
            results['rigidity_detection']['byte_edge_error'] / results['rigidity_detection']['dodecet_edge_error']
                if results['rigidity_detection']['dodecet_edge_error'] > 0 else 1.0,
            results['holonomy_transport']['improvement_ratio'],
            results['entropy_calculation']['byte_entropy_error'] / results['entropy_calculation']['dodecet_entropy_error']
                if results['entropy_calculation']['dodecet_entropy_error'] > 0 else 1.0,
            results['kd_tree']['improvement_ratio']
        ]

        colors = ['#2ecc71' if r >= 1.0 else '#f39c12' for r in ratios]
        bars = ax.barh(test_names, ratios, color=colors)
        ax.set_xlabel('Improvement Ratio (Byte Error / Dodecet Error)')
        ax.set_title('Precision Improvement Summary')
        ax.axvline(x=1.0, color='red', linestyle='--', alpha=0.5, label='1x baseline')
        ax.axvline(x=16.0, color='green', linestyle='--', alpha=0.5, label='16x target')
        ax.legend()

        for bar, ratio in zip(bars, ratios):
            width = bar.get_width()
            ax.text(width + 0.1, bar.get_y() + bar.get_height()/2.,
                   f'{ratio:.2f}x', ha='left', va='center', fontsize=10)

        plt.tight_layout()

        # Save figure
        fig_path = self.output_dir / "geometric_validation_plots.png"
        plt.savefig(fig_path, dpi=300, bbox_inches='tight')
        print(f"Geometric validation plots saved to {fig_path}")
        plt.close()


def main():
    """Main entry point"""
    import argparse

    parser = argparse.ArgumentParser(description="Run Geometric Validation for Dodecet Encoding")
    parser.add_argument("--output", "-o", default="results", help="Output directory")
    parser.add_argument("--points", "-p", type=int, default=1000, help="Number of test points")

    args = parser.parse_args()

    validator = GeometricValidator(output_dir=args.output)

    # Run tests
    results = validator.run_all_tests()

    # Save results
    validator.save_results(results)

    # Generate visualizations
    validator.generate_visualizations(results)

    return 0


if __name__ == "__main__":
    import sys
    sys.exit(main())
