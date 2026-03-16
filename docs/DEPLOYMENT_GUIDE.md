# Cloudflare Deployment Guide - Constraint Theory Web App

**Author:** Cloudflare Deployment Specialist
**Date:** 2026-03-16
**Status:** Production Ready

---

## Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Prerequisites](#prerequisites)
4. [Local Development](#local-development)
5. [Cloudflare Workers Deployment](#cloudflare-workers-deployment)
6. [Docker Container Deployment](#docker-container-deployment)
7. [Custom Domain Setup](#custom-domain-setup)
8. [Monitoring & Analytics](#monitoring--analytics)
9. [Troubleshooting](#troubleshooting)
10. [Maintenance](#maintenance)

---

## Overview

This guide covers deploying the Constraint Theory web application to Cloudflare's global edge network using:

- **Cloudflare Workers** - Serverless JavaScript/TypeScript compute
- **Docker Containers** - Heavy compute (Rust WASM, Python simulations)
- **Workers KV** - Distributed key-value storage
- **Cloudflare Pages** - Static asset hosting (optional)
- **Cloudflare R2** - Object storage (optional)

### Deployment Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Cloudflare Edge Network                  │
│                   (300+ Global Locations)                    │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  User Request → CDN → Workers API → [Cache Hit?]            │
│                               │                             │
│                               ├─→ Yes: Return cached        │
│                               └─→ No:                       │
│                                   ├─→ Static Asset          │
│                                   ├─→ Worker Compute        │
│                                   └─→ Docker Container      │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

---

## Architecture

### Components

#### 1. Cloudflare Workers
- **Purpose:** API routing, request handling, lightweight compute
- **Runtime:** V8 JavaScript engine (same as Chrome)
- **Limits:** 50ms CPU time (free), 30s CPU time (paid)
- **File:** `workers/src/index.ts`

#### 2. Docker Container
- **Purpose:** Heavy compute (Rust WASM, Python simulations)
- **Base:** `node:20-alpine`
- **Services:**
  - Rust constraint engine (WASM)
  - Python simulation backend
  - Redis emulator (Workers KV)
- **File:** `docker/Dockerfile`

#### 3. Static Assets
- **Purpose:** Interactive simulators, documentation
- **Location:** `web/`
- **Formats:** HTML, CSS, JavaScript, images
- **CDN:** Cloudflare CDN

#### 4. Workers KV
- **Purpose:** Session storage, caching
- **Latency:** Global read (<1ms), regional write (<10ms)
- **Capacity:** Up to 1GB per namespace

---

## Prerequisites

### Required Accounts

1. **Cloudflare Account** (Free tier available)
   - Sign up: https://dash.cloudflare.com/sign-up
   - Paid Workers plan required for Docker containers

2. **Domain Name** (optional)
   - For custom domain configuration
   - Can use `.workers.dev` subdomain for free

### Required Tools

```bash
# Install Node.js (v20+)
# https://nodejs.org/

# Install Wrangler CLI
npm install -g wrangler

# Install Docker (for local testing)
# https://docs.docker.com/get-docker/

# Authenticate with Cloudflare
wrangler login
```

### Cloudflare Configuration

```bash
# Set your account details
wrangler whoami

# Create Workers KV namespaces (production)
wrangler kv:namespace create "SESSION_STORE" --preview
wrangler kv:namespace create "CACHE" --preview

# Note the namespace IDs for wrangler.toml
```

---

## Local Development

### 1. Clone Repository

```bash
git clone https://github.com/SuperInstance/constrainttheory.git
cd constrainttheory
```

### 2. Install Dependencies

```bash
# Install Worker dependencies
cd workers
npm install
cd ..

# Install Python dependencies (for simulations)
pip3 install -r docker/simulations/requirements.txt
```

### 3. Build WASM Module

```bash
# Install Rust toolchain
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh

# Install wasm-pack
cargo install wasm-pack

# Build WASM
cd packages/constraint-theory-wasm
wasm-pack build --target web
```

### 4. Run Local Development Server

```bash
# Start Workers dev server
cd workers
wrangler dev

# Start Docker container (optional)
cd ../docker
docker-compose up
```

### 5. Access Application

- Workers API: http://localhost:8787
- Static assets: http://localhost:8787/simulators/pythagorean/
- API docs: http://localhost:8787/api/docs

---

## Cloudflare Workers Deployment

### 1. Configure wrangler.toml

Edit `wrangler.toml` with your details:

```toml
name = "constraint-theory"
main = "workers/src/index.ts"
compatibility_date = "2024-01-01"

[env.production]
routes = [
  { pattern = "https://constrainttheory.com/*", zone_name = "constrainttheory.com" }
]

[env.production.vars]
ENVIRONMENT = "production"
API_VERSION = "v1"
CORS_ORIGIN = "https://constrainttheory.com"

[[env.production.kv_namespaces]]
binding = "SESSION_STORE"
id = "your_namespace_id_here"

[[env.production.kv_namespaces]]
binding = "CACHE"
id = "your_cache_namespace_id_here"
```

### 2. Build Project

```bash
cd workers
npm run build
```

### 3. Deploy Workers

```bash
# Deploy to production
wrangler deploy --env production

# Deploy to staging (optional)
wrangler deploy --env staging
```

### 4. Verify Deployment

```bash
# Check deployment status
wrangler deployments list

# Test health endpoint
curl https://constraint-theory.YOUR_SUBDOMAIN.workers.dev/health
```

---

## Docker Container Deployment

### 1. Build Docker Image

```bash
cd docker
docker build -t constraint-theory-worker:latest ..
```

### 2. Test Locally

```bash
docker run -p 8080:8080 constraint-theory-worker:latest
curl http://localhost:8080/health
```

### 3. Push to Container Registry

```bash
# Tag image
docker tag constraint-theory-worker:latest \
  YOUR_REGISTRY/constraint-theory-worker:latest

# Push to registry
docker push YOUR_REGISTRY/constraint-theory-worker:latest
```

### 4. Deploy to Cloudflare

```bash
# Deploy Docker container
wrangler deploy --env production

# Or use Docker integration in wrangler.toml
# [env.production]
# docker_image = "constraint-theory-worker:latest"
```

---

## Custom Domain Setup

### Option 1: Workers.dev Subdomain (Free)

```bash
# Deploy to .workers.dev subdomain
wrangler deploy --subdomain constraint-theory
```

Access: https://constraint-theory.workers.dev

### Option 2: Custom Domain

#### 1. Add Domain to Cloudflare

```bash
# In Cloudflare dashboard:
# 1. Add your domain
# 2. Update nameservers at your registrar
# 3. Wait for DNS propagation (usually <24 hours)
```

#### 2. Configure Worker Route

```bash
# In wrangler.toml:
[env.production]
routes = [
  { pattern = "https://constrainttheory.com/*", zone_name = "constrainttheory.com" }
]

# Or via dashboard:
# Workers & Pages → constraint-theory → Settings → Triggers → Routes
```

#### 3. Configure DNS

```
Type: CNAME
Name: @
Content: constraint-theory.your-subdomain.workers.dev
Proxy: ✓ (Proxied)
```

#### 4. Configure SSL

```bash
# In Cloudflare dashboard:
# SSL/TLS → Overview → Full (strict)

# Edge Certificates: Always Use HTTPS ✓
```

---

## Monitoring & Analytics

### Cloudflare Web Analytics

```bash
# Enable in dashboard:
# Analytics & Logs → Web Analytics → Add Site

# Or via snippet in index.html:
<script src="https://static.cloudflareinsights.com/beacon.min.js" data-cf-beacon='{"token": "YOUR_TOKEN"}'></script>
```

### Workers Analytics

```bash
# View metrics
wrangler deployments list

# View logs
wrangler tail --format pretty

# Real-time log streaming
wrangler tail --format pretty --status-code 5xx
```

### Custom Metrics

```typescript
// In workers/src/index.ts
export default {
  fetch: async (request, env, ctx) => {
    const start = Date.now();

    // ... handle request ...

    const duration = Date.now() - start;

    // Send to analytics
    env.ANALYTICS.writeDataPoint({
      blobs: [request.url],
      doubles: [duration],
      indexes: [request.headers.get('User-Agent')?.length || 0]
    });

    return response;
  }
};
```

### Error Tracking (Sentry)

```bash
npm install @sentry/cloudflare
```

```typescript
import * as Sentry from '@sentry/cloudflare';

Sentry.init({
  dsn: 'YOUR_SENTRY_DSN',
  environment: ENVIRONMENT,
  tracesSampleRate: 1.0,
});
```

---

## Troubleshooting

### Common Issues

#### 1. Deployment Fails

**Error:** `Error: Failed to publish`

**Solution:**
```bash
# Check authentication
wrangler whoami

# Re-authenticate
wrangler logout
wrangler login

# Check wrangler.toml syntax
wrangler dev
```

#### 2. CORS Errors

**Error:** `Access to fetch blocked by CORS policy`

**Solution:**
```typescript
// In workers/src/middleware/cors.ts
const allowedOrigins = env.CORS_ORIGIN.split(',');
origin = allowedOrigins.includes(request.headers.get('Origin'))
  ? request.headers.get('Origin')
  : allowedOrigins[0];
```

#### 3. KV Not Found

**Error:** `KV namespace not found`

**Solution:**
```bash
# List KV namespaces
wrangler kv:namespace list

# Create missing namespace
wrangler kv:namespace create "SESSION_STORE"

# Update wrangler.toml with correct ID
```

#### 4. Docker Container Crashes

**Error:** `Container exited with code 1`

**Solution:**
```bash
# View logs
docker logs constraint-theory-worker

# Run in interactive mode
docker run -it constraint-theory-worker /bin/sh

# Check health
curl http://localhost:8080/health
```

#### 5. High Latency

**Solution:**
```bash
# Enable caching
# In workers/src/middleware/cache.ts

# Use Cloudflare CDN
# Cache static assets for 1 year

# Optimize WASM
# In Cargo.toml:
[profile.release]
opt-level = "z"
lto = true
```

---

## Maintenance

### Updates

```bash
# Update dependencies
cd workers
npm update

# Rebuild WASM
cd ../packages/constraint-theory-wasm
wasm-pack build --target web

# Redeploy
cd ../../workers
wrangler deploy --env production
```

### Scaling

Cloudflare Workers automatically scale to handle traffic:

- **Free:** 100,000 requests/day
- **Paid:** $5/million requests

### Backups

```bash
# Export KV data
wrangler kv:bulk get --namespace-id=YOUR_ID --prefix="session:" > backup.json

# Import KV data
wrangler kv:bulk put --namespace-id=YOUR_ID < backup.json
```

### Monitoring

```bash
# Set up alerts in Cloudflare dashboard
# Monitoring → Notifications → Create Alert

# Metrics to monitor:
# - Request rate
# - Error rate (>1%)
# - Latency (>100ms)
# - KV read/write rate
```

---

## Performance Optimization

### 1. Caching Strategy

```typescript
// Cache static assets for 1 year
response.headers.set('Cache-Control', 'public, max-age=31536000, immutable');

// Cache API responses for 5 minutes
response.headers.set('Cache-Control', 'public, max-age=300');
```

### 2. Minify Assets

```bash
# Install minifiers
npm install -g terser html-minifier-terser

# Minify JavaScript
terser workers/dist/index.js -o workers/dist/index.min.js

# Minify HTML
html-minifier-terser web/index.html -o web/index.min.html
```

### 3. Optimize WASM

```toml
# In packages/constraint-theory-wasm/Cargo.toml
[profile.release]
opt-level = "z"     # Optimize for size
lto = true          # Link-time optimization
codegen-units = 1   # Better optimization
panic = "abort"     # Smaller code
```

### 4. CDN Configuration

```
# In Cloudflare dashboard:
# Caching → Configuration → Browser Cache TTL: 1 year

# Purge cache after deployment
wrangler cache purge --url=https://constrainttheory.com/*
```

---

## Security Best Practices

### 1. Environment Variables

```bash
# Never commit secrets
# Use .dev.vars for local development
# Use wrangler secret for production

wrangler secret put API_KEY
wrangler secret put DATABASE_URL
```

### 2. CORS Configuration

```typescript
// Only allow trusted origins
const allowedOrigins = [
  'https://constrainttheory.com',
  'https://www.constrainttheory.com'
];
```

### 3. Rate Limiting

```typescript
// Implement rate limiting
const rateLimit = await env.RATE_LIMIT.get(ip);
if (rateLimit && parseInt(rateLimit) > 100) {
  return new Response('Too many requests', { status: 429 });
}
```

### 4. Input Validation

```typescript
// Validate all inputs
const schema = {
  constraints: 'array',
  threshold: 'number'
};

// Validate before processing
if (!validateInput(body, schema)) {
  return new Response('Invalid input', { status: 400 });
}
```

---

## Cost Estimation

### Free Tier (Development)

- Workers: 100,000 requests/day
- KV: 100,000 reads/day, 1,000 writes/day
- Durable Objects: Not available
- **Cost:** $0/month

### Paid Tier (Production)

- Workers: $5/million requests
- KV: $0.50/million reads, $5.00/million writes
- Durable Objects: $0.30/million requests + $0.00014/GB-minute
- **Estimated:** $10-50/month for moderate traffic

### High Traffic (HackerNews surge)

- Workers: $5/million requests
- 1 million requests = $5
- 10 million requests = $50
- **Estimated:** $50-500/month depending on traffic

---

## Support & Resources

### Documentation

- Cloudflare Workers: https://developers.cloudflare.com/workers/
- Wrangler CLI: https://developers.cloudflare.com/workers/wrangler/
- Docker: https://docs.docker.com/

### Community

- Cloudflare Discord: https://discord.gg/cloudflaredev
- Stack Overflow: Tag questions with `cloudflare-workers`
- GitHub Issues: https://github.com/SuperInstance/constrainttheory/issues

### Emergency Contacts

- Cloudflare Support: https://support.cloudflare.com/
- Status Page: https://www.cloudflarestatus.com/

---

## Checklist

### Pre-Deployment

- [ ] All tests passing
- [ ] Environment variables configured
- [ ] KV namespaces created
- [ ] Docker image built and tested
- [ ] Security audit complete
- [ ] Performance benchmarks met

### Deployment

- [ ] Workers deployed
- [ ] Docker container deployed
- [ ] DNS configured
- [ ] SSL certificates valid
- [ ] Monitoring enabled
- [ ] Error tracking configured

### Post-Deployment

- [ ] Smoke tests passing
- [ ] Analytics dashboard set up
- [ ] Alerts configured
- [ ] Documentation updated
- [ ] Team notified
- [ ] Backup plan tested

---

**Last Updated:** 2026-03-16
**Version:** 1.0.0
**Maintained By:** SuperInstance Team
