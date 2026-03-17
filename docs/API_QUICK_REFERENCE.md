# API Quick Reference

**Version:** 1.0.0 | **Last Updated:** 2026-03-16

---

## Base URL

```
https://constraint-theory-api.casey-digennaro.workers.dev
```

---

## Quick Start

### Health Check
```bash
curl https://constraint-theory-api.casey-digennaro.workers.dev/health
```

### Snap Vector
```bash
curl -X POST https://constraint-theory-api.casey-digennaro.workers.dev/api/geometry/snap \
  -H "Content-Type: application/json" \
  -d '{"vector": {"x": 0.6, "y": 0.8}, "threshold": 0.1}'
```

---

## Core Endpoints

### Health & Status

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Health check |
| GET | `/api/status` | Detailed status |
| GET | `/api` | API index |

### Geometry

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/geometry/snap` | Snap vector to Pythagorean ratio |
| POST | `/api/geometry/transform` | Apply geometric transformations |
| POST | `/api/geometry/intersect` | Find intersections |

### Constraints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/constraints/solve` | Solve constraint system |
| POST | `/api/constraints/validate` | Validate constraints |
| POST | `/api/constraints/optimize` | Optimize system |

### Simulators

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/simulators` | List all simulators |
| GET | `/api/simulators/{id}/config` | Get simulator config |
| POST | `/api/simulators/{id}/run` | Run simulator |

---

## Interactive Tools

### API Explorer
```
https://constraint-theory-api.casey-digennaro.workers.dev/api-explorer
```

### Simulators
```
/simulators/pythagorean  - Pythagorean Snapping
/simulators/rigidity    - Rigidity Matroid
/simulators/holonomy    - Discrete Holonomy
/simulators/performance - Performance Benchmarks
/simulators/kdtree      - KD-Tree Visualization
/simulators/voxel       - Voxel Engine
/simulators/swarm       - Swarm Intelligence
/simulators/reasoning   - Geometric Reasoning
```

---

## Code Examples

### JavaScript

```javascript
// Snap vector
const response = await fetch('/api/geometry/snap', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    vector: { x: 0.6, y: 0.8 },
    threshold: 0.1
  })
});

const result = await response.json();
console.log(result.snapped);
```

### Python

```python
import requests

response = requests.post(
    '/api/geometry/snap',
    json={'vector': {'x': 0.6, 'y': 0.8}, 'threshold': 0.1}
)

result = response.json()
print(result['snapped'])
```

### cURL

```bash
curl -X POST /api/geometry/snap \
  -H "Content-Type: application/json" \
  -d '{"vector": {"x": 0.6, "y": 0.8}, "threshold": 0.1}'
```

---

## Response Format

### Success Response
```json
{
  "original": {"x": 0.6, "y": 0.8},
  "snapped": {"x": 0.6, "y": 0.8},
  "snappedTo": "pythagorean_ratio",
  "distance": 0,
  "ratio": {"a": 3, "b": 4, "c": 5}
}
```

### Error Response
```json
{
  "error": "invalid_input",
  "message": "vector is required",
  "timestamp": "2026-03-16T10:30:00Z"
}
```

---

## Rate Limits

| Tier | Requests/Hour |
|------|---------------|
| Free | 1,000 |
| Pro | 10,000 |
| Enterprise | Unlimited |

---

## Support

- **Docs:** `/api/docs`
- **Explorer:** `/api-explorer`
- **GitHub:** https://github.com/SuperInstance/constrainttheory
- **Email:** support@superinstance.ai

---

**For complete documentation, see [API_REFERENCE.md](./API_REFERENCE.md)**
