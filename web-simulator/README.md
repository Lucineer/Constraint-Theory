# Constraint Theory Web Simulator

**Interactive demonstrations of geometric constraint-solving and deterministic computation**

**Live Demo:** https://constraint-theory.superinstance.ai
**Status:** Production Ready
**License:** MIT

---

## Overview

The Web Simulator provides interactive visualizations of Constraint Theory concepts, making abstract geometric and mathematical ideas accessible through hands-on exploration. Watch vectors snap to perfect Pythagorean triples, explore KD-tree traversal, and understand O(log n) complexity in real-time.

**What You'll Experience:**
- See continuous vectors snap to discrete geometric states
- Visualize spatial indexing algorithms in action
- Understand the difference between probabilistic and deterministic computation
- Explore the mathematical foundations interactively

---

## Quick Start

### Option 1: Try Online (Recommended)

Visit **https://constraint-theory.superinstance.ai** to try the interactive demos in your browser. No installation required.

### Option 2: Local Development

```bash
# Navigate to web simulator directory
cd web-simulator

# Install dependencies
npm install

# Start development server
npm run dev

# Open browser to http://localhost:8787
```

### Option 3: Docker (Isolated Environment)

```bash
# Build and run with Docker Compose
cd docker
docker-compose up

# Access at http://localhost:8787
```

---

## Available Simulators

### 1. Pythagorean Manifold Visualizer ⭐ Featured

**Watch continuous space snap to discrete geometric states**

**Interactive Features:**
- Click anywhere to place a continuous vector
- See real-time snapping to nearest Pythagorean triple
- Visualize KD-tree traversal path
- Adjust manifold density (100-2000 points)
- View performance metrics live
- Toggle uncertainty field display

**Educational Goals:**
- Understand geometric constraint-solving
- See O(log n) complexity vs O(n) brute force
- Visualize exact vs approximate computation
- Understand why results are deterministic

**Try it:** https://constraint-theory.superinstance.ai/simulators/pythagorean.html

<details>
<summary><strong>Mathematical Background (click to expand)</strong></summary>

**Pythagorean Triples:** Integer solutions to a² + b² = c²

The manifold contains points like:
- (3/5, 4/5) from triple (3, 4, 5)
- (5/13, 12/13) from triple (5, 12, 13)
- (8/17, 15/17) from triple (8, 15, 17)

**Snapping Operation:**
```
Φ(v) = argmin_{g ∈ G} ||v - g||
```

Where G is the set of all Pythagorean triples normalized to unit circle.

**Complexity:** O(log n) via KD-tree spatial indexing
</details>

---

### 2. Performance Comparison Dashboard (Planned)

**Compare geometric vs traditional approaches**

**Planned Features:**
- Side-by-side algorithm comparison
- Live benchmark visualization
- Performance metrics charts
- Memory usage analysis

**Educational Goals:**
- Understand performance tradeoffs
- See when geometric approaches excel
- Learn about algorithmic complexity

---

### 3. KD-tree Visualization (Planned)

**Understand spatial indexing interactively**

**Planned Features:**
- Interactive 2D point set creation
- Step-by-step KD-tree construction
- Nearest neighbor search visualization
- Comparison with linear search

**Educational Goals:**
- Learn how KD-trees work
- Understand space partitioning
- See why O(log n) beats O(n)

---

### 4. Rigidity Percolation Simulator (Planned)

**Explore structural rigidity emergence**

**Planned Features:**
- Interactive graph construction
- Real-time rigidity detection (Laman's theorem)
- Percolation threshold visualization
- Cluster coloring and analysis

**Educational Goals:**
- Understand Laman's theorem
- See phase transitions in graphs
- Explore rigidity-curvature duality

---

### 5. Holonomy Transport Visualizer (Planned)

**Explore parallel transport on curved manifolds**

**Planned Features:**
- Manifold surface exploration
- Interactive loop creation
- Holonomy calculation display
- Flat vs. curved comparison

**Educational Goals:**
- Understand geometric phase
- See curvature effects
- Learn about gauge theory

---

## Technology Stack

### Frontend

- **Canvas API** - High-performance 2D rendering
- **TypeScript** - Type-safe JavaScript
- **CSS3** - Modern styling (Grid, Flexbox)
- **Vanilla JS** - No framework dependencies

### Backend

- **Cloudflare Workers** - Global edge deployment
- **R2** - Optional asset storage
- **KV** - Optional caching layer
- **D1** - Optional analytics database

### DevOps

- **Docker** - Containerized development
- **Docker Compose** - Multi-service orchestration
- **Wrangler** - Workers deployment tool

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     WEB SIMULATOR                            │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
│  │  LANDING    │  │ VISUALIZERS │  │   DOCS      │        │
│  │    PAGE     │  │             │  │             │        │
│  └─────────────┘  └─────────────┘  └─────────────┘        │
│         │                 │                 │                │
│         └─────────────────┴─────────────────┘                │
│                           │                                  │
│                    ┌──────▼──────┐                           │
│                    │   CANVAS    │                           │
│                    │  RENDERING  │                           │
│                    └──────┬──────┘                           │
│                           │                                  │
│                    ┌──────▼──────┐                           │
│                    │  WORKER     │                           │
│                    │  LOGIC      │                           │
│                    └──────┬──────┘                           │
│                           │                                  │
│                    ┌──────▼──────┐                           │
│                    │  CLOUDFLARE │                           │
│                    │  WORKERS    │                           │
│                    └─────────────┘                           │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

**Project Structure:**
```
web-simulator/
├── static/                 # Static assets
│   ├── index.html         # Landing page
│   ├── simulators/        # Simulator pages
│   │   └── pythagorean.html
│   ├── css/              # Stylesheets
│   │   └── main.css
│   └── js/               # JavaScript
│       └── pythagorean.js
├── docker/               # Docker configuration
│   ├── Dockerfile
│   └── docker-compose.yml
├── worker.ts            # Cloudflare Worker entry
├── wrangler.toml        # Workers configuration
├── package.json         # Dependencies
└── README.md           # This file
```

---

## Development Guide

### Prerequisites

- Node.js >= 18.0.0
- npm >= 9.0.0
- (Optional) Docker
- (Optional) Cloudflare account

### Setup for Development

```bash
# Clone repository
git clone https://github.com/SuperInstance/constraint-theory.git
cd constraint-theory/web-simulator

# Install dependencies
npm install

# Start development server
npm run dev

# Open http://localhost:8787
```

### Adding New Simulators

1. **Create HTML file** in `static/simulators/`
```html
<!DOCTYPE html>
<html>
<head>
    <title>Your Simulator</title>
    <link rel="stylesheet" href="../css/main.css">
</head>
<body>
    <canvas id="simulator"></canvas>
    <script src="../js/your-simulator.js"></script>
</body>
</html>
```

2. **Add JavaScript logic** in `static/js/`
```javascript
// your-simulator.js
const canvas = document.getElementById('simulator');
const ctx = canvas.getContext('2d');

function init() {
    // Initialize simulator
}

function draw() {
    // Render loop
    requestAnimationFrame(draw);
}

init();
draw();
```

3. **Add styles** to `static/css/main.css`
```css
#simulator {
    width: 100%;
    height: 100%;
}
```

4. **Add simulator card** to `static/index.html`
```html
<div class="simulator-card">
    <h3>Your Simulator</h3>
    <p>Description of what it does</p>
    <a href="simulators/your-simulator.html" class="btn">Try It</a>
</div>
```

### Testing

```bash
# Run tests (when implemented)
npm test

# Lint code
npm run lint

# Format code
npm run format
```

---

## Deployment

### Cloudflare Workers (Production)

```bash
# Login to Cloudflare
npx wrangler login

# Deploy to production
npm run deploy

# Deploy to staging
npm run deploy:staging
```

### Configuration

Edit `wrangler.toml` to configure:

```toml
name = "constraint-theory-simulator"
main = "worker.ts"
type = "javascript"

[env.production]
routes = [
  { pattern = "your-domain.com/*", zone_name = "your-domain.com" }
]
```

### Custom Domain Setup

1. Add your domain in Cloudflare Dashboard
2. Update `wrangler.toml` with your domain
3. Deploy: `npm run deploy`

---

## Performance

### Current Metrics

| Metric | Target | Achieved | Status |
|--------|--------|----------|--------|
| Page Load | <2 seconds | ~1.5 seconds | ✅ |
| First Interaction | <3 seconds | ~2 seconds | ✅ |
| Animation FPS | 60fps | 60fps | ✅ |
| Mobile Support | 100% | 100% | ✅ |

### Optimization Techniques

- **Canvas rendering** - Hardware-accelerated graphics
- **RequestAnimationFrame** - Smooth 60fps animations
- **Lazy loading** - Load simulators on demand
- **Minimal dependencies** - Fast page loads
- **Edge caching** - Cloudflare CDN for global distribution

---

## Educational Resources

### Core Concepts Demonstrated

1. **Geometric Constraint-Solving**
   - See continuous vectors snap to discrete states
   - Understand exact vs approximate computation
   - Visualize deterministic output guarantees

2. **Spatial Indexing**
   - Watch KD-tree traversal in action
   - Compare O(log n) vs O(n) performance
   - Understand space partitioning

3. **Rigidity Theory**
   - Explore Laman's theorem interactively
   - See structural rigidity emerge
   - Understand phase transitions

4. **Differential Geometry**
   - Visualize curvature effects
   - Explore holonomy transport
   - Understand geometric phase

### Further Reading

- [MATHEMATICAL_FOUNDATIONS_DEEP_DIVE.md](../docs/MATHEMATICAL_FOUNDATIONS_DEEP_DIVE.md)
- [THEORETICAL_GUARANTEES.md](../docs/THEORETICAL_GUARANTEES.md)
- [GEOMETRIC_INTERPRETATION.md](../docs/GEOMETRIC_INTERPRETATION.md)
- [TUTORIAL.md](../docs/TUTORIAL.md)

---

## Contributing

We welcome contributions to the web simulator!

### How to Contribute

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

### Contribution Areas

- **New Simulators** - Create interactive visualizations
- **Documentation** - Improve guides and explanations
- **Performance** - Optimize rendering and algorithms
- **Accessibility** - Improve screen reader support
- **Internationalization** - Add translations
- **Mobile** - Improve touch interactions

### Contribution Guidelines

- Keep code simple and readable
- Add helpful comments
- Test on multiple browsers
- Ensure mobile compatibility
- Follow existing code style

---

## Roadmap

### Phase 1: Foundation ✅ Complete

- [x] Pythagorean Manifold Visualizer
- [x] Landing page
- [x] Basic styling
- [x] Cloudflare Workers setup
- [x] Docker configuration

### Phase 2: Additional Simulators (In Progress)

- [ ] Performance Comparison Dashboard
- [ ] KD-tree Visualization
- [ ] Rigidity Percolation Simulator
- [ ] Holonomy Transport Visualizer

### Phase 3: Enhanced Features (Planned)

- [ ] User accounts and progress tracking
- [ ] Educational quizzes and assessments
- [ ] Community contribution system
- [ ] Multi-language support

### Phase 4: Advanced Integration (Future)

- [ ] WASM integration for core engine
- [ ] GPU acceleration via WebGPU
- [ ] Real-time collaboration
- [ ] VR/AR visualization

---

## Troubleshooting

### Common Issues

**Issue:** Development server won't start

**Solution:**
```bash
# Clear npm cache
npm cache clean --force

# Reinstall dependencies
rm -rf node_modules
npm install

# Restart server
npm run dev
```

**Issue:** Canvas not rendering

**Solution:**
- Check browser console for errors
- Ensure JavaScript is enabled
- Try a different browser

**Issue:** Deployment fails

**Solution:**
```bash
# Check Wrangler authentication
npx wrangler whoami

# Re-login if needed
npx wrangler login

# Retry deployment
npm run deploy
```

---

## License

MIT License - see [LICENSE](../LICENSE) file for details

---

## Acknowledgments

- **SuperInstance Research Team** - Core constraint theory research
- **Cloudflare** - Workers platform and edge computing infrastructure
- **Open Source Community** - Tools and libraries that make this possible

---

## Contact

- **GitHub:** https://github.com/SuperInstance/constraint-theory
- **Live Demo:** https://constraint-theory.superinstance.ai
- **Discussions:** https://github.com/SuperInstance/constraint-theory/discussions
- **Issues:** https://github.com/SuperInstance/constraint-theory/issues

---

**Last Updated:** 2026-03-17
**Version:** 1.0.0
**Status:** Production Ready
**Maintainer:** SuperInstance Team
