# Deployment Checklist - Constraint Theory Web App

**Use this checklist to ensure a smooth production deployment.**

---

## Pre-Deployment Checks

### Code Quality
- [ ] All TypeScript compiles without errors
- [ ] All tests passing (`npm test`)
- [ ] Linting passes (`npm run lint`)
- [ ] No console.log or debug statements in production code
- [ ] Code reviewed by at least one team member
- [ ] Security audit completed

### Dependencies
- [ ] All dependencies up to date
- [ ] No known vulnerabilities in dependencies
- [ ] Production dependencies locked in package-lock.json
- [ ] Development dependencies excluded from production build

### Configuration
- [ ] wrangler.toml configured with correct account details
- [ ] Environment variables set (production)
- [ ] KV namespaces created and IDs updated
- [ ] Custom domain configured (if applicable)
- [ ] SSL certificates valid

### Assets
- [ ] Static assets optimized (minified, compressed)
- [ ] Images optimized (WebP format, compressed)
- [ ] WASM module compiled for production
- [ ] Cache busting implemented (versioned filenames)

---

## Deployment Steps

### 1. Build Phase
```bash
# Install dependencies
cd workers && npm install

# Build TypeScript
npm run build

# Build WASM module
cd ../packages/constraint-theory-wasm
wasm-pack build --target web

# Build Docker image
cd ../../docker
docker build -t constraint-theory-worker:latest ..
```

### 2. Deploy Workers
```bash
# Deploy to production
cd ../workers
wrangler deploy --env production

# Verify deployment
wrangler deployments list
```

### 3. Deploy Docker Container (Optional)
```bash
# Tag and push to registry
docker tag constraint-theory-worker:latest \
  YOUR_REGISTRY/constraint-theory-worker:latest
docker push YOUR_REGISTRY/constraint-theory-worker:latest

# Deploy to Cloudflare
wrangler deploy --env production
```

### 4. DNS Configuration
- [ ] DNS records updated
- [ ] DNS propagation verified
- [ ] SSL certificate provisioned
- [ ] HTTPS redirects configured

---

## Post-Deployment Verification

### Health Checks
- [ ] Health endpoint responding: `/health`
- [ ] API documentation accessible: `/api/docs`
- [ ] Static assets serving: `/`
- [ ] Simulators loading: `/simulators/pythagorean/`

### Functionality Tests
- [ ] Pythagorean simulator working
- [ ] Rigidity simulator working
- [ ] API endpoints responding
- [ ] Form submissions working
- [ ] File uploads working (if applicable)

### Performance Tests
- [ ] Page load time < 2 seconds
- [ ] API response time < 100ms
- [ ] Cache hit rate > 50%
- [ ] No memory leaks
- [ ] No CPU spikes

### Security Tests
- [ ] HTTPS enforced
- [ ] CORS headers correct
- [ ] No sensitive data exposed
- [ ] Rate limiting working
- [ ] Input validation working

### Monitoring
- [ ] Analytics dashboard configured
- [ ] Error tracking working (Sentry)
- [ ] Uptime monitoring configured
- [ ] Alerts configured
- [ ] Log aggregation working

---

## Rollback Plan

### If Deployment Fails

1. **Immediate Rollback**
   ```bash
   # Rollback Workers to previous version
   wrangler rollback --env production

   # Or redeploy previous version
   wrangler deploy --env production --version PREVIOUS_VERSION
   ```

2. **DNS Rollback** (if needed)
   - Revert DNS records to previous server
   - Update Cloudflare Workers routes

3. **Data Rollback** (if needed)
   - Restore KV data from backup
   - Restore database from backup (if applicable)

### Rollback Verification
- [ ] Previous version deployed successfully
- [ ] All functionality restored
- [ ] No data loss
- [ ] Users notified (if applicable)

---

## Monitoring & Maintenance

### Daily Checks
- [ ] Uptime monitoring
- [ ] Error rates
- [ ] Response times
- [ ] Cache hit rates

### Weekly Checks
- [ ] Review analytics
- [ ] Check for vulnerabilities
- [ ] Review costs
- [ ] Performance optimization

### Monthly Checks
- [ ] Security audit
- [ ] Dependency updates
- [ ] Backup verification
- [ ] Capacity planning

---

## Emergency Procedures

### Site Down

1. Check Cloudflare status page
2. Check deployment logs: `wrangler tail`
3. Check error tracking (Sentry)
4. Check rate limits
5. Verify DNS resolution

### High Error Rates

1. Check error tracking for common errors
2. Check recent deployments
3. Check third-party services
4. Verify database connectivity
5. Check rate limiting rules

### Performance Degradation

1. Check cache hit rates
2. Check response times
3. Check CPU/memory usage
4. Review recent code changes
5. Check third-party service performance

---

## Communication

### Before Deployment
- [ ] Stakeholders notified
- [ ] Maintenance window scheduled
- [ ] Users notified (if applicable)

### During Deployment
- [ ] Status page updated
- [ ] Progress shared with team

### After Deployment
- [ ] Success announcement
- [ ] Documentation updated
- [ ] Team debrief
- [ ] Postmortem (if issues)

---

## Documentation

- [ ] Deployment guide updated
- [ ] API documentation updated
- [ ] README updated
- [ ] Changelog updated
- [ ] Architecture diagrams updated

---

## Success Criteria

Deployment is successful when:

- ✅ All health checks passing
- ✅ All functionality tests passing
- ✅ Performance metrics within targets
- ✅ No critical errors
- ✅ Monitoring operational
- ✅ Documentation complete

---

## Sign-Off

**Deployed by:** _______________ **Date:** _______________

**Reviewed by:** _______________ **Date:** _______________

**Approved by:** _______________ **Date:** _______________

**Notes:** _________________________________________________

____________________________________________________________

____________________________________________________________

---

**Last Updated:** 2026-03-16
**Version:** 1.0.0
