// Calculus Visualization Simulator - Dodecet-Encoded Geometric Constraints
class CalculusSimulator {
    constructor() {
        this.currentTab = 'differentiation';
        this.diffCanvas = document.getElementById('diffCanvas');
        this.diffCtx = this.diffCanvas.getContext('2d');
        this.intCanvas = document.getElementById('intCanvas');
        this.intCtx = this.intCanvas.getContext('2d');
        this.gradientContainer = document.getElementById('gradientContainer');

        // Differentiation state
        this.diffFunction = 'x2';
        this.customFunctionStr = '';
        this.xRange = 5;
        this.resolution = 100;
        this.showTangent = true;
        this.showSecant = true;
        this.mouseX = null;

        // Integration state
        this.intFunction = 'x2';
        this.lowerBound = 0;
        this.upperBound = 2;
        this.segments = 10;
        this.integrationMethod = 'simpson';

        // Gradient state
        this.gradientFunction = 'saddle';
        this.density = 10;
        this.showSurface = true;
        this.showVectors = true;
        this.animateGradient = false;
        this.gradientAnimationId = null;
        this.gradientScene = null;
        this.gradientCamera = null;
        this.gradientRenderer = null;
        this.gradientMesh = null;
        this.gradientArrows = [];

        this.init();
    }

    init() {
        this.setupEventListeners();
        this.initThreeJS();
        this.updateDifferentiation();
        this.updateTheory();
    }

    setupEventListeners() {
        // Tab switching
        document.getElementById('tabDifferentiation').addEventListener('click', () => this.switchTab('differentiation'));
        document.getElementById('tabIntegration').addEventListener('click', () => this.switchTab('integration'));
        document.getElementById('tabGradient').addEventListener('click', () => this.switchTab('gradient'));

        // Differentiation controls
        document.getElementById('diffFunction').addEventListener('change', (e) => {
            this.diffFunction = e.target.value;
            document.getElementById('customFunctionInput').classList.toggle('hidden', e.target.value !== 'custom');
            this.updateDifferentiation();
        });

        document.getElementById('customFunction').addEventListener('input', (e) => {
            this.customFunctionStr = e.target.value;
            this.updateDifferentiation();
        });

        document.getElementById('xRange').addEventListener('input', (e) => {
            this.xRange = parseFloat(e.target.value);
            document.getElementById('xRangeValue').textContent = this.xRange;
            this.updateDifferentiation();
        });

        document.getElementById('resolution').addEventListener('input', (e) => {
            this.resolution = parseInt(e.target.value);
            document.getElementById('resolutionValue').textContent = this.resolution;
            this.updateDifferentiation();
        });

        document.getElementById('showTangent').addEventListener('change', (e) => {
            this.showTangent = e.target.checked;
            this.updateDifferentiation();
        });

        document.getElementById('showSecant').addEventListener('change', (e) => {
            this.showSecant = e.target.checked;
            this.updateDifferentiation();
        });

        // Canvas mouse tracking for tangent line
        this.diffCanvas.addEventListener('mousemove', (e) => {
            const rect = this.diffCanvas.getBoundingClientRect();
            const scaleX = this.diffCanvas.width / rect.width;
            this.mouseX = (e.clientX - rect.left) * scaleX;
            this.updateDifferentiation();
        });

        this.diffCanvas.addEventListener('mouseleave', () => {
            this.mouseX = null;
            this.updateDifferentiation();
        });

        // Integration controls
        document.getElementById('intFunction').addEventListener('change', (e) => {
            this.intFunction = e.target.value;
            this.updateIntegration();
        });

        document.getElementById('lowerBound').addEventListener('input', (e) => {
            this.lowerBound = parseFloat(e.target.value);
            document.getElementById('lowerBoundValue').textContent = this.lowerBound.toFixed(1);
            this.updateIntegration();
        });

        document.getElementById('upperBound').addEventListener('input', (e) => {
            this.upperBound = parseFloat(e.target.value);
            document.getElementById('upperBoundValue').textContent = this.upperBound.toFixed(1);
            this.updateIntegration();
        });

        document.getElementById('segments').addEventListener('input', (e) => {
            this.segments = parseInt(e.target.value);
            document.getElementById('segmentsValue').textContent = this.segments;
            this.updateIntegration();
        });

        document.getElementById('integrationMethod').addEventListener('change', (e) => {
            this.integrationMethod = e.target.value;
            this.updateIntegration();
        });

        // Gradient controls
        document.getElementById('gradientFunction').addEventListener('change', (e) => {
            this.gradientFunction = e.target.value;
            this.updateGradient();
        });

        document.getElementById('density').addEventListener('input', (e) => {
            this.density = parseInt(e.target.value);
            document.getElementById('densityValue').textContent = this.density;
            this.updateGradient();
        });

        document.getElementById('showSurface').addEventListener('change', (e) => {
            this.showSurface = e.target.checked;
            this.updateGradient();
        });

        document.getElementById('showVectors').addEventListener('change', (e) => {
            this.showVectors = e.target.checked;
            this.updateGradient();
        });

        document.getElementById('animateGradient').addEventListener('change', (e) => {
            this.animateGradient = e.target.checked;
            if (this.animateGradient) {
                this.startGradientAnimation();
            } else {
                this.stopGradientAnimation();
            }
        });
    }

    switchTab(tab) {
        this.currentTab = tab;

        // Update tab buttons
        document.querySelectorAll('.tab-button').forEach(btn => btn.classList.remove('active'));
        document.getElementById(`tab${tab.charAt(0).toUpperCase() + tab.slice(1)}`).classList.add('active');

        // Update panels
        document.querySelectorAll('.tab-panel').forEach(panel => panel.classList.add('hidden'));
        document.getElementById(`${tab === 'differentiation' ? 'diff' : tab === 'integration' ? 'int' : 'gradient'}Panel`).classList.remove('hidden');

        // Update controls
        document.querySelectorAll('.control-panel').forEach(panel => panel.classList.add('hidden'));
        document.getElementById(`${tab === 'differentiation' ? 'diff' : tab === 'integration' ? 'int' : 'gradient'}Controls`).classList.remove('hidden');

        this.updateTheory();

        if (tab === 'gradient' && this.gradientRenderer) {
            this.gradientRenderer.setSize(
                this.gradientContainer.clientWidth,
                this.gradientContainer.clientHeight
            );
        }
    }

    // ==================== DIFFERENTIATION ====================

    updateDifferentiation() {
        const ctx = this.diffCtx;
        const canvas = this.diffCanvas;
        const width = canvas.width;
        const height = canvas.height;

        // Clear canvas
        ctx.clearRect(0, 0, width, height);

        // Coordinate system
        const padding = 60;
        const plotWidth = width - 2 * padding;
        const plotHeight = height - 2 * padding;
        const originX = width / 2;
        const originY = height / 2;

        const scaleX = plotWidth / (2 * this.xRange);
        const scaleY = plotHeight / (2 * this.yRange);

        // Helper functions
        const toCanvasX = (x) => originX + x * scaleX;
        const toCanvasY = (y) => originY - y * scaleY;
        const fromCanvasX = (cx) => (cx - originX) / scaleX;
        const fromCanvasY = (cy) => (originY - cy) / scaleY;

        // Get function
        const f = this.getFunction(this.diffFunction);

        // Draw grid
        this.drawGrid(ctx, width, height, originX, originY, scaleX, scaleY);

        // Draw axes
        this.drawAxes(ctx, width, height, originX, originY);

        // Draw function
        ctx.beginPath();
        ctx.strokeStyle = '#06b6d4';
        ctx.lineWidth = 2;

        for (let i = 0; i <= this.resolution; i++) {
            const x = -this.xRange + (2 * this.xRange * i) / this.resolution;
            const y = f(x);
            const cx = toCanvasX(x);
            const cy = toCanvasY(y);

            if (i === 0) {
                ctx.moveTo(cx, cy);
            } else {
                ctx.lineTo(cx, cy);
            }
        }
        ctx.stroke();

        // Draw tangent line at mouse position or center
        const tangentX = this.mouseX !== null ? fromCanvasX(this.mouseX) : 0;
        const tangentY = f(tangentX);
        const derivative = this.numericalDerivative(f, tangentX);

        if (this.showTangent) {
            ctx.beginPath();
            ctx.strokeStyle = '#f59e0b';
            ctx.lineWidth = 2;
            ctx.setLineDash([5, 5]);

            const x1 = tangentX - 1;
            const y1 = tangentY - derivative;
            const x2 = tangentX + 1;
            const y2 = tangentY + derivative;

            ctx.moveTo(toCanvasX(x1), toCanvasY(y1));
            ctx.lineTo(toCanvasX(x2), toCanvasY(y2));
            ctx.stroke();
            ctx.setLineDash([]);

            // Tangent point
            ctx.beginPath();
            ctx.fillStyle = '#f59e0b';
            ctx.arc(toCanvasX(tangentX), toCanvasY(tangentY), 6, 0, 2 * Math.PI);
            ctx.fill();
        }

        // Draw secant approximation
        if (this.showSecant) {
            const h = 0.1;
            const x1 = tangentX - h;
            const x2 = tangentX + h;
            const y1 = f(x1);
            const y2 = f(x2);

            ctx.beginPath();
            ctx.strokeStyle = '#10b981';
            ctx.lineWidth = 2;
            ctx.setLineDash([3, 3]);

            ctx.moveTo(toCanvasX(x1), toCanvasY(y1));
            ctx.lineTo(toCanvasX(x2), toCanvasY(y2));
            ctx.stroke();
            ctx.setLineDash([]);

            // Secant points
            ctx.beginPath();
            ctx.fillStyle = '#10b981';
            ctx.arc(toCanvasX(x1), toCanvasY(y1), 4, 0, 2 * Math.PI);
            ctx.arc(toCanvasX(x2), toCanvasY(y2), 4, 0, 2 * Math.PI);
            ctx.fill();
        }

        // Update info and stats
        document.getElementById('diffInfo').innerHTML = `
            <span class="text-cyan-400">x = ${tangentX.toFixed(3)}</span> |
            <span class="text-yellow-400">f(x) = ${tangentY.toFixed(3)}</span> |
            <span class="text-green-400">f'(x) = ${derivative.toFixed(3)}</span>
        `;

        this.updateDifferentiationStats(tangentX, tangentY, derivative);
    }

    numericalDerivative(f, x, h = 0.0001) {
        return (f(x + h) - f(x - h)) / (2 * h);
    }

    getFunction(type) {
        switch (type) {
            case 'x2': return (x) => x * x;
            case 'x3': return (x) => x * x * x;
            case 'sin': return (x) => Math.sin(x);
            case 'exp': return (x) => Math.exp(x);
            case 'ln': return (x) => x > 0 ? Math.log(x) : NaN;
            case 'custom':
                try {
                    return new Function('x', `return ${this.customFunctionStr || 'x * x'}`);
                } catch {
                    return (x) => x * x;
                }
            default: return (x) => x * x;
        }
    }

    updateDifferentiationStats(x, y, derivative) {
        const statsHtml = `
            <div class="grid grid-cols-2 gap-2">
                <div>
                    <p class="text-gray-400">Point x</p>
                    <p class="font-bold">${x.toFixed(4)}</p>
                </div>
                <div>
                    <p class="text-gray-400">f(x)</p>
                    <p class="font-bold text-cyan-400">${y.toFixed(4)}</p>
                </div>
                <div>
                    <p class="text-gray-400">f'(x)</p>
                    <p class="font-bold text-yellow-400">${derivative.toFixed(4)}</p>
                </div>
                <div>
                    <p class="text-gray-400">f''(x)</p>
                    <p class="font-bold text-purple-400">${this.numericalSecondDerivative(x).toFixed(4)}</p>
                </div>
            </div>
        `;
        document.getElementById('statsContent').innerHTML = statsHtml;
    }

    numericalSecondDerivative(x) {
        const f = this.getFunction(this.diffFunction);
        const h = 0.0001;
        return (f(x + h) - 2 * f(x) + f(x - h)) / (h * h);
    }

    // ==================== INTEGRATION ====================

    updateIntegration() {
        const ctx = this.intCtx;
        const canvas = this.intCanvas;
        const width = canvas.width;
        const height = canvas.height;

        ctx.clearRect(0, 0, width, height);

        const padding = 60;
        const plotWidth = width - 2 * padding;
        const plotHeight = height - 2 * padding;
        const originX = width / 2;
        const originY = height - padding;

        const xMin = -6;
        const xMax = 6;
        const yMax = 10;

        const scaleX = plotWidth / (xMax - xMin);
        const scaleY = plotHeight / yMax;

        const toCanvasX = (x) => originX + (x - xMin) * scaleX;
        const toCanvasY = (y) => originY - y * scaleY;

        // Draw grid and axes
        this.drawIntegrationGrid(ctx, width, height, originX, originY, scaleX, scaleY, xMin, xMax, yMax);

        // Get function
        const f = this.getIntegrationFunction();

        // Draw function
        ctx.beginPath();
        ctx.strokeStyle = '#06b6d4';
        ctx.lineWidth = 2;

        for (let i = 0; i <= this.resolution; i++) {
            const x = xMin + (xMax - xMin) * i / this.resolution;
            const y = f(x);
            const cx = toCanvasX(x);
            const cy = toCanvasY(y);

            if (i === 0 || isNaN(cy)) {
                ctx.moveTo(cx, cy);
            } else {
                ctx.lineTo(cx, cy);
            }
        }
        ctx.stroke();

        // Draw integration area
        const area = this.drawIntegrationArea(ctx, f, toCanvasX, toCanvasY, xMin);

        // Update info
        const exactArea = this.getExactArea();
        const error = Math.abs(area - exactArea);
        const errorPercent = (error / Math.abs(exactArea) * 100).toFixed(2);

        document.getElementById('intInfo').innerHTML = `
            <span class="text-cyan-400">[${this.lowerBound}, ${this.upperBound}]</span> |
            <span class="text-green-400">∫f(x)dx ≈ ${area.toFixed(4)}</span> |
            <span class="text-yellow-400">Error: ${errorPercent}%</span>
        `;

        this.updateIntegrationStats(area, exactArea, error);
    }

    drawIntegrationArea(ctx, f, toCanvasX, toCanvasY, xMin) {
        const a = this.lowerBound;
        const b = this.upperBound;
        const n = this.segments;
        const h = (b - a) / n;

        let totalArea = 0;

        ctx.fillStyle = 'rgba(6, 182, 212, 0.2)';
        ctx.strokeStyle = 'rgba(6, 182, 212, 0.5)';
        ctx.lineWidth = 1;

        if (this.integrationMethod === 'simpson') {
            // Simpson's Rule
            for (let i = 0; i < n; i += 2) {
                const x0 = a + i * h;
                const x1 = a + (i + 1) * h;
                const x2 = a + (i + 2) * h;

                const y0 = f(x0);
                const y1 = f(x1);
                const y2 = f(x2);

                // Simpson's rule area
                const segmentArea = (h / 3) * (y0 + 4 * y1 + y2);
                totalArea += segmentArea;

                // Draw quadratic segment
                ctx.beginPath();
                ctx.moveTo(toCanvasX(x0), toCanvasY(0));
                ctx.lineTo(toCanvasX(x0), toCanvasY(y0));

                // Quadratic curve through three points
                const cx0 = toCanvasX(x0);
                const cy0 = toCanvasY(y0);
                const cx1 = toCanvasX(x1);
                const cy1 = toCanvasY(y1);
                const cx2 = toCanvasX(x2);
                const cy2 = toCanvasY(y2);

                // Approximate quadratic with bezier
                const cp1x = cx0 + (cx2 - cx0) / 3;
                const cp1y = cy0 + (cy1 - cy0) * 3;
                const cp2x = cx2 - (cx2 - cx0) / 3;
                const cp2y = cy2 + (cy1 - cy2) * 3;

                ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, cx2, cy2);
                ctx.lineTo(toCanvasX(x2), toCanvasY(0));
                ctx.closePath();
                ctx.fill();
                ctx.stroke();
            }
        } else if (this.integrationMethod === 'trapezoidal') {
            // Trapezoidal Rule
            for (let i = 0; i < n; i++) {
                const x0 = a + i * h;
                const x1 = a + (i + 1) * h;
                const y0 = f(x0);
                const y1 = f(x1);

                const segmentArea = h * (y0 + y1) / 2;
                totalArea += segmentArea;

                ctx.beginPath();
                ctx.moveTo(toCanvasX(x0), toCanvasY(0));
                ctx.lineTo(toCanvasX(x0), toCanvasY(y0));
                ctx.lineTo(toCanvasX(x1), toCanvasY(y1));
                ctx.lineTo(toCanvasX(x1), toCanvasY(0));
                ctx.closePath();
                ctx.fill();
                ctx.stroke();
            }
        } else {
            // Riemann Sum (left endpoint)
            for (let i = 0; i < n; i++) {
                const x0 = a + i * h;
                const x1 = a + (i + 1) * h;
                const y = f(x0);

                const segmentArea = h * y;
                totalArea += segmentArea;

                ctx.beginPath();
                ctx.moveTo(toCanvasX(x0), toCanvasY(0));
                ctx.lineTo(toCanvasX(x0), toCanvasY(y));
                ctx.lineTo(toCanvasX(x1), toCanvasY(y));
                ctx.lineTo(toCanvasX(x1), toCanvasY(0));
                ctx.closePath();
                ctx.fill();
                ctx.stroke();
            }
        }

        return totalArea;
    }

    getIntegrationFunction() {
        switch (this.intFunction) {
            case 'x2': return (x) => x * x;
            case 'sin': return (x) => Math.sin(x);
            case 'exp': return (x) => Math.exp(x);
            default: return (x) => x * x;
        }
    }

    getExactArea() {
        const a = this.lowerBound;
        const b = this.upperBound;

        switch (this.intFunction) {
            case 'x2': return (b * b * b - a * a * a) / 3;
            case 'sin': return -Math.cos(b) + Math.cos(a);
            case 'exp': return Math.exp(b) - Math.exp(a);
            default: return (b * b * b - a * a * a) / 3;
        }
    }

    updateIntegrationStats(calculated, exact, error) {
        const errorPercent = (error / Math.abs(exact) * 100).toFixed(2);

        const statsHtml = `
            <div class="grid grid-cols-2 gap-2">
                <div>
                    <p class="text-gray-400">Calculated</p>
                    <p class="font-bold text-cyan-400">${calculated.toFixed(4)}</p>
                </div>
                <div>
                    <p class="text-gray-400">Exact</p>
                    <p class="font-bold text-green-400">${exact.toFixed(4)}</p>
                </div>
                <div>
                    <p class="text-gray-400">Error</p>
                    <p class="font-bold text-yellow-400">${error.toFixed(4)}</p>
                </div>
                <div>
                    <p class="text-gray-400">Error %</p>
                    <p class="font-bold text-purple-400">${errorPercent}%</p>
                </div>
            </div>
            <div class="mt-3 text-xs text-gray-500">
                Method: ${this.integrationMethod.charAt(0).toUpperCase() + this.integrationMethod.slice(1)}<br>
                Segments: ${this.segments}
            </div>
        `;
        document.getElementById('statsContent').innerHTML = statsHtml;
    }

    // ==================== GRADIENT (3D) ====================

    initThreeJS() {
        // Scene setup
        this.gradientScene = new THREE.Scene();
        this.gradientScene.background = new THREE.Color(0x1f2937);

        // Camera
        const aspect = this.gradientContainer.clientWidth / this.gradientContainer.clientHeight;
        this.gradientCamera = new THREE.PerspectiveCamera(60, aspect, 0.1, 1000);
        this.gradientCamera.position.set(5, 5, 5);
        this.gradientCamera.lookAt(0, 0, 0);

        // Renderer
        this.gradientRenderer = new THREE.WebGLRenderer({ antialias: true });
        this.gradientRenderer.setSize(
            this.gradientContainer.clientWidth,
            this.gradientContainer.clientHeight
        );
        this.gradientContainer.appendChild(this.gradientRenderer.domElement);

        // Lights
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
        this.gradientScene.add(ambientLight);

        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(5, 10, 7.5);
        this.gradientScene.add(directionalLight);

        // Create surface
        this.createSurface();

        // Create gradient vectors
        this.createGradientVectors();

        // Add grid helper
        const gridHelper = new THREE.GridHelper(10, 10, 0x444444, 0x333333);
        this.gradientScene.add(gridHelper);

        // Orbit controls (simple implementation)
        this.setupOrbitControls();

        // Animation loop
        this.animateThreeJS();
    }

    createSurface() {
        if (this.gradientMesh) {
            this.gradientScene.remove(this.gradientMesh);
        }

        const geometry = new THREE.PlaneGeometry(10, 10, 50, 50);
        const positions = geometry.attributes.position.array;

        for (let i = 0; i < positions.length; i += 3) {
            const x = positions[i];
            const y = positions[i + 1];
            positions[i + 2] = this.getSurfaceZ(x, y);
        }

        geometry.computeVertexNormals();

        const material = new THREE.MeshPhongMaterial({
            color: 0x06b6d4,
            side: THREE.DoubleSide,
            wireframe: false,
            shininess: 30,
            transparent: true,
            opacity: 0.8
        });

        this.gradientMesh = new THREE.Mesh(geometry, material);
        this.gradientMesh.rotation.x = -Math.PI / 2;
        this.gradientScene.add(this.gradientMesh);
    }

    createGradientVectors() {
        // Remove old arrows
        this.gradientArrows.forEach(arrow => this.gradientScene.remove(arrow));
        this.gradientArrows = [];

        const size = 10;
        const step = size / this.density;

        for (let x = -size / 2; x <= size / 2; x += step) {
            for (let y = -size / 2; y <= size / 2; y += step) {
                const z = this.getSurfaceZ(x, y);

                // Calculate gradient
                const grad = this.calculateGradient(x, y);
                const magnitude = Math.sqrt(grad.x * grad.x + grad.y * grad.y);

                // Normalize for visualization
                const scale = Math.min(magnitude, 2);
                const normalizedGrad = {
                    x: grad.x / magnitude * scale,
                    y: grad.y / magnitude * scale
                };

                // Create arrow
                const dir = new THREE.Vector3(normalizedGrad.x, normalizedGrad.y, 1);
                dir.normalize();

                const origin = new THREE.Vector3(x, z + 0.5, y);
                const length = scale * 0.5;
                const color = new THREE.Color().setHSL(0.6 - magnitude * 0.1, 1, 0.5);

                const arrowHelper = new THREE.ArrowHelper(dir, origin, length, color, 0.2, 0.1);
                this.gradientScene.add(arrowHelper);
                this.gradientArrows.push(arrowHelper);
            }
        }
    }

    getSurfaceZ(x, y) {
        switch (this.gradientFunction) {
            case 'saddle':
                return (x * x - y * y) / 4;
            case 'bowl':
                return (x * x + y * y) / 4;
            case 'wave':
                return Math.sin(x) * Math.cos(y) * 2;
            case 'pyramid':
                return (Math.abs(x) + Math.abs(y)) / 2;
            default:
                return (x * x - y * y) / 4;
        }
    }

    calculateGradient(x, y, h = 0.01) {
        const z0 = this.getSurfaceZ(x, y);
        const zx = this.getSurfaceZ(x + h, y);
        const zy = this.getSurfaceZ(x, y + h);

        return {
            x: (zx - z0) / h,
            y: (zy - z0) / h
        };
    }

    updateGradient() {
        this.createSurface();
        this.createGradientVectors();
        this.gradientMesh.visible = this.showSurface;
        this.gradientArrows.forEach(arrow => {
            arrow.visible = this.showVectors;
        });
    }

    setupOrbitControls() {
        let isDragging = false;
        let previousMousePosition = { x: 0, y: 0 };
        let theta = Math.PI / 4;
        let phi = Math.PI / 4;
        const radius = 10;

        const updateCameraPosition = () => {
            this.gradientCamera.position.x = radius * Math.sin(phi) * Math.cos(theta);
            this.gradientCamera.position.y = radius * Math.cos(phi);
            this.gradientCamera.position.z = radius * Math.sin(phi) * Math.sin(theta);
            this.gradientCamera.lookAt(0, 0, 0);
        };

        updateCameraPosition();

        this.gradientContainer.addEventListener('mousedown', (e) => {
            isDragging = true;
            previousMousePosition = { x: e.clientX, y: e.clientY };
        });

        this.gradientContainer.addEventListener('mousemove', (e) => {
            if (!isDragging) return;

            const deltaX = e.clientX - previousMousePosition.x;
            const deltaY = e.clientY - previousMousePosition.y;

            theta += deltaX * 0.01;
            phi += deltaY * 0.01;
            phi = Math.max(0.1, Math.min(Math.PI - 0.1, phi));

            updateCameraPosition();
            previousMousePosition = { x: e.clientX, y: e.clientY };
        });

        this.gradientContainer.addEventListener('mouseup', () => {
            isDragging = false;
        });

        this.gradientContainer.addEventListener('mouseleave', () => {
            isDragging = false;
        });
    }

    startGradientAnimation() {
        if (this.gradientAnimationId) return;

        let time = 0;
        const animate = () => {
            time += 0.02;

            // Rotate camera
            const radius = 10;
            const theta = time * 0.5;
            const phi = Math.PI / 4;

            this.gradientCamera.position.x = radius * Math.sin(phi) * Math.cos(theta);
            this.gradientCamera.position.y = radius * Math.cos(phi);
            this.gradientCamera.position.z = radius * Math.sin(phi) * Math.sin(theta);
            this.gradientCamera.lookAt(0, 0, 0);

            this.gradientAnimationId = requestAnimationFrame(animate);
        };

        animate();
    }

    stopGradientAnimation() {
        if (this.gradientAnimationId) {
            cancelAnimationFrame(this.gradientAnimationId);
            this.gradientAnimationId = null;
        }
    }

    animateThreeJS() {
        const animate = () => {
            requestAnimationFrame(animate);

            if (this.gradientRenderer && this.gradientScene && this.gradientCamera) {
                this.gradientRenderer.render(this.gradientScene, this.gradientCamera);
            }
        };

        animate();
    }

    // ==================== UTILITY FUNCTIONS ====================

    drawGrid(ctx, width, height, originX, originY, scaleX, scaleY) {
        ctx.strokeStyle = '#374151';
        ctx.lineWidth = 1;

        // Vertical lines
        for (let i = -Math.floor(this.xRange); i <= Math.floor(this.xRange); i++) {
            const x = originX + i * scaleX;
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, height);
            ctx.stroke();
        }

        // Horizontal lines
        for (let i = -Math.floor(this.yRange); i <= Math.floor(this.yRange); i++) {
            const y = originY - i * scaleY;
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(width, y);
            ctx.stroke();
        }
    }

    drawAxes(ctx, width, height, originX, originY) {
        ctx.strokeStyle = '#6b7280';
        ctx.lineWidth = 2;

        // X axis
        ctx.beginPath();
        ctx.moveTo(0, originY);
        ctx.lineTo(width, originY);
        ctx.stroke();

        // Y axis
        ctx.beginPath();
        ctx.moveTo(originX, 0);
        ctx.lineTo(originX, height);
        ctx.stroke();

        // Axis labels
        ctx.fillStyle = '#9ca3af';
        ctx.font = '12px Inter, sans-serif';
        ctx.fillText('x', width - 20, originY - 10);
        ctx.fillText('y', originX + 10, 20);
        ctx.fillText('0', originX + 5, originY + 15);
    }

    drawIntegrationGrid(ctx, width, height, originX, originY, scaleX, scaleY, xMin, xMax, yMax) {
        ctx.strokeStyle = '#374151';
        ctx.lineWidth = 1;

        // Vertical lines
        for (let i = Math.ceil(xMin); i <= Math.floor(xMax); i++) {
            const x = originX + (i - xMin) * scaleX;
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, height);
            ctx.stroke();
        }

        // Horizontal lines
        for (let i = 0; i <= Math.floor(yMax); i++) {
            const y = originY - i * scaleY;
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(width, y);
            ctx.stroke();
        }

        // Axes
        ctx.strokeStyle = '#6b7280';
        ctx.lineWidth = 2;

        ctx.beginPath();
        ctx.moveTo(0, originY);
        ctx.lineTo(width, originY);
        ctx.stroke();

        // Labels
        ctx.fillStyle = '#9ca3af';
        ctx.font = '12px Inter, sans-serif';
        ctx.fillText('x', width - 20, originY - 10);
        ctx.fillText('0', originX + (0 - xMin) * scaleX + 5, originY + 15);
    }

    updateTheory() {
        const theoryContent = document.getElementById('theoryContent');

        if (this.currentTab === 'differentiation') {
            theoryContent.innerHTML = `
                <div class="bg-gray-900 p-3 rounded">
                    <p class="text-center text-sm font-mono" id="diffEq">
                        f'(x) = lim(h→0) [f(x+h) - f(x-h)] / 2h
                    </p>
                </div>
                <p><strong class="text-cyan-400">Numerical Differentiation:</strong> Approximates derivatives using finite differences.</p>
                <p><strong class="text-yellow-400">Tangent Line:</strong> Shows instantaneous rate of change at a point.</p>
                <p><strong class="text-green-400">Secant Line:</strong> Shows average rate of change over small interval.</p>
                <p class="text-xs text-gray-500 mt-2">Move your mouse over the graph to see the tangent at different points.</p>
            `;
        } else if (this.currentTab === 'integration') {
            theoryContent.innerHTML = `
                <div class="bg-gray-900 p-3 rounded">
                    <p class="text-center text-sm font-mono">
                        ∫[a,b] f(x)dx ≈
                    </p>
                </div>
                <p><strong class="text-cyan-400">Simpson's Rule:</strong> Uses quadratic polynomials for O(h⁴) accuracy.</p>
                <p><strong class="text-green-400">Trapezoidal Rule:</strong> Uses linear segments for O(h²) accuracy.</p>
                <p><strong class="text-yellow-400">Riemann Sum:</strong> Uses rectangles for O(h) accuracy.</p>
                <p class="text-xs text-gray-500 mt-2">Adjust bounds and segments to see convergence.</p>
            `;
        } else {
            theoryContent.innerHTML = `
                <div class="bg-gray-900 p-3 rounded">
                    <p class="text-center text-sm font-mono">
                        ∇f = (∂f/∂x, ∂f/∂y, ∂f/∂z)
                    </p>
                </div>
                <p><strong class="text-cyan-400">Gradient Vector:</strong> Points in direction of steepest ascent.</p>
                <p><strong class="text-green-400">Magnitude:</strong> Indicates rate of change (longer = steeper).</p>
                <p><strong class="text-yellow-400">Direction:</strong> Always perpendicular to level curves.</p>
                <p class="text-xs text-gray-500 mt-2">Drag to rotate the 3D view. Toggle animation for automatic rotation.</p>
            `;
        }

        // Render KaTeX equations
        if (typeof katex !== 'undefined') {
            try {
                const equations = theoryContent.querySelectorAll('.font-mono');
                equations.forEach(eq => {
                    katex.render(eq.textContent, eq, {
                        throwOnError: false,
                        displayMode: true
                    });
                });
            } catch (e) {
                // Skip if rendering fails
            }
        }
    }
}

// Initialize simulator when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new CalculusSimulator();
});
