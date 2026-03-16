// ===================================
// PYTHAGOREAN MANIFOLD VISUALIZER
// ===================================
// Interactive demonstration of constraint theory's geometric approach
// Shows how vectors snap to Pythagorean triples with O(log n) complexity
// ===================================

class PythagoreanManifold {
    constructor(size) {
        this.size = size;
        this.points = [];
        this.triples = [];
        this.kdtree = null;
        this.generateManifold();
        this.buildKDTree();
    }

    // Generate Pythagorean triples
    generateManifold() {
        this.triples = [];
        this.points = [];

        // Generate primitive triples using Euclid's formula
        // m > n > 0, coprime, not both odd
        let count = 0;
        let m = 2;
        while (count < this.size) {
            for (let n = 1; n < m; n++) {
                if (count >= this.size) break;

                // Check if coprime
                if (this.gcd(m, n) !== 1) continue;

                // Check not both odd
                if ((m % 2 === 1) && (n % 2 === 1)) continue;

                // Generate triple
                const a = m * m - n * n;
                const b = 2 * m * n;
                const c = m * m + n * n;

                this.triples.push([a, b, c]);
                this.points.push([a / c, b / c]);
                count++;
            }
            m++;
        }
    }

    // Build KD-tree for O(log n) lookup
    buildKDTree() {
        this.kdtree = new KDTree(this.points);
    }

    // Find nearest Pythagorean triple
    snap(vec) {
        const start = performance.now();
        const [nearest, depth] = this.kdtree.nearest(vec);
        const end = performance.now();

        const triple = this.triples[this.points.indexOf(nearest)];
        const noise = Math.sqrt(
            Math.pow(vec[0] - nearest[0], 2) +
            Math.pow(vec[1] - nearest[1], 2)
        );

        return {
            snapped: nearest,
            triple: triple,
            noise: noise,
            depth: depth,
            time: (end - start) * 1000 // nanoseconds
        };
    }

    // Get all points
    getPoints() {
        return this.points;
    }

    // Get specific triple
    getTriple(point) {
        const idx = this.points.indexOf(point);
        return idx >= 0 ? this.triples[idx] : null;
    }

    // GCD for coprime check
    gcd(a, b) {
        while (b) {
            [a, b] = [b, a % b];
        }
        return a;
    }
}

// ===================================
// KD-TREE IMPLEMENTATION
// ===================================

class KDTree {
    constructor(points) {
        this.root = this.build(points, 0);
        this.searchDepth = 0;
    }

    build(points, depth) {
        if (points.length === 0) return null;

        const axis = depth % 2; // Alternate between x and y
        points.sort((a, b) => a[axis] - b[axis]);

        const mid = Math.floor(points.length / 2);
        const node = {
            point: points[mid],
            left: this.build(points.slice(0, mid), depth + 1),
            right: this.build(points.slice(mid + 1), depth + 1),
            axis: axis
        };

        return node;
    }

    nearest(target) {
        this.searchDepth = 0;
        const result = this.nearestHelper(this.root, target, null, Infinity, 0);
        return [result.point, this.searchDepth];
    }

    nearestHelper(node, target, best, bestDist, depth) {
        if (node === null) return { point: best, dist: bestDist };

        this.searchDepth = Math.max(this.searchDepth, depth);
        const axis = depth % 2;

        const dist = this.distance(node.point, target);
        if (dist < bestDist) {
            best = node.point;
            bestDist = dist;
        }

        const diff = target[axis] - node.point[axis];
        const near = diff < 0 ? node.left : node.right;
        const far = diff < 0 ? node.right : node.left;

        const result = this.nearestHelper(near, target, best, bestDist, depth + 1);
        best = result.point;
        bestDist = result.dist;

        if (diff * diff < bestDist) {
            const farResult = this.nearestHelper(far, target, best, bestDist, depth + 1);
            if (farResult.dist < bestDist) {
                best = farResult.point;
                bestDist = farResult.dist;
            }
        }

        return { point: best, dist: bestDist };
    }

    distance(a, b) {
        return Math.sqrt(
            Math.pow(a[0] - b[0], 2) +
            Math.pow(a[1] - b[1], 2)
        );
    }
}

// ===================================
// CANVAS RENDERER
// ===================================

class ManifoldRenderer {
    constructor(canvas, manifold) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.manifold = manifold;
        this.inputVector = null;
        this.snappedVector = null;
        this.snapping = false;
        this.animationProgress = 0;
        this.searchPath = [];

        this.setupCanvas();
        this.setupEvents();
    }

    setupCanvas() {
        const dpr = window.devicePixelRatio || 1;
        const rect = this.canvas.getBoundingClientRect();

        this.canvas.width = rect.width * dpr;
        this.canvas.height = rect.height * dpr;
        this.ctx.scale(dpr, dpr);

        this.width = rect.width;
        this.height = rect.height;
    }

    setupEvents() {
        this.canvas.addEventListener('mousemove', (e) => this.onMouseMove(e));
        this.canvas.addEventListener('mouseleave', () => this.onMouseLeave());
        this.canvas.addEventListener('touchmove', (e) => this.onTouchMove(e));
        window.addEventListener('resize', () => this.onResize());
    }

    onMouseMove(e) {
        const rect = this.canvas.getBoundingClientRect();
        const x = (e.clientX - rect.left) / this.width;
        const y = 1 - (e.clientY - rect.top) / this.height;

        this.inputVector = [x, y];
        this.triggerSnap();
    }

    onMouseLeave() {
        this.inputVector = null;
        this.snappedVector = null;
    }

    onTouchMove(e) {
        e.preventDefault();
        const touch = e.touches[0];
        const rect = this.canvas.getBoundingClientRect();
        const x = (touch.clientX - rect.left) / this.width;
        const y = 1 - (touch.clientY - rect.top) / this.height;

        this.inputVector = [x, y];
        this.triggerSnap();
    }

    onResize() {
        this.setupCanvas();
        this.render();
    }

    triggerSnap() {
        if (!this.inputVector) return;

        const result = this.manifold.snap(this.inputVector);
        this.snappedVector = result.snapped;
        this.snapResult = result;
        this.snapping = true;
        this.animationProgress = 0;
    }

    render(options = {}) {
        const {
            showKDTree = true,
            showUncertainty = true,
            performanceMode = 'balanced'
        } = options;

        this.ctx.clearRect(0, 0, this.width, this.height);

        // Draw background
        this.drawBackground();

        // Draw uncertainty field
        if (showUncertainty) {
            this.drawUncertaintyField();
        }

        // Draw manifold points
        this.drawManifoldPoints();

        // Draw KD-tree traversal
        if (showKDTree && this.inputVector) {
            this.drawKDTreeTraversal();
        }

        // Draw input vector
        if (this.inputVector) {
            this.drawInputVector();
        }

        // Draw snapped vector
        if (this.snappedVector) {
            this.drawSnappedVector();
        }

        // Animate snapping
        if (this.snapping) {
            this.animateSnap();
        }
    }

    drawBackground() {
        const gradient = this.ctx.createRadialGradient(
            this.width / 2, this.height / 2, 0,
            this.width / 2, this.height / 2, this.width / 2
        );
        gradient.addColorStop(0, '#1e293b');
        gradient.addColorStop(1, '#0f172a');

        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.width, this.height);
    }

    drawUncertaintyField() {
        const imageData = this.ctx.createImageData(this.width, this.height);
        const data = imageData.data;

        for (let i = 0; i < this.width; i += 4) {
            for (let j = 0; j < this.height; j += 4) {
                const x = i / this.width;
                const y = 1 - j / this.height;

                // Find nearest point
                const result = this.manifold.snap([x, y]);
                const uncertainty = result.noise;

                // Color based on uncertainty
                const alpha = Math.min(255, uncertainty * 500);
                const r = Math.floor(uncertainty * 100);
                const g = Math.floor((1 - uncertainty) * 50);
                const b = Math.floor((1 - uncertainty) * 100);

                // Fill 4x4 block
                for (let di = 0; di < 4 && i + di < this.width; di++) {
                    for (let dj = 0; dj < 4 && j + dj < this.height; dj++) {
                        const idx = ((j + dj) * this.width + (i + di)) * 4;
                        data[idx] = r;
                        data[idx + 1] = g;
                        data[idx + 2] = b;
                        data[idx + 3] = alpha * 0.3;
                    }
                }
            }
        }

        this.ctx.putImageData(imageData, 0, 0);
    }

    drawManifoldPoints() {
        const points = this.manifold.getPoints();

        this.ctx.fillStyle = 'rgba(99, 102, 241, 0.6)';
        this.ctx.strokeStyle = 'rgba(99, 102, 241, 0.8)';
        this.ctx.lineWidth = 1;

        points.forEach(point => {
            const x = point[0] * this.width;
            const y = (1 - point[1]) * this.height;

            this.ctx.beginPath();
            this.ctx.arc(x, y, 3, 0, Math.PI * 2);
            this.ctx.fill();
            this.ctx.stroke();
        });
    }

    drawKDTreeTraversal() {
        if (!this.snapResult) return;

        // Visualize search depth
        const depth = this.snapResult.depth;
        const maxDepth = Math.log2(this.manifold.size) + 1;

        this.ctx.strokeStyle = `rgba(6, 182, 212, ${0.3 + (depth / maxDepth) * 0.7})`;
        this.ctx.lineWidth = 2;
        this.ctx.setLineDash([5, 5]);

        // Draw search spiral
        this.ctx.beginPath();
        for (let i = 0; i < depth; i++) {
            const angle = (i / depth) * Math.PI * 2;
            const radius = (i / depth) * 100;
            const x = this.inputVector[0] * this.width + Math.cos(angle) * radius;
            const y = (1 - this.inputVector[1]) * this.height + Math.sin(angle) * radius;

            if (i === 0) {
                this.ctx.moveTo(x, y);
            } else {
                this.ctx.lineTo(x, y);
            }
        }
        this.ctx.stroke();
        this.ctx.setLineDash([]);
    }

    drawInputVector() {
        const x = this.inputVector[0] * this.width;
        const y = (1 - this.inputVector[1]) * this.height;

        // Draw input point
        this.ctx.fillStyle = '#f59e0b';
        this.ctx.beginPath();
        this.ctx.arc(x, y, 8, 0, Math.PI * 2);
        this.ctx.fill();

        // Draw glow
        this.ctx.strokeStyle = 'rgba(245, 158, 11, 0.5)';
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.arc(x, y, 15, 0, Math.PI * 2);
        this.ctx.stroke();
    }

    drawSnappedVector() {
        const x = this.snappedVector[0] * this.width;
        const y = (1 - this.snappedVector[1]) * this.height;

        // Draw snapped point
        this.ctx.fillStyle = '#10b981';
        this.ctx.beginPath();
        this.ctx.arc(x, y, 10, 0, Math.PI * 2);
        this.ctx.fill();

        // Draw glow
        this.ctx.strokeStyle = 'rgba(16, 185, 129, 0.5)';
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.arc(x, y, 20, 0, Math.PI * 2);
        this.ctx.stroke();

        // Draw snap line
        if (this.inputVector) {
            const ix = this.inputVector[0] * this.width;
            const iy = (1 - this.inputVector[1]) * this.height;

            this.ctx.strokeStyle = 'rgba(16, 185, 129, 0.8)';
            this.ctx.lineWidth = 2;
            this.ctx.beginPath();
            this.ctx.moveTo(ix, iy);
            this.ctx.lineTo(x, y);
            this.ctx.stroke();

            // Draw arrow
            const angle = Math.atan2(y - iy, x - ix);
            this.ctx.beginPath();
            this.ctx.moveTo(x, y);
            this.ctx.lineTo(
                x - 15 * Math.cos(angle - Math.PI / 6),
                y - 15 * Math.sin(angle - Math.PI / 6)
            );
            this.ctx.moveTo(x, y);
            this.ctx.lineTo(
                x - 15 * Math.cos(angle + Math.PI / 6),
                y - 15 * Math.sin(angle + Math.PI / 6)
            );
            this.ctx.stroke();
        }
    }

    animateSnap() {
        if (!this.snapping) return;

        this.animationProgress += 0.05;

        if (this.animationProgress >= 1) {
            this.snapping = false;
            this.animationProgress = 1;
        }

        // Draw animation
        if (this.inputVector && this.snappedVector) {
            const t = this.easeInOutCubic(this.animationProgress);
            const x = this.inputVector[0] * (1 - t) + this.snappedVector[0] * t;
            const y = this.inputVector[1] * (1 - t) + this.snappedVector[1] * t;

            const canvasX = x * this.width;
            const canvasY = (1 - y) * this.height;

            this.ctx.fillStyle = `rgba(16, 185, 129, ${0.5 + this.animationProgress * 0.5})`;
            this.ctx.beginPath();
            this.ctx.arc(canvasX, canvasY, 12, 0, Math.PI * 2);
            this.ctx.fill();
        }

        if (this.snapping) {
            requestAnimationFrame(() => this.render());
        }
    }

    easeInOutCubic(t) {
        return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    }
}

// ===================================
// PERFORMANCE MONITOR
// ===================================

class PerformanceMonitor {
    constructor() {
        this.operations = 0;
        this.totalTime = 0;
        this.startTime = performance.now();
        this.frameCount = 0;
        this.lastFpsUpdate = performance.now();
        this.fps = 60;
    }

    recordOperation(time) {
        this.operations++;
        this.totalTime += time;
    }

    updateFPS() {
        this.frameCount++;
        const now = performance.now();

        if (now - this.lastFpsUpdate >= 1000) {
            this.fps = this.frameCount;
            this.frameCount = 0;
            this.lastFpsUpdate = now;
        }
    }

    getMetrics() {
        const elapsed = (performance.now() - this.startTime) / 1000;
        const opsPerSec = Math.round(this.operations / elapsed);
        const avgLatency = this.operations > 0
            ? Math.round(this.totalTime / this.operations)
            : 0;

        return {
            opsPerSec: opsPerSec,
            avgLatency: avgLatency,
            fps: this.fps
        };
    }
}

// ===================================
// MAIN APPLICATION
// ===================================

class PythagoreanVisualizer {
    constructor() {
        this.canvas = document.getElementById('manifoldCanvas');
        this.manifold = new PythagoreanManifold(200);
        this.renderer = new ManifoldRenderer(this.canvas, this.manifold);
        this.monitor = new PerformanceMonitor();

        this.options = {
            showKDTree: true,
            showUncertainty: true,
            performanceMode: 'balanced'
        };

        this.setupControls();
        this.startRenderLoop();
    }

    setupControls() {
        // Density slider
        const densitySlider = document.getElementById('densitySlider');
        const densityValue = document.getElementById('densityValue');
        densitySlider.addEventListener('input', (e) => {
            const density = parseInt(e.target.value);
            densityValue.textContent = density;
            this.manifold = new PythagoreanManifold(density);
            this.renderer.manifold = this.manifold;
        });

        // Speed slider
        const speedSlider = document.getElementById('speedSlider');
        const speedValue = document.getElementById('speedValue');
        speedSlider.addEventListener('input', (e) => {
            const speed = parseFloat(e.target.value);
            speedValue.textContent = speed.toFixed(1) + 'x';
        });

        // Checkboxes
        document.getElementById('showKDTree').addEventListener('change', (e) => {
            this.options.showKDTree = e.target.checked;
        });

        document.getElementById('showUncertainty').addEventListener('change', (e) => {
            this.options.showUncertainty = e.target.checked;
        });

        // Performance mode
        document.getElementById('performanceMode').addEventListener('change', (e) => {
            this.options.performanceMode = e.target.value;
        });

        // Buttons
        document.getElementById('resetBtn').addEventListener('click', () => {
            this.renderer.inputVector = null;
            this.renderer.snappedVector = null;
        });

        document.getElementById('randomBtn').addEventListener('click', () => {
            const x = Math.random();
            const y = Math.random();
            this.renderer.inputVector = [x, y];
            this.renderer.triggerSnap();
        });
    }

    startRenderLoop() {
        const loop = () => {
            this.renderer.render(this.options);
            this.monitor.updateFPS();
            this.updateUI();
            requestAnimationFrame(loop);
        };
        loop();
    }

    updateUI() {
        // Update overlay info
        const inputVector = document.getElementById('inputVector');
        const snappedVector = document.getElementById('snappedVector');
        const noiseLevel = document.getElementById('noiseLevel');
        const kdDepth = document.getElementById('kdDepth');

        if (this.renderer.snapResult) {
            const result = this.renderer.snapResult;

            inputVector.textContent = `(${this.renderer.inputVector[0].toFixed(3)}, ${this.renderer.inputVector[1].toFixed(3)})`;
            snappedVector.textContent = `(${result.snapped[0].toFixed(3)}, ${result.snapped[1].toFixed(3)})`;
            snappedVector.style.color = '#10b981';
            noiseLevel.textContent = result.noise.toFixed(6);
            kdDepth.textContent = result.depth;

            // Record operation
            this.monitor.recordOperation(result.time);
        } else if (this.renderer.inputVector) {
            inputVector.textContent = `(${this.renderer.inputVector[0].toFixed(3)}, ${this.renderer.inputVector[1].toFixed(3)})`;
            snappedVector.textContent = 'Computing...';
            snappedVector.style.color = '#f59e0b';
            noiseLevel.textContent = '-';
            kdDepth.textContent = '-';
        } else {
            inputVector.textContent = 'Move mouse...';
            snappedVector.textContent = '-';
            noiseLevel.textContent = '-';
            kdDepth.textContent = '-';
        }

        // Update performance metrics
        const metrics = this.monitor.getMetrics();
        document.getElementById('opsPerSec').textContent = metrics.opsPerSec.toLocaleString();
        document.getElementById('avgLatency').textContent = metrics.avgLatency + 'ns';
        document.getElementById('fps').textContent = metrics.fps;
    }
}

// ===================================
// INITIALIZATION
// ===================================

document.addEventListener('DOMContentLoaded', () => {
    window.visualizer = new PythagoreanVisualizer();

    // Initial render
    window.visualizer.renderer.render();
});

// ===================================
// EXPORTS FOR WEBASSEMBLY INTEGRATION
// ===================================

// This will be replaced with actual WASM calls when integrated
export { PythagoreanManifold, KDTree, ManifoldRenderer, PythagoreanVisualizer };
