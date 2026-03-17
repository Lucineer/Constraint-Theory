# Constraint Theory API Reference

**Version:** 1.0.0
**Last Updated:** 2026-03-16
**Base URL:** `https://constrainttheory.superinstance.ai/api`

---

## Table of Contents

1. [Overview](#overview)
2. [Authentication](#authentication)
3. [Rate Limiting](#rate-limiting)
4. [REST API Endpoints](#rest-api-endpoints)
5. [WebSocket Protocol](#websocket-protocol)
6. [Data Structures](#data-structures)
7. [Error Handling](#error-handling)
8. [Simulator APIs](#simulator-apis)
9. [Encoding Systems](#encoding-systems)
10. [Code Examples](#code-examples)
11. [SDK Reference](#sdk-reference)

---

## Overview

The Constraint Theory API provides RESTful endpoints and WebSocket connections for:

- **Geometric Operations:** Pythagorean snapping, transformations, intersections
- **Constraint Solving:** Validate and solve geometric constraint systems
- **Simulators:** Interactive visualization and computation engines
- **Performance Benchmarks:** Compare constraint theory vs traditional methods
- **Real-time Updates:** WebSocket streaming for live computations

### API Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    CLOUDFLARE WORKERS                       │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   REST API   │  │  WebSocket   │  │  Simulators  │      │
│  │              │  │              │  │              │      │
│  │ • Geometry   │  │ • Real-time  │  │ • Pythagorean│      │
│  │ • Constraints│  │ • Streaming  │  │ • Rigidity   │      │
│  │ • Validation │  │ • Events     │  │ • Holonomy   │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│                                                               │
│  ┌──────────────────────────────────────────────────────┐  │
│  │              Core Processing Engine                   │  │
│  │                                                       │  │
│  │  • Pythagorean Manifold                              │  │
│  │  • KD-tree Spatial Indexing                          │  │
│  │  • SIMD Acceleration                                 │  │
│  │  • Constraint Solver                                 │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

### Quick Start

```bash
# Health check
curl https://constrainttheory.superinstance.ai/health

# List all simulators
curl https://constrainttheory.superinstance.ai/api/simulators

# Snap a vector to Pythagorean ratio
curl -X POST https://constrainttheory.superinstance.ai/api/geometry/snap \
  -H "Content-Type: application/json" \
  -d '{"vector": {"x": 0.6, "y": 0.8}, "threshold": 0.1}'
```

---

## Authentication

### Current Status

**Version 1.0.0:** Public API (no authentication required)

### Future Authentication (v2.0)

```http
GET /api/geometry/snap
Authorization: Bearer YOUR_API_KEY
```

### API Key Format

```typescript
interface APIKey {
  keyId: string;        // e.g., "ct_pk_1234567890"
  secret: string;       // e.g., "ct_sk_abcdef..."
  permissions: string[]; // ["read", "write", "admin"]
  rateLimit: number;    // requests per hour
}
```

### Authentication Flow (Future)

```typescript
// 1. Generate API key from dashboard
const apiKey = await fetch('https://constrainttheory.superinstance.ai/api/keys', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${SESSION_TOKEN}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    name: 'My Application',
    permissions: ['read', 'write']
  })
});

// 2. Use API key in requests
const response = await fetch('https://constrainttheory.superinstance.ai/api/geometry/snap', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${apiKey.key}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    vector: { x: 0.6, y: 0.8 },
    threshold: 0.1
  })
});
```

---

## Rate Limiting

### Current Limits

| Tier | Requests/Hour | Burst | Features |
|------|---------------|-------|----------|
| Free | 1,000 | 100 | Public API, basic simulators |
| Pro | 10,000 | 500 | All simulators, priority support |
| Enterprise | Unlimited | 5,000 | Custom limits, dedicated support |

### Rate Limit Headers

```http
HTTP/1.1 200 OK
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 947
X-RateLimit-Reset: 1678867200
```

### Rate Limit Error Response

```json
{
  "error": "rate_limit_exceeded",
  "message": "Rate limit exceeded. Please retry after 3600 seconds.",
  "retryAfter": 3600,
  "documentation": "https://constrainttheory.superinstance.ai/docs/rate-limiting"
}
```

### Handling Rate Limits

```typescript
async function fetchWithRetry(url: string, options: RequestInit, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    const response = await fetch(url, options);

    if (response.status === 429) {
      const retryAfter = parseInt(response.headers.get('Retry-After') || '60');
      console.log(`Rate limited. Retrying after ${retryAfter} seconds...`);
      await sleep(retryAfter * 1000);
      continue;
    }

    return response;
  }

  throw new Error('Max retries exceeded');
}
```

---

## REST API Endpoints

### Health & Status

#### GET /health

Check API health status.

**Response:**

```json
{
  "status": "healthy",
  "timestamp": "2026-03-16T10:30:00Z",
  "version": "v1"
}
```

#### GET /api/status

Get detailed API status.

**Response:**

```json
{
  "status": "operational",
  "version": "v1",
  "timestamp": "2026-03-16T10:30:00Z",
  "services": {
    "core": "operational",
    "simulators": "operational",
    "database": "operational"
  }
}
```

#### GET /api

Get API documentation index.

**Response:**

```json
{
  "version": "v1",
  "title": "Constraint Theory API",
  "description": "RESTful API for constraint theory computations and simulations",
  "baseUrl": "/api",
  "endpoints": {
    "health": "GET /health",
    "docs": "GET /api",
    "snap": "POST /api/geometry/snap",
    "solve": "POST /api/constraints/solve",
    "validate": "POST /api/constraints/validate"
  },
  "authentication": "None (public API)",
  "rateLimit": "1000 requests per hour per IP",
  "cache": "5 minutes for GET requests"
}
```

---

### Geometry Endpoints

#### POST /api/geometry/snap

Snap a 2D vector to the nearest Pythagorean ratio.

**Request Body:**

```json
{
  "vector": {
    "x": 0.6,
    "y": 0.8
  },
  "threshold": 0.1
}
```

**Parameters:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| vector | object | Yes | 2D vector to snap |
| vector.x | number | Yes | X component |
| vector.y | number | Yes | Y component |
| threshold | number | No | Maximum distance to snap (default: 0.1) |

**Response:**

```json
{
  "original": {
    "x": 0.6,
    "y": 0.8
  },
  "snapped": {
    "x": 0.6,
    "y": 0.8
  },
  "snappedTo": "pythagorean_ratio",
  "distance": 0,
  "ratio": {
    "a": 3,
    "b": 4,
    "c": 5
  }
}
```

**Error Response:**

```json
{
  "error": "invalid_input",
  "message": "vector is required"
}
```

**Example:**

```bash
curl -X POST https://constrainttheory.superinstance.ai/api/geometry/snap \
  -H "Content-Type: application/json" \
  -d '{
    "vector": {"x": 0.61, "y": 0.79},
    "threshold": 0.1
  }'
```

#### POST /api/geometry/transform

Apply geometric transformations to vectors.

**Request Body:**

```json
{
  "vectors": [
    {"x": 0.6, "y": 0.8},
    {"x": 0.36, "y": 0.48}
  ],
  "transform": {
    "type": "rotate",
    "angle": 45,
    "degrees": true
  }
}
```

**Transform Types:**

- `rotate`: Rotate by angle
- `scale`: Scale by factor
- `translate`: Translate by offset
- `reflect`: Reflect across line
- `shear`: Shear transformation

**Response:**

```json
{
  "original": [
    {"x": 0.6, "y": 0.8},
    {"x": 0.36, "y": 0.48}
  ],
  "transformed": [
    {"x": 0.1414, "y": 0.9899},
    {"x": 0.0849, "y": 0.5940}
  ],
  "transform": {
    "type": "rotate",
    "angle": 45,
    "matrix": [
      [0.7071, -0.7071],
      [0.7071, 0.7071]
    ]
  }
}
```

#### POST /api/geometry/intersect

Find intersections between geometric objects.

**Request Body:**

```json
{
  "objects": [
    {
      "type": "line",
      "start": {"x": 0, "y": 0},
      "end": {"x": 1, "y": 1}
    },
    {
      "type": "circle",
      "center": {"x": 0.5, "y": 0.5},
      "radius": 0.5
    }
  ]
}
```

**Response:**

```json
{
  "intersections": [
    {
      "point": {"x": 0.5, "y": 0.5},
      "type": "single",
      "objects": [0, 1]
    }
  ],
  "count": 1
}
```

---

### Constraint Endpoints

#### POST /api/constraints/solve

Solve a system of geometric constraints.

**Request Body:**

```json
{
  "constraints": [
    {
      "id": "c1",
      "type": "distance",
      "entities": ["p1", "p2"],
      "value": 5.0,
      "tolerance": 0.001
    },
    {
      "id": "c2",
      "type": "angle",
      "entities": ["p1", "p2", "p3"],
      "value": 90,
      "tolerance": 0.1
    }
  ],
  "entities": {
    "p1": {"type": "point", "position": {"x": 0, "y": 0}},
    "p2": {"type": "point", "position": {"x": 1, "y": 0}},
    "p3": {"type": "point", "position": {"x": 1, "y": 1}}
  },
  "solver": "geometric",
  "maxIterations": 1000,
  "convergence": 0.0001
}
```

**Parameters:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| constraints | array | Yes | Array of constraint definitions |
| entities | object | Yes | Entity definitions |
| solver | string | No | Solver type: "geometric" or "numeric" |
| maxIterations | number | No | Maximum solver iterations |
| convergence | number | No | Convergence threshold |

**Response:**

```json
{
  "solved": true,
  "iterations": 42,
  "convergence": 0.00001,
  "result": {
    "p1": {"x": 0, "y": 0},
    "p2": {"x": 5, "y": 0},
    "p3": {"x": 5, "y": 5}
  },
  "constraints": [
    {
      "id": "c1",
      "satisfied": true,
      "error": 0
    },
    {
      "id": "c2",
      "satisfied": true,
      "error": 0.0001
    }
  ]
}
```

**Error Response:**

```json
{
  "error": "unsolvable",
  "message": "Constraint system is over-constrained",
  "conflicts": [
    {
      "constraint1": "c1",
      "constraint2": "c3",
      "reason": "Conflicting distance constraints"
    }
  ]
}
```

#### POST /api/constraints/validate

Validate a constraint system without solving.

**Request Body:**

```json
{
  "constraints": [
    {
      "id": "c1",
      "type": "distance",
      "entities": ["p1", "p2"],
      "value": 5.0
    },
    {
      "id": "c2",
      "type": "distance",
      "entities": ["p2", "p3"],
      "value": 4.0
    },
    {
      "id": "c3",
      "type": "distance",
      "entities": ["p1", "p3"],
      "value": 3.0
    }
  ]
}
```

**Response:**

```json
{
  "valid": true,
  "constraints": [
    {
      "id": "c1",
      "valid": true,
      "satisfiable": true,
      "dependencies": []
    },
    {
      "id": "c2",
      "valid": true,
      "satisfiable": true,
      "dependencies": ["c1"]
    },
    {
      "id": "c3",
      "valid": true,
      "satisfiable": true,
      "dependencies": ["c1", "c2"]
    }
  ],
  "rigidity": {
    "isRigid": true,
    "type": "minimally_rigid",
    "lamanCondition": "2*n - 3 = 3 edges"
  }
}
```

#### POST /api/constraints/optimize

Optimize constraint system for performance.

**Request Body:**

```json
{
  "constraints": [
    {
      "id": "c1",
      "type": "distance",
      "entities": ["p1", "p2"],
      "value": 5.0
    }
  ],
  "objective": "minimize_energy",
  "parameters": {
    "useGPU": true,
    "algorithm": "conjugate_gradient"
  }
}
```

**Response:**

```json
{
  "optimized": true,
  "improvement": {
    "timeReduction": "45%",
    "memoryReduction": "23%",
    "iterationReduction": "60%"
  },
  "suggestions": [
    {
      "type": "reorder",
      "description": "Reorder constraints for better cache locality",
      "impact": "high"
    },
    {
      "type": "parallelize",
      "description": "Enable parallel constraint solving",
      "impact": "medium"
    }
  ]
}
```

---

### Simulator Endpoints

#### GET /api/simulators

List all available simulators.

**Response:**

```json
{
  "simulators": [
    {
      "id": "pythagorean",
      "name": "Pythagorean Snapping",
      "description": "Interactive visualization of integer ratio snapping",
      "path": "/simulators/pythagorean",
      "status": "stable",
      "features": ["real-time", "interactive", "visualization"]
    },
    {
      "id": "rigidity",
      "name": "Rigidity Matroid",
      "description": "Laman graph rigidity visualization",
      "path": "/simulators/rigidity",
      "status": "stable",
      "features": ["graph-editor", "laman-check", "stress-test"]
    },
    {
      "id": "holonomy",
      "name": "Discrete Holonomy",
      "description": "Parallel transport along Platonic symmetries",
      "path": "/simulators/holonomy",
      "status": "experimental",
      "features": ["3d-visualization", "platonic-solids", "transport-paths"]
    },
    {
      "id": "performance",
      "name": "Performance Benchmark",
      "description": "Compare constraint theory vs traditional methods",
      "path": "/simulators/performance",
      "status": "stable",
      "features": ["benchmarks", "comparison", "charts"]
    },
    {
      "id": "kdtree",
      "name": "KD-Tree Visualization",
      "description": "Spatial partitioning for LVQ tokenization",
      "path": "/simulators/kdtree",
      "status": "stable",
      "features": ["tree-builder", "spatial-query", "visualization"]
    },
    {
      "id": "voxel",
      "name": "Voxel Engine",
      "description": "3D voxel-based constraint visualization",
      "path": "/simulators/voxel",
      "status": "stable",
      "features": ["3d-rendering", "voxel-editing", "constraint-coloring"]
    },
    {
      "id": "swarm",
      "name": "Swarm Intelligence",
      "description": "Particle swarm optimization for constraints",
      "path": "/simulators/swarm",
      "status": "stable",
      "features": ["particle-system", "optimization", "real-time"]
    },
    {
      "id": "reasoning",
      "name": "Geometric Reasoning",
      "description": "AI-powered geometric constraint reasoning",
      "path": "/simulators/reasoning",
      "status": "experimental",
      "features": ["ai-inference", "constraint-synthesis", "explanation"]
    },
    {
      "id": "entropy",
      "name": "Entropy Minimization",
      "description": "Information theory for constraint solving",
      "path": "/simulators/entropy",
      "status": "stable",
      "features": ["entropy-calculation", "optimization", "visualization"]
    },
    {
      "id": "bottleneck",
      "name": "Theory of Constraints",
      "description": "Bottleneck analysis and optimization",
      "path": "/simulators/bottleneck",
      "status": "stable",
      "features": ["bottleneck-detection", "throughput-analysis", "optimization"]
    },
    {
      "id": "flow",
      "name": "Flow Network",
      "description": "Network flow algorithms for constraints",
      "path": "/simulators/flow",
      "status": "stable",
      "features": ["max-flow", "min-cut", "network-visualization"]
    },
    {
      "id": "benchmark",
      "name": "Performance Benchmarks",
      "description": "Comprehensive performance testing",
      "path": "/simulators/benchmark",
      "status": "stable",
      "features": ["performance-tests", "comparison", "charts"]
    }
  ]
}
```

#### GET /api/simulators/{id}/config

Get simulator configuration.

**Example: GET /api/simulators/pythagorean/config**

**Response:**

```json
{
  "id": "pythagorean",
  "name": "Pythagorean Snapping",
  "initialRatios": [
    {"a": 3, "b": 4, "c": 5},
    {"a": 5, "b": 12, "c": 13},
    {"a": 8, "b": 15, "c": 17},
    {"a": 7, "b": 24, "c": 25},
    {"a": 20, "b": 21, "c": 29}
  ],
  "snapThreshold": 0.1,
  "showAngles": true,
  "showCoordinates": true,
  "colors": {
    "primary": "#00ff88",
    "secondary": "#0088ff",
    "highlight": "#ff8800"
  },
  "performance": {
    "targetFPS": 60,
    "maxParticles": 1000,
    "enableGPU": true
  }
}
```

#### POST /api/simulators/{id}/run

Run a simulator with custom parameters.

**Example: POST /api/simulators/pythagorean/run**

**Request Body:**

```json
{
  "parameters": {
    "vectors": [
      {"x": 0.6, "y": 0.8},
      {"x": 0.36, "y": 0.48}
    ],
    "threshold": 0.1,
    "iterations": 100
  },
  "options": {
    "returnAnimation": true,
    "frameRate": 60,
    "format": "json"
  }
}
```

**Response:**

```json
{
  "runId": "pyth_20260316_103000",
  "status": "running",
  "results": {
    "snapped": [
      {"x": 0.6, "y": 0.8, "ratio": "3-4-5"},
      {"x": 0.36, "y": 0.48, "ratio": "3-4-5"}
    ],
    "statistics": {
      "totalVectors": 2,
      "snappedCount": 2,
      "averageNoise": 0.0,
      "processingTime": 0.001
    }
  },
  "animation": {
    "frames": [
      {
        "frame": 0,
        "timestamp": 0,
        "data": [...]
      }
    ],
    "duration": 1.0,
    "fps": 60
  }
}
```

---

## WebSocket Protocol

### Connection

```javascript
const ws = new WebSocket('wss://constrainttheory.superinstance.ai/ws');

ws.onopen = () => {
  console.log('Connected to Constraint Theory WebSocket');
};
```

### Message Format

All WebSocket messages follow this structure:

```typescript
interface WebSocketMessage {
  type: string;
  id: string;
  timestamp: number;
  payload: any;
}
```

### Client → Server Messages

#### Subscribe to Simulator

```json
{
  "type": "subscribe",
  "id": "sub_001",
  "payload": {
    "simulator": "pythagorean",
    "events": ["snap", "error", "complete"]
  }
}
```

#### Send Vector for Snapping

```json
{
  "type": "snap",
  "id": "snap_001",
  "payload": {
    "vector": {"x": 0.6, "y": 0.8},
    "threshold": 0.1
  }
}
```

#### Start Batch Processing

```json
{
  "type": "batch_start",
  "id": "batch_001",
  "payload": {
    "vectors": [
      {"x": 0.6, "y": 0.8},
      {"x": 0.36, "y": 0.48}
    ],
    "chunkSize": 100
  }
}
```

#### Cancel Operation

```json
{
  "type": "cancel",
  "id": "cancel_001",
  "payload": {
    "operationId": "batch_001"
  }
}
```

### Server → Client Messages

#### Snap Result

```json
{
  "type": "snap_result",
  "id": "snap_001",
  "timestamp": 1678867200000,
  "payload": {
    "original": {"x": 0.6, "y": 0.8},
    "snapped": {"x": 0.6, "y": 0.8},
    "noise": 0.0,
    "ratio": {"a": 3, "b": 4, "c": 5}
  }
}
```

#### Batch Progress

```json
{
  "type": "batch_progress",
  "id": "batch_001",
  "timestamp": 1678867200000,
  "payload": {
    "processed": 500,
    "total": 1000,
    "percentage": 50,
    "eta": 2.5
  }
}
```

#### Batch Complete

```json
{
  "type": "batch_complete",
  "id": "batch_001",
  "timestamp": 1678867200000,
  "payload": {
    "results": [...],
    "statistics": {
      "totalVectors": 1000,
      "snappedCount": 847,
      "averageNoise": 0.0234,
      "processingTime": 5.0
    }
  }
}
```

#### Error

```json
{
  "type": "error",
  "id": "err_001",
  "timestamp": 1678867200000,
  "payload": {
    "code": "invalid_vector",
    "message": "Vector must have x and y components",
    "details": {
      "received": {"x": 0.6},
      "expected": {"x": "number", "y": "number"}
    }
  }
}
```

### WebSocket Example

```javascript
const ws = new WebSocket('wss://constrainttheory.superinstance.ai/ws');

// Connection opened
ws.addEventListener('open', () => {
  console.log('Connected');

  // Subscribe to snap events
  ws.send(JSON.stringify({
    type: 'subscribe',
    id: 'sub_001',
    payload: {
      simulator: 'pythagorean',
      events: ['snap', 'error', 'complete']
    }
  }));

  // Send vector to snap
  ws.send(JSON.stringify({
    type: 'snap',
    id: 'snap_001',
    payload: {
      vector: { x: 0.6, y: 0.8 },
      threshold: 0.1
    }
  }));
});

// Listen for messages
ws.addEventListener('message', (event) => {
  const message = JSON.parse(event.data);

  switch (message.type) {
    case 'snap_result':
      console.log('Snapped:', message.payload);
      break;
    case 'error':
      console.error('Error:', message.payload);
      break;
    default:
      console.log('Unknown message:', message);
  }
});

// Connection closed
ws.addEventListener('close', () => {
  console.log('Disconnected');
});

// Connection error
ws.addEventListener('error', (error) => {
  console.error('WebSocket error:', error);
});
```

---

## Data Structures

### Vector2D

```typescript
interface Vector2D {
  x: number;
  y: number;
}
```

### PythagoreanRatio

```typescript
interface PythagoreanRatio {
  a: number;  // First leg
  b: number;  // Second leg
  c: number;  // Hypotenuse
}
```

### SnapResult

```typescript
interface SnapResult {
  original: Vector2D;
  snapped: Vector2D;
  snappedTo: 'pythagorean_ratio' | 'none';
  distance: number;
  ratio?: PythagoreanRatio;
  noise: number;
}
```

### Constraint

```typescript
interface Constraint {
  id: string;
  type: 'distance' | 'angle' | 'coincident' | 'parallel' | 'perpendicular';
  entities: string[];
  value: number;
  tolerance?: number;
  weight?: number;
}
```

### Entity

```typescript
interface Entity {
  id: string;
  type: 'point' | 'line' | 'circle' | 'arc';
  position?: Vector2D;
  radius?: number;
  start?: Vector2D;
  end?: Vector2D;
}
```

### ConstraintSolution

```typescript
interface ConstraintSolution {
  solved: boolean;
  iterations: number;
  convergence: number;
  result: Record<string, Vector2D>;
  constraints: Array<{
    id: string;
    satisfied: boolean;
    error: number;
  }>;
}
```

### LamanGraph

```typescript
interface LamanGraph {
  nodes: Array<{
    id: number;
    position: Vector2D;
    fixed: boolean;
  }>;
  edges: Array<{
    from: number;
    to: number;
    length: number;
  }>;
  isRigid: boolean;
  isMinimallyRigid: boolean;
  redundantEdges: number[];
}
```

---

## Error Handling

### Error Response Format

```typescript
interface ErrorResponse {
  error: string;
  message: string;
  details?: any;
  documentation?: string;
  timestamp: string;
}
```

### Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `invalid_input` | 400 | Request body is invalid |
| `missing_parameter` | 400 | Required parameter is missing |
| `invalid_parameter` | 400 | Parameter has invalid value |
| `unsolvable` | 400 | Constraint system cannot be solved |
| `over_constrained` | 400 | Too many constraints |
| `under_constrained` | 400 | Not enough constraints |
| `not_found` | 404 | Resource not found |
| `rate_limit_exceeded` | 429 | Rate limit exceeded |
| `internal_error` | 500 | Internal server error |
| `service_unavailable` | 503 | Service temporarily unavailable |

### Error Examples

```json
{
  "error": "invalid_input",
  "message": "vector is required",
  "details": {
    "received": {},
    "expected": {
      "vector": {
        "x": "number",
        "y": "number"
      }
    }
  },
  "documentation": "https://constrainttheory.superinstance.ai/docs/api#geometry-snap",
  "timestamp": "2026-03-16T10:30:00Z"
}
```

```json
{
  "error": "unsolvable",
  "message": "Constraint system is over-constrained",
  "details": {
    "conflicts": [
      {
        "constraint1": "c1",
        "constraint2": "c3",
        "reason": "Conflicting distance constraints"
      }
    ],
    "suggestions": [
      "Remove constraint c3",
      "Relax tolerance on c1 or c3"
    ]
  },
  "documentation": "https://constrainttheory.superinstance.ai/docs/constraints#solving",
  "timestamp": "2026-03-16T10:30:00Z"
}
```

### Error Handling Best Practices

```typescript
async function handleAPICall<T>(
  apiCall: () => Promise<T>,
  retries = 3
): Promise<T> {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await apiCall();

      if (!response.ok) {
        const error = await response.json();

        // Handle specific error codes
        switch (error.error) {
          case 'rate_limit_exceeded':
            const retryAfter = error.retryAfter || 60;
            console.log(`Rate limited. Retrying after ${retryAfter}s...`);
            await sleep(retryAfter * 1000);
            continue;

          case 'invalid_input':
            throw new Error(`Invalid input: ${error.message}`);

          case 'unsolvable':
            console.warn('Constraint system unsolvable:', error.details);
            throw new Error('Cannot solve constraint system');

          default:
            throw new Error(`API error: ${error.message}`);
        }
      }

      return await response.json();
    } catch (error) {
      if (i === retries - 1) throw error;
      console.log(`Retrying... (${i + 1}/${retries})`);
    }
  }

  throw new Error('Max retries exceeded');
}
```

---

## Simulator APIs

### 1. Pythagorean Snapping Simulator

**Path:** `/simulators/pythagorean`
**Status:** Stable
**Features:** Real-time snapping, interactive visualization

#### Configuration

```typescript
interface PythagoreanConfig {
  initialRatios: PythagoreanRatio[];
  snapThreshold: number;
  showAngles: boolean;
  showCoordinates: boolean;
  colors: {
    primary: string;
    secondary: string;
    highlight: string;
  };
}
```

#### JavaScript API

```javascript
// Initialize simulator
const simulator = new PythagoreanSimulator({
  container: '#simulator-container',
  threshold: 0.1,
  showAngles: true,
  showCoordinates: true
});

// Snap vector
const result = simulator.snap({ x: 0.6, y: 0.8 });
console.log('Snapped to:', result.snapped);
console.log('Ratio:', result.ratio);

// Subscribe to events
simulator.on('snap', (result) => {
  console.log('Vector snapped:', result);
});

simulator.on('hover', (vector) => {
  console.log('Hovering over:', vector);
});
```

#### Events

| Event | Data | Description |
|-------|------|-------------|
| `snap` | `SnapResult` | Vector snapped to ratio |
| `hover` | `Vector2D` | Mouse hovering over vector |
| `click` | `Vector2D` | Vector clicked |
| `reset` | - | Simulator reset |

---

### 2. Rigidity Matroid Simulator

**Path:** `/simulators/rigidity`
**Status:** Stable
**Features:** Graph editor, Laman check, stress test

#### Configuration

```typescript
interface RigidityConfig {
  nodes: Array<{
    id: number;
    position: Vector2D;
    fixed: boolean;
  }>;
  edges: Array<{
    from: number;
    to: number;
    length: number;
  }>;
  autoCheckLaman: boolean;
  showStress: boolean;
}
```

#### JavaScript API

```javascript
// Initialize simulator
const simulator = new RigiditySimulator({
  container: '#simulator-container',
  autoCheckLaman: true
});

// Add node
const node = simulator.addNode({
  position: { x: 100, y: 100 },
  fixed: false
});

// Add edge
simulator.addEdge(node.id, otherNode.id, 50);

// Check rigidity
const rigidity = simulator.checkRigidity();
console.log('Is rigid:', rigidity.isRigid);
console.log('Is minimally rigid:', rigidity.isMinimallyRigid);
```

#### Events

| Event | Data | Description |
|-------|------|-------------|
| `nodeAdded` | `Node` | Node added to graph |
| `edgeAdded` | `Edge` | Edge added to graph |
| `rigidityChanged` | `RigidityResult` | Rigidity status changed |
| `stressTestComplete` | `StressTestResult` | Stress test completed |

---

### 3. Discrete Holonomy Simulator

**Path:** `/simulators/holonomy`
**Status:** Experimental
**Features:** 3D visualization, Platonic solids, transport paths

#### Configuration

```typescript
interface HolonomyConfig {
  platonicSolid: 'tetrahedron' | 'cube' | 'octahedron' | 'dodecahedron' | 'icosahedron';
  initialVector: Vector3D;
  transportPath: string;
  showDeviations: boolean;
  animationSpeed: number;
}
```

#### JavaScript API

```javascript
// Initialize simulator
const simulator = new HolonomySimulator({
  container: '#simulator-container',
  platonicSolid: 'cube',
  showDeviations: true
});

// Transport vector
const result = simulator.transportVector({
  vector: { x: 1, y: 0, z: 0 },
  path: 'cube_face_loop'
});

console.log('Final vector:', result.vector);
console.log('Holonomy:', result.holonomy);
```

#### Events

| Event | Data | Description |
|-------|------|-------------|
| `transportStep` | `TransportStep` | Vector transported one step |
| `transportComplete` | `TransportResult` | Transport complete |
| `deviationDetected` | `Deviation` | Holonomy deviation detected |

---

### 4. Performance Benchmark Simulator

**Path:** `/simulators/performance`
**Status:** Stable
**Features:** Benchmarks, comparison, charts

#### Configuration

```typescript
interface BenchmarkConfig {
  algorithms: ('constraint' | 'traditional')[];
  problemSizes: number[];
  iterations: number;
  useGPU: boolean;
}
```

#### JavaScript API

```javascript
// Initialize simulator
const simulator = new BenchmarkSimulator({
  container: '#simulator-container',
  algorithms: ['constraint', 'traditional'],
  problemSizes: [100, 1000, 10000]
});

// Run benchmark
const results = await simulator.runBenchmark({
  algorithm: 'constraint',
  problemSize: 1000,
  iterations: 100
});

console.log('Average time:', results.averageTime);
console.log('Speedup:', results.comparison.speedup);
```

#### Events

| Event | Data | Description |
|-------|------|-------------|
| `benchmarkStart` | `BenchmarkConfig` | Benchmark started |
| `benchmarkProgress` | `Progress` | Benchmark progress update |
| `benchmarkComplete` | `BenchmarkResults` | Benchmark complete |
| `comparisonReady` | `Comparison` | Comparison chart ready |

---

### 5. KD-Tree Visualization Simulator

**Path:** `/simulators/kdtree`
**Status:** Stable
**Features:** Tree builder, spatial query, visualization

#### Configuration

```typescript
interface KDTreeConfig {
  points: Vector2D[];
  maxDepth: number;
  maxPointsPerNode: number;
  showPartition: boolean;
}
```

#### JavaScript API

```javascript
// Initialize simulator
const simulator = new KDTreeSimulator({
  container: '#simulator-container',
  maxDepth: 10
});

// Build tree
simulator.buildTree(points);

// Query nearest neighbors
const neighbors = simulator.queryNearest({
  point: { x: 0.5, y: 0.5 },
  k: 5
});
```

#### Events

| Event | Data | Description |
|-------|------|-------------|
| `treeBuilt` | `KDTree` | Tree construction complete |
| `nodeSplit` | `NodeSplit` | Node split during build |
| `queryComplete` | `QueryResult` | Query complete |

---

## Encoding Systems

### Origin-Centric Encoding

**Description:** Normalized encoding centered at origin with unitary symmetry

**Structure:**

```typescript
interface OriginCentricEncoding {
  type: 'origin-centric';
  origin: Vector2D;
  vectors: Array<{
    angle: number;      // Angle from origin (radians)
    magnitude: number;  // Normalized magnitude [0, 1]
    phase: number;      // Quantum phase angle
  }>;
}
```

**Advantages:**
- Rotationally invariant
- Zero-point reference
- O(log n) operations

**Example:**

```javascript
const encoding = encodeOriginCentric([
  { x: 3, y: 4 },
  { x: 5, y: 12 }
]);

// Result:
// {
//   type: 'origin-centric',
//   origin: { x: 0, y: 0 },
//   vectors: [
//     { angle: 0.927, magnitude: 1.0, phase: 0 },
//     { angle: 1.176, magnitude: 1.0, phase: 0 }
//   ]
// }
```

---

### Dodecet Encoding

**Description:** 12-element encoding based on dodecahedron symmetry

**Structure:**

```typescript
interface DodecetEncoding {
  type: 'dodecet';
  elements: number[];  // 12 elements
  symmetry: 'icosahedral';
  precision: number;   // Bits per element
}
```

**Advantages:**
- Higher dimensional representation
- Platonic symmetry
- Efficient compression

**Example:**

```javascript
const encoding = encodeDodecet(vectors, {
  precision: 8,
  normalize: true
});

// Result:
// {
//   type: 'dodecet',
//   elements: [0, 1, 0, 1, 1, 0, 1, 0, 0, 1, 1, 0],
//   symmetry: 'icosahedral',
//   precision: 8
// }
```

---

### 8-bit Encoding

**Description:** Compact 8-bit encoding for constrained environments

**Structure:**

```typescript
interface Bit8Encoding {
  type: '8-bit';
  data: Uint8Array;
  format: 'packed' | 'planar';
}
```

**Advantages:**
- Minimal memory footprint
- Fast processing
- Hardware acceleration

**Example:**

```javascript
const encoding = encode8Bit(vectors, {
  format: 'packed',
  scale: 255
});

// Result:
// {
//   type: '8-bit',
//   data: Uint8Array[...],
//   format: 'packed'
// }
```

---

### Traditional Encoding

**Description:** Standard floating-point encoding

**Structure:**

```typescript
interface TraditionalEncoding {
  type: 'traditional';
  data: Float32Array;
  precision: 'single' | 'double';
}
```

**Advantages:**
- Maximum precision
- Hardware native
- Broad compatibility

**Example:**

```javascript
const encoding = encodeTraditional(vectors, {
  precision: 'single'
});

// Result:
// {
//   type: 'traditional',
//   data: Float32Array[...],
//   precision: 'single'
// }
```

---

### Encoding Comparison

| Encoding | Memory | Speed | Precision | Use Case |
|----------|--------|-------|----------|----------|
| Origin-Centric | Medium | Fast | High | Geometric operations |
| Dodecet | Low | Medium | Medium | Symmetry-aware apps |
| 8-bit | Very Low | Very Fast | Low | Embedded systems |
| Traditional | High | Fast | Very High | General purpose |

---

### Encoding Migration Guide

#### Migrating from Traditional to Origin-Centric

```javascript
// Before (Traditional)
const traditional = encodeTraditional(vectors);

// After (Origin-Centric)
const originCentric = encodeOriginCentric(vectors);

// Convert existing data
function migrateTraditionalToOriginCentric(traditional) {
  const vectors = decodeTraditional(traditional);
  return encodeOriginCentric(vectors);
}
```

#### Migrating from 8-bit to Dodecet

```javascript
// Before (8-bit)
const bit8 = encode8Bit(vectors);

// After (Dodecet)
const dodecet = encodeDodecet(vectors, {
  precision: 8,
  normalize: true
});

// Convert existing data
function migrate8BitToDodecet(bit8) {
  const vectors = decode8Bit(bit8);
  return encodeDodecet(vectors);
}
```

---

## Code Examples

### Example 1: Basic Vector Snapping

```javascript
// Snap a single vector
async function snapVector(x, y, threshold = 0.1) {
  const response = await fetch('https://constrainttheory.superinstance.ai/api/geometry/snap', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      vector: { x, y },
      threshold
    })
  });

  const result = await response.json();
  return result;
}

// Usage
const result = await snapVector(0.6, 0.8);
console.log('Snapped to:', result.snapped);
console.log('Ratio:', result.ratio);
```

---

### Example 2: Batch Processing

```javascript
// Snap multiple vectors efficiently
async function snapBatch(vectors, threshold = 0.1) {
  const results = await Promise.all(
    vectors.map(v => snapVector(v.x, v.y, threshold))
  );

  return results;
}

// Usage
const vectors = [
  { x: 0.6, y: 0.8 },
  { x: 0.36, y: 0.48 },
  { x: 0.28, y: 0.96 }
];

const results = await snapBatch(vectors);
console.log('Results:', results);
```

---

### Example 3: WebSocket Real-time Snapping

```javascript
// Real-time vector snapping with WebSocket
class RealtimeSnapper {
  constructor() {
    this.ws = new WebSocket('wss://constrainttheory.superinstance.ai/ws');
    this.callbacks = new Map();
  }

  connect() {
    return new Promise((resolve, reject) => {
      this.ws.onopen = () => {
        // Subscribe to snap events
        this.send({
          type: 'subscribe',
          id: 'sub_001',
          payload: {
            simulator: 'pythagorean',
            events: ['snap', 'error']
          }
        });
        resolve();
      };

      this.ws.onerror = reject;
      this.ws.onmessage = (event) => this.handleMessage(event);
    });
  }

  snap(vector, threshold = 0.1) {
    const id = `snap_${Date.now()}`;
    return new Promise((resolve, reject) => {
      this.callbacks.set(id, { resolve, reject });
      this.send({
        type: 'snap',
        id,
        payload: { vector, threshold }
      });
    });
  }

  send(message) {
    this.ws.send(JSON.stringify(message));
  }

  handleMessage(event) {
    const message = JSON.parse(event.data);
    const callback = this.callbacks.get(message.id);

    if (callback) {
      callback.resolve(message.payload);
      this.callbacks.delete(message.id);
    }
  }
}

// Usage
const snapper = new RealtimeSnapper();
await snapper.connect();

const result = await snapper.snap({ x: 0.6, y: 0.8 });
console.log('Snapped:', result.snapped);
```

---

### Example 4: Constraint Solving

```javascript
// Solve a constraint system
async function solveConstraints(constraints, entities) {
  const response = await fetch('https://constrainttheory.superinstance.ai/api/constraints/solve', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      constraints,
      entities,
      solver: 'geometric',
      maxIterations: 1000,
      convergence: 0.0001
    })
  });

  const result = await response.json();
  return result;
}

// Usage
const constraints = [
  {
    id: 'c1',
    type: 'distance',
    entities: ['p1', 'p2'],
    value: 5.0,
    tolerance: 0.001
  },
  {
    id: 'c2',
    type: 'angle',
    entities: ['p1', 'p2', 'p3'],
    value: 90,
    tolerance: 0.1
  }
];

const entities = {
  p1: { type: 'point', position: { x: 0, y: 0 } },
  p2: { type: 'point', position: { x: 1, y: 0 } },
  p3: { type: 'point', position: { x: 1, y: 1 } }
};

const solution = await solveConstraints(constraints, entities);
console.log('Solved:', solution.solved);
console.log('Iterations:', solution.iterations);
console.log('Result:', solution.result);
```

---

### Example 5: Simulator Integration

```javascript
// Integrate Pythagorean simulator
class PythagoreanSimulator {
  constructor(container, options = {}) {
    this.container = document.querySelector(container);
    this.options = {
      threshold: 0.1,
      showAngles: true,
      showCoordinates: true,
      ...options
    };
    this.vectors = [];
    this.init();
  }

  async init() {
    // Fetch simulator config
    const response = await fetch('/api/simulators/pythagorean/config');
    this.config = await response.json();

    // Load simulator HTML
    this.container.innerHTML = await this.loadSimulatorHTML();

    // Initialize canvas
    this.canvas = this.container.querySelector('canvas');
    this.ctx = this.canvas.getContext('2d');

    // Setup event listeners
    this.setupEvents();

    // Start animation loop
    this.animate();
  }

  async loadSimulatorHTML() {
    const response = await fetch('/simulators/pythagorean/');
    return await response.text();
  }

  setupEvents() {
    this.canvas.addEventListener('mousemove', (e) => {
      const rect = this.canvas.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      const y = (e.clientY - rect.top) / rect.height;
      this.emit('hover', { x, y });
    });

    this.canvas.addEventListener('click', (e) => {
      const rect = this.canvas.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      const y = (e.clientY - rect.top) / rect.height;
      this.emit('click', { x, y });
    });
  }

  async snap(vector) {
    const response = await fetch('/api/geometry/snap', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        vector,
        threshold: this.options.threshold
      })
    });
    const result = await response.json();
    this.emit('snap', result);
    return result;
  }

  on(event, callback) {
    if (!this.listeners) this.listeners = {};
    if (!this.listeners[event]) this.listeners[event] = [];
    this.listeners[event].push(callback);
  }

  emit(event, data) {
    if (this.listeners && this.listeners[event]) {
      this.listeners[event].forEach(cb => cb(data));
    }
  }

  animate() {
    this.render();
    requestAnimationFrame(() => this.animate());
  }

  render() {
    // Clear canvas
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // Draw vectors
    this.vectors.forEach(v => {
      this.drawVector(v);
    });
  }

  drawVector(vector) {
    const { x, y } = vector;
    const scale = Math.min(this.canvas.width, this.canvas.height);

    this.ctx.beginPath();
    this.ctx.moveTo(0, 0);
    this.ctx.lineTo(x * scale, y * scale);
    this.ctx.strokeStyle = '#00ff88';
    this.ctx.lineWidth = 2;
    this.ctx.stroke();

    // Draw arrow
    const angle = Math.atan2(y, x);
    const headLen = 10;
    this.ctx.beginPath();
    this.ctx.moveTo(x * scale, y * scale);
    this.ctx.lineTo(
      x * scale - headLen * Math.cos(angle - Math.PI / 6),
      y * scale - headLen * Math.sin(angle - Math.PI / 6)
    );
    this.ctx.lineTo(
      x * scale - headLen * Math.cos(angle + Math.PI / 6),
      y * scale - headLen * Math.sin(angle + Math.PI / 6)
    );
    this.ctx.closePath();
    this.ctx.fillStyle = '#00ff88';
    this.ctx.fill();
  }
}

// Usage
const simulator = new PythagoreanSimulator('#simulator-container', {
  threshold: 0.1,
  showAngles: true
});

simulator.on('snap', (result) => {
  console.log('Vector snapped:', result);
});

simulator.on('click', async (vector) => {
  const result = await simulator.snap(vector);
  simulator.vectors.push(result.snapped);
});
```

---

### Example 6: Error Handling

```javascript
// Robust API client with error handling
class ConstraintTheoryClient {
  constructor(baseURL = 'https://constrainttheory.superinstance.ai/api') {
    this.baseURL = baseURL;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const defaultOptions = {
      headers: {
        'Content-Type': 'application/json'
      }
    };

    try {
      const response = await fetch(url, { ...defaultOptions, ...options });

      if (!response.ok) {
        const error = await response.json();
        throw this.handleError(error);
      }

      return await response.json();
    } catch (error) {
      if (error instanceof ConstraintTheoryError) {
        throw error;
      }
      throw new ConstraintTheoryError('network_error', 'Network request failed');
    }
  }

  handleError(error) {
    switch (error.error) {
      case 'invalid_input':
        return new InputValidationError(error.message, error.details);
      case 'unsolvable':
        return new UnsolvableError(error.message, error.details);
      case 'rate_limit_exceeded':
        return new RateLimitError(error.message, error.retryAfter);
      default:
        return new ConstraintTheoryError(error.error, error.message);
    }
  }

  snap(vector, threshold = 0.1) {
    return this.request('/geometry/snap', {
      method: 'POST',
      body: JSON.stringify({ vector, threshold })
    });
  }
}

// Custom error classes
class ConstraintTheoryError extends Error {
  constructor(code, message) {
    super(message);
    this.code = code;
    this.name = 'ConstraintTheoryError';
  }
}

class InputValidationError extends ConstraintTheoryError {
  constructor(message, details) {
    super('invalid_input', message);
    this.details = details;
    this.name = 'InputValidationError';
  }
}

class UnsolvableError extends ConstraintTheoryError {
  constructor(message, details) {
    super('unsolvable', message);
    this.details = details;
    this.name = 'UnsolvableError';
  }
}

class RateLimitError extends ConstraintTheoryError {
  constructor(message, retryAfter) {
    super('rate_limit_exceeded', message);
    this.retryAfter = retryAfter;
    this.name = 'RateLimitError';
  }
}

// Usage
const client = new ConstraintTheoryClient();

try {
  const result = await client.snap({ x: 0.6, y: 0.8 });
  console.log('Result:', result);
} catch (error) {
  if (error instanceof InputValidationError) {
    console.error('Invalid input:', error.details);
  } else if (error instanceof RateLimitError) {
    console.log(`Rate limited. Retry after ${error.retryAfter}s`);
  } else {
    console.error('Error:', error.message);
  }
}
```

---

### Example 7: Performance Benchmarking

```javascript
// Benchmark constraint theory vs traditional methods
async function runBenchmark() {
  const sizes = [100, 1000, 10000];
  const results = [];

  for (const size of sizes) {
    console.log(`Benchmarking size ${size}...`);

    // Generate test vectors
    const vectors = Array.from({ length: size }, () => ({
      x: Math.random(),
      y: Math.random()
    }));

    // Benchmark constraint theory
    const constraintStart = performance.now();
    await fetch('/api/simulators/performance/benchmark', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        algorithm: 'constraint',
        iterations: 100,
        problemSize: size
      })
    });
    const constraintTime = performance.now() - constraintStart;

    // Benchmark traditional
    const traditionalStart = performance.now();
    await fetch('/api/simulators/performance/benchmark', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        algorithm: 'traditional',
        iterations: 100,
        problemSize: size
      })
    });
    const traditionalTime = performance.now() - traditionalStart;

    results.push({
      size,
      constraintTime,
      traditionalTime,
      speedup: traditionalTime / constraintTime
    });
  }

  return results;
}

// Usage
const results = await runBenchmark();
console.table(results);
```

---

### Example 8: Encoding Conversion

```javascript
// Convert between different encodings
async function convertEncoding(data, fromEncoding, toEncoding) {
  const response = await fetch('/api/encoding/convert', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      data,
      from: fromEncoding,
      to: toEncoding
    })
  });
  return await response.json();
}

// Usage
const vectors = [
  { x: 0.6, y: 0.8 },
  { x: 0.36, y: 0.48 }
];

// Convert to Origin-Centric
const originCentric = await convertEncoding(
  vectors,
  'traditional',
  'origin-centric'
);

// Convert to Dodecet
const dodecet = await convertEncoding(
  originCentric,
  'origin-centric',
  'dodecet'
);

console.log('Origin-Centric:', originCentric);
console.log('Dodecet:', dodecet);
```

---

## SDK Reference

### JavaScript SDK

#### Installation

```bash
npm install @superinstance/constraint-theory
```

#### Basic Usage

```javascript
import { ConstraintTheory } from '@superinstance/constraint-theory';

const ct = new ConstraintTheory({
  baseURL: 'https://constrainttheory.superinstance.ai/api',
  apiKey: 'your-api-key'
});

// Snap vector
const result = await ct.geometry.snap({ x: 0.6, y: 0.8 });
console.log('Snapped:', result.snapped);

// Solve constraints
const solution = await ct.constraints.solve(constraints, entities);
console.log('Solved:', solution.solved);
```

---

### Python SDK

#### Installation

```bash
pip install constraint-theory
```

#### Basic Usage

```python
import constraint_theory as ct

# Initialize client
client = ct.Client(
    base_url="https://constrainttheory.superinstance.ai/api",
    api_key="your-api-key"
)

# Snap vector
result = client.geometry.snap({"x": 0.6, "y": 0.8})
print(f"Snapped: {result.snapped}")

# Solve constraints
solution = client.constraints.solve(constraints, entities)
print(f"Solved: {solution.solved}")
```

---

### Rust SDK

#### Installation

```toml
[dependencies]
constraint-theory = "1.0"
```

#### Basic Usage

```rust
use constraint_theory::Client;

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    let client = Client::new(
        "https://constrainttheory.superinstance.ai/api",
        "your-api-key"
    );

    // Snap vector
    let result = client.geometry.snap(0.6, 0.8).await?;
    println!("Snapped: {:?}", result.snapped);

    Ok(())
}
```

---

## Interactive API Explorer

Navigate to [https://constrainttheory.superinstance.ai/api-explorer](https://constrainttheory.superinstance.ai/api-explorer) to:

- Browse all API endpoints
- Test requests interactively
- View responses in real-time
- Copy code snippets in multiple languages
- Read detailed documentation for each endpoint

---

## Support & Resources

- **Documentation:** [https://constrainttheory.superinstance.ai/docs](https://constrainttheory.superinstance.ai/docs)
- **GitHub:** [https://github.com/SuperInstance/constrainttheory](https://github.com/SuperInstance/constrainttheory)
- **Issues:** [https://github.com/SuperInstance/constrainttheory/issues](https://github.com/SuperInstance/constrainttheory/issues)
- **Discussions:** [https://github.com/SuperInstance/constrainttheory/discussions](https://github.com/SuperInstance/constrainttheory/discussions)
- **Email:** support@superinstance.ai

---

## Changelog

### Version 1.0.0 (2026-03-16)

- Initial stable release
- REST API for geometry and constraints
- WebSocket support for real-time updates
- 8 interactive simulators
- 4 encoding systems
- JavaScript, Python, and Rust SDKs

---

**API Version:** 1.0.0
**Last Updated:** 2026-03-16
**Maintained By:** Constraint Theory API Team
