# Constraint Theory - Cloudflare Deployment

**Production-ready deployment of the Constraint Theory web application on Cloudflare's global edge network.**

---

## Quick Start

### Prerequisites

```bash
# Install Wrangler CLI
npm install -g wrangler

# Authenticate with Cloudflare
wrangler login

# Verify installation
wrangler whoami
```

### Local Development

```bash
# Clone repository
git clone https://github.com/SuperInstance/constrainttheory.git
cd constrainttheory

# Install dependencies
cd workers && npm install && cd ..

# Start development server
cd workers && wrangler dev
```

Access at: http://localhost:8787

### Production Deployment

```bash
# Deploy Workers
cd workers
wrangler deploy --env production

# Deploy Docker container (optional)
cd ../docker
docker build -t constraint-theory-worker:latest ..
docker push YOUR_REGISTRY/constraint-theory-worker:latest
```

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Cloudflare Edge Network                  │
│                   (300+ Global Locations)                    │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────┐      ┌──────────────┐      ┌───────────┐ │
│  │ Static Assets│      │  Workers API │      │  Workers  │ │
│  │ (simulators) │ ◄────►│   (routing)  │◄────►│    KV     │ │
│  └──────────────┘      └──────┬───────┘      └───────────┘ │
│                                │                            │
│                       ┌────────▼────────┐                   │
│                       │  Docker Container│                   │
│                       │  (Rust WASM +   │                   │
│                       │   Python sims)  │                   │
│                       └─────────────────┘                   │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

### Components

- **Cloudflare Workers** - Serverless JavaScript/TypeScript compute
- **Docker Containers** - Heavy compute (Rust WASM, Python)
- **Workers KV** - Distributed key-value storage
- **Static Assets** - Interactive simulators and documentation

---

## Project Structure

```
constrainttheory/
├── workers/                      # Cloudflare Workers
│   ├── src/
│   │   ├── index.ts             # Main entry point
│   │   ├── routes/              # API routes
│   │   ├── middleware/          # CORS, caching
│   │   └── utils/               # Analytics, monitoring
│   ├── package.json
│   ├── tsconfig.json
│   └── wrangler.toml           # Workers configuration
├── web/                         # Static assets
│   ├── index.html              # Homepage
│   ├── css/                    # Stylesheets
│   ├── js/                     # Client-side JavaScript
│   └── simulators/             # Interactive simulators
│       ├── pythagorean/        # Pythagorean snapping
│       ├── rigidity/           # Rigidity matroid
│       ├── holonomy/           # Discrete holonomy
│       ├── performance/        # Benchmarks
│       └── kdtree/             # KD-tree visualization
├── docker/                      # Docker configuration
│   ├── Dockerfile
│   ├── docker-compose.yml
│   └── simulations/            # Python backend
├── packages/                    # WASM packages
│   └── constraint-theory-wasm/ # Rust WASM module
├── wrangler.toml               # Root configuration
├── DEPLOYMENT_GUIDE.md         # Comprehensive deployment guide
└── DEPLOYMENT_CHECKLIST.md     # Pre/post-deployment checklist
```

---

## Features

### Interactive Simulators

1. **Pythagorean Snapping**
   - Visualize integer ratio alignment
   - Interactive canvas for placing points
   - Real-time snapping visualization

2. **Rigidity Matroid**
   - Laman graph visualization
   - Real-time rigidity checking
   - Force-directed layout

3. **Discrete Holonomy**
   - Parallel transport visualization
   - Platonic symmetry exploration
   - Deviation measurement

4. **Performance Benchmarks**
   - Compare algorithms
   - Run performance tests
   - Track historical data

5. **KD-Tree Visualization**
   - Spatial partitioning
   - LVQ tokenization demo
   - Query visualization

### API Endpoints

- `GET /health` - Health check
- `GET /api/docs` - API documentation
- `GET /api/simulators` - List simulators
- `POST /api/constraints/solve` - Solve constraints
- `POST /api/geometry/snap` - Pythagorean snapping
- `POST /api/simulators/performance/benchmark` - Run benchmark

---

## Deployment

### Option 1: Workers.dev Subdomain (Free)

```bash
wrangler deploy --subdomain constraint-theory
```

Access: https://constraint-theory.workers.dev

### Option 2: Custom Domain

1. Add domain to Cloudflare
2. Update nameservers
3. Configure worker route in wrangler.toml:

```toml
[env.production]
routes = [
  { pattern = "https://constrainttheory.com/*", zone_name = "constrainttheory.com" }
]
```

4. Deploy:

```bash
wrangler deploy --env production
```

### Option 3: Docker Container

```bash
# Build image
docker build -t constraint-theory-worker:latest .

# Test locally
docker run -p 8080:8080 constraint-theory-worker:latest

# Push to registry
docker push YOUR_REGISTRY/constraint-theory-worker:latest

# Deploy to Cloudflare
wrangler deploy --env production
```

---

## Configuration

### Environment Variables

Set in `wrangler.toml` or via Cloudflare dashboard:

```toml
[env.production.vars]
ENVIRONMENT = "production"
API_VERSION = "v1"
CORS_ORIGIN = "https://constrainttheory.com"
```

### Secrets

```bash
# Set secrets via CLI
wrangler secret put API_KEY
wrangler secret put DATABASE_URL
wrangler secret put SENTRY_DSN
```

### KV Namespaces

```bash
# Create KV namespaces
wrangler kv:namespace create "SESSION_STORE"
wrangler kv:namespace create "CACHE"

# Update wrangler.toml with namespace IDs
```

---

## Monitoring

### Cloudflare Analytics

- Web Analytics: Page views, unique visitors
- Workers Analytics: Request count, errors, latency
- KV Analytics: Read/write operations

### Custom Monitoring

```typescript
// Track custom events
await env.ANALYTICS.writeDataPoint({
  blobs: ['simulator_usage'],
  doubles: [duration],
  indexes: [simulatorIndex],
});
```

### Error Tracking

```typescript
// Sentry integration
import * as Sentry from '@sentry/cloudflare';

Sentry.init({
  dsn: 'YOUR_SENTRY_DSN',
  environment: 'production',
});
```

---

## Performance

### Optimization Techniques

1. **Caching**
   - Static assets: 1 year cache
   - API responses: 5 minute cache
   - KV storage: Session data

2. **Minification**
   - JavaScript minified
   - CSS minified
   - HTML optimized

3. **WASM Optimization**
   - Compiled with `opt-level = "z"`
   - Link-time optimization enabled
   - Single codegen unit

4. **CDN**
   - Global edge distribution
   - HTTP/3 support
   - Brotli compression

### Targets

- Page load: < 2 seconds
- API latency: < 100ms
- Cache hit rate: > 50%
- Error rate: < 1%

---

## Security

### Best Practices

- HTTPS enforced
- CORS headers configured
- Rate limiting implemented
- Input validation on all endpoints
- Secrets never committed to git

### Security Headers

```typescript
response.headers.set('X-Frame-Options', 'SAMEORIGIN');
response.headers.set('X-Content-Type-Options', 'nosniff');
response.headers.set('X-XSS-Protection', '1; mode=block');
response.headers.set('Strict-Transport-Security', 'max-age=31536000');
```

---

## Troubleshooting

### Common Issues

**Deployment fails**
```bash
# Check authentication
wrangler whoami

# Check configuration
wrangler dev

# View logs
wrangler tail
```

**CORS errors**
- Verify `CORS_ORIGIN` in wrangler.toml
- Check origin matches request
- Allow credentials if needed

**KV not found**
```bash
# List namespaces
wrangler kv:namespace list

# Create missing namespace
wrangler kv:namespace create "SESSION_STORE"
```

**High latency**
- Enable caching
- Optimize WASM
- Use CDN for static assets
- Monitor performance metrics

---

## Maintenance

### Updates

```bash
# Update dependencies
cd workers
npm update

# Rebuild
npm run build

# Redeploy
wrangler deploy --env production
```

### Scaling

Workers automatically scale to handle traffic:
- Free: 100,000 requests/day
- Paid: $5/million requests

### Backups

```bash
# Export KV data
wrangler kv:bulk get --namespace-id=YOUR_ID > backup.json

# Import KV data
wrangler kv:bulk put --namespace-id=YOUR_ID < backup.json
```

---

## Documentation

- **[DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)** - Comprehensive deployment guide
- **[DEPLOYMENT_CHECKLIST.md](./DEPLOYMENT_CHECKLIST.md)** - Pre/post-deployment checklist
- **[web/README.md](./web/README.md)** - Static assets documentation
- **API Docs** - https://constrainttheory.com/api/docs

---

## Support

### Documentation

- Cloudflare Workers: https://developers.cloudflare.com/workers/
- Wrangler CLI: https://developers.cloudflare.com/workers/wrangler/
- Docker: https://docs.docker.com/

### Community

- Discord: https://discord.gg/cloudflaredev
- Stack Overflow: Tag with `cloudflare-workers`
- GitHub Issues: https://github.com/SuperInstance/constrainttheory/issues

### Emergency

- Cloudflare Support: https://support.cloudflare.com/
- Status Page: https://www.cloudflarestatus.com/

---

## License

MIT License - see LICENSE file for details

---

## Contributing

1. Fork repository
2. Create feature branch
3. Make changes
4. Test locally
5. Submit pull request

---

**Status:** Production Ready
**Last Updated:** 2026-03-16
**Maintained By:** SuperInstance Team

---

## Quick Reference

### Essential Commands

```bash
# Development
wrangler dev                    # Start local dev server
wrangler tail                   # Stream logs
wrangler secret put KEY         # Set secret

# Deployment
wrangler deploy                 # Deploy to Workers
wrangler rollback               # Rollback deployment
wrangler deployments list       # List deployments

# KV Operations
wrangler kv:namespace list      # List namespaces
wrangler kv:key get --namespace-id=ID KEY
wrangler kv:key put --namespace-id=ID KEY VALUE

# Analytics
wrangler analytics --format json  # View analytics
```

### Important URLs

- Dashboard: https://dash.cloudflare.com/
- Workers: https://dash.cloudflare.com/?to=/:account/workers
- KV: https://dash.cloudflare.com/?to=/:account/workers/kv
- Analytics: https://dash.cloudflare.com/?to=/:account/analytics

### Success Criteria

- ✅ Workers deployed and accessible
- ✅ Docker container running
- ✅ Static assets serving
- ✅ API endpoints responding
- ✅ Simulators working
- ✅ Global edge distribution
- ✅ HTTPS enabled
- ✅ <100ms response time

---

**Ready to deploy!** Follow the [DEPLOYMENT_CHECKLIST.md](./DEPLOYMENT_CHECKLIST.md) for a smooth production launch.
