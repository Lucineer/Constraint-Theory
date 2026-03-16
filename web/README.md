# Constraint Theory Web Assets

**Static assets for interactive geometric demonstrations**

---

## Asset Architecture

```mermaid
graph TB
    subgraph Root["/web"]
        Home["index.html<br/>Homepage"]
        CSS["css/<br/>Stylesheets"]
        JS["js/<br/>Scripts"]
        Sim["simulators/<br/>Interactive demos"]
    end

    subgraph CSSContent["CSS Modules"]
        Main["main.css<br/>Core styles"]
    end

    subgraph JSContent["JavaScript Modules"]
        Lib["lib/<br/>Third-party"]
        Utils["utils/<br/>Utilities"]
    end

    subgraph Sims["Interactive Simulators"]
        Pyth["pythagorean/<br/>Snapping"]
        Rig["rigidity/<br/>Matroid"]
        Hol["holonomy/<br/>Transport"]
        Perf["performance/<br/>Benchmarks"]
        KD["kdtree/<br/>Spatial index"]
    end

    Home --> CSS
    Home --> JS
    Home --> Sim

    CSS --> Main
    JS --> Lib
    JS --> Utils
    Sim --> Pyth
    Sim --> Rig
    Sim --> Hol
    Sim --> Perf
    Sim --> KD

    style Home fill:#e3f2fd
    style Sim fill:#fff3e0
    style Pyth fill:#e8f5e9
```

---

## Simulator Ecosystem

### Interactive Demonstrations

```mermaid
graph LR
    subgraph User["User Interaction"]
        Input[Input]
        Viz[Visualization]
        Stats[Statistics]
    end

    subgraph Backend["Backend API"]
        API["Geometry API"]
        Bench["Benchmark API"]
    end

    subgraph Core["Core Engine"]
        Rust["Rust Engine"]
        GPU["GPU (optional)"]
    end

    Input --> API
    Viz --> API
    Stats --> Bench
    API --> Rust
    Bench --> Rust
    Rust --> GPU

    style User fill:#e3f2fd
    style Backend fill:#fff3e0
    style Core fill:#e8f5e9
```

---

## Simulators

### 1. Pythagorean Snapping

**Path:** `/simulators/pythagorean/`

Interactive vector snapping to integer ratio constraints.

```mermaid
graph TD
    Input[User clicks canvas] --> Snap[Snap to nearest<br/>Pythagorean triple]
    Snap --> Display[Display snapped point]
    Snap --> Stats[Update statistics]

    Snap --> Cache{In cache?}
    Cache -->|Yes| Fast[Fast path]
    Cache -->|No| API[Call Rust API]
    API --> Fast

    style Input fill:#e3f2fd
    style Snap fill:#fff3e0
    style Display fill:#e8f5e9
```

**Features:**
- Interactive canvas placement
- Real-time snapping visualization
- Adjustable snap threshold
- Integer ratio display
- Performance statistics

**API:**
```typescript
// Snap vector to integer ratio
POST /api/geometry/snap
{
  "vector": [0.6, 0.8],
  "threshold": 0.01
}

// Response
{
  "snapped": [0.6, 0.8],
  "ratio": [3, 4, 5],
  "noise": 0.0001
}
```

---

### 2. Rigidity Matroid

**Path:** `/simulators/rigidity/`

Laman graph visualization and rigidity testing.

```mermaid
graph TD
    Graph[User creates graph] --> Laman[Laman's Theorem<br/>2V - 3 edges]
    Laman --> Rigid{Is rigid?}
    Rigid -->|Yes| Green[Display green]
    Rigid -->|No| Red[Display red]

    Laman --> Count[Count edges]
    Count --> Check{2V - 3?}
    Check -->|Yes| Rigid
    Check -->|No| Flexible[Flexible graph]

    style Graph fill:#e3f2fd
    style Laman fill:#fff3e0
    style Green fill:#e8f5e9
    style Red fill:#ffebee
```

**Features:**
- Interactive graph editor
- Real-time rigidity checking
- Preset configurations
- Force-directed layout
- Visual feedback

**API:**
```typescript
// Check rigidity
POST /api/constraints/solve
{
  "vertices": [[0,0], [1,0], [0,1]],
  "edges": [[0,1], [1,2], [0,2]]
}

// Response
{
  "rigid": true,
  "degrees_of_freedom": 0,
  "laman_condition": true
}
```

---

### 3. Discrete Holonomy

**Path:** `/simulators/holonomy/`

Parallel transport visualization.

```mermaid
graph LR
    Path[Define path] --> Transport[Parallel transport<br/>along path]
    Transport --> Holonomy[Compute holonomy<br/>H = P - I]
    Holonomy --> Deviation{Deviation?}

    Deviation -->|Zero| Flat[Flat manifold]
    Deviation -->|Non-zero| Curved[Curved manifold]

    style Path fill:#e3f2fd
    style Transport fill:#fff3e0
    style Flat fill:#e8f5e9
    style Curved fill:#ffebee
```

**Features:**
- 3D visualization
- Platonic solid selection
- Path drawing tools
- Deviation measurement

**API:**
```typescript
// Compute holonomy
POST /api/geometry/transform
{
  "manifold": "sphere",
  "path": [[0,0], [π/2,0], [π/2,π/2], [0,0]]
}

// Response
{
  "holonomy": {
    "norm": 0.15,
    "matrix": [[0.99, -0.01], [0.01, 0.99]]
  },
  "curvature": 1.0
}
```

---

### 4. Performance Benchmarks

**Path:** `/simulators/performance/`

Performance comparison visualization.

```mermaid
graph TD
    Start[Select benchmark] --> Run[Run benchmark]
    Run --> CPU[CPU implementation]
    Run --> GPU[GPU implementation]

    CPU --> Result1[Collect results]
    GPU --> Result2[Collect results]

    Result1 --> Compare[Compare]
    Result2 --> Compare

    Compare --> Chart[Display chart]
    Compare --> Table[Display table]

    style Start fill:#e3f2fd
    style Run fill:#fff3e0
    style Chart fill:#e8f5e9
```

**Features:**
- Benchmark execution
- Performance comparison
- Results visualization
- Historical tracking

**API:**
```typescript
// Run benchmark
POST /api/simulators/performance/benchmark
{
  "operation": "kdtree_search",
  "size": 10000,
  "iterations": 100
}

// Response
{
  "cpu_time": 20.7,
  "gpu_time": 0.11,
  "speedup": 188,
  "operations_per_second": 4830917
}
```

---

### 5. KD-Tree Visualization

**Path:** `/simulators/kdtree/`

Spatial partitioning visualization.

```mermaid
graph TD
    Points[Generate points] --> Build[Build KD-tree]
    Build --> Split[Split on median]
    Split --> Recurse{Recurse?}

    Recurse -->|Yes| Build
    Recurse -->|No| Done[Tree complete]

    Done --> Query[Spatial query]
    Query --> Traverse[Traverse tree]
    Traverse --> Result[Return result]

    style Points fill:#e3f2fd
    style Build fill:#fff3e0
    style Result fill:#e8f5e9
```

**Features:**
- Interactive construction
- Query visualization
- Performance comparison
- Tree depth control

**API:**
```typescript
// Build KD-tree
GET /api/simulators/kdtree/build?points=100

// Response
{
  "tree": {
    "depth": 7,
    "nodes": 100,
    "build_time": 0.002
  }
}

// Spatial query
POST /api/geometry/query
{
  "point": [0.5, 0.5],
  "k": 5
}

// Response
{
  "neighbors": [[0.6, 0.8], [0.4, 0.6], ...],
  "query_time": 0.0001
}
```

---

## Styling System

### CSS Architecture

```mermaid
graph TD
    Variables[CSS Variables] --> Theme[Theme Colors]
    Variables --> Spacing[Spacing Scale]
    Variables --> Typography[Typography Scale]

    Theme --> Components[Component Styles]
    Spacing --> Components
    Typography --> Components

    Components --> Pages[Simulator Pages]

    style Variables fill:#e3f2fd
    style Components fill:#fff3e0
    style Pages fill:#e8f5e9
```

### Design Tokens

```css
:root {
    /* Colors */
    --primary: #3b82f6;
    --secondary: #8b5cf6;
    --success: #22c55e;
    --danger: #ef4444;

    /* Spacing */
    --space-xs: 0.25rem;
    --space-sm: 0.5rem;
    --space-md: 1rem;
    --space-lg: 2rem;

    /* Typography */
    --font-sans: system-ui, sans-serif;
    --font-mono: 'SF Mono', monospace;
}
```

---

## JavaScript Architecture

### Module System

```mermaid
graph LR
    Lib[Third-party Libs] --> Core[Core Modules]
    Utils[Utilities] --> Core
    Core --> Sims[Simulator Scripts]

    Lib --> KaTeX[KaTeX Math]
    Lib --> Mermaid[Mermaid Diagrams]
    Utils --> Canvas[Canvas Helpers]
    Utils --> API[API Client]

    Core --> Pyth[Pythagorean]
    Core --> Rig[Rigidity]
    Core --> Hol[Holonomy]

    style Lib fill:#e3f2fd
    style Core fill:#fff3e0
    style Sims fill:#e8f5e9
```

### Libraries

- **KaTeX** - Math rendering
- **Mermaid.js** - Diagrams
- **Canvas API** - Graphics
- **WebGL** - GPU acceleration (future)

---

## Deployment

### Architecture

```mermaid
graph TB
    User[User Browser] --> CF[Cloudflare Edge]
    CF --> Worker[Cloudflare Worker]
    CF --> R2[R2 Storage]

    Worker --> Static[Static Assets]
    Worker --> API[API Routes]

    API --> Rust[Rust Engine]
    Rust --> GPU[GPU Compute]

    style User fill:#e3f2fd
    style CF fill:#fff3e0
    style Rust fill:#e8f5e9
```

### Local Development

```bash
# Serve static files
npx serve web -p 8080

# Or Python
python -m http.server 8080 --directory web
```

### Production Deployment

1. **Cloudflare Workers** - Built-in responses
2. **Cloudflare R2** - Object storage (optional)
3. **CDN** - Edge caching

---

## Performance Optimization

### Optimization Strategies

```mermaid
graph TD
    Load[Page Load] --> Lazy[Lazy Loading]
    Load --> Preload[Asset Preloading]

    Lazy --> Defer[Defer Scripts]
    Lazy --> Code[Code Splitting]

    Preload --> Cache[Cache Headers]
    Preload --> Compress[Compression]

    Cache --> CDN[CDN Caching]
    Compress --> Gzip[Gzip + Brotli]

    style Load fill:#e3f2fd
    style Lazy fill:#fff3e0
    style Preload fill:#e8f5e9
```

### Best Practices

1. **Defer JavaScript**
   ```html
   <script src="app.js" defer></script>
   ```

2. **Preload Critical Assets**
   ```html
   <link rel="preload" href="css/main.css" as="style">
   ```

3. **Cache Strategy**
   - Static: 1 year
   - API: 5 minutes
   - Version updates: `app.v2.js`

4. **Compression**
   - Gzip enabled
   - Brotli optional

---

## Browser Support

### Target Browsers

```mermaid
graph LR
    Chrome[Chrome 90+] --> Features[Modern Features]
    Firefox[Firefox 88+] --> Features
    Safari[Safari 14+] --> Features
    Edge[Edge 90+] --> Features

    Features --> Canvas[Canvas API]
    Features --> ES[ES2021]
    Features --> Grid[CSS Grid]
    Features --> Flex[Flexbox]

    style Chrome fill:#e3f2fd
    style Features fill:#fff3e0
    style Canvas fill:#e8f5e9
```

### Features Used

- Canvas API
- ES2021 JavaScript
- CSS Grid & Flexbox
- Web Workers (optional)

---

## Testing

### Test Strategy

```mermaid
graph TD
    Manual[Manual Testing] --> Browsers[Cross-browser]
    Manual --> Mobile[Responsive]
    Manual --> A11y[Accessibility]

    Auto[Automated] --> Visual[Visual Regression]
    Auto --> Unit[Unit Tests]
    Auto --> Perf[Performance]

    Browsers --> Report[Test Report]
    Mobile --> Report
    A11y --> Report
    Visual --> Report
    Unit --> Report
    Perf --> Report

    style Manual fill:#e3f2fd
    style Auto fill:#fff3e0
    style Report fill:#e8f5e9
```

### Test Commands

```bash
# Visual regression tests
npm test

# Manual browser test
open http://localhost:8080
```

---

## Accessibility

### ARIA Implementation

```html
<!-- Buttons -->
<button aria-label="Reset simulation">Reset</button>

<!-- Canvas -->
<canvas role="img" aria-label="Pythagorean snapping visualization"></canvas>

<!-- Interactive elements -->
<button aria-pressed="false">Toggle</button>
```

### Keyboard Navigation

- Tab order: Logical and consistent
- Focus indicators: Visible
- Shortcuts: Documented

---

**Last Updated:** 2026-03-16
**Version:** 1.0.0
