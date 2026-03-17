/**
 * Integration Tests for Dodecet Encoding
 *
 * Comprehensive tests for dodecet utilities, comparison, and display components
 */

import { Dodecet, DodecetArray, DodecetPoint3D, DodecetHex } from './dodecet';
import {
  EncodingComparator,
  RealtimeComparator,
  VisualComparator,
  EncodingBenchmark,
} from './comparison';

// Test utilities
function assert(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(`Assertion failed: ${message}`);
  }
}

function assertEqual<T>(actual: T, expected: T, message: string): void {
  if (actual !== expected) {
    throw new Error(
      `Assertion failed: ${message}\nExpected: ${expected}\nActual: ${actual}`
    );
  }
}

function assertClose(
  actual: number,
  expected: number,
  tolerance: number,
  message: string
): void {
  if (Math.abs(actual - expected) > tolerance) {
    throw new Error(
      `Assertion failed: ${message}\nExpected: ${expected} ± ${tolerance}\nActual: ${actual}`
    );
  }
}

// Test suites
export class DodecetTests {
  /**
   * Test basic dodecet creation
   */
  static testCreation(): void {
    console.log('Testing dodecet creation...');

    // Test from number
    const d1 = new Dodecet(0xABC);
    assertEqual(d1.toNumber(), 0xABC, 'Dodecet number creation');

    // Test from hex
    const d2 = Dodecet.fromHex(0x123);
    assertEqual(d2.toNumber(), 0x123, 'Dodecet hex creation');

    // Test from hex string
    const d3 = Dodecet.fromHexString('FFF');
    assertEqual(d3.toNumber(), 0xFFF, 'Dodecet hex string creation');

    // Test bounds
    try {
      new Dodecet(0x1000);
      throw new Error('Should throw for value > 4095');
    } catch (e) {
      assert(
        e instanceof Error && e.message.includes('must be between 0 and 4095'),
        'Bounds checking'
      );
    }

    console.log('✓ Dodecet creation tests passed');
  }

  /**
   * Test nibble operations
   */
  static testNibbles(): void {
    console.log('Testing nibble operations...');

    const d = Dodecet.fromHexString('ABC');

    assertEqual(d.nibble(0), 0xC, 'Nibble 0 (least significant)');
    assertEqual(d.nibble(1), 0xB, 'Nibble 1');
    assertEqual(d.nibble(2), 0xA, 'Nibble 2 (most significant)');

    console.log('✓ Nibble operations tests passed');
  }

  /**
   * Test conversions
   */
  static testConversions(): void {
    console.log('Testing conversions...');

    const d = Dodecet.fromHexString('ABC');

    // Hex string
    assertEqual(d.toHexString(), 'ABC', 'Hex string conversion');

    // Binary string
    assertEqual(
      d.toBinaryString(),
      '101010111100',
      'Binary string conversion'
    );

    // Normalized
    const normalized = d.normalize();
    assertClose(normalized, 0xABC / 0xFFF, 0.0001, 'Normalized value');

    // Signed
    const signed = d.toSigned();
    assertEqual(signed, 0xABC, 'Signed conversion (positive)');

    const negative = Dodecet.fromHexString('F00');
    assertEqual(negative.toSigned(), -256, 'Signed conversion (negative)');

    console.log('✓ Conversion tests passed');
  }

  /**
   * Test bitwise operations
   */
  static testBitwise(): void {
    console.log('Testing bitwise operations...');

    const d1 = Dodecet.fromHexString('ABC');
    const d2 = Dodecet.fromHexString('123');

    // AND
    const and = d1.and(d2);
    assertEqual(and.toNumber(), 0xABC & 0x123, 'Bitwise AND');

    // OR
    const or = d1.or(d2);
    assertEqual(or.toNumber(), 0xABC | 0x123, 'Bitwise OR');

    // XOR
    const xor = d1.xor(d2);
    assertEqual(xor.toNumber(), 0xABC ^ 0x123, 'Bitwise XOR');

    // NOT
    const not = d1.not();
    assertEqual(not.toNumber(), ~0xABC & 0xFFF, 'Bitwise NOT');

    console.log('✓ Bitwise operation tests passed');
  }

  /**
   * Test arithmetic operations
   */
  static testArithmetic(): void {
    console.log('Testing arithmetic operations...');

    const d1 = Dodecet.fromHexString('800');
    const d2 = Dodecet.fromHexString('100');

    // Addition
    const sum = d1.add(d2);
    assertEqual(sum.toNumber(), 0x900, 'Addition');

    // Subtraction
    const diff = d1.sub(d2);
    assertEqual(diff.toNumber(), 0x700, 'Subtraction');

    // Overflow (wrapping)
    const overflow = Dodecet.fromHexString('FFF').add(Dodecet.fromHexString('1'));
    assertEqual(overflow.toNumber(), 0, 'Overflow wrapping');

    console.log('✓ Arithmetic operation tests passed');
  }

  /**
   * Test dodecet array
   */
  static testArray(): void {
    console.log('Testing dodecet array...');

    const arr = DodecetArray.fromNumbers([0x123, 0x456, 0x789]);

    // Length
    assertEqual(arr.length(), 3, 'Array length');

    // Access
    assertEqual(arr.get(1).toNumber(), 0x456, 'Array access');

    // Sum
    assertEqual(arr.sum(), 0x123 + 0x456 + 0x789, 'Array sum');

    // Average
    assertClose(
      arr.average(),
      (0x123 + 0x456 + 0x789) / 3,
      0.01,
      'Array average'
    );

    // Hex string
    assertEqual(
      arr.toHexString(),
      '123456789',
      'Array hex string'
    );

    // Spaced hex
    assertEqual(
      arr.toSpacedHexString(),
      '123 456 789',
      'Array spaced hex'
    );

    console.log('✓ Dodecet array tests passed');
  }

  /**
   * Test 3D point
   */
  static testPoint3D(): void {
    console.log('Testing 3D point...');

    const point = DodecetPoint3D.fromHex(0x100, 0x200, 0x300);

    // Coordinates
    assertEqual(point.getX().toNumber(), 0x100, 'X coordinate');
    assertEqual(point.getY().toNumber(), 0x200, 'Y coordinate');
    assertEqual(point.getZ().toNumber(), 0x300, 'Z coordinate');

    // To array
    const arr = point.toArray();
    assertEqual(arr[0], 0x100, 'Array X');
    assertEqual(arr[1], 0x200, 'Array Y');
    assertEqual(arr[2], 0x300, 'Array Z');

    // Normalized array
    const norm = point.toNormalizedArray();
    assertClose(norm[0], 0x100 / 0xFFF, 0.0001, 'Normalized X');
    assertClose(norm[1], 0x200 / 0xFFF, 0.0001, 'Normalized Y');
    assertClose(norm[2], 0x300 / 0xFFF, 0.0001, 'Normalized Z');

    // Hex string
    assertEqual(point.toHexString(), '100200300', 'Point hex string');

    // Distance
    const point2 = DodecetPoint3D.fromHex(0x100, 0x200, 0x400);
    const distance = point.distanceTo(point2);
    assertClose(distance, (0x400 - 0x300) / 0xFFF, 0.0001, 'Distance calculation');

    console.log('✓ 3D point tests passed');
  }

  /**
   * Test hex utilities
   */
  static testHexUtilities(): void {
    console.log('Testing hex utilities...');

    // Format spaced
    const spaced = DodecetHex.formatSpaced('123456789');
    assertEqual(spaced, '123 456 789', 'Format spaced');

    // Validation
    assert(DodecetHex.isValid('123456'), 'Valid hex (6 digits)');
    assert(DodecetHex.isValid('123456789'), 'Valid hex (9 digits)');
    assert(!DodecetHex.isValid('12345'), 'Invalid hex (5 digits)');
    assert(!DodecetHex.isValid('GHI'), 'Invalid hex (non-hex)');

    // Hex view
    const view = DodecetHex.hexView('123456789', 4);
    assert(view.includes('00000000'), 'Hex view has offset');
    assert(view.includes('123 456 789'), 'Hex view has data');

    console.log('✓ Hex utility tests passed');
  }
}

export class ComparisonTests {
  /**
   * Test encoding comparison
   */
  static testComparison(): void {
    console.log('Testing encoding comparison...');

    const comparison = EncodingComparator.compareValue(0.5);

    // Dodecet encoding
    assertEqual(comparison.dodecet.type, 'dodecet', 'Dodecet type');
    assertEqual(comparison.dodecet.bits, 12, 'Dodecet bits');
    assertEqual(comparison.dodecet.states, 4096, 'Dodecet states');
    assertEqual(comparison.dodecet.bytes, 1.5, 'Dodecet bytes');

    // 8-bit encoding
    assertEqual(comparison.byte8.type, 'byte8', 'Byte8 type');
    assertEqual(comparison.byte8.bits, 8, 'Byte8 bits');
    assertEqual(comparison.byte8.states, 256, 'Byte8 states');
    assertEqual(comparison.byte8.bytes, 1, 'Byte8 bytes');

    // Float encoding
    assertEqual(comparison.float.type, 'float', 'Float type');
    assertEqual(comparison.float.bits, 32, 'Float bits');
    assertEqual(comparison.float.bytes, 4, 'Float bytes');

    // Metrics
    assertEqual(comparison.metrics.compressionRatio, 16, 'Compression ratio');
    assertEqual(comparison.metrics.qualityImprovement, 16, 'Quality improvement');
    assertEqual(comparison.metrics.artifactReduction, 8, 'Artifact reduction');
    assertClose(comparison.metrics.efficiency, 10.7, 0.1, 'Efficiency');

    console.log('✓ Encoding comparison tests passed');
  }

  /**
   * Test summary statistics
   */
  static testSummaryStats(): void {
    console.log('Testing summary statistics...');

    const comparisons = [
      EncodingComparator.compareValue(0.25),
      EncodingComparator.compareValue(0.5),
      EncodingComparator.compareValue(0.75),
    ];

    const stats = EncodingComparator.getSummaryStats(comparisons);

    assertEqual(stats.avgCompression, 16, 'Average compression');
    assertEqual(stats.avgQuality, 16, 'Average quality');
    assertClose(stats.avgEfficiency, 10.7, 0.1, 'Average efficiency');

    // Bytes saved vs float (12 bytes vs 4.5 bytes)
    assertEqual(stats.totalBytesSaved, 7.5, 'Total bytes saved');

    console.log('✓ Summary statistics tests passed');
  }

  /**
   * Test real-time comparator
   */
  static testRealtimeComparator(): void {
    console.log('Testing real-time comparator...');

    const comparator = new RealtimeComparator();

    // Add values
    const c1 = comparator.addValue(0.25);
    const c2 = comparator.addValue(0.5);
    const c3 = comparator.addValue(0.75);

    assertEqual(comparator.size(), 3, 'Comparator size');

    // Get recent
    const recent = comparator.getRecent(2);
    assertEqual(recent.length, 2, 'Recent count');
    assertEqual(recent[0], c2, 'First recent');
    assertEqual(recent[1], c3, 'Second recent');

    // Get summary
    const stats = comparator.getSummary();
    assertEqual(stats.avgCompression, 16, 'Average compression');

    // Clear
    comparator.clear();
    assertEqual(comparator.size(), 0, 'Size after clear');

    console.log('✓ Real-time comparator tests passed');
  }

  /**
   * Test visual comparator
   */
  static testVisualComparator(): void {
    console.log('Testing visual comparator...');

    // Precision gradient
    const gradient1 = VisualComparator.createPrecisionGradient(0);
    assert(gradient1.includes('240'), 'Low value gradient is blue');

    const gradient2 = VisualComparator.createPrecisionGradient(1);
    assert(gradient2.includes('0'), 'High value gradient is red');

    // Metrics formatting
    const metrics = {
      compressionRatio: 16,
      qualityImprovement: 16,
      artifactReduction: 8,
      efficiency: 10.7,
    };
    const formatted = VisualComparator.formatMetrics(metrics);
    assert(formatted.includes('16x'), 'Formatted metrics includes compression');
    assert(formatted.includes('10.7x'), 'Formatted metrics includes efficiency');

    console.log('✓ Visual comparator tests passed');
  }
}

export class BenchmarkTests {
  /**
   * Test performance benchmarking
   */
  static testBenchmark(): void {
    console.log('Testing performance benchmarking...');

    // Benchmark dodecet creation
    const dodecetTime = EncodingBenchmark.benchmark('dodecet', 1000, () => {
      new Dodecet(Math.floor(Math.random() * 4096));
    });

    assert(dodecetTime > 0, 'Benchmark returns positive time');
    assert(dodecetTime < 100, 'Benchmark completes in reasonable time');

    // Compare performance
    const comparison = EncodingBenchmark.comparePerformance(100);
    assert(comparison.dodecetTime > 0, 'Dodecet benchmark ran');
    assert(comparison.byte8Time > 0, 'Byte8 benchmark ran');
    assert(comparison.floatTime > 0, 'Float benchmark ran');

    // Speedup ratio
    const speedup = EncodingBenchmark.getSpeedupRatio(10, 5);
    assertEqual(speedup, 2, 'Speedup ratio calculation');

    console.log('✓ Performance benchmark tests passed');
  }
}

// Run all tests
export function runAllTests(): void {
  console.log('🧪 Running Dodecet Integration Tests...\n');

  try {
    // Dodecet tests
    DodecetTests.testCreation();
    DodecetTests.testNibbles();
    DodecetTests.testConversions();
    DodecetTests.testBitwise();
    DodecetTests.testArithmetic();
    DodecetTests.testArray();
    DodecetTests.testPoint3D();
    DodecetTests.testHexUtilities();

    console.log('');

    // Comparison tests
    ComparisonTests.testComparison();
    ComparisonTests.testSummaryStats();
    ComparisonTests.testRealtimeComparator();
    ComparisonTests.testVisualComparator();

    console.log('');

    // Benchmark tests
    BenchmarkTests.testBenchmark();

    console.log('\n✅ All tests passed!');
  } catch (error) {
    console.error('\n❌ Test failed:', error);
    throw error;
  }
}

// Auto-run if in Node.js or browser console
if (typeof window === 'undefined') {
  // Node.js
  runAllTests();
} else {
  // Browser - expose to window
  (window as any).runDodecetTests = runAllTests;
  (window as any).DodecetTests = DodecetTests;
  (window as any).ComparisonTests = ComparisonTests;
  (window as any).BenchmarkTests = BenchmarkTests;
}
