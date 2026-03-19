// Pythagorean Snapping Simulator
class PythagoreanSimulator {
    constructor() {
        this.canvas = document.getElementById('snapCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.points = [];
        this.threshold = 0.1;
        this.showGrid = true;
        this.showRatios = true;
        this.showAngles = true;

        this.pythagoreanTriples = [
            { a: 3, b: 4, c: 5 },
            { a: 5, b: 12, c: 13 },
            { a: 8, b: 15, c: 17 },
            { a: 7, b: 24, c: 25 },
            { a: 20, b: 21, c: 29 },
            { a: 9, b: 40, c: 41 },
            { a: 12, b: 35, c: 37 },
        ];

        this.scale = 20; // Pixels per unit
        this.offsetX = this.canvas.width / 2;
        this.offsetY = this.canvas.height / 2;

        this.init();
    }

    init() {
        this.setupEventListeners();
        this.populateTriplesList();
        this.render();
        this.renderEquation();
    }

    setupEventListeners() {
        this.canvas.addEventListener('click', (e) => this.handleCanvasClick(e));

        document.getElementById('threshold').addEventListener('input', (e) => {
            this.threshold = parseFloat(e.target.value);
            document.getElementById('thresholdValue').textContent = this.threshold.toFixed(2);
            this.recalculateSnaps();
            this.render();
        });

        document.getElementById('showGrid').addEventListener('change', (e) => {
            this.showGrid = e.target.checked;
            this.render();
        });

        document.getElementById('showRatios').addEventListener('change', (e) => {
            this.showRatios = e.target.checked;
            this.render();
        });

        document.getElementById('showAngles').addEventListener('change', (e) => {
            this.showAngles = e.target.checked;
            this.render();
        });

        document.getElementById('resetBtn').addEventListener('click', () => {
            this.points = [];
            this.updateStats();
            this.render();
            document.getElementById('snapHistory').innerHTML = '<p class="text-gray-500">No snaps yet</p>';
        });
    }

    handleCanvasClick(e) {
        const rect = this.canvas.getBoundingClientRect();
        const scaleX = this.canvas.width / rect.width;
        const scaleY = this.canvas.height / rect.height;

        const x = (e.clientX - rect.left) * scaleX;
        const y = (e.clientY - rect.top) * scaleY;

        // Convert to mathematical coordinates
        const mathX = (x - this.offsetX) / this.scale;
        const mathY = (this.offsetY - y) / this.scale;

        // Snap to Pythagorean triple
        const snapped = this.snapToPythagorean(mathX, mathY);

        this.points.push({
            x: mathX,
            y: mathY,
            snapped: snapped.snapped,
            snappedTo: snapped.snappedTo,
            distance: snapped.distance
        });

        this.updateSnapHistory(snapped);
        this.updateStats();
        this.render();
    }

    snapToPythagorean(x, y) {
        let snapped = null;
        let minDistance = Infinity;

        for (const triple of this.pythagoreanTriples) {
            const distance = Math.sqrt(Math.pow(x - triple.a, 2) + Math.pow(y - triple.b, 2));

            if (distance < this.threshold && distance < minDistance) {
                minDistance = distance;
                snapped = { ...triple };
            }
        }

        return {
            original: { x, y },
            snapped: snapped,
            snappedTo: snapped ? { x: snapped.a, y: snapped.b } : null,
            distance: minDistance === Infinity ? 0 : minDistance
        };
    }

    recalculateSnaps() {
        this.points = this.points.map(point => {
            const snapped = this.snapToPythagorean(point.x, point.y);
            return {
                x: point.x,
                y: point.y,
                snapped: snapped.snapped,
                snappedTo: snapped.snappedTo,
                distance: snapped.distance
            };
        });
        this.updateStats();
    }

    render() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw grid
        if (this.showGrid) {
            this.drawGrid();
        }

        // Draw Pythagorean ratios
        if (this.showRatios) {
            this.drawPythagoreanRatios();
        }

        // Draw points
        this.points.forEach(point => {
            const screenX = point.x * this.scale + this.offsetX;
            const screenY = this.offsetY - point.y * this.scale;

            // Draw line from original to snapped
            if (point.snapped) {
                const snappedScreenX = point.snappedTo.x * this.scale + this.offsetX;
                const snappedScreenY = this.offsetY - point.snappedTo.y * this.scale;

                this.ctx.beginPath();
                this.ctx.moveTo(screenX, screenY);
                this.ctx.lineTo(snappedScreenX, snappedScreenY);
                this.ctx.strokeStyle = 'rgba(59, 130, 246, 0.5)';
                this.ctx.lineWidth = 2;
                this.ctx.stroke();

                // Draw snapped point
                this.ctx.beginPath();
                this.ctx.arc(snappedScreenX, snappedScreenY, 8, 0, 2 * Math.PI);
                this.ctx.fillStyle = 'rgb(34, 197, 94)';
                this.ctx.fill();
            }

            // Draw original point
            this.ctx.beginPath();
            this.ctx.arc(screenX, screenY, 6, 0, 2 * Math.PI);
            this.ctx.fillStyle = point.snapped ? 'rgb(59, 130, 246)' : 'rgb(239, 68, 68)';
            this.ctx.fill();
        });

        // Update coordinates display
        if (this.points.length > 0) {
            const lastPoint = this.points[this.points.length - 1];
            document.getElementById('coordinates').textContent =
                `Last: (${lastPoint.x.toFixed(2)}, ${lastPoint.y.toFixed(2)})` +
                (lastPoint.snapped ? ` → Snapped to (${lastPoint.snappedTo.x}, ${lastPoint.snappedTo.y})` : '');
        }
    }

    drawGrid() {
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
        this.ctx.lineWidth = 1;

        // Vertical lines
        for (let x = this.offsetX % this.scale; x < this.canvas.width; x += this.scale) {
            this.ctx.beginPath();
            this.ctx.moveTo(x, 0);
            this.ctx.lineTo(x, this.canvas.height);
            this.ctx.stroke();
        }

        // Horizontal lines
        for (let y = this.offsetY % this.scale; y < this.canvas.height; y += this.scale) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, y);
            this.ctx.lineTo(this.canvas.width, y);
            this.ctx.stroke();
        }

        // Axes
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
        this.ctx.lineWidth = 2;

        // X-axis
        this.ctx.beginPath();
        this.ctx.moveTo(0, this.offsetY);
        this.ctx.lineTo(this.canvas.width, this.offsetY);
        this.ctx.stroke();

        // Y-axis
        this.ctx.beginPath();
        this.ctx.moveTo(this.offsetX, 0);
        this.ctx.lineTo(this.offsetX, this.canvas.height);
        this.ctx.stroke();
    }

    drawPythagoreanRatios() {
        this.ctx.fillStyle = 'rgba(34, 197, 94, 0.3)';
        this.ctx.strokeStyle = 'rgba(34, 197, 94, 0.8)';
        this.ctx.lineWidth = 2;

        this.pythagoreanTriples.forEach(triple => {
            const x = triple.a * this.scale + this.offsetX;
            const y = this.offsetY - triple.b * this.scale;

            // Draw ratio point
            this.ctx.beginPath();
            this.ctx.arc(x, y, 5, 0, 2 * Math.PI);
            this.ctx.fill();

            // Draw label
            this.ctx.fillStyle = 'rgba(34, 197, 94, 1)';
            this.ctx.font = '12px monospace';
            this.ctx.fillText(`(${triple.a}, ${triple.b})`, x + 10, y - 10);
            this.ctx.fillStyle = 'rgba(34, 197, 94, 0.3)';

            // Draw triangle
            if (this.showAngles) {
                this.ctx.beginPath();
                this.ctx.moveTo(this.offsetX, this.offsetY);
                this.ctx.lineTo(x, this.offsetY);
                this.ctx.lineTo(x, y);
                this.ctx.closePath();
                this.ctx.stroke();
            }
        });
    }

    populateTriplesList() {
        const list = document.getElementById('triplesList');
        list.innerHTML = this.pythagoreanTriples.map(t => `
            <div class="flex justify-between items-center bg-gray-900 p-2 rounded">
                <span>${t.a}² + ${t.b}² = ${t.c}²</span>
                <span class="text-green-400">(${t.a}, ${t.b})</span>
            </div>
        `).join('');
    }

    updateSnapHistory(snapped) {
        const history = document.getElementById('snapHistory');
        if (history.querySelector('.text-gray-500')) {
            history.innerHTML = '';
        }

        const entry = document.createElement('div');
        entry.className = `bg-gray-900 p-2 rounded ${snapped.snapped ? 'border-l-4 border-green-500' : 'border-l-4 border-red-500'}`;
        entry.innerHTML = `
            <div class="font-mono text-xs">
                (${snapped.original.x.toFixed(2)}, ${snapped.original.y.toFixed(2)})
                ${snapped.snapped ? `→ (${snapped.snappedTo.x}, ${snapped.snappedTo.y})` : '(no snap)'}
            </div>
            ${snapped.snapped ? `<div class="text-xs text-gray-400">Distance: ${snapped.distance.toFixed(3)}</div>` : ''}
        `;
        history.insertBefore(entry, history.firstChild);
    }

    updateStats() {
        const total = this.points.length;
        const snapped = this.points.filter(p => p.snapped).length;
        const snapRate = total > 0 ? (snapped / total * 100).toFixed(1) : 0;
        const avgDistance = snapped > 0
            ? (this.points.reduce((sum, p) => sum + (p.distance || 0), 0) / snapped).toFixed(3)
            : '0.00';

        document.getElementById('totalPoints').textContent = total;
        document.getElementById('snappedPoints').textContent = snapped;
        document.getElementById('snapRate').textContent = `${snapRate}%`;
        document.getElementById('avgDistance').textContent = avgDistance;
    }

    renderEquation() {
        katex.render('a^2 + b^2 = c^2', document.getElementById('equation'), {
            throwOnError: false
        });
    }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    new PythagoreanSimulator();
});
