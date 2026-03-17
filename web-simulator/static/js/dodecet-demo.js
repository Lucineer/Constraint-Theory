/**
 * Dodecet Demo Controller
 *
 * Interactive demo showcasing 12-bit dodecet encoding comparison
 */

import { Dodecet, DodecetArray, DodecetPoint3D } from './dodecet.js';
import { EncodingComparator, RealtimeComparator } from './comparison.js';
import { createDodecetDisplay } from './dodecet-display.js';

class DodecetDemo {
  private display: any;
  private comparator: RealtimeComparator;
  private autoPlayInterval: number | null = null;
  private speed: number = 1.0;

  constructor() {
    this.initialize();
  }

  private initialize(): void {
    // Initialize dodecet display
    this.display = createDodecetDisplay('#dodecetDisplay', {
      showComparison: true,
      showBinary: true,
      showNormalized: true,
      showNibbles: true,
      animate: true,
      theme: 'dark',
    });

    if (!this.display) {
      console.error('Failed to initialize dodecet display');
      return;
    }

    // Initialize comparator
    this.comparator = new RealtimeComparator();

    // Set up controls
    this.setupControls();

    // Initialize with default value
    this.updateValue(0.5);

    console.log('Dodecet Demo initialized');
  }

  private setupControls(): void {
    // Value slider
    const valueSlider = document.getElementById('valueSlider') as HTMLInputElement;
    const inputValue = document.getElementById('inputValue') as HTMLElement;

    if (valueSlider && inputValue) {
      valueSlider.addEventListener('input', (e) => {
        const value = parseFloat((e.target as HTMLInputElement).value);
        this.updateValue(value);
        inputValue.textContent = value.toFixed(3);
      });
    }

    // Random button
    const randomBtn = document.getElementById('randomBtn');
    if (randomBtn) {
      randomBtn.addEventListener('click', () => {
        this.setRandomValue();
      });
    }

    // Speed slider
    const speedSlider = document.getElementById('speedSlider') as HTMLInputElement;
    const speedValue = document.getElementById('speedValue') as HTMLElement;

    if (speedSlider && speedValue) {
      speedSlider.addEventListener('input', (e) => {
        this.speed = parseFloat((e.target as HTMLInputElement).value);
        speedValue.textContent = `${this.speed.toFixed(1)}x`;

        // Update autoplay interval if running
        if (this.autoPlayInterval !== null) {
          this.stopAutoPlay();
          this.startAutoPlay();
        }
      });
    }

    // Auto-play checkbox
    const autoPlayCheckbox = document.getElementById('autoPlay') as HTMLInputElement;
    const stopBtn = document.getElementById('stopBtn') as HTMLButtonElement;

    if (autoPlayCheckbox && stopBtn) {
      autoPlayCheckbox.addEventListener('change', (e) => {
        if ((e.target as HTMLInputElement).checked) {
          this.startAutoPlay();
          stopBtn.style.display = 'inline-block';
        } else {
          this.stopAutoPlay();
          stopBtn.style.display = 'none';
        }
      });

      stopBtn.addEventListener('click', () => {
        this.stopAutoPlay();
        autoPlayCheckbox.checked = false;
        stopBtn.style.display = 'none';
      });
    }
  }

  private updateValue(value: number): void {
    // Update display
    if (this.display) {
      this.display.updateValue(value);
    }

    // Add to comparator
    this.comparator.addValue(value);
  }

  private setRandomValue(): void {
    const value = Math.random();
    const valueSlider = document.getElementById('valueSlider') as HTMLInputElement;
    const inputValue = document.getElementById('inputValue') as HTMLElement;

    if (valueSlider && inputValue) {
      valueSlider.value = value.toString();
      inputValue.textContent = value.toFixed(3);
      this.updateValue(value);
    }
  }

  private startAutoPlay(): void {
    const interval = Math.max(50, Math.floor(1000 / this.speed));

    this.autoPlayInterval = window.setInterval(() => {
      this.setRandomValue();
    }, interval);
  }

  private stopAutoPlay(): void {
    if (this.autoPlayInterval !== null) {
      clearInterval(this.autoPlayInterval);
      this.autoPlayInterval = null;
    }
  }

  /**
   * Get comparison statistics
   */
  getStats() {
    return this.comparator.getSummary();
  }

  /**
   * Clean up
   */
  destroy(): void {
    this.stopAutoPlay();
    if (this.display) {
      this.display.clear();
    }
  }
}

// Initialize demo when DOM is ready
let demo: DodecetDemo | null = null;

function initDemo() {
  demo = new DodecetDemo();
}

// Auto-initialize
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initDemo);
} else {
  initDemo();
}

// Export for external use
if (typeof window !== 'undefined') {
  (window as any).DodecetDemo = DodecetDemo;
  (window as any).dodecetDemo = demo;
}

export { DodecetDemo };
