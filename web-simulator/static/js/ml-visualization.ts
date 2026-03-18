/**
 * Machine Learning Visualization Components
 *
 * Interactive demonstrations showing practical ML applications
 * using dodecet encoding and geometric primitives.
 *
 * Features:
 * - Neural network visualization with dodecet-encoded weights
 * - Gradient descent animation on loss surfaces
 * - Feature map visualization for understanding embeddings
 * - Interactive tutorials for ML concepts
 *
 * All visualizations run at 60 FPS using Canvas API.
 */

import {
  DodecetDifferentiation,
  DodecetIntegration,
  DodecetGradient
} from './dodecet-calculus';
import { Dodecet, DodecetArray } from './dodecet';
import { DodecetVector3D } from './dodecet-geometric';

// ===================================
// COLOR PALETTE
// ===================================

const COLORS = {
  primary: '#00FFFF',
  primaryDark: '#00CCCC',
  secondary: '#0077FF',
  accent: '#FF00FF',
  success: '#00FF00',
  warning: '#FFAA00',
  error: '#FF0044',
  background: '#0A0A0A',
  backgroundSecondary: '#1A1A1A',
  grid: '#2A2A2A',
  gridLight: '#3A3A3A',
  text: '#FFFFFF',
  textMuted: '#707070',
  nodeInput: '#4F46E5',
  nodeHidden: '#7C3AED',
  nodeOutput: '#059669',
  weightPositive: '#00FF00',
  weightNegative: '#FF0000',
  gradient: '#FFD700',
  lossSurface: '#1E40AF'
};

// ===================================
// NEURAL NETWORK VISUALIZATION
// ===================================

/**
 * Visualizes a simple neural network with dodecet-encoded weights.
 * Shows forward propagation, weight values, and activation functions.
 */
export class NeuralNetworkVisualizer {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private width: number;
  private height: number;
  private animationId: number | null = null;

  // Network architecture
  private layers: number[] = [2, 3, 3, 1]; // Input, hidden, hidden, output
  private weights: Dodecet[][][] = []; // [layer][from][to]
  private biases: Dodecet[][] = []; // [layer][node]
  private activations: number[][] = []; // [layer][node]

  // Visualization state
  private currentInput: number[] = [0.5, 0.5];
  private animatingForward: boolean = false;
  private forwardStep: number = 0;
  private time: number = 0;

  // Performance
  private fps: number = 60;
  private frameCount: number = 0;
  private lastFpsUpdate: number = 0;

  constructor(canvasId: string) {
    this.canvas = document.getElementById(canvasId) as HTMLCanvasElement;
    this.ctx = this.canvas.getContext('2d')!;
    this.width = this.canvas.width;
    this.height = this.canvas.height;

    this.initializeNetwork();
    this.setupInteraction();
  }

  /**
   * Initialize network with random dodecet-encoded weights
   */
  private initializeNetwork(): void {
    // Initialize weights between layers
    for (let l = 0; l < this.layers.length - 1; l++) {
      this.weights[l] = [];
      this.biases[l] = [];

      for (let i = 0; i < this.layers[l]; i++) {
        this.weights[l][i] = [];
        for (let j = 0; j < this.layers[l + 1]; j++) {
          // Random weight in range [-1, 1] encoded as dodecet
          const randomWeight = Math.random() * 2 - 1;
          this.weights[l][i][j] = new Dodecet(Math.round((randomWeight + 1) * 2048) & 0xFFF);
        }
      }

      // Initialize biases
      for (let j = 0; j < this.layers[l + 1]; j++) {
        const randomBias = Math.random() * 2 - 1;
        this.biases[l][j] = new Dodecet(Math.round((randomBias + 1) * 2048) & 0xFFF);
      }
    }

    // Initialize activations
    for (let l = 0; l < this.layers.length; l++) {
      this.activations[l] = new Array(this.layers[l]).fill(0);
    }
  }

  /**
   * Setup mouse interaction for input manipulation
   */
  private setupInteraction(): void {
    this.canvas.addEventListener('click', (e) => {
      const rect = this.canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      // Check if clicking on input nodes
      const inputLayerX = 100;
      const inputSpacing = this.height / (this.layers[0] + 1);

      for (let i = 0; i < this.layers[0]; i++) {
        const nodeY = inputSpacing * (i + 1);
        const dist = Math.sqrt((x - inputLayerX) ** 2 + (y - nodeY) ** 2);

        if (dist < 25) {
          this.currentInput[i] = Math.random();
          this.forwardPass();
          this.render();
          break;
        }
      }
    });
  }

  /**
   * Sigmoid activation function
   */
  private sigmoid(x: number): number {
    return 1 / (1 + Math.exp(-x));
  }

  /**
   * Decode dodecet weight to float
   */
  private decodeWeight(d: Dodecet): number {
    return d.toSigned() / 2048;
  }

  /**
   * Perform forward pass through network
   */
  private forwardPass(): number[] {
    // Set input activations
    this.activations[0] = [...this.currentInput];

    // Forward through each layer
    for (let l = 0; l < this.layers.length - 1; l++) {
      for (let j = 0; j < this.layers[l + 1]; j++) {
        let sum = this.decodeWeight(this.biases[l][j]);

        for (let i = 0; i < this.layers[l]; i++) {
          sum += this.activations[l][i] * this.decodeWeight(this.weights[l][i][j]);
        }

        this.activations[l + 1][j] = this.sigmoid(sum);
      }
    }

    return this.activations[this.layers.length - 1];
  }

  /**
   * Draw network architecture
   */
  private drawNetwork(): void {
    const ctx = this.ctx;
    const layerSpacing = this.width / (this.layers.length + 1);

    // Draw connections first (behind nodes)
    for (let l = 0; l < this.layers.length - 1; l++) {
      const fromX = layerSpacing * (l + 1);
      const toX = layerSpacing * (l + 2);
      const fromSpacing = this.height / (this.layers[l] + 1);
      const toSpacing = this.height / (this.layers[l + 1] + 1);

      for (let i = 0; i < this.layers[l]; i++) {
        for (let j = 0; j < this.layers[l + 1]; j++) {
          const fromY = fromSpacing * (i + 1);
          const toY = toSpacing * (j + 1);

          const weight = this.decodeWeight(this.weights[l][i][j]);
          const activation = this.activations[l][i] * this.activations[l + 1][j];

          // Color based on weight sign
          if (weight > 0) {
            ctx.strokeStyle = `rgba(0, 255, 0, ${Math.min(1, Math.abs(weight)) * 0.5 + 0.2})`;
          } else {
            ctx.strokeStyle = `rgba(255, 0, 0, ${Math.min(1, Math.abs(weight)) * 0.5 + 0.2})`;
          }

          ctx.lineWidth = Math.abs(weight) * 3 + 0.5;
          ctx.beginPath();
          ctx.moveTo(fromX, fromY);
          ctx.lineTo(toX, toY);
          ctx.stroke();

          // Animated pulse along connection
          if (this.animatingForward && activation > 0.1) {
            const t = (this.time * 2 + l * 0.5) % 1;
            const px = fromX + (toX - fromX) * t;
            const py = fromY + (toY - fromY) * t;

            ctx.fillStyle = COLORS.primary;
            ctx.beginPath();
            ctx.arc(px, py, 3, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      }
    }

    // Draw nodes
    for (let l = 0; l < this.layers.length; l++) {
      const x = layerSpacing * (l + 1);
      const spacing = this.height / (this.layers[l] + 1);

      // Determine node color based on layer type
      let nodeColor: string;
      if (l === 0) {
        nodeColor = COLORS.nodeInput;
      } else if (l === this.layers.length - 1) {
        nodeColor = COLORS.nodeOutput;
      } else {
        nodeColor = COLORS.nodeHidden;
      }

      for (let i = 0; i < this.layers[l]; i++) {
        const y = spacing * (i + 1);
        const activation = this.activations[l][i];

        // Outer glow based on activation
        ctx.shadowColor = nodeColor;
        ctx.shadowBlur = 10 + activation * 20;

        // Node circle
        ctx.fillStyle = nodeColor;
        ctx.beginPath();
        ctx.arc(x, y, 20, 0, Math.PI * 2);
        ctx.fill();

        // Inner fill based on activation
        ctx.fillStyle = `rgba(255, 255, 255, ${activation * 0.8})`;
        ctx.beginPath();
        ctx.arc(x, y, 15 * activation, 0, Math.PI * 2);
        ctx.fill();

        ctx.shadowBlur = 0;

        // Activation value
        ctx.fillStyle = COLORS.text;
        ctx.font = '12px "Fira Code", monospace';
        ctx.textAlign = 'center';
        ctx.fillText(activation.toFixed(2), x, y + 35);

        // Layer label
        if (i === 0) {
          ctx.fillStyle = COLORS.textMuted;
          ctx.font = '11px Arial';
          let label = '';
          if (l === 0) label = 'Input';
          else if (l === this.layers.length - 1) label = 'Output';
          else label = `Hidden ${l}`;
          ctx.fillText(label, x, 25);
        }
      }
    }
  }

  /**
   * Draw weight information panel
   */
  private drawWeightPanel(): void {
    const ctx = this.ctx;
    const panelX = 10;
    const panelY = 10;
    const panelW = 200;
    const panelH = 180;

    // Panel background
    ctx.fillStyle = 'rgba(26, 26, 26, 0.9)';
    ctx.fillRect(panelX, panelY, panelW, panelH);
    ctx.strokeStyle = COLORS.primary;
    ctx.lineWidth = 1;
    ctx.strokeRect(panelX, panelY, panelW, panelH);

    // Title
    ctx.fillStyle = COLORS.primary;
    ctx.font = 'bold 14px Arial';
    ctx.textAlign = 'left';
    ctx.fillText('Dodecet-Encoded Weights', panelX + 10, panelY + 25);

    // Sample weights
    ctx.font = '11px "Fira Code", monospace';
    ctx.fillStyle = COLORS.text;

    const lines: string[] = [];
    lines.push('Layer 0 -> 1:');

    for (let i = 0; i < Math.min(3, this.layers[0]); i++) {
      for (let j = 0; j < Math.min(2, this.layers[1]); j++) {
        const hex = this.weights[0][i][j].toHexString();
        const val = this.decodeWeight(this.weights[0][i][j]);
        lines.push(`  w[${i}][${j}]: ${hex} = ${val.toFixed(3)}`);
      }
    }

    lines.push('');
    lines.push('Biases (Layer 1):');
    for (let j = 0; j < Math.min(2, this.layers[1]); j++) {
      const hex = this.biases[0][j].toHexString();
      const val = this.decodeWeight(this.biases[0][j]);
      lines.push(`  b[${j}]: ${hex} = ${val.toFixed(3)}`);
    }

    lines.forEach((line, i) => {
      ctx.fillText(line, panelX + 10, panelY + 45 + i * 14);
    });
  }

  /**
   * Draw output panel
   */
  private drawOutputPanel(): void {
    const ctx = this.ctx;
    const panelX = this.width - 180;
    const panelY = 10;
    const panelW = 170;
    const panelH = 120;

    // Panel background
    ctx.fillStyle = 'rgba(26, 26, 26, 0.9)';
    ctx.fillRect(panelX, panelY, panelW, panelH);
    ctx.strokeStyle = COLORS.success;
    ctx.lineWidth = 1;
    ctx.strokeRect(panelX, panelY, panelW, panelH);

    // Title
    ctx.fillStyle = COLORS.success;
    ctx.font = 'bold 14px Arial';
    ctx.textAlign = 'left';
    ctx.fillText('Network Output', panelX + 10, panelY + 25);

    // Input values
    ctx.font = '12px "Fira Code", monospace';
    ctx.fillStyle = COLORS.text;
    ctx.fillText(`Input: [${this.currentInput.map(v => v.toFixed(2)).join(', ')}]`, panelX + 10, panelY + 50);

    // Output value
    const output = this.activations[this.layers.length - 1][0];
    ctx.fillText(`Output: ${output.toFixed(4)}`, panelX + 10, panelY + 70);

    // Encoded output
    const encodedOutput = new Dodecet(Math.round(output * 4095) & 0xFFF);
    ctx.fillText(`Encoded: 0x${encodedOutput.toHexString()}`, panelX + 10, panelY + 90);

    // FPS
    ctx.fillStyle = COLORS.textMuted;
    ctx.fillText(`FPS: ${this.fps.toFixed(0)}`, panelX + 10, panelY + 110);
  }

  /**
   * Main render function
   */
  render(): void {
    const ctx = this.ctx;

    // Clear canvas
    ctx.fillStyle = COLORS.background;
    ctx.fillRect(0, 0, this.width, this.height);

    // Draw components
    this.drawNetwork();
    this.drawWeightPanel();
    this.drawOutputPanel();

    // Update FPS
    this.frameCount++;
    const now = performance.now();
    if (now - this.lastFpsUpdate > 1000) {
      this.fps = this.frameCount * 1000 / (now - this.lastFpsUpdate);
      this.frameCount = 0;
      this.lastFpsUpdate = now;
    }

    this.time += 0.016;
  }

  /**
   * Start animation
   */
  startAnimation(): void {
    this.animatingForward = true;
    this.forwardPass();

    const animate = () => {
      this.render();
      this.animationId = requestAnimationFrame(animate);
    };
    animate();
  }

  /**
   * Stop animation
   */
  stopAnimation(): void {
    this.animatingForward = false;
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
  }

  /**
   * Set input values
   */
  setInput(values: number[]): void {
    this.currentInput = values;
    this.forwardPass();
    this.render();
  }

  /**
   * Get network output
   */
  getOutput(): number[] {
    return this.activations[this.layers.length - 1];
  }
}

// ===================================
// GRADIENT DESCENT VISUALIZATION
// ===================================

/**
 * Visualizes gradient descent optimization on a 2D loss surface.
 * Shows the optimization path with dodecet-encoded positions.
 */
export class GradientDescentVisualizer {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private width: number;
  private height: number;
  private animationId: number | null = null;

  // Loss function (bowl-shaped)
  private lossFn = (x: number, y: number) => {
    // Rosenbrock-like function
    return (1 - x) ** 2 + 100 * (y - x ** 2) ** 2;
  };

  // Current position
  private position: { x: number; y: number } = { x: -1.5, y: -1.5 };
  private path: Array<{ x: number; y: number; loss: number }> = [];

  // Optimization parameters
  private learningRate: number = 0.001;
  private momentum: number = 0.9;
  private velocity: { x: number; y: number } = { x: 0, y: 0 };

  // Viewport
  private xRange = { min: -2, max: 2 };
  private yRange = { min: -2, max: 2 };

  // Animation state
  private running: boolean = false;
  private iterations: number = 0;
  private time: number = 0;

  // Performance
  private fps: number = 60;
  private frameCount: number = 0;
  private lastFpsUpdate: number = 0;

  constructor(canvasId: string) {
    this.canvas = document.getElementById(canvasId) as HTMLCanvasElement;
    this.ctx = this.canvas.getContext('2d')!;
    this.width = this.canvas.width;
    this.height = this.canvas.height;

    this.reset();
    this.setupInteraction();
  }

  /**
   * Reset optimization
   */
  reset(): void {
    this.position = {
      x: -1.5 + Math.random() * 0.5,
      y: -1.5 + Math.random() * 0.5
    };
    this.path = [{ ...this.position, loss: this.lossFn(this.position.x, this.position.y) }];
    this.velocity = { x: 0, y: 0 };
    this.iterations = 0;
  }

  /**
   * Setup mouse interaction
   */
  private setupInteraction(): void {
    this.canvas.addEventListener('click', (e) => {
      const rect = this.canvas.getBoundingClientRect();
      const px = e.clientX - rect.left;
      const py = e.clientY - rect.top;

      // Convert to math coordinates
      const x = this.xRange.min + (px / this.width) * (this.xRange.max - this.xRange.min);
      const y = this.yRange.max - (py / this.height) * (this.yRange.max - this.yRange.min);

      this.position = { x, y };
      this.path = [{ ...this.position, loss: this.lossFn(x, y) }];
      this.velocity = { x: 0, y: 0 };
      this.iterations = 0;
      this.render();
    });
  }

  /**
   * Convert math coordinates to canvas
   */
  private toCanvas(x: number, y: number): [number, number] {
    const px = ((x - this.xRange.min) / (this.xRange.max - this.xRange.min)) * this.width;
    const py = this.height - ((y - this.yRange.min) / (this.yRange.max - this.yRange.min)) * this.height;
    return [px, py];
  }

  /**
   * Compute numerical gradient
   */
  private computeGradient(x: number, y: number): { dx: number; dy: number } {
    const h = 0.0001;
    const dx = (this.lossFn(x + h, y) - this.lossFn(x - h, y)) / (2 * h);
    const dy = (this.lossFn(x, y + h) - this.lossFn(x, y - h)) / (2 * h);
    return { dx, dy };
  }

  /**
   * Perform one optimization step
   */
  step(): void {
    const grad = this.computeGradient(this.position.x, this.position.y);

    // Momentum update
    this.velocity.x = this.momentum * this.velocity.x - this.learningRate * grad.dx;
    this.velocity.y = this.momentum * this.velocity.y - this.learningRate * grad.dy;

    this.position.x += this.velocity.x;
    this.position.y += this.velocity.y;

    // Clamp to bounds
    this.position.x = Math.max(this.xRange.min, Math.min(this.xRange.max, this.position.x));
    this.position.y = Math.max(this.yRange.min, Math.min(this.yRange.max, this.position.y));

    this.path.push({
      ...this.position,
      loss: this.lossFn(this.position.x, this.position.y)
    });

    // Keep path reasonable size
    if (this.path.length > 500) {
      this.path.shift();
    }

    this.iterations++;
  }

  /**
   * Draw loss surface contour
   */
  private drawContour(): void {
    const ctx = this.ctx;
    const resolution = 60;

    // Find loss range
    let minLoss = Infinity;
    let maxLoss = -Infinity;
    for (let i = 0; i <= resolution; i++) {
      for (let j = 0; j <= resolution; j++) {
        const x = this.xRange.min + (i / resolution) * (this.xRange.max - this.xRange.min);
        const y = this.yRange.min + (j / resolution) * (this.yRange.max - this.yRange.min);
        const loss = this.lossFn(x, y);
        minLoss = Math.min(minLoss, loss);
        maxLoss = Math.max(maxLoss, loss);
      }
    }

    // Draw contours
    const levels = [0.1, 0.5, 1, 2, 5, 10, 20, 50, 100, 200];
    ctx.lineWidth = 1;

    levels.forEach((level, levelIdx) => {
      const normalized = levelIdx / levels.length;
      const r = Math.floor(normalized * 100);
      const g = Math.floor(100 - normalized * 50);
      const b = Math.floor(200 + normalized * 55);
      ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, 0.5)`;

      // Simple marching squares approximation
      for (let i = 0; i < resolution; i++) {
        for (let j = 0; j < resolution; j++) {
          const x0 = this.xRange.min + (i / resolution) * (this.xRange.max - this.xRange.min);
          const y0 = this.yRange.min + (j / resolution) * (this.yRange.max - this.yRange.min);
          const x1 = this.xRange.min + ((i + 1) / resolution) * (this.xRange.max - this.xRange.min);
          const y1 = this.yRange.min + ((j + 1) / resolution) * (this.yRange.max - this.yRange.min);

          const v00 = this.lossFn(x0, y0) > level ? 1 : 0;
          const v10 = this.lossFn(x1, y0) > level ? 1 : 0;
          const v01 = this.lossFn(x0, y1) > level ? 1 : 0;
          const v11 = this.lossFn(x1, y1) > level ? 1 : 0;

          const sum = v00 + v10 + v01 + v11;
          if (sum > 0 && sum < 4) {
            const [px, py] = this.toCanvas((x0 + x1) / 2, (y0 + y1) / 2);
            ctx.beginPath();
            ctx.arc(px, py, 2, 0, Math.PI * 2);
            ctx.stroke();
          }
        }
      }
    });
  }

  /**
   * Draw optimization path
   */
  private drawPath(): void {
    const ctx = this.ctx;

    if (this.path.length < 2) return;

    // Draw path
    ctx.beginPath();
    const [startX, startY] = this.toCanvas(this.path[0].x, this.path[0].y);
    ctx.moveTo(startX, startY);

    for (let i = 1; i < this.path.length; i++) {
      const [px, py] = this.toCanvas(this.path[i].x, this.path[i].y);

      // Gradient color from red to green
      const t = i / this.path.length;
      ctx.strokeStyle = `rgba(${255 * (1 - t)}, ${255 * t}, 0, 0.8)`;
      ctx.lineWidth = 2;

      ctx.lineTo(px, py);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(px, py);
    }

    // Draw current position
    const [cx, cy] = this.toCanvas(this.position.x, this.position.y);

    // Glow effect
    ctx.shadowColor = COLORS.gradient;
    ctx.shadowBlur = 20;

    ctx.fillStyle = COLORS.gradient;
    ctx.beginPath();
    ctx.arc(cx, cy, 10, 0, Math.PI * 2);
    ctx.fill();

    ctx.shadowBlur = 0;

    // Inner dot
    ctx.fillStyle = COLORS.text;
    ctx.beginPath();
    ctx.arc(cx, cy, 4, 0, Math.PI * 2);
    ctx.fill();

    // Draw gradient vector
    const grad = this.computeGradient(this.position.x, this.position.y);
    const gradMag = Math.sqrt(grad.dx ** 2 + grad.dy ** 2);
    const arrowLen = Math.min(50, gradMag * 0.1);

    if (gradMag > 0.001) {
      const arrowX = cx - (grad.dx / gradMag) * arrowLen;
      const arrowY = cy + (grad.dy / gradMag) * arrowLen;

      ctx.strokeStyle = COLORS.error;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(arrowX, arrowY);
      ctx.stroke();

      // Arrowhead
      const angle = Math.atan2(arrowY - cy, arrowX - cx);
      ctx.beginPath();
      ctx.moveTo(arrowX, arrowY);
      ctx.lineTo(arrowX - 8 * Math.cos(angle - 0.4), arrowY - 8 * Math.sin(angle - 0.4));
      ctx.lineTo(arrowX - 8 * Math.cos(angle + 0.4), arrowY - 8 * Math.sin(angle + 0.4));
      ctx.closePath();
      ctx.fillStyle = COLORS.error;
      ctx.fill();
    }
  }

  /**
   * Draw info panel
   */
  private drawInfo(): void {
    const ctx = this.ctx;
    const panelX = 10;
    const panelY = 10;
    const panelW = 250;
    const panelH = 180;

    // Panel background
    ctx.fillStyle = 'rgba(26, 26, 26, 0.9)';
    ctx.fillRect(panelX, panelY, panelW, panelH);
    ctx.strokeStyle = COLORS.gradient;
    ctx.lineWidth = 1;
    ctx.strokeRect(panelX, panelY, panelW, panelH);

    // Title
    ctx.fillStyle = COLORS.gradient;
    ctx.font = 'bold 14px Arial';
    ctx.textAlign = 'left';
    ctx.fillText('Gradient Descent (Momentum)', panelX + 10, panelY + 25);

    // Current state
    ctx.font = '12px "Fira Code", monospace';
    ctx.fillStyle = COLORS.text;

    const currentLoss = this.lossFn(this.position.x, this.position.y);
    const encodedX = new Dodecet(Math.round((this.position.x + 2) / 4 * 4095) & 0xFFF);
    const encodedY = new Dodecet(Math.round((this.position.y + 2) / 4 * 4095) & 0xFFF);

    const lines = [
      `Position: (${this.position.x.toFixed(4)}, ${this.position.y.toFixed(4)})`,
      `Encoded: (0x${encodedX.toHexString()}, 0x${encodedY.toHexString()})`,
      `Loss: ${currentLoss.toFixed(6)}`,
      `Iterations: ${this.iterations}`,
      `Learning Rate: ${this.learningRate}`,
      `Momentum: ${this.momentum}`,
      `FPS: ${this.fps.toFixed(0)}`
    ];

    lines.forEach((line, i) => {
      ctx.fillText(line, panelX + 10, panelY + 50 + i * 18);
    });

    // Instructions
    ctx.fillStyle = COLORS.textMuted;
    ctx.font = '10px Arial';
    ctx.fillText('Click to set starting point', panelX + 10, panelY + panelH - 10);
  }

  /**
   * Draw minimum marker
   */
  private drawMinimum(): void {
    const ctx = this.ctx;

    // Rosenbrock minimum is at (1, 1)
    const [mx, my] = this.toCanvas(1, 1);

    ctx.strokeStyle = COLORS.success;
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);

    // Crosshair
    ctx.beginPath();
    ctx.moveTo(mx - 15, my);
    ctx.lineTo(mx + 15, my);
    ctx.moveTo(mx, my - 15);
    ctx.lineTo(mx, my + 15);
    ctx.stroke();

    ctx.setLineDash([]);

    // Label
    ctx.fillStyle = COLORS.success;
    ctx.font = '11px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Minimum (1, 1)', mx, my + 30);
  }

  /**
   * Main render
   */
  render(): void {
    const ctx = this.ctx;

    // Clear canvas
    ctx.fillStyle = COLORS.background;
    ctx.fillRect(0, 0, this.width, this.height);

    // Draw components
    this.drawContour();
    this.drawMinimum();
    this.drawPath();
    this.drawInfo();

    // Update FPS
    this.frameCount++;
    const now = performance.now();
    if (now - this.lastFpsUpdate > 1000) {
      this.fps = this.frameCount * 1000 / (now - this.lastFpsUpdate);
      this.frameCount = 0;
      this.lastFpsUpdate = now;
    }
  }

  /**
   * Start optimization animation
   */
  startAnimation(): void {
    this.running = true;

    const animate = () => {
      if (this.running) {
        this.step();
      }
      this.render();
      this.animationId = requestAnimationFrame(animate);
    };
    animate();
  }

  /**
   * Stop animation
   */
  stopAnimation(): void {
    this.running = false;
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
  }

  /**
   * Toggle running state
   */
  toggle(): void {
    this.running = !this.running;
  }

  /**
   * Set learning rate
   */
  setLearningRate(lr: number): void {
    this.learningRate = lr;
  }
}

// ===================================
// FEATURE MAP VISUALIZATION
// ===================================

/**
 * Visualizes feature embeddings in 2D space using dodecet encoding.
 * Shows clustering, nearest neighbors, and similarity metrics.
 */
export class FeatureMapVisualizer {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private width: number;
  private height: number;
  private animationId: number | null = null;

  // Feature points
  private points: Array<{
    x: number;
    y: number;
    label: string;
    cluster: number;
    dodecetX: Dodecet;
    dodecetY: Dodecet;
  }> = [];

  // Selected point
  private selectedPoint: number | null = null;

  // Viewport
  private xRange = { min: 0, max: 1 };
  private yRange = { min: 0, max: 1 };

  // Animation
  private time: number = 0;

  // Performance
  private fps: number = 60;
  private frameCount: number = 0;
  private lastFpsUpdate: number = 0;

  constructor(canvasId: string) {
    this.canvas = document.getElementById(canvasId) as HTMLCanvasElement;
    this.ctx = this.canvas.getContext('2d')!;
    this.width = this.canvas.width;
    this.height = this.canvas.height;

    this.generateSampleData();
    this.setupInteraction();
  }

  /**
   * Generate sample feature embeddings
   */
  private generateSampleData(): void {
    const labels = ['cat', 'dog', 'bird', 'fish', 'tree', 'flower', 'car', 'house'];
    const clusters = [0, 0, 1, 1, 2, 2, 3, 3];
    const clusterColors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4'];

    this.points = [];

    for (let i = 0; i < labels.length; i++) {
      // Create clustered points
      const clusterCenterX = (clusters[i] % 2) * 0.4 + 0.3;
      const clusterCenterY = Math.floor(clusters[i] / 2) * 0.4 + 0.3;

      const x = clusterCenterX + (Math.random() - 0.5) * 0.3;
      const y = clusterCenterY + (Math.random() - 0.5) * 0.3;

      this.points.push({
        x,
        y,
        label: labels[i],
        cluster: clusters[i],
        dodecetX: new Dodecet(Math.round(x * 4095) & 0xFFF),
        dodecetY: new Dodecet(Math.round(y * 4095) & 0xFFF)
      });
    }

    // Add more points for density
    for (let i = 0; i < 20; i++) {
      const clusterIdx = Math.floor(Math.random() * 4);
      const clusterCenterX = (clusterIdx % 2) * 0.4 + 0.3;
      const clusterCenterY = Math.floor(clusterIdx / 2) * 0.4 + 0.3;

      const x = clusterCenterX + (Math.random() - 0.5) * 0.25;
      const y = clusterCenterY + (Math.random() - 0.5) * 0.25;

      this.points.push({
        x,
        y,
        label: `sample_${i}`,
        cluster: clusterIdx,
        dodecetX: new Dodecet(Math.round(x * 4095) & 0xFFF),
        dodecetY: new Dodecet(Math.round(y * 4095) & 0xFFF)
      });
    }
  }

  /**
   * Setup mouse interaction
   */
  private setupInteraction(): void {
    this.canvas.addEventListener('mousemove', (e) => {
      const rect = this.canvas.getBoundingClientRect();
      const px = e.clientX - rect.left;
      const py = e.clientY - rect.top;

      // Find nearest point
      let minDist = Infinity;
      let nearest = -1;

      this.points.forEach((p, i) => {
        const [cx, cy] = this.toCanvas(p.x, p.y);
        const dist = Math.sqrt((px - cx) ** 2 + (py - cy) ** 2);
        if (dist < minDist && dist < 30) {
          minDist = dist;
          nearest = i;
        }
      });

      this.selectedPoint = nearest >= 0 ? nearest : null;
      this.render();
    });
  }

  /**
   * Convert to canvas coordinates
   */
  private toCanvas(x: number, y: number): [number, number] {
    const px = ((x - this.xRange.min) / (this.xRange.max - this.xRange.min)) * this.width;
    const py = this.height - ((y - this.yRange.min) / (this.yRange.max - this.yRange.min)) * this.height;
    return [px, py];
  }

  /**
   * Calculate cosine similarity between two points
   */
  private cosineSimilarity(i: number, j: number): number {
    const p1 = this.points[i];
    const p2 = this.points[j];
    const dot = p1.x * p2.x + p1.y * p2.y;
    const mag1 = Math.sqrt(p1.x ** 2 + p1.y ** 2);
    const mag2 = Math.sqrt(p2.x ** 2 + p2.y ** 2);
    return dot / (mag1 * mag2 + 0.0001);
  }

  /**
   * Find k nearest neighbors
   */
  private findNeighbors(pointIdx: number, k: number): number[] {
    const distances: Array<{ idx: number; dist: number }> = [];

    this.points.forEach((p, i) => {
      if (i !== pointIdx) {
        const dist = Math.sqrt(
          (this.points[pointIdx].x - p.x) ** 2 +
          (this.points[pointIdx].y - p.y) ** 2
        );
        distances.push({ idx: i, dist });
      }
    });

    return distances
      .sort((a, b) => a.dist - b.dist)
      .slice(0, k)
      .map(d => d.idx);
  }

  /**
   * Draw feature points
   */
  private drawPoints(): void {
    const ctx = this.ctx;
    const clusterColors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4'];

    // Draw connections to neighbors if point selected
    if (this.selectedPoint !== null) {
      const neighbors = this.findNeighbors(this.selectedPoint, 3);

      neighbors.forEach(nIdx => {
        const p1 = this.points[this.selectedPoint!];
        const p2 = this.points[nIdx];
        const [x1, y1] = this.toCanvas(p1.x, p1.y);
        const [x2, y2] = this.toCanvas(p2.x, p2.y);

        ctx.strokeStyle = 'rgba(255, 215, 0, 0.5)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
      });
    }

    // Draw points
    this.points.forEach((p, i) => {
      const [cx, cy] = this.toCanvas(p.x, p.y);
      const isSelected = i === this.selectedPoint;
      const isNeighbor = this.selectedPoint !== null && this.findNeighbors(this.selectedPoint, 3).includes(i);

      // Glow for selected
      if (isSelected) {
        ctx.shadowColor = COLORS.primary;
        ctx.shadowBlur = 20;
      }

      // Point color
      ctx.fillStyle = clusterColors[p.cluster % clusterColors.length];
      ctx.beginPath();
      ctx.arc(cx, cy, isSelected ? 12 : isNeighbor ? 8 : 6, 0, Math.PI * 2);
      ctx.fill();

      ctx.shadowBlur = 0;

      // Label for main points
      if (i < 8) {
        ctx.fillStyle = COLORS.text;
        ctx.font = '10px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(p.label, cx, cy - 15);
      }
    });
  }

  /**
   * Draw info panel
   */
  private drawInfo(): void {
    const ctx = this.ctx;
    const panelX = 10;
    const panelY = 10;
    const panelW = 280;
    const panelH = this.selectedPoint !== null ? 200 : 100;

    // Panel background
    ctx.fillStyle = 'rgba(26, 26, 26, 0.9)';
    ctx.fillRect(panelX, panelY, panelW, panelH);
    ctx.strokeStyle = COLORS.primary;
    ctx.lineWidth = 1;
    ctx.strokeRect(panelX, panelY, panelW, panelH);

    // Title
    ctx.fillStyle = COLORS.primary;
    ctx.font = 'bold 14px Arial';
    ctx.textAlign = 'left';
    ctx.fillText('Feature Map (Dodecet-Encoded)', panelX + 10, panelY + 25);

    ctx.font = '12px "Fira Code", monospace';
    ctx.fillStyle = COLORS.text;

    if (this.selectedPoint !== null) {
      const p = this.points[this.selectedPoint];
      const neighbors = this.findNeighbors(this.selectedPoint, 3);

      const lines = [
        `Selected: ${p.label}`,
        `Position: (${p.x.toFixed(4)}, ${p.y.toFixed(4)})`,
        `Dodecet: (0x${p.dodecetX.toHexString()}, 0x${p.dodecetY.toHexString()})`,
        `Cluster: ${p.cluster}`,
        '',
        'Nearest Neighbors:'
      ];

      neighbors.forEach((n, i) => {
        const np = this.points[n];
        const sim = this.cosineSimilarity(this.selectedPoint!, n);
        lines.push(`  ${i + 1}. ${np.label} (sim: ${sim.toFixed(3)})`);
      });

      lines.push('', `FPS: ${this.fps.toFixed(0)}`);

      lines.forEach((line, i) => {
        ctx.fillText(line, panelX + 10, panelY + 50 + i * 16);
      });
    } else {
      ctx.fillText('Hover over points to see details', panelX + 10, panelY + 50);
      ctx.fillText(`Total points: ${this.points.length}`, panelX + 10, panelY + 70);
      ctx.fillText(`FPS: ${this.fps.toFixed(0)}`, panelX + 10, panelY + 90);
    }
  }

  /**
   * Draw cluster legend
   */
  private drawLegend(): void {
    const ctx = this.ctx;
    const clusterColors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4'];
    const clusterNames = ['Animals', 'Plants', 'Objects', 'Mixed'];

    const legendX = this.width - 120;
    const legendY = 10;

    ctx.fillStyle = 'rgba(26, 26, 26, 0.9)';
    ctx.fillRect(legendX, legendY, 110, 100);
    ctx.strokeStyle = COLORS.textMuted;
    ctx.strokeRect(legendX, legendY, 110, 100);

    ctx.fillStyle = COLORS.text;
    ctx.font = 'bold 12px Arial';
    ctx.textAlign = 'left';
    ctx.fillText('Clusters', legendX + 10, legendY + 20);

    clusterNames.forEach((name, i) => {
      ctx.fillStyle = clusterColors[i];
      ctx.beginPath();
      ctx.arc(legendX + 20, legendY + 40 + i * 15, 5, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = COLORS.text;
      ctx.font = '11px Arial';
      ctx.fillText(name, legendX + 35, legendY + 44 + i * 15);
    });
  }

  /**
   * Main render
   */
  render(): void {
    const ctx = this.ctx;

    // Clear canvas
    ctx.fillStyle = COLORS.background;
    ctx.fillRect(0, 0, this.width, this.height);

    // Draw components
    this.drawPoints();
    this.drawInfo();
    this.drawLegend();

    // Update FPS
    this.frameCount++;
    const now = performance.now();
    if (now - this.lastFpsUpdate > 1000) {
      this.fps = this.frameCount * 1000 / (now - this.lastFpsUpdate);
      this.frameCount = 0;
      this.lastFpsUpdate = now;
    }

    this.time += 0.016;
  }

  /**
   * Start animation
   */
  startAnimation(): void {
    const animate = () => {
      this.render();
      this.animationId = requestAnimationFrame(animate);
    };
    animate();
  }

  /**
   * Stop animation
   */
  stopAnimation(): void {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
  }

  /**
   * Add custom point
   */
  addPoint(x: number, y: number, label: string, cluster: number): void {
    this.points.push({
      x,
      y,
      label,
      cluster,
      dodecetX: new Dodecet(Math.round(x * 4095) & 0xFFF),
      dodecetY: new Dodecet(Math.round(y * 4095) & 0xFFF)
    });
    this.render();
  }
}

// ===================================
// UNIFIED ML DEMO
// ===================================

export class MLDemo {
  private nnViz: NeuralNetworkVisualizer;
  private gdViz: GradientDescentVisualizer;
  private fmViz: FeatureMapVisualizer;

  constructor(
    nnCanvasId: string,
    gdCanvasId: string,
    fmCanvasId: string
  ) {
    this.nnViz = new NeuralNetworkVisualizer(nnCanvasId);
    this.gdViz = new GradientDescentVisualizer(gdCanvasId);
    this.fmViz = new FeatureMapVisualizer(fmCanvasId);
  }

  start(): void {
    this.nnViz.startAnimation();
    this.gdViz.startAnimation();
    this.fmViz.startAnimation();
  }

  stop(): void {
    this.nnViz.stopAnimation();
    this.gdViz.stopAnimation();
    this.fmViz.stopAnimation();
  }

  getNNOutput(): number[] {
    return this.nnViz.getOutput();
  }

  resetGradientDescent(): void {
    this.gdViz.reset();
  }
}

// Export for global access
(window as any).NeuralNetworkVisualizer = NeuralNetworkVisualizer;
(window as any).GradientDescentVisualizer = GradientDescentVisualizer;
(window as any).FeatureMapVisualizer = FeatureMapVisualizer;
(window as any).MLDemo = MLDemo;
