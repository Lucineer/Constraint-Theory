"""
Quick script to run dodecet validation and handle encoding issues
"""
import sys
import subprocess
from pathlib import Path

# Change to the validation directory
validation_dir = Path(__file__).parent
sys.path.insert(0, str(validation_dir))

# Import the main module
from dodecet_validation import ComparisonFramework

def main():
    print("=" * 70)
    print("DODECET VALIDATION SIMULATION SUITE")
    print("=" * 70)

    # Create framework
    framework = ComparisonFramework(output_dir="results")

    # Run all tests
    results = framework.run_all_tests()

    # Save results
    framework.save_results(results)

    # Generate visualizations
    framework.generate_visualizations(results)

    # Print summary to console (avoid Unicode issues)
    print("\n" + "=" * 70)
    print("VALIDATION SUMMARY")
    print("=" * 70)

    precision_ratio = results['precision']['precision_ratio']
    print(f"\nPrecision Improvement: {precision_ratio:.2f}x (Target: 16x)")
    print(f"Status: {'PASSED' if precision_ratio >= 16.0 else 'NEEDS REVIEW'}")

    print(f"\nDodecet Point3D: {results['memory']['dodecet_point3d']} bytes")
    print(f"Float32 Point3D: {results['memory']['float32_point3d']} bytes")
    print(f"Memory savings: {results['memory']['float32_point3d'] - results['memory']['dodecet_point3d']} bytes")

    print(f"\nAll hex values parseable: {results['hex_encoding']['parseable']}")

    print("\n" + "=" * 70)

    return 0 if all(r.passed for r in framework.results) else 1


def run_geometric_validation():
    """Run the geometric validation suite"""
    print("\n" + "=" * 70)
    print("GEOMETRIC VALIDATION SUITE")
    print("=" * 70)

    # Import geometric validator
    from geometric_validation import GeometricValidator

    validator = GeometricValidator(output_dir="results")

    # Run tests
    results = validator.run_all_tests()

    # Save results
    validator.save_results(results)

    # Generate visualizations
    validator.generate_visualizations(results)

    print("\nGeometric validation complete!")
    return 0


if __name__ == "__main__":
    # Run main validation
    exit_code = main()

    # Run geometric validation
    exit_code += run_geometric_validation()

    sys.exit(exit_code)
