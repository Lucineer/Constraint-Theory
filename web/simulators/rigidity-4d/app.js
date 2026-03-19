// 4D Rigidity Visualization Simulator
class Rigidity4DSimulator {
    constructor() {
        this.container = document.getElementById('rigidity4dContainer');
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.vertices = [];
        this.edges = [];
        this.vertexObjects = [];
        this.edgeObjects = [];
        this.structureType = 'hypertetrahedron';
        this.rotationSpeed = 1.0;
        this.projectionDistance = 2.0;
        this.time = 0;

        this.init();
    }

    init() {
        this.initThreeJS();
        this.setupEventListeners();
        this.loadStructure('hypertetrahedron');
        this.animate();
    }

    initThreeJS() {
        // Scene
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x1f2937);

        // Camera
        const aspect = this.container.clientWidth / this.container.clientHeight;
        this.camera = new THREE.PerspectiveCamera(60, aspect, 0.1, 1000);
        this.camera.position.set(5, 5, 5);
        this.camera.lookAt(0, 0, 0);

        // Renderer
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(
            this.container.clientWidth,
            this.container.clientHeight
        );
        this.container.appendChild(this.renderer.domElement);

        // Lights
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
        this.scene.add(ambientLight);

        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(5, 10, 7.5);
        this.scene.add(directionalLight);

        // Grid helper
        const gridHelper = new THREE.GridHelper(10, 10, 0x444444, 0x333333);
        this.scene.add(gridHelper);

        // Orbit controls
        this.setupOrbitControls();
    }

    setupOrbitControls() {
        let isDragging = false;
        let previousMousePosition = { x: 0, y: 0 };
        let theta = Math.PI / 4;
        let phi = Math.PI / 4;
        const radius = 10;

        const updateCameraPosition = () => {
            this.camera.position.x = radius * Math.sin(phi) * Math.cos(theta);
            this.camera.position.y = radius * Math.cos(phi);
            this.camera.position.z = radius * Math.sin(phi) * Math.sin(theta);
            this.camera.lookAt(0, 0, 0);
        };

        updateCameraPosition();

        this.container.addEventListener('mousedown', (e) => {
            isDragging = true;
            previousMousePosition = { x: e.clientX, y: e.clientY };
        });

        this.container.addEventListener('mousemove', (e) => {
            if (!isDragging) return;

            const deltaX = e.clientX - previousMousePosition.x;
            const deltaY = e.clientY - previousMousePosition.y;

            theta += deltaX * 0.01;
            phi += deltaY * 0.01;
            phi = Math.max(0.1, Math.min(Math.PI - 0.1, phi));

            updateCameraPosition();
            previousMousePosition = { x: e.clientX, y: e.clientY };
        });

        this.container.addEventListener('mouseup', () => {
            isDragging = false;
        });

        this.container.addEventListener('mouseleave', () => {
            isDragging = false;
        });

        document.getElementById('resetCamera').addEventListener('click', () => {
            theta = Math.PI / 4;
            phi = Math.PI / 4;
            updateCameraPosition();
        });
    }

    setupEventListeners() {
        document.getElementById('structureType').addEventListener('change', (e) => {
            this.loadStructure(e.target.value);
        });

        document.getElementById('rotationSpeed').addEventListener('input', (e) => {
            this.rotationSpeed = parseFloat(e.target.value);
            document.getElementById('rotationSpeedValue').textContent = this.rotationSpeed.toFixed(1);
        });

        document.getElementById('projectionDistance').addEventListener('input', (e) => {
            this.projectionDistance = parseFloat(e.target.value);
            document.getElementById('projectionValue').textContent = this.projectionDistance.toFixed(1);
            this.updateProjection();
        });

        document.getElementById('randomize').addEventListener('click', () => {
            this.randomizeStructure();
        });
    }

    loadStructure(type) {
        this.structureType = type;

        // Clear existing objects
        this.clearScene();

        switch (type) {
            case 'hypertetrahedron':
                this.createHypertetrahedron();
                break;
            case 'hypercube':
                this.createHypercube();
                break;
            case '16cell':
                this.create16Cell();
                break;
            case '24cell':
                this.create24Cell();
                break;
            case '120cell':
                this.create120Cell();
                break;
            case 'custom':
                this.createCustomStructure();
                break;
        }

        this.createVisualization();
        this.analyzeRigidity();
    }

    clearScene() {
        this.vertexObjects.forEach(obj => this.scene.remove(obj));
        this.edgeObjects.forEach(obj => this.scene.remove(obj));
        this.vertexObjects = [];
        this.edgeObjects = [];
        this.vertices = [];
        this.edges = [];
    }

    createHypertetrahedron() {
        // 4D simplex (5 vertices)
        this.vertices = [
            { x: 1, y: 1, z: 1, w: 1 },
            { x: -1, y: -1, z: 1, w: 1 },
            { x: -1, y: 1, z: -1, w: 1 },
            { x: 1, y: -1, z: -1, w: 1 },
            { x: 0, y: 0, z: 0, w: -1 }
        ];

        // All pairs connected (complete graph K5)
        this.edges = [];
        for (let i = 0; i < this.vertices.length; i++) {
            for (let j = i + 1; j < this.vertices.length; j++) {
                this.edges.push([i, j]);
            }
        }
    }

    createHypercube() {
        // 4D hypercube (16 vertices)
        this.vertices = [];
        for (let i = 0; i < 16; i++) {
            const x = (i & 1) ? 1 : -1;
            const y = (i & 2) ? 1 : -1;
            const z = (i & 4) ? 1 : -1;
            const w = (i & 8) ? 1 : -1;
            this.vertices.push({ x, y, z, w });
        }

        // Connect vertices that differ by exactly one coordinate
        this.edges = [];
        for (let i = 0; i < this.vertices.length; i++) {
            for (let j = i + 1; j < this.vertices.length; j++) {
                const v1 = this.vertices[i];
                const v2 = this.vertices[j];
                const diff = Math.abs(v1.x - v2.x) + Math.abs(v1.y - v2.y) +
                            Math.abs(v1.z - v2.z) + Math.abs(v1.w - v2.w);
                if (diff === 2) {
                    this.edges.push([i, j]);
                }
            }
        }
    }

    create16Cell() {
        // 16-cell (dual of hypercube, 8 vertices)
        this.vertices = [
            { x: 1, y: 0, z: 0, w: 0 },
            { x: -1, y: 0, z: 0, w: 0 },
            { x: 0, y: 1, z: 0, w: 0 },
            { x: 0, y: -1, z: 0, w: 0 },
            { x: 0, y: 0, z: 1, w: 0 },
            { x: 0, y: 0, z: -1, w: 0 },
            { x: 0, y: 0, z: 0, w: 1 },
            { x: 0, y: 0, z: 0, w: -1 }
        ];

        // Connect orthogonal vertices
        this.edges = [];
        for (let i = 0; i < this.vertices.length; i++) {
            for (let j = i + 1; j < this.vertices.length; j++) {
                const v1 = this.vertices[i];
                const v2 = this.vertices[j];
                if (v1.x !== v2.x && v1.y !== v2.y && v1.z !== v2.z && v1.w !== v2.w) {
                    this.edges.push([i, j]);
                }
            }
        }
    }

    create24Cell() {
        // 24-cell (self-dual, 24 vertices)
        this.vertices = [];

        // 16 vertices from (±1, ±1, 0, 0) permutations
        const perms = [
            [1, 1, 0, 0], [1, -1, 0, 0], [-1, 1, 0, 0], [-1, -1, 0, 0],
            [1, 0, 1, 0], [1, 0, -1, 0], [-1, 0, 1, 0], [-1, 0, -1, 0],
            [1, 0, 0, 1], [1, 0, 0, -1], [-1, 0, 0, 1], [-1, 0, 0, -1],
            [0, 1, 1, 0], [0, 1, -1, 0], [0, -1, 1, 0], [0, -1, -1, 0],
            [0, 1, 0, 1], [0, 1, 0, -1], [0, -1, 0, 1], [0, -1, 0, -1],
            [0, 0, 1, 1], [0, 0, 1, -1], [0, 0, -1, 1], [0, 0, -1, -1]
        ];

        perms.forEach(p => {
            this.vertices.push({ x: p[0], y: p[1], z: p[2], w: p[3] });
        });

        // Connect vertices at distance sqrt(2)
        this.edges = [];
        for (let i = 0; i < this.vertices.length; i++) {
            for (let j = i + 1; j < this.vertices.length; j++) {
                const v1 = this.vertices[i];
                const v2 = this.vertices[j];
                const dist = Math.sqrt(
                    Math.pow(v1.x - v2.x, 2) +
                    Math.pow(v1.y - v2.y, 2) +
                    Math.pow(v1.z - v2.z, 2) +
                    Math.pow(v1.w - v2.w, 2)
                );
                if (dist < 1.5) {
                    this.edges.push([i, j]);
                }
            }
        }
    }

    create120Cell() {
        // Simplified 120-cell (showing subset of vertices)
        // Full 120-cell has 600 vertices, too many for smooth visualization
        this.vertices = [];
        const scale = 0.5;

        // Generate vertices based on golden ratio
        const phi = (1 + Math.sqrt(5)) / 2;

        // Add some vertices from the 120-cell structure
        for (let i = 0; i < 60; i++) {
            const angle1 = (i / 60) * Math.PI * 2;
            const angle2 = (i / 60) * Math.PI * 4;

            this.vertices.push({
                x: Math.cos(angle1) * scale,
                y: Math.sin(angle1) * scale,
                z: Math.cos(angle2) * scale,
                w: Math.sin(angle2) * scale
            });
        }

        // Connect nearby vertices
        this.edges = [];
        for (let i = 0; i < this.vertices.length; i++) {
            for (let j = i + 1; j < this.vertices.length; j++) {
                const v1 = this.vertices[i];
                const v2 = this.vertices[j];
                const dist = Math.sqrt(
                    Math.pow(v1.x - v2.x, 2) +
                    Math.pow(v1.y - v2.y, 2) +
                    Math.pow(v1.z - v2.z, 2) +
                    Math.pow(v1.w - v2.w, 2)
                );
                if (dist < 0.8) {
                    this.edges.push([i, j]);
                }
            }
        }
    }

    createCustomStructure() {
        // Random structure for exploration
        this.vertices = [];
        this.edges = [];
        const numVertices = 10;

        for (let i = 0; i < numVertices; i++) {
            this.vertices.push({
                x: (Math.random() - 0.5) * 2,
                y: (Math.random() - 0.5) * 2,
                z: (Math.random() - 0.5) * 2,
                w: (Math.random() - 0.5) * 2
            });
        }

        // Connect some vertices randomly
        for (let i = 0; i < numVertices; i++) {
            const numConnections = 2 + Math.floor(Math.random() * 3);
            for (let j = 0; j < numConnections; j++) {
                const target = Math.floor(Math.random() * numVertices);
                if (target !== i && !this.edges.some(e =>
                    (e[0] === i && e[1] === target) || (e[0] === target && e[1] === i))) {
                    this.edges.push([i, target]);
                }
            }
        }
    }

    randomizeStructure() {
        // Add random perturbation to current structure
        this.vertices.forEach(v => {
            v.x += (Math.random() - 0.5) * 0.2;
            v.y += (Math.random() - 0.5) * 0.2;
            v.z += (Math.random() - 0.5) * 0.2;
            v.w += (Math.random() - 0.5) * 0.2;
        });

        this.updateProjection();
    }

    project4Dto3D(v4d, angleXW, angleYZ, angleZW) {
        // Rotate in 4D
        const x = v4d.x;
        const y = v4d.y;
        const z = v4d.z;
        const w = v4d.w;

        // XW rotation
        let x1 = x * Math.cos(angleXW) - w * Math.sin(angleXW);
        let w1 = x * Math.sin(angleXW) + w * Math.cos(angleXW);

        // YZ rotation
        let y1 = y * Math.cos(angleYZ) - z * Math.sin(angleYZ);
        let z1 = y * Math.sin(angleYZ) + z * Math.cos(angleYZ);

        // ZW rotation
        let z2 = z1 * Math.cos(angleZW) - w1 * Math.sin(angleZW);
        let w2 = z1 * Math.sin(angleZW) + w1 * Math.cos(angleZW);

        // Project to 3D using perspective projection
        const distance = this.projectionDistance;
        const scale = 1 / (distance - w2);

        return {
            x: x1 * scale,
            y: y1 * scale,
            z: z2 * scale
        };
    }

    createVisualization() {
        // Create vertex spheres
        const vertexGeometry = new THREE.SphereGeometry(0.1, 16, 16);
        const vertexMaterial = new THREE.MeshPhongMaterial({ color: 0x06b6d4 });

        this.vertices.forEach((v, i) => {
            const sphere = new THREE.Mesh(vertexGeometry, vertexMaterial.clone());
            sphere.userData.vertexIndex = i;
            this.scene.add(sphere);
            this.vertexObjects.push(sphere);
        });

        // Create edge lines
        const edgeMaterial = new THREE.LineBasicMaterial({ color: 0x10b981, transparent: true, opacity: 0.6 });

        this.edges.forEach(edge => {
            const geometry = new THREE.BufferGeometry();
            const positions = new Float32Array(6); // 2 vertices * 3 coordinates
            geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

            const line = new THREE.Line(geometry, edgeMaterial.clone());
            line.userData.edge = edge;
            this.scene.add(line);
            this.edgeObjects.push(line);
        });

        this.updateProjection();
    }

    updateProjection() {
        const angleXW = this.time * this.rotationSpeed;
        const angleYZ = this.time * this.rotationSpeed * 0.7;
        const angleZW = this.time * this.rotationSpeed * 0.5;

        // Update vertex positions
        this.vertices.forEach((v4d, i) => {
            const v3d = this.project4Dto3D(v4d, angleXW, angleYZ, angleZW);
            this.vertexObjects[i].position.set(v3d.x, v3d.y, v3d.z);
        });

        // Update edge positions
        this.edgeObjects.forEach((line, i) => {
            const edge = this.edges[i];
            const v3d1 = this.project4Dto3D(this.vertices[edge[0]], angleXW, angleYZ, angleZW);
            const v3d2 = this.project4Dto3D(this.vertices[edge[1]], angleXW, angleYZ, angleZW);

            const positions = line.geometry.attributes.position.array;
            positions[0] = v3d1.x;
            positions[1] = v3d1.y;
            positions[2] = v3d1.z;
            positions[3] = v3d2.x;
            positions[4] = v3d2.y;
            positions[5] = v3d2.z;

            line.geometry.attributes.position.needsUpdate = true;
        });
    }

    analyzeRigidity() {
        const V = this.vertices.length;
        const E = this.edges.length;

        // 4D rigidity: E >= 4V - 10
        const requiredEdges = 4 * V - 10;
        const degreesOfFreedom = 4 * V - 10;
        const redundancy = E - requiredEdges;
        const efficiency = V > 0 ? ((E / requiredEdges) * 100).toFixed(1) : 0;

        // Update UI
        document.getElementById('numVertices').textContent = V;
        document.getElementById('numEdges').textContent = E;
        document.getElementById('degreesOfFreedom').textContent = degreesOfFreedom;
        document.getElementById('requiredEdges').textContent = requiredEdges;
        document.getElementById('redundancy').textContent = redundancy;
        document.getElementById('efficiency').textContent = efficiency + '%';

        // Determine rigidity status
        const statusEl = document.getElementById('rigidityStatus');
        if (E >= requiredEdges) {
            statusEl.textContent = 'RIGID';
            statusEl.className = 'font-bold text-green-400';
        } else {
            statusEl.textContent = 'FLEXIBLE';
            statusEl.className = 'font-bold text-red-400';
        }

        // Update info text
        document.getElementById('rigidityInfo').innerHTML = `
            <span class="text-cyan-400">${V} vertices</span> |
            <span class="text-green-400">${E} edges</span> |
            <span class="text-yellow-400">${E >= requiredEdges ? 'Rigid' : 'Flexible'}</span>
        `;
    }

    animate() {
        const animate = () => {
            requestAnimationFrame(animate);

            this.time += 0.01;
            this.updateProjection();

            if (this.renderer && this.scene && this.camera) {
                this.renderer.render(this.scene, this.camera);
            }
        };

        animate();
    }
}

// Initialize simulator when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new Rigidity4DSimulator();
});
