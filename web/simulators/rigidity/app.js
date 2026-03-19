// Rigidity Matroid Simulator
class RigiditySimulator {
    constructor() {
        this.canvas = document.getElementById('rigidityCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.nodes = [];
        this.edges = [];
        this.nodeRadius = 20;
        this.showLabels = true;
        this.animate = true;
        this.animationFrame = null;

        this.init();
    }

    init() {
        this.setupEventListeners();
        this.generatePreset('triangle');
    }

    setupEventListeners() {
        document.getElementById('addNodeBtn').addEventListener('click', () => {
            this.addNode();
            this.updateRigidity();
            this.render();
        });

        document.getElementById('resetBtn').addEventListener('click', () => {
            this.nodes = [];
            this.edges = [];
            this.updateRigidity();
            this.render();
        });

        document.getElementById('generateBtn').addEventListener('click', () => {
            const targetNodes = parseInt(document.getElementById('targetNodes').value);
            const targetEdges = parseInt(document.getElementById('targetEdges').value);
            this.generateLamanGraph(targetNodes, targetEdges);
        });

        document.getElementById('showLabels').addEventListener('change', (e) => {
            this.showLabels = e.target.checked;
            this.render();
        });

        document.getElementById('animate').addEventListener('change', (e) => {
            this.animate = e.target.checked;
            if (this.animate) {
                this.startAnimation();
            } else {
                this.stopAnimation();
            }
        });

        // Preset buttons
        document.querySelectorAll('.preset-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                this.generatePreset(btn.dataset.preset);
            });
        });

        // Canvas interaction for adding edges
        this.canvas.addEventListener('click', (e) => this.handleCanvasClick(e));

        if (this.animate) {
            this.startAnimation();
        }
    }

    addNode() {
        const angle = (this.nodes.length / 10) * Math.PI * 2;
        const radius = 200;
        const x = this.canvas.width / 2 + Math.cos(angle) * radius;
        const y = this.canvas.height / 2 + Math.sin(angle) * radius;

        this.nodes.push({
            id: this.nodes.length,
            x, y,
            vx: 0, vy: 0,
            fixed: this.nodes.length < 2
        });
    }

    generateLamanGraph(nodeCount, edgeCount) {
        this.nodes = [];
        this.edges = [];

        // Create nodes in a circle
        for (let i = 0; i < nodeCount; i++) {
            const angle = (i / nodeCount) * Math.PI * 2;
            const radius = 200;
            this.nodes.push({
                id: i,
                x: this.canvas.width / 2 + Math.cos(angle) * radius,
                y: this.canvas.height / 2 + Math.sin(angle) * radius,
                vx: 0, vy: 0,
                fixed: i < 2
            });
        }

        // Create edges to satisfy Laman's theorem
        const requiredEdges = 2 * nodeCount - 3;
        const actualEdges = Math.min(edgeCount, requiredEdges);

        // Add edges to create a minimally rigid graph
        for (let i = 0; i < nodeCount && this.edges.length < actualEdges; i++) {
            const next = (i + 1) % nodeCount;
            this.edges.push({ from: i, to: next, length: this.calculateDistance(i, next) });
        }

        // Add more edges if needed
        let attempts = 0;
        while (this.edges.length < actualEdges && attempts < 1000) {
            const from = Math.floor(Math.random() * nodeCount);
            const to = Math.floor(Math.random() * nodeCount);

            if (from !== to && !this.edgeExists(from, to)) {
                this.edges.push({ from, to, length: this.calculateDistance(from, to) });
            }
            attempts++;
        }

        this.updateRigidity();
        this.render();
    }

    edgeExists(from, to) {
        return this.edges.some(e =>
            (e.from === from && e.to === to) ||
            (e.from === to && e.to === from)
        );
    }

    calculateDistance(from, to) {
        const nodeA = this.nodes[from];
        const nodeB = this.nodes[to];
        return Math.sqrt(Math.pow(nodeA.x - nodeB.x, 2) + Math.pow(nodeA.y - nodeB.y, 2));
    }

    generatePreset(preset) {
        this.nodes = [];
        this.edges = [];

        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;
        const size = 150;

        switch (preset) {
            case 'triangle':
                this.nodes = [
                    { id: 0, x: centerX, y: centerY - size, vx: 0, vy: 0, fixed: true },
                    { id: 1, x: centerX - size, y: centerY + size * 0.7, vx: 0, vy: 0, fixed: true },
                    { id: 2, x: centerX + size, y: centerY + size * 0.7, vx: 0, vy: 0, fixed: false }
                ];
                this.edges = [
                    { from: 0, to: 1, length: this.calculateDistance(0, 1) },
                    { from: 1, to: 2, length: this.calculateDistance(1, 2) },
                    { from: 2, to: 0, length: this.calculateDistance(2, 0) }
                ];
                break;

            case 'square':
                this.nodes = [
                    { id: 0, x: centerX - size/2, y: centerY - size/2, vx: 0, vy: 0, fixed: true },
                    { id: 1, x: centerX + size/2, y: centerY - size/2, vx: 0, vy: 0, fixed: true },
                    { id: 2, x: centerX + size/2, y: centerY + size/2, vx: 0, vy: 0, fixed: false },
                    { id: 3, x: centerX - size/2, y: centerY + size/2, vx: 0, vy: 0, fixed: false }
                ];
                this.edges = [
                    { from: 0, to: 1, length: this.calculateDistance(0, 1) },
                    { from: 1, to: 2, length: this.calculateDistance(1, 2) },
                    { from: 2, to: 3, length: this.calculateDistance(2, 3) },
                    { from: 3, to: 0, length: this.calculateDistance(3, 0) }
                ];
                break;

            case 'square-diag':
                this.nodes = [
                    { id: 0, x: centerX - size/2, y: centerY - size/2, vx: 0, vy: 0, fixed: true },
                    { id: 1, x: centerX + size/2, y: centerY - size/2, vx: 0, vy: 0, fixed: true },
                    { id: 2, x: centerX + size/2, y: centerY + size/2, vx: 0, vy: 0, fixed: false },
                    { id: 3, x: centerX - size/2, y: centerY + size/2, vx: 0, vy: 0, fixed: false }
                ];
                this.edges = [
                    { from: 0, to: 1, length: this.calculateDistance(0, 1) },
                    { from: 1, to: 2, length: this.calculateDistance(1, 2) },
                    { from: 2, to: 3, length: this.calculateDistance(2, 3) },
                    { from: 3, to: 0, length: this.calculateDistance(3, 0) },
                    { from: 0, to: 2, length: this.calculateDistance(0, 2) } // Diagonal
                ];
                break;

            case 'pentagon':
                for (let i = 0; i < 5; i++) {
                    const angle = (i / 5) * Math.PI * 2 - Math.PI / 2;
                    this.nodes.push({
                        id: i,
                        x: centerX + Math.cos(angle) * size,
                        y: centerY + Math.sin(angle) * size,
                        vx: 0, vy: 0,
                        fixed: i < 2
                    });
                }
                for (let i = 0; i < 5; i++) {
                    this.edges.push({
                        from: i,
                        to: (i + 1) % 5,
                        length: this.calculateDistance(i, (i + 1) % 5)
                    });
                }
                break;
        }

        this.updateRigidity();
        this.render();
    }

    handleCanvasClick(e) {
        const rect = this.canvas.getBoundingClientRect();
        const scaleX = this.canvas.width / rect.width;
        const scaleY = this.canvas.height / rect.height;

        const x = (e.clientX - rect.left) * scaleX;
        const y = (e.clientY - rect.top) * scaleY;

        // Find clicked node
        const clickedNode = this.nodes.find(node => {
            const distance = Math.sqrt(Math.pow(node.x - x, 2) + Math.pow(node.y - y, 2));
            return distance < this.nodeRadius;
        });

        if (clickedNode) {
            if (this.selectedNode === null) {
                this.selectedNode = clickedNode.id;
            } else if (this.selectedNode !== clickedNode.id) {
                // Create edge
                if (!this.edgeExists(this.selectedNode, clickedNode.id)) {
                    this.edges.push({
                        from: this.selectedNode,
                        to: clickedNode.id,
                        length: this.calculateDistance(this.selectedNode, clickedNode.id)
                    });
                    this.updateRigidity();
                    this.render();
                }
                this.selectedNode = null;
            } else {
                this.selectedNode = null;
            }
        } else {
            this.selectedNode = null;
        }

        this.render();
    }

    updateRigidity() {
        const nodeCount = this.nodes.length;
        const edgeCount = this.edges.length;
        const requiredEdges = 2 * nodeCount - 3;
        const isRigid = edgeCount >= requiredEdges && nodeCount >= 3;

        document.getElementById('vertexCount').textContent = nodeCount;
        document.getElementById('edgeCount').textContent = edgeCount;
        document.getElementById('requiredEdges').textContent = requiredEdges;

        const statusElement = document.getElementById('rigidityStatus');
        const statusText = document.getElementById('graphStatus');

        if (nodeCount < 3) {
            statusElement.textContent = 'Need ≥3 vertices';
            statusElement.className = 'text-yellow-400';
            statusText.textContent = `Nodes: ${nodeCount} | Edges: ${edgeCount} | Rigid: No (need ≥3 vertices)`;
        } else if (isRigid) {
            statusElement.textContent = 'Rigid';
            statusElement.className = 'text-green-400';
            statusText.textContent = `Nodes: ${nodeCount} | Edges: ${edgeCount} | Rigid: Yes`;
        } else {
            statusElement.textContent = 'Not Rigid';
            statusElement.className = 'text-red-400';
            statusText.textContent = `Nodes: ${nodeCount} | Edges: ${edgeCount} | Rigid: No (need ${requiredEdges - edgeCount} more edges)`;
        }
    }

    startAnimation() {
        const animate = () => {
            if (this.animate) {
                this.simulate();
                this.render();
                this.animationFrame = requestAnimationFrame(animate);
            }
        };
        animate();
    }

    stopAnimation() {
        if (this.animationFrame) {
            cancelAnimationFrame(this.animationFrame);
            this.animationFrame = null;
        }
    }

    simulate() {
        // Simple force-directed layout simulation
        const k = 0.01; // Spring constant
        const damping = 0.9;

        // Apply forces
        this.nodes.forEach(node => {
            if (node.fixed) return;

            let fx = 0, fy = 0;

            // Spring forces from edges
            this.edges.forEach(edge => {
                const other = edge.from === node.id ? this.nodes[edge.to] : this.nodes[edge.from];
                if (!other) return;

                const dx = other.x - node.x;
                const dy = other.y - node.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                const force = (distance - edge.length) * k;

                fx += (dx / distance) * force;
                fy += (dy / distance) * force;
            });

            // Apply velocity
            node.vx = (node.vx + fx) * damping;
            node.vy = (node.vy + fy) * damping;

            // Update position
            node.x += node.vx;
            node.y += node.vy;
        });
    }

    render() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw edges
        this.edges.forEach(edge => {
            const from = this.nodes[edge.from];
            const to = this.nodes[edge.to];

            this.ctx.beginPath();
            this.ctx.moveTo(from.x, from.y);
            this.ctx.lineTo(to.x, to.y);
            this.ctx.strokeStyle = '#3b82f6';
            this.ctx.lineWidth = 3;
            this.ctx.stroke();
        });

        // Draw nodes
        this.nodes.forEach(node => {
            this.ctx.beginPath();
            this.ctx.arc(node.x, node.y, this.nodeRadius, 0, 2 * Math.PI);

            if (node.fixed) {
                this.ctx.fillStyle = '#22c55e';
            } else if (node.id === this.selectedNode) {
                this.ctx.fillStyle = '#f59e0b';
            } else {
                this.ctx.fillStyle = '#3b82f6';
            }

            this.ctx.fill();
            this.ctx.strokeStyle = '#1f2937';
            this.ctx.lineWidth = 2;
            this.ctx.stroke();

            // Draw label
            if (this.showLabels) {
                this.ctx.fillStyle = '#f9fafb';
                this.ctx.font = 'bold 14px sans-serif';
                this.ctx.textAlign = 'center';
                this.ctx.textBaseline = 'middle';
                this.ctx.fillText(node.id, node.x, node.y);
            }
        });
    }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    new RigiditySimulator();
});
