/**
 * TypeScript Definitions for Dodecet Encoding
 *
 * 12-bit dodecet encoding system for geometric operations
 */

export interface DodecetDisplayOptions {
  showComparison?: boolean;
  showBinary?: boolean;
  showNormalized?: boolean;
  showNibbles?: boolean;
  animate?: boolean;
  theme?: 'light' | 'dark';
}

export interface DodecetEncoding {
  type: 'dodecet';
  bits: 12;
  states: number;
  hex: string;
  normalized: number;
  bytes: number;
}

export interface Byte8Encoding {
  type: 'byte8';
  bits: 8;
  states: number;
  hex: string;
  normalized: number;
  bytes: number;
}

export interface FloatEncoding {
  type: 'float';
  bits: 32;
  states: number;
  value: number;
  bytes: number;
}

export interface ComparisonMetrics {
  compressionRatio: number;
  qualityImprovement: number;
  artifactReduction: number;
  efficiency: number;
}

export interface EncodingComparison {
  dodecet: DodecetEncoding;
  byte8: Byte8Encoding;
  float: FloatEncoding;
  metrics: ComparisonMetrics;
}

export interface SummaryStats {
  avgCompression: number;
  avgQuality: number;
  avgEfficiency: number;
  totalBytesSaved: number;
}

export interface BenchmarkResult {
  dodecetTime: number;
  byte8Time: number;
  floatTime: number;
}

/**
 * 12-bit dodecet value (0-4095)
 */
export class Dodecet {
  constructor(value: number);

  static fromHex(hex: number): Dodecet;
  static fromHexString(hex: string): Dodecet;

  nibble(position: 0 | 1 | 2): number;
  toNumber(): number;
  toHexString(): string;
  toBinaryString(): string;
  normalize(): number;
  toSigned(): number;

  and(other: Dodecet): Dodecet;
  or(other: Dodecet): Dodecet;
  xor(other: Dodecet): Dodecet;
  not(): Dodecet;

  add(other: Dodecet): Dodecet;
  sub(other: Dodecet): Dodecet;

  clone(): Dodecet;
}

/**
 * Array of dodecets
 */
export class DodecetArray {
  constructor(dodecets: Dodecet[]);

  static fromNumbers(values: number[]): DodecetArray;
  static fromHexString(hex: string): DodecetArray;

  get(index: number): Dodecet;
  length(): number;

  toHexString(): string;
  toSpacedHexString(): string;

  sum(): number;
  average(): number;

  map<T>(fn: (d: Dodecet, i: number) => T): T[];
  forEach(fn: (d: Dodecet, i: number) => void): void;
}

/**
 * 3D point using dodecet encoding
 */
export class DodecetPoint3D {
  constructor(x: Dodecet | number, y: Dodecet | number, z: Dodecet | number);

  static fromHex(x: number, y: number, z: number): DodecetPoint3D;

  getX(): Dodecet;
  getY(): Dodecet;
  getZ(): Dodecet;

  toArray(): [number, number, number];
  toNormalizedArray(): [number, number, number];

  distanceTo(other: DodecetPoint3D): number;

  toHexString(): string;
  clone(): DodecetPoint3D;
}

/**
 * Hex utilities for dodecet encoding
 */
export class DodecetHex {
  static formatSpaced(hex: string): string;
  static hexView(data: string, bytesPerRow?: number): string;
  static isValid(hex: string): boolean;
}

/**
 * Performance utilities
 */
export class DodecetPerformance {
  static start(): () => number;
  static getAverage(): number;
  static getOpsPerSec(): number;
  static reset(): void;
  static getStats(): { avg: number; min: number; max: number; count: number };
}

/**
 * Encoding comparison utilities
 */
export class EncodingComparator {
  static compareValue(value: number): EncodingComparison;
  static compareArray(values: number[]): EncodingComparison[];
  static getSummaryStats(comparisons: EncodingComparison[]): SummaryStats;
  static createComparisonTable(comparisons: EncodingComparison[]): string;
}

/**
 * Real-time encoding comparison
 */
export class RealtimeComparator {
  addValue(value: number): EncodingComparison;
  getRecent(count?: number): EncodingComparison[];
  getSummary(): SummaryStats;
  clear(): void;
  size(): number;
}

/**
 * Visual comparison utilities
 */
export class VisualComparator {
  static createPrecisionGradient(value: number): string;
  static formatMetrics(metrics: ComparisonMetrics): string;
  static createEncodingBar(dodecetValue: number, byte8Value: number, floatValue: number): string;
}

/**
 * Benchmarking utilities
 */
export class EncodingBenchmark {
  static benchmark(name: string, iterations: number, fn: () => void): number;
  static comparePerformance(iterations?: number): BenchmarkResult;
  static getSpeedupRatio(baseline: number, optimized: number): number;
}

/**
 * Dodecet display component
 */
export class DodecetDisplay {
  constructor(element: HTMLElement, options?: DodecetDisplayOptions);

  updateValue(value: number): void;
  updateDodecet(dodecet: Dodecet): void;
  updatePoint3D(point: DodecetPoint3D): void;

  getSummary(): SummaryStats;
  clear(): void;
}

/**
 * Create a dodecet display from selector
 */
export function createDodecetDisplay(
  selector: string,
  options?: DodecetDisplayOptions
): DodecetDisplay | null;

/**
 * Initialize all dodecet displays on page
 */
export function initDodecetDisplays(): void;

/**
 * Dodecet demo controller
 */
export class DodecetDemo {
  constructor();

  getStats(): SummaryStats;
  destroy(): void;
}
