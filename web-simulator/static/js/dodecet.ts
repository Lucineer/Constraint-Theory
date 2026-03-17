/**
 * Dodecet Encoding Utilities
 *
 * 12-bit dodecet encoding system for geometric operations.
 * Each dodecet = 3 nibbles (4 bits each) = 3 hex digits
 *
 * Provides 4096 states (16x more than 8-bit's 256 states)
 */

export class Dodecet {
  private value: number;

  constructor(value: number) {
    if (value < 0 || value > 0xFFF) {
      throw new Error(`Dodecet value must be between 0 and 4095 (0xFFF), got ${value}`);
    }
    this.value = value;
  }

  /**
   * Create a Dodecet from hex value (0x000 to 0xFFF)
   */
  static fromHex(hex: number): Dodecet {
    return new Dodecet(hex & 0xFFF);
  }

  /**
   * Parse a Dodecet from hex string (e.g., "ABC")
   */
  static fromHexString(hex: string): Dodecet {
    const value = parseInt(hex, 16);
    if (isNaN(value)) {
      throw new Error(`Invalid hex string: ${hex}`);
    }
    return new Dodecet(value);
  }

  /**
   * Get nibble at position (0 = least significant)
   */
  nibble(position: 0 | 1 | 2): number {
    return (this.value >> (position * 4)) & 0xF;
  }

  /**
   * Get the numeric value
   */
  toNumber(): number {
    return this.value;
  }

  /**
   * Convert to hex string (3 digits, uppercase)
   */
  toHexString(): string {
    return this.value.toString(16).toUpperCase().padStart(3, '0');
  }

  /**
   * Convert to binary string (12 bits)
   */
  toBinaryString(): string {
    return this.value.toString(2).padStart(12, '0');
  }

  /**
   * Normalize to [0, 1] range
   */
  normalize(): number {
    return this.value / 0xFFF;
  }

  /**
   * Convert to signed integer (-2048 to 2047)
   */
  toSigned(): number {
    if (this.value >= 0x800) {
      return this.value - 0x1000;
    }
    return this.value;
  }

  /**
   * Bitwise AND
   */
  and(other: Dodecet): Dodecet {
    return new Dodecet(this.value & other.value);
  }

  /**
   * Bitwise OR
   */
  or(other: Dodecet): Dodecet {
    return new Dodecet(this.value | other.value);
  }

  /**
   * Bitwise XOR
   */
  xor(other: Dodecet): Dodecet {
    return new Dodecet(this.value ^ other.value);
  }

  /**
   * Bitwise NOT
   */
  not(): Dodecet {
    return new Dodecet(~this.value & 0xFFF);
  }

  /**
   * Addition
   */
  add(other: Dodecet): Dodecet {
    return new Dodecet((this.value + other.value) & 0xFFF);
  }

  /**
   * Subtraction
   */
  sub(other: Dodecet): Dodecet {
    return new Dodecet(((this.value - other.value) & 0xFFF));
  }

  /**
   * Clone
   */
  clone(): Dodecet {
    return new Dodecet(this.value);
  }
}

/**
 * Dodecet array for geometric operations
 */
export class DodecetArray {
  private dodecets: Dodecet[];

  constructor(dodecets: Dodecet[]) {
    this.dodecets = dodecets;
  }

  /**
   * Create from array of numbers
   */
  static fromNumbers(values: number[]): DodecetArray {
    return new DodecetArray(values.map(v => new Dodecet(v)));
  }

  /**
   * Create from hex string (e.g., "123456789")
   */
  static fromHexString(hex: string): DodecetArray {
    const dodecets: Dodecet[] = [];
    for (let i = 0; i < hex.length; i += 3) {
      const chunk = hex.substring(i, i + 3).padEnd(3, '0');
      dodecets.push(Dodecet.fromHexString(chunk));
    }
    return new DodecetArray(dodecets);
  }

  /**
   * Get dodecet at index
   */
  get(index: number): Dodecet {
    return this.dodecets[index];
  }

  /**
   * Get length
   */
  length(): number {
    return this.dodecets.length;
  }

  /**
   * Convert to hex string
   */
  toHexString(): string {
    return this.dodecets.map(d => d.toHexString()).join('');
  }

  /**
   * Convert to spaced hex string (e.g., "123 456 789")
   */
  toSpacedHexString(): string {
    return this.dodecets.map(d => d.toHexString()).join(' ');
  }

  /**
   * Sum all dodecets
   */
  sum(): number {
    return this.dodecets.reduce((acc, d) => acc + d.toNumber(), 0);
  }

  /**
   * Get average value
   */
  average(): number {
    if (this.dodecets.length === 0) return 0;
    return this.sum() / this.dodecets.length;
  }

  /**
   * Map to new array
   */
  map<T>(fn: (d: Dodecet, i: number) => T): T[] {
    return this.dodecets.map(fn);
  }

  /**
   * For each dodecet
   */
  forEach(fn: (d: Dodecet, i: number) => void): void {
    this.dodecets.forEach(fn);
  }
}

/**
 * 3D Point using dodecet encoding
 */
export class DodecetPoint3D {
  private x: Dodecet;
  private y: Dodecet;
  private z: Dodecet;

  constructor(x: Dodecet | number, y: Dodecet | number, z: Dodecet | number) {
    this.x = x instanceof Dodecet ? x : new Dodecet(x);
    this.y = y instanceof Dodecet ? y : new Dodecet(y);
    this.z = z instanceof Dodecet ? z : new Dodecet(z);
  }

  /**
   * Create from hex values
   */
  static fromHex(x: number, y: number, z: number): DodecetPoint3D {
    return new DodecetPoint3D(
      Dodecet.fromHex(x),
      Dodecet.fromHex(y),
      Dodecet.fromHex(z)
    );
  }

  /**
   * Get X coordinate
   */
  getX(): Dodecet {
    return this.x;
  }

  /**
   * Get Y coordinate
   */
  getY(): Dodecet {
    return this.y;
  }

  /**
   * Get Z coordinate
   */
  getZ(): Dodecet {
    return this.z;
  }

  /**
   * Convert to array
   */
  toArray(): [number, number, number] {
    return [this.x.toNumber(), this.y.toNumber(), this.z.toNumber()];
  }

  /**
   * Convert to normalized array [0, 1]
   */
  toNormalizedArray(): [number, number, number] {
    return [this.x.normalize(), this.y.normalize(), this.z.normalize()];
  }

  /**
   * Calculate distance to another point
   */
  distanceTo(other: DodecetPoint3D): number {
    const dx = this.x.normalize() - other.x.normalize();
    const dy = this.y.normalize() - other.y.normalize();
    const dz = this.z.normalize() - other.z.normalize();
    return Math.sqrt(dx * dx + dy * dy + dz * dz);
  }

  /**
   * Convert to hex string
   */
  toHexString(): string {
    return `${this.x.toHexString()}${this.y.toHexString()}${this.z.toHexString()}`;
  }

  /**
   * Clone
   */
  clone(): DodecetPoint3D {
    return new DodecetPoint3D(this.x.clone(), this.y.clone(), this.z.clone());
  }
}

/**
 * Hex utilities for dodecet encoding
 */
export class DodecetHex {
  /**
   * Format hex string with spaces (e.g., "123 456 789")
   */
  static formatSpaced(hex: string): string {
    const chunks: string[] = [];
    for (let i = 0; i < hex.length; i += 3) {
      chunks.push(hex.substring(i, i + 3));
    }
    return chunks.join(' ');
  }

  /**
   * Create hex editor view
   */
  static hexView(data: string, bytesPerRow: number = 8): string {
    const lines: string[] = [];
    const dodecets = DodecetArray.fromHexString(data);

    for (let i = 0; i < dodecets.length(); i += bytesPerRow) {
      const offset = (i * 3).toString(16).padStart(8, '0').toUpperCase();
      const row = dodecets
        .map((d, idx) => (idx >= i && idx < i + bytesPerRow ? d.toHexString() : '  '))
        .join(' ')
        .substring(0, bytesPerRow * 4);

      lines.push(`${offset}  ${row}`);
    }

    return lines.join('\n');
  }

  /**
   * Validate hex string
   */
  static isValid(hex: string): boolean {
    if (!/^[0-9A-Fa-f]*$/.test(hex)) return false;
    return hex.length % 3 === 0;
  }
}

/**
 * Performance utilities
 */
export class DodecetPerformance {
  private static operations: number[] = [];

  /**
   * Start timing an operation
   */
  static start(): () => number {
    const start = performance.now();
    return () => {
      const elapsed = performance.now() - start;
      this.operations.push(elapsed);
      return elapsed;
    };
  }

  /**
   * Get average operation time
   */
  static getAverage(): number {
    if (this.operations.length === 0) return 0;
    const sum = this.operations.reduce((a, b) => a + b, 0);
    return sum / this.operations.length;
  }

  /**
   * Get operations per second
   */
  static getOpsPerSec(): number {
    const avg = this.getAverage();
    if (avg === 0) return 0;
    return 1000 / avg;
  }

  /**
   * Reset statistics
   */
  static reset(): void {
    this.operations = [];
  }

  /**
   * Get statistics
   */
  static getStats(): { avg: number; min: number; max: number; count: number } {
    if (this.operations.length === 0) {
      return { avg: 0, min: 0, max: 0, count: 0 };
    }

    const avg = this.getAverage();
    const min = Math.min(...this.operations);
    const max = Math.max(...this.operations);

    return { avg, min, max, count: this.operations.length };
  }
}
