# Deployment Guide - Constraint Theory Web Simulator

Complete guide for deploying the Constraint Theory Web Simulator to production.

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Cloudflare Workers Deployment](#cloudflare-workers-deployment)
3. [Custom Domain Setup](#custom-domain-setup)
4. [Docker Deployment](#docker-deployment)
5. [Performance Optimization](#performance-optimization)
6. [Monitoring and Analytics](#monitoring-and-analytics)
7. [Troubleshooting](#troubleshooting)

---

## Prerequisites

### Required Accounts

1. **Cloudflare Account** (for Workers deployment)
   - Free tier supports 100,000 requests/day
   - Paid plans start at $5/month for more

2. **Custom Domain** (optional but recommended)
   - Purchase from any registrar
   - Point to Cloudflare nameservers

### Required Tools

```bash
# Install Node.js >= 18.0.0
node --version  # v18.x.x or higher

# Install Wrangler CLI
npm install -g wrangler

# Install Docker (optional)
docker --version
```

---

## Cloudflare Workers Deployment

### Step 1: Authentication

```bash
# Login to Cloudflare
npx wrangler login

# This will open a browser for authentication
# Successful login shows: "Successfully logged in"
```

### Step 2: Configure Project

Edit `wrangler.toml`:

```toml
name = "constraint-theory-simulator"
main = "worker.ts"
type = "javascript"
compatibility_date = "2024-01-01"

[env.production]
routes = [
  { pattern = "your-domain.com/*", zone_name = "your-domain.com" }
]
```

### Step 3: Deploy

```bash
# Deploy to production
npm run deploy

# Or use Wrangler directly
npx wrangler deploy

# Expected output:
# ✨ Successfully deployed your Worker!
# 🚀 Available at: https://your-worker.workers.dev
```

### Step 4: Verify Deployment

```bash
# Test health endpoint
curl https://your-worker.workers.dev/health

# Expected response:
# {"status":"healthy","version":"1.0.0","timestamp":"..."}
```

---

## Custom Domain Setup

### Option 1: Cloudflare Workers.dev Domain

Free subdomain: `https://constraint-theory-simulator.workers.dev`

### Option 2: Custom Domain

#### Step 1: Add Domain to Cloudflare

1. Go to Cloudflare Dashboard
2. Add your site/domain
3. Update nameservers at your registrar
4. Wait for DNS propagation (usually <24 hours)

#### Step 2: Configure Worker Route

```bash
# Add custom domain to Worker
npx wrangler domains add constraint.theory

# Or edit wrangler.toml:
[env.production]
routes = [
  { pattern = "constraint.theory/*", zone_name = "constraint.theory" }
]
```

#### Step 3: Deploy with Custom Domain

```bash
npm run deploy:production
```

#### Step 4: Configure DNS

Add these records in Cloudflare DNS:

```
Type: CNAME
Name: simulator
Target: constraint-theory-simulator.workers.dev
Proxy: ON (orange cloud)
```

---

## Docker Deployment

### Local Development

```bash
# Build and run
cd docker
docker-compose up

# Access at http://localhost:8787
```

### Production Deployment

#### Option 1: Cloudflare Workers (Recommended)

See [Cloudflare Workers Deployment](#cloudflare-workers-deployment)

#### Option 2: VPS/Cloud Server

```bash
# Build image
docker build -t constraint-theory-web .

# Run container
docker run -d \
  --name constraint-theory-web \
  -p 8787:8787 \
  --restart unless-stopped \
  constraint-theory-web

# Behind nginx proxy (recommended)
# Configure nginx to reverse proxy to :8787
```

#### Option 3: Kubernetes

```yaml
# deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: constraint-theory-web
spec:
  replicas: 3
  selector:
    matchLabels:
      app: constraint-theory-web
  template:
    metadata:
      labels:
        app: constraint-theory-web
    spec:
      containers:
      - name: web
        image: constraint-theory-web:latest
        ports:
        - containerPort: 8787
        resources:
          requests:
            memory: "128Mi"
            cpu: "100m"
          limits:
            memory: "256Mi"
            cpu: "200m"
---
apiVersion: v1
kind: Service
metadata:
  name: constraint-theory-web
spec:
  selector:
    app: constraint-theory-web
  ports:
  - port: 80
    targetPort: 8787
  type: LoadBalancer
```

Deploy:

```bash
kubectl apply -f deployment.yaml
```

---

## Performance Optimization

### 1. Enable Caching

The Worker automatically sets cache headers:

```typescript
const CACHE_HEADERS = {
  'Cache-Control': 'public, max-age=3600, immutable',
};
```

### 2. Use R2 for Assets

For large assets, store in Cloudflare R2:

```bash
# Create R2 bucket
npx wrangler r2 bucket create ASSETS

# Upload assets
npx wrangler r2 object put ASSETS/js/pythagorean.js --file=static/js/pythagorean.js
```

### 3. Enable Brotli Compression

Cloudflare automatically enables Brotli compression.

### 4. Use CDN

Cloudflare's global CDN is automatically enabled.

### 5. Optimize Images

```bash
# Optimize images before deploying
npm install -g imagemin-cli
imagemin static/images/* --out-dir=static/images/optimized
```

---

## Monitoring and Analytics

### Cloudflare Analytics

1. Go to Cloudflare Dashboard
2. Select your domain/worker
3. View analytics:
   - Request count
   - Response time
   - Error rate
   - Geographic distribution

### Custom Analytics (Optional)

```typescript
// Add to worker.ts
export default {
  async fetch(request, env, ctx) {
    const startTime = Date.now();

    // Handle request
    const response = await router.handle(request, env, ctx);

    // Log analytics
    const duration = Date.now() - startTime;
    await env.DB.prepare(
      'INSERT INTO analytics (endpoint, duration, status) VALUES (?, ?, ?)'
    ).bind(request.url, duration, response.status).run();

    return response;
  },
};
```

### Uptime Monitoring

Use external services:
- UptimeRobot (free)
- Pingdom
- StatusCake

---

## Troubleshooting

### Common Issues

#### Issue 1: "Authentication Error"

```bash
# Fix: Re-authenticate
npx wrangler logout
npx wrangler login
```

#### Issue 2: "Route Already Exists"

```bash
# Fix: Remove existing route
npx wrangler domains delete your-domain.com
# Then add it again
npx wrangler domains add your-domain.com
```

#### Issue 3: "404 Not Found"

**Check:**
- Route pattern in wrangler.toml
- DNS records
- Worker is deployed: `npx wrangler deployments list`

#### Issue 4: "CORS Errors"

**Fix:** Add CORS headers in worker.ts:

```typescript
const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
};
```

#### Issue 5: "High Latency"

**Debug:**
```bash
# Check worker logs
npx wrangler tail

# Test locally
npm run dev

# Check Cloudflare status page
```

---

## Security Best Practices

### 1. Enable Security Headers

```typescript
const SECURITY_HEADERS = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Strict-Transport-Security': 'max-age=31536000',
};
```

### 2. Rate Limiting

```bash
# Add rate limiting in Cloudflare Dashboard
# Security > WAF > Custom rules > Create rule
```

### 3. Bot Protection

```bash
# Enable Bot Fight Mode in Cloudflare Dashboard
# Security > Bots
```

### 4. HTTPS Only

Cloudflare automatically redirects HTTP to HTTPS.

---

## Continuous Deployment

### GitHub Actions

```yaml
# .github/workflows/deploy.yml
name: Deploy to Cloudflare Workers

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run build
      - uses: cloudflare/wrangler-action@v2
        with:
          apiToken: ${{ secrets.CLOUDFLARE_API_TOKEN }}
          accountId: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
```

### Environment Variables

```bash
# Set secrets
npx wrangler secret put API_KEY
npx wrangler secret put DB_CONNECTION_STRING

# Use in worker
export default {
  async fetch(request, env, ctx) {
    const apiKey = env.API_KEY;
    // ...
  },
};
```

---

## Scaling Considerations

### Cloudflare Workers Limits

**Free Tier:**
- 100,000 requests/day
- 10ms CPU time per request

**Paid Tier ($5/month):**
- 10 million requests/month
- 50ms CPU time per request
- 30 days of logs retention

### Scaling Strategies

1. **Use KV for Caching**
   - Cache expensive computations
   - Reduce API calls

2. **Implement Rate Limiting**
   - Prevent abuse
   - Ensure fair usage

3. **Use R2 for Large Assets**
   - Store static files
   - Reduce Worker bundle size

4. **Optimize Worker Code**
   - Minimize CPU time
   - Use async operations
   - Cache frequently accessed data

---

## Backup and Recovery

### Backup Strategy

1. **Code Repository**
   - All code in Git
   - Tag releases

2. **Configuration Backup**
   ```bash
   # Export wrangler config
   npx wrangler deployments list > deployments.txt

   # Backup KV namespace
   npx wrangler kv:namespace get --namespace-id=XXX > backup.json
   ```

3. **R2 Backup**
   ```bash
   # Sync R2 bucket to local
   aws s3 sync s3://your-bucket ./backup
   ```

### Recovery

```bash
# Redeploy Worker
npm run deploy

# Restore KV namespace
npx wrangler kv:namespace put --namespace-id=XXX --data=backup.json
```

---

## Cost Estimation

### Cloudflare Workers

**Free Tier:** $0/month
- 100,000 requests/day
- Sufficient for testing and small projects

**Paid Tier:** $5/month
- 10 million requests/month
- Suitable for production

**Estimated Costs:**
- 1M requests/month: $0.50
- 10M requests/month: $5.00
- 100M requests/month: $50.00

### R2 Storage

**Storage:** $0.015/GB/month
**Class A Operations:** $4.50/million requests
**Class B Operations:** $0.36/million requests

### Total Estimated Cost

**Small Project (1M requests/month):**
- Workers: $0.50
- R2: $0.10
- **Total: ~$0.60/month**

**Medium Project (10M requests/month):**
- Workers: $5.00
- R2: $1.00
- **Total: ~$6.00/month**

**Large Project (100M requests/month):**
- Workers: $50.00
- R2: $10.00
- **Total: ~$60.00/month**

---

## Support

### Documentation
- Cloudflare Workers Docs: https://developers.cloudflare.com/workers/
- Wrangler CLI: https://developers.cloudflare.com/workers/wrangler/

### Community
- Cloudflare Community: https://community.cloudflare.com/
- GitHub Issues: https://github.com/SuperInstance/Constraint-Theory/issues

### Emergency Contact
For deployment emergencies, check:
1. Cloudflare Status Page: https://www.cloudflarestatus.com/
2. Worker Logs: `npx wrangler tail`
3. Deployment History: `npx wrangler deployments list`

---

**Last Updated:** 2026-03-16
**Version:** 1.0.0
**Maintainer:** SuperInstance
