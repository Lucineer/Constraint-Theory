/**
 * Interactive ML Tutorial System
 *
 * Step-by-step tutorials for understanding geometric ML concepts.
 * Each tutorial includes interactive visualizations and code examples.
 */

import { Dodecet, DodecetArray } from './dodecet';
import { DodecetVector3D } from './dodecet-geometric';

// ===================================
// TUTORIAL STEP INTERFACE
// ===================================

interface TutorialStep {
  id: string;
  title: string;
  description: string;
  codeExample: string;
  interactivePrompt?: string;
  validation?: (input: any) => boolean;
  hint?: string;
}

// ===================================
// TUTORIAL: DODECET ENCODING BASICS
// ===================================

export const dodecetBasicsTutorial: TutorialStep[] = [
  {
    id: 'intro',
    title: 'What is a Dodecet?',
    description: `A dodecet is a 12-bit value (0x000 to 0xFFF) that provides 4096 discrete states.
This is 16x more precision than 8-bit encoding (256 states).`,
    codeExample: `// Create a dodecet
const d = new Dodecet(0xABC);
console.log(d.toHexString());  // "ABC"
console.log(d.toNumber());     // 2748
console.log(d.normalize());    // 0.671...`,
    interactivePrompt: 'Try creating a dodecet with value 0x800',
    hint: 'new Dodecet(0x800)',
    validation: (input) => input === 0x800 || input === 2048
  },
  {
    id: 'encoding',
    title: 'Encoding Values',
    description: `To encode a value in range [-1, 1] as a dodecet:
1. Add 1 to shift to [0, 2]
2. Multiply by 2048 to get [0, 4096]
3. Clamp to 12 bits with & 0xFFF`,
    codeExample: `// Encode weight = 0.732
const weight = 0.732;
const encoded = new Dodecet(
  Math.round((weight + 1) * 2048) & 0xFFF
);
console.log(encoded.toHexString()); // "FDB"`,
    interactivePrompt: 'Encode the value -0.5 as a dodecet',
    hint: 'Math.round((-0.5 + 1) * 2048) & 0xFFF = 0x400',
    validation: (input) => input === 0x400 || input === 1024
  },
  {
    id: 'decoding',
    title: 'Decoding Values',
    description: `To decode a dodecet back to a value:
1. Get signed value with toSigned()
2. Divide by 2048 to normalize to [-1, 1]`,
    codeExample: `// Decode dodecet back to float
const d = new Dodecet(0x800);  // Center
const decoded = d.toSigned() / 2048;
console.log(decoded);  // 0.0`,
    interactivePrompt: 'What value does 0xFFF decode to?',
    hint: '0xFFF = 4095, signed = 2047, normalized = 0.999...',
    validation: (input) => Math.abs(input - 0.999) < 0.01
  },
  {
    id: 'precision',
    title: 'Precision Analysis',
    description: `Dodecet precision: 1/4096 ≈ 0.000244
8-bit precision: 1/256 ≈ 0.003906
16x improvement in precision!`,
    codeExample: `// Compare precisions
const value = 0.732;

// 12-bit encoding
const dodecet = Math.round((value + 1) * 2048) / 2048 - 1;
const dodecetError = Math.abs(value - dodecet);
// Error: 0.000244

// 8-bit encoding
const eightBit = Math.round((value + 1) * 128) / 128 - 1;
const eightBitError = Math.abs(value - eightBit);
// Error: 0.005`,
    interactivePrompt: 'What is the maximum error for 12-bit encoding?',
    hint: 'Half of the step size: 0.5 * (1/2048) ≈ 0.000244',
    validation: (input) => Math.abs(input - 0.000244) < 0.0001
  }
];

// ===================================
// TUTORIAL: VECTOR QUANTIZATION
// ===================================

export const vectorQuantizationTutorial: TutorialStep[] = [
  {
    id: 'intro',
    title: 'What is Vector Quantization?',
    description: `Vector quantization maps continuous vectors to discrete codebook vectors.
This reduces storage and enables fast approximate nearest neighbor search.`,
    codeExample: `// Continuous embedding
const embedding = [0.732, 0.643];

// Quantized to codebook index
const codebookIndex = quantize(embedding);
// Now we only need to store the index!`,
    interactivePrompt: 'Why would we quantize embeddings?'
  },
  {
    id: 'pythagorean',
    title: 'Pythagorean Manifold Quantization',
    description: `Instead of a fixed grid, we quantize to Pythagorean triples.
This ensures exact arithmetic with zero floating-point error for certain values.`,
    codeExample: `// Pythagorean triple (3,4,5)
// Direction: (0.6, 0.8)
const vec = [0.6, 0.8];
const (snapped, noise) = manifold.snap(vec);
// noise ≈ 0 because (0.6, 0.8) is exact`,
    interactivePrompt: 'What is special about (0.6, 0.8)?'
  },
  {
    id: 'benefits',
    title: 'Benefits of Geometric Quantization',
    description: `1. Deterministic: Same input always produces same output
2. Exact arithmetic for Pythagorean values
3. O(log n) lookup with KD-tree
4. 12-bit storage per dimension`,
    codeExample: `// Storage comparison
// Float32: 32 bits per dimension
// Dodecet: 12 bits per dimension
// Savings: 62.5% reduction per dimension`,
    interactivePrompt: 'What is the storage savings for 2D?'
  },
  {
    id: 'limitations',
    title: 'Limitations',
    description: `1. Currently 2D only (higher dimensions require extension)
2. Quantization error for non-Pythagorean values
3. Not a replacement for production quantization (PQ, OPQ)
4. Not validated on real ML workloads`,
    codeExample: `// This is a demonstration, not production code
// Always benchmark against your actual use case`,
    interactivePrompt: 'What should you do before using in production?'
  }
];

// ===================================
// TUTORIAL: GRADIENT DESCENT
// ===================================

export const gradientDescentTutorial: TutorialStep[] = [
  {
    id: 'intro',
    title: 'What is Gradient Descent?',
    description: `Gradient descent is an optimization algorithm that finds the minimum
of a function by iteratively moving in the direction of steepest descent.`,
    codeExample: `// Loss function: f(x, y) = (1-x)^2 + 100(y-x^2)^2
// Gradient: [df/dx, df/dy]
// Update: x = x - learning_rate * df/dx`,
    interactivePrompt: 'What does the learning rate control?'
  },
  {
    id: 'momentum',
    title: 'Momentum',
    description: `Momentum accelerates convergence by accumulating velocity:
v = momentum * v - learning_rate * gradient
x = x + v`,
    codeExample: `// With momentum
let velocity = { x: 0, y: 0 };
const momentum = 0.9;

velocity.x = momentum * velocity.x - lr * grad.dx;
velocity.y = momentum * velocity.y - lr * grad.dy;

position.x += velocity.x;
position.y += velocity.y;`,
    interactivePrompt: 'What is a typical momentum value?'
  },
  {
    id: 'encoding',
    title: 'Encoding Positions',
    description: `We encode optimization positions as dodecets:
- Position (x, y) -> (dodecet_x, dodecet_y)
- This enables exact storage and comparison`,
    codeExample: `// Encode position
const encX = new Dodecet(
  Math.round((x + 2) / 4 * 4095) & 0xFFF
);
const encY = new Dodecet(
  Math.round((y + 2) / 4 * 4095) & 0xFFF
);

// Decode position
const decX = encX.normalize() * 4 - 2;
const decY = encY.normalize() * 4 - 2;`,
    interactivePrompt: 'Why do we add 2 before encoding?'
  },
  {
    id: 'rosenbrock',
    title: 'The Rosenbrock Function',
    description: `A classic optimization test function with a narrow curved valley.
Global minimum at (1, 1) with value 0.
Challenging because the gradient doesn't point directly to the minimum.`,
    codeExample: `const rosenbrock = (x, y) => {
  return (1 - x) ** 2 + 100 * (y - x ** 2) ** 2;
};

// Gradient
const dfdx = -2 * (1 - x) - 400 * x * (y - x ** 2);
const dfdy = 200 * (y - x ** 2);`,
    interactivePrompt: 'Where is the global minimum?'
  }
];

// ===================================
// TUTORIAL: FEATURE EMBEDDINGS
// ===================================

export const featureEmbeddingsTutorial: TutorialStep[] = [
  {
    id: 'intro',
    title: 'What are Feature Embeddings?',
    description: `Feature embeddings map high-dimensional data to low-dimensional vectors
where similar items are close together.`,
    codeExample: `// Word embeddings
"cat" -> [0.2, 0.8, ...]
"dog" -> [0.25, 0.75, ...]  // Similar to cat
"car" -> [0.9, 0.1, ...]    // Different`,
    interactivePrompt: 'Why do similar words have similar embeddings?'
  },
  {
    id: 'encoding',
    title: 'Encoding Embeddings',
    description: `We can encode 2D embeddings as dodecet pairs:
- Each dimension uses 12 bits
- Total: 24 bits per point (vs 64 bits for float32)`,
    codeExample: `interface EncodedPoint {
  x: Dodecet;  // 12 bits
  y: Dodecet;  // 12 bits
  label: string;
}

const point: EncodedPoint = {
  x: new Dodecet(Math.round(embedding[0] * 4095)),
  y: new Dodecet(Math.round(embedding[1] * 4095)),
  label: "cat"
};`,
    interactivePrompt: 'How many bits for a 2D point?'
  },
  {
    id: 'similarity',
    title: 'Cosine Similarity',
    description: `Cosine similarity measures the angle between vectors:
cos(θ) = (A · B) / (|A| * |B|)
Values range from -1 (opposite) to 1 (identical direction).`,
    codeExample: `function cosineSimilarity(p1, p2) {
  const dot = p1.x * p2.x + p1.y * p2.y;
  const mag1 = Math.sqrt(p1.x ** 2 + p1.y ** 2);
  const mag2 = Math.sqrt(p2.x ** 2 + p2.y ** 2);
  return dot / (mag1 * mag2);
}`,
    interactivePrompt: 'What is the cosine similarity of identical vectors?'
  },
  {
    id: 'neighbors',
    title: 'Nearest Neighbors',
    description: `Find k nearest neighbors using Euclidean distance:
d(A, B) = sqrt((Ax - Bx)^2 + (Ay - By)^2)`,
    codeExample: `function findNeighbors(points, query, k) {
  const distances = points.map((p, i) => ({
    idx: i,
    dist: Math.sqrt(
      (query.x - p.x) ** 2 +
      (query.y - p.y) ** 2
    )
  }));

  return distances
    .sort((a, b) => a.dist - b.dist)
    .slice(0, k);
}`,
    interactivePrompt: 'What is the time complexity for brute-force k-NN?'
  }
];

// ===================================
// TUTORIAL RUNNER
// ===================================

export class TutorialRunner {
  private currentStep: number = 0;
  private tutorial: TutorialStep[];
  private container: HTMLElement;
  private onComplete?: () => void;

  constructor(
    tutorial: TutorialStep[],
    containerId: string,
    onComplete?: () => void
  ) {
    this.tutorial = tutorial;
    this.container = document.getElementById(containerId)!;
    this.onComplete = onComplete;
  }

  render(): void {
    const step = this.tutorial[this.currentStep];

    this.container.innerHTML = `
      <div class="tutorial-step">
        <div class="tutorial-progress">
          Step ${this.currentStep + 1} of ${this.tutorial.length}
        </div>
        <h3>${step.title}</h3>
        <p class="description">${step.description}</p>
        <pre class="code-example">${step.codeExample}</pre>
        ${step.interactivePrompt ? `
          <div class="interactive">
            <p>${step.interactivePrompt}</p>
            ${step.hint ? `<p class="hint">Hint: ${step.hint}</p>` : ''}
          </div>
        ` : ''}
        <div class="navigation">
          <button onclick="tutorialRunner.prev()" ${this.currentStep === 0 ? 'disabled' : ''}>
            Previous
          </button>
          <span class="progress-dots">
            ${this.tutorial.map((_, i) =>
              `<span class="dot ${i === this.currentStep ? 'active' : i < this.currentStep ? 'completed' : ''}"></span>`
            ).join('')}
          </span>
          <button onclick="tutorialRunner.next()">
            ${this.currentStep === this.tutorial.length - 1 ? 'Complete' : 'Next'}
          </button>
        </div>
      </div>
    `;
  }

  next(): void {
    if (this.currentStep < this.tutorial.length - 1) {
      this.currentStep++;
      this.render();
    } else {
      this.onComplete?.();
    }
  }

  prev(): void {
    if (this.currentStep > 0) {
      this.currentStep--;
      this.render();
    }
  }

  goTo(stepIndex: number): void {
    if (stepIndex >= 0 && stepIndex < this.tutorial.length) {
      this.currentStep = stepIndex;
      this.render();
    }
  }

  getCurrentStep(): TutorialStep {
    return this.tutorial[this.currentStep];
  }
}

// Make globally accessible
(window as any).TutorialRunner = TutorialRunner;
(window as any).dodecetBasicsTutorial = dodecetBasicsTutorial;
(window as any).vectorQuantizationTutorial = vectorQuantizationTutorial;
(window as any).gradientDescentTutorial = gradientDescentTutorial;
(window as any).featureEmbeddingsTutorial = featureEmbeddingsTutorial;
