/**
 * Dodecet Display Component
 *
 * Reusable component for displaying dodecet-encoded values with comparison panels
 */

import { Dodecet, DodecetPoint3D } from './dodecet';
import { EncodingComparator, RealtimeComparator } from './comparison';

export interface DodecetDisplayOptions {
  showComparison?: boolean;
  showBinary?: boolean;
  showNormalized?: boolean;
  showNibbles?: boolean;
  animate?: boolean;
  theme?: 'light' | 'dark';
}

export class DodecetDisplay {
  private element: HTMLElement;
  private options: DodecetDisplayOptions;
  private comparator: RealtimeComparator;

  constructor(element: HTMLElement, options: DodecetDisplayOptions = {}) {
    this.element = element;
    this.options = {
      showComparison: true,
      showBinary: false,
      showNormalized: true,
      showNibbles: true,
      animate: true,
      theme: 'dark',
      ...options,
    };
    this.comparator = new RealtimeComparator();
    this.render();
  }

  /**
   * Update display with new value
   */
  updateValue(value: number): void {
    const comparison = this.comparator.addValue(value);

    if (this.options.animate) {
      this.animateUpdate(comparison);
    } else {
      this.renderComparison(comparison);
    }
  }

  /**
   * Update display with dodecet
   */
  updateDodecet(dodecet: Dodecet): void {
    const normalized = dodecet.normalize();
    this.updateValue(normalized);
  }

  /**
   * Update display with 3D point
   */
  updatePoint3D(point: DodecetPoint3D): void {
    const html = this.renderPoint3D(point);
    this.element.innerHTML = html;
  }

  /**
   * Render initial display
   */
  private render(): void {
    const html = `
      <div class="dodecet-display ${this.options.theme}">
        <div class="dodecet-header">
          <h4 class="dodecet-title">12-Bit Dodecet Encoding</h4>
          <div class="dodecet-badge">4096 States</div>
        </div>
        <div class="dodecet-content">
          <div class="dodecet-main">
            <div class="dodecet-value">---</div>
            <div class="dodecet-label">Hex Value</div>
          </div>
          ${this.options.showNibbles ? this.renderNibbleStructure() : ''}
          ${this.options.showComparison ? this.renderComparisonPanel() : ''}
          ${this.options.showBinary ? this.renderBinaryPanel() : ''}
          ${this.options.showNormalized ? this.renderNormalizedPanel() : ''}
        </div>
        <div class="dodecet-footer">
          <div class="dodecet-metric">
            <span class="metric-label">Compression:</span>
            <span class="metric-value">16x</span>
          </div>
          <div class="dodecet-metric">
            <span class="metric-label">Precision:</span>
            <span class="metric-value">16x</span>
          </div>
          <div class="dodecet-metric">
            <span class="metric-label">States:</span>
            <span class="metric-value">4096</span>
          </div>
        </div>
      </div>
    `;
    this.element.innerHTML = html;
  }

  /**
   * Render comparison panel
   */
  private renderComparisonPanel(): string {
    return `
      <div class="dodecet-comparison">
        <h5 class="comparison-title">Encoding Comparison</h5>
        <div class="comparison-grid">
          <div class="comparison-item dodecet">
            <div class="comparison-label">12-bit Dodecet</div>
            <div class="comparison-states">4,096 states</div>
            <div class="comparison-hex comparison-value">---</div>
          </div>
          <div class="comparison-item byte8">
            <div class="comparison-label">8-bit Byte</div>
            <div class="comparison-states">256 states</div>
            <div class="comparison-hex comparison-value">---</div>
          </div>
          <div class="comparison-item float">
            <div class="comparison-label">32-bit Float</div>
            <div class="comparison-states">∞ precision</div>
            <div class="comparison-value">---</div>
          </div>
        </div>
        <div class="comparison-metrics">
          <div class="metric">
            <span class="metric-label">Compression:</span>
            <span class="metric-value highlight">16x</span>
          </div>
          <div class="metric">
            <span class="metric-label">Quality:</span>
            <span class="metric-value highlight">16x</span>
          </div>
          <div class="metric">
            <span class="metric-label">Artifacts:</span>
            <span class="metric-value highlight">-8x</span>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Render nibble structure
   */
  private renderNibbleStructure(): string {
    return `
      <div class="nibble-structure">
        <h5 class="nibble-title">Nibble Structure (3 × 4-bit)</h5>
        <div class="nibble-visual">
          <div class="nibble" id="nibble-2">
            <div class="nibble-label">Nibble 2</div>
            <div class="nibble-value">--</div>
            <div class="nibble-bits">0000</div>
          </div>
          <div class="nibble" id="nibble-1">
            <div class="nibble-label">Nibble 1</div>
            <div class="nibble-value">--</div>
            <div class="nibble-bits">0000</div>
          </div>
          <div class="nibble" id="nibble-0">
            <div class="nibble-label">Nibble 0</div>
            <div class="nibble-value">--</div>
            <div class="nibble-bits">0000</div>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Render binary panel
   */
  private renderBinaryPanel(): string {
    return `
      <div class="dodecet-binary">
        <h5 class="binary-title">Binary Representation</h5>
        <div class="binary-display" id="binary-display">
          <span class="binary-placeholder">0000 0000 0000</span>
        </div>
      </div>
    `;
  }

  /**
   * Render normalized panel
   */
  private renderNormalizedPanel(): string {
    return `
      <div class="dodecet-normalized">
        <h5 class="normalized-title">Normalized Value [0, 1]</h5>
        <div class="normalized-bar">
          <div class="normalized-fill" id="normalized-fill" style="width: 0%"></div>
        </div>
        <div class="normalized-value" id="normalized-value">0.000</div>
      </div>
    `;
  }

  /**
   * Render 3D point
   */
  private renderPoint3D(point: DodecetPoint3D): string {
    return `
      <div class="dodecet-point3d">
        <div class="point3d-header">
          <h4 class="point3d-title">3D Point (Dodecet)</h4>
          <div class="point3d-hex">${point.toHexString()}</div>
        </div>
        <div class="point3d-coordinates">
          <div class="coordinate">
            <span class="coord-label">X:</span>
            <span class="coord-value">${point.getX().toHexString()}</span>
            <span class="coord-normalized">(${point.getX().normalize().toFixed(3)})</span>
          </div>
          <div class="coordinate">
            <span class="coord-label">Y:</span>
            <span class="coord-value">${point.getY().toHexString()}</span>
            <span class="coord-normalized">(${point.getY().normalize().toFixed(3)})</span>
          </div>
          <div class="coordinate">
            <span class="coord-label">Z:</span>
            <span class="coord-value">${point.getZ().toHexString()}</span>
            <span class="coord-normalized">(${point.getZ().normalize().toFixed(3)})</span>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Render comparison data
   */
  private renderComparison(comparison: any): void {
    // Update dodecet value
    const dodecetValue = this.element.querySelector('.dodecet-value');
    if (dodecetValue) {
      dodecetValue.textContent = comparison.dodecet.hex;
    }

    // Update comparison values
    const dodecetHex = this.element.querySelector('.comparison-item.dodecet .comparison-value');
    if (dodecetHex) {
      dodecetHex.textContent = comparison.dodecet.hex;
    }

    const byte8Hex = this.element.querySelector('.comparison-item.byte8 .comparison-value');
    if (byte8Hex) {
      byte8Hex.textContent = comparison.byte8.hex;
    }

    const floatValue = this.element.querySelector('.comparison-item.float .comparison-value');
    if (floatValue) {
      floatValue.textContent = comparison.float.value.toFixed(4);
    }

    // Update nibbles
    this.updateNibbles(comparison.dodecet.hex);

    // Update binary
    this.updateBinary(comparison.dodecet.hex);

    // Update normalized
    this.updateNormalized(comparison.dodecet.normalized);
  }

  /**
   * Animate update
   */
  private animateUpdate(comparison: any): void {
    this.element.classList.add('updating');

    setTimeout(() => {
      this.renderComparison(comparison);
      this.element.classList.remove('updating');
    }, 100);
  }

  /**
   * Update nibble display
   */
  private updateNibbles(hex: string): void {
    for (let i = 0; i < 3; i++) {
      const nibble = this.element.querySelector(`#nibble-${i}`);
      if (nibble) {
        const value = hex.charAt(2 - i);
        const valueEl = nibble.querySelector('.nibble-value');
        const bitsEl = nibble.querySelector('.nibble-bits');

        if (valueEl) valueEl.textContent = value.toUpperCase();
        if (bitsEl) {
          const intValue = parseInt(value, 16);
          bitsEl.textContent = intValue.toString(2).padStart(4, '0');
        }
      }
    }
  }

  /**
   * Update binary display
   */
  private updateBinary(hex: string): void {
    const binaryDisplay = this.element.querySelector('#binary-display');
    if (binaryDisplay) {
      const value = parseInt(hex, 16);
      const binary = value.toString(2).padStart(12, '0');
      const formatted = binary.match(/.{4}/g)?.join(' ') || binary;
      binaryDisplay.textContent = formatted;
    }
  }

  /**
   * Update normalized display
   */
  private updateNormalized(value: number): void {
    const fill = this.element.querySelector('#normalized-fill');
    const valueEl = this.element.querySelector('#normalized-value');

    if (fill) {
      fill.style.width = `${value * 100}%`;
    }

    if (valueEl) {
      valueEl.textContent = value.toFixed(3);
    }
  }

  /**
   * Get summary statistics
   */
  getSummary() {
    return this.comparator.getSummary();
  }

  /**
   * Clear history
   */
  clear(): void {
    this.comparator.clear();
    this.render();
  }
}

/**
 * Create a dodecet display from selector
 */
export function createDodecetDisplay(
  selector: string,
  options?: DodecetDisplayOptions
): DodecetDisplay | null {
  const element = document.querySelector(selector) as HTMLElement;
  if (!element) return null;

  return new DodecetDisplay(element, options);
}

/**
 * Initialize all dodecet displays on page
 */
export function initDodecetDisplays(): void {
  const displays = document.querySelectorAll('[data-dodecet-display]');

  displays.forEach(element => {
    const options = JSON.parse(
      element.getAttribute('data-dodecet-display') || '{}'
    );
    new DodecetDisplay(element as HTMLElement, options);
  });
}

// Auto-initialize on DOM ready
if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initDodecetDisplays);
  } else {
    initDodecetDisplays();
  }
}
