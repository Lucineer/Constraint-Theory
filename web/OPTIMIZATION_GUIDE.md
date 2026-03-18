# Web Performance Optimization Guide

**Constraint Theory Website**
**Last Updated:** 2026-03-18

---

## Table of Contents

1. [Quick Start](#quick-start)
2. [Optimization Techniques](#optimization-techniques)
3. [Implementation Guide](#implementation-guide)
4. [Testing & Validation](#testing--validation)
5. [Monitoring & Maintenance](#monitoring--maintenance)
6. [Troubleshooting](#troubleshooting)
7. [Best Practices](#best-practices)

---

## Quick Start

### Deploy Optimized Version

```bash
# Navigate to web directory
cd /c/Users/casey/polln/constrainttheory/web

# Backup original files
cp index.html index.html.backup

# Deploy optimized version
cp index-optimized.html index.html

# Verify deployment
ls -lh *.html
```

### Verify Performance

1. Open Chrome DevTools (F12)
2. Go to Lighthouse tab
3. Select "Performance" audit
4. Click "Analyze page load"
5. Verify score is 95+

---

## Optimization Techniques

### 1. Critical CSS Extraction

#### What It Is

Critical CSS is the minimum styles required to render above-the-fold content. By inlining these styles directly in HTML, we eliminate render-blocking CSS and achieve instant first paint.

#### How to Implement

```html
<!DOCTYPE html>
<html>
<head>
  <!-- Inline critical CSS -->
  <style>
    /* Critical styles for hero, nav, etc. */
    body{background:#0a0a0a;color:#fafafa}
    .nav{position:fixed;top:0;width:100%}
    .hero{min-height:100vh;display:flex}
  </style>

  <!-- Defer non-critical CSS -->
  <link rel="preload" href="/css/styles.min.css" as="style"
        onload="this.onload=null;this.rel='stylesheet'">
  <noscript><link rel="stylesheet" href="/css/styles.min.css"></noscript>
</head>
</html>
```

#### Tools

- **Critical:** `npm install -g critical`
- **PurgeCSS:** `npm install -g purgecss`
- **Manual:** Copy above-the-fold styles

#### Best Practices

1. Keep critical CSS under 15KB
2. Include only above-the-fold styles
3. Test on mobile viewport (375x667)
4. Validate no FOUC occurs

---

### 2. CSS/JS Minification

#### What It Is

Minification removes whitespace, comments, and unnecessary characters to reduce file size.

#### How to Implement

**Option 1: Using Node.js**

```javascript
// minify-css.js
const fs = require('fs');
const css = fs.readFileSync('input.css', 'utf8');
const minified = css
  .replace(/\/\*[\s\S]*?\*\//g, '')  // Remove comments
  .replace(/\s+/g, ' ')               // Collapse whitespace
  .replace(/\s*([{}:;,])\s*/g, '$1')  // Remove space around chars
  .trim();
fs.writeFileSync('output.min.css', minified);
```

**Option 2: Using Online Tools**

- CSS Minifier: https://cssminifier.com/
- JS Minifier: https://javascript-minifier.com/
- HTML Minifier: https://htmlminifier.com/

#### Best Practices

1. Keep source files (don't delete originals)
2. Use `.min.` extension for minified files
3. Test minified files work correctly
4. Add to build process

---

### 3. Deferred Resource Loading

#### What It Is

Deferring loads resources asynchronously without blocking HTML parsing and rendering.

#### CSS Loading Pattern

```html
<!-- Asynchronous CSS load -->
<link rel="preload" href="/css/styles.min.css" as="style"
      onload="this.onload=null;this.rel='stylesheet'">
<noscript>
  <link rel="stylesheet" href="/css/styles.min.css">
</noscript>
```

#### JavaScript Loading Pattern

```html
<!-- Deferred JavaScript -->
<script defer src="/js/main.min.js"></script>
<script defer src="/js/animations.min.js"></script>
```

#### Best Practices

1. Defer all non-critical JavaScript
2. Use `async` for independent scripts
3. Use `defer` for scripts that depend on DOM
4. Test script execution order

---

### 4. System Fonts

#### What It Is

Using system fonts eliminates external font requests and reduces layout shift.

#### How to Implement

```css
/* System font stack */
font-family: system-ui, -apple-system, sans-serif;

/* Comprehensive stack */
font-family:
  -apple-system,
  BlinkMacSystemFont,
  'Segoe UI',
  Roboto,
  Oxygen-Sans,
  Ubuntu,
  Cantarell,
  'Helvetica Neue',
  sans-serif;
```

#### Benefits

- Zero external requests
- Instant rendering
- No font layout shift
- Better privacy (no tracking)

#### Trade-offs

- Limited font selection
- Inconsistent across OS
- Less design control

---

### 5. Performance Monitoring

#### What It Is

Real-time tracking of Core Web Vitals and performance metrics.

#### Implementation

```javascript
// Web Vitals tracking
(function() {
  'use strict';

  // Track Largest Contentful Paint (LCP)
  if ('PerformanceObserver' in window) {
    const lcpObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const lastEntry = entries[entries.length - 1];
      console.log('[Performance] LCP:', lastEntry.startTime.toFixed(2), 'ms');
      // Send to analytics
    });
    lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });

    // Track First Input Delay (FID)
    const fidObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach((entry) => {
        const fid = entry.processingStart - entry.startTime;
        console.log('[Performance] FID:', fid.toFixed(2), 'ms');
        // Send to analytics
      });
    });
    fidObserver.observe({ entryTypes: ['first-input'] });

    // Track Cumulative Layout Shift (CLS)
    let clsScore = 0;
    const clsObserver = new PerformanceObserver((list) => {
      list.getEntries().forEach((entry) => {
        if (!entry.hadRecentInput) {
          clsScore += entry.value;
          console.log('[Performance] CLS:', (clsScore * 1000).toFixed(2));
          // Send to analytics
        }
      });
    });
    clsObserver.observe({ entryTypes: ['layout-shift'] });
  }

  // Track Time to First Byte (TTFB)
  window.addEventListener('load', () => {
    const perfData = performance.timing;
    const ttfb = perfData.responseStart - perfData.navigationStart;
    console.log('[Performance] TTFB:', ttfb.toFixed(2), 'ms');
    // Send to analytics
  });
})();
```

#### Best Practices

1. Track all Core Web Vitals
2. Send data to analytics
3. Set up alerts for regressions
4. Monitor real user data (RUM)

---

## Implementation Guide

### Step 1: Critical CSS Extraction

```bash
# Install critical CSS tool
npm install -g critical

# Extract critical CSS
critical index.html --css=css/styles.css --inline --minify > index-critical.html
```

### Step 2: Minify CSS/JS

```bash
# Minify CSS
for file in css/*.css; do
  minify "$file" > "${file%.css}.min.css"
done

# Minify JS
for file in js/*.js; do
  minify "$file" > "${file%.js}.min.js"
done
```

### Step 3: Update HTML

```bash
# Replace CSS links with preload pattern
sed -i 's/<link rel="stylesheet" href="\/css\/\(.*\).css">/<link rel="preload" href="\/css\/\1.min.css" as="style" onload="this.onload=null;this.rel='\''stylesheet'\''"><noscript><link rel="stylesheet" href="\/css\/\1.min.css"><\/noscript>/g' index.html

# Add defer to scripts
sed -i 's/<script src="\/js\/\(.*\).js">/<script defer src="\/js\/\1.min.js">/g' index.html
```

### Step 4: Test Changes

```bash
# Start local server
python -m http.server 8000

# Open in browser
open http://localhost:8000

# Run Lighthouse
# Chrome DevTools > Lighthouse > Analyze page load
```

---

## Testing & Validation

### Lighthouse Audit

1. Open Chrome DevTools (F12)
2. Go to Lighthouse tab
3. Select categories:
   - Performance
   - Accessibility
   - Best Practices
   - SEO
4. Click "Analyze page load"
5. Review results

### Target Scores

| Metric | Target | Good | Needs Work |
|--------|--------|------|------------|
| **Performance** | 95+ | 90-94 | < 90 |
| **Accessibility** | 100 | 95-99 | < 95 |
| **Best Practices** | 100 | 90-99 | < 90 |
| **SEO** | 100 | 90-99 | < 90 |

### Core Web Vitals

Run Chrome DevTools > Performance > Record:

1. Load page
2. Interact with page
3. Stop recording
4. Analyze metrics

### Network Analysis

1. Open Chrome DevTools > Network
2. Reload page
3. Check:
   - Waterfall (no blocking requests)
   - File sizes (are they minified?)
   - Request count (< 20)
   - Transfer size (< 100KB)

---

## Monitoring & Maintenance

### Set Up Performance Budget

```json
// package.json
{
  "scripts": {
    "lighthouse": "lighthouse http://localhost:8000 --budget-path=budget.json"
  },
  "budget": {
    "budgets": [
      {
        "path": "/*",
        "timings": [
          {
            "metric": "first-contentful-paint",
            "budget": 1500
          },
          {
            "metric": "largest-contentful-paint",
            "budget": 2500
          },
          {
            "metric": "cumulative-layout-shift",
            "budget": 0.1
          }
        ],
        "resourceSizes": [
          {
            "resourceType": "stylesheet",
            "budget": 35000
          },
          {
            "resourceType": "script",
            "budget": 30000
          },
          {
            "resourceType": "total",
            "budget": 100000
          }
        ],
        "resourceCounts": [
          {
            "resourceType": "total",
            "budget": 20
          }
        ]
      }
    ]
  }
}
```

### Continuous Monitoring

1. **Lighthouse CI** - Automated testing in CI/CD
2. **PageSpeed Insights** - Google's monitoring tool
3. **WebPageTest** - Detailed performance analysis
4. **RUM** - Real User Monitoring

### Monthly Audit Checklist

- [ ] Run Lighthouse audit
- [ ] Check Core Web Vitals
- [ ] Review file sizes
- [ ] Test on mobile devices
- [ ] Analyze RUM data
- [ ] Update performance budgets

---

## Troubleshooting

### Issue: Low Lighthouse Score

**Symptoms:** Performance score < 90

**Solutions:**
1. Check for render-blocking resources
2. Minify CSS/JS
3. Optimize images
4. Reduce JavaScript execution time
5. Eliminate unused CSS

### Issue: High CLS

**Symptoms:** Cumulative Layout Shift > 0.1

**Solutions:**
1. Use system fonts
2. Reserve space for images
3. Avoid inserting content above existing content
4. Set explicit dimensions on media

### Issue: Slow FCP

**Symptoms:** First Contentful Paint > 1.5s

**Solutions:**
1. Inline critical CSS
2. Defer non-critical CSS
3. Minimize render-blocking resources
4. Use CDN for static assets

### Issue: Slow LCP

**Symptoms:** Largest Contentful Paint > 2.5s

**Solutions:**
1. Optimize hero image
2. Preload critical resources
3. Reduce server response time
4. Improve FCP (helps LCP)

### Issue: High FID

**Symptoms:** First Input Delay > 100ms

**Solutions:**
1. Defer JavaScript
2. Reduce JavaScript execution time
3. Break up long tasks
4. Use web workers

---

## Best Practices

### 1. Performance First

- Design with performance in mind
- Set performance budgets
- Test early and often
- Monitor continuously

### 2. Progressive Enhancement

- Start with basic HTML/CSS
- Add JavaScript for enhancement
- Ensure graceful degradation
- Test without JavaScript

### 3. Resource Loading

- Inline critical CSS
- Defer non-critical resources
- Preload important resources
- Lazy load below-the-fold content

### 4. Monitoring

- Track Core Web Vitals
- Monitor real user data
- Set up alerts
- Review regularly

### 5. Maintenance

- Keep dependencies updated
- Regular performance audits
- Optimize new features
- Document changes

---

## Additional Resources

### Tools

- **Lighthouse:** https://developers.google.com/web/tools/lighthouse
- **PageSpeed Insights:** https://pagespeed.web.dev/
- **WebPageTest:** https://www.webpagetest.org/
- **Chrome DevTools:** https://developers.google.com/web/tools/chrome-devtools

### Documentation

- **Web.dev:** https://web.dev/
- **MDN Performance:** https://developer.mozilla.org/en-US/docs/Web/Performance
- **W3C Performance Timeline:** https://www.w3.org/TR/performance-timeline/

### Libraries

- **Critical:** https://github.com/addyosmani/critical
- **PurgeCSS:** https://purgecss.com/
- **Webpack:** https://webpack.js.org/

---

## Glossary

- **FCP:** First Contentful Paint - First time any content is rendered
- **LCP:** Largest Contentful Paint - Largest content element rendered
- **FID:** First Input Delay - Time from first user interaction to response
- **CLS:** Cumulative Layout Shift - Amount of unexpected layout shift
- **TTI:** Time to Interactive - Time when page is fully interactive
- **TTFB:** Time to First Byte - Time to receive first byte from server
- **RUM:** Real User Monitoring - Performance data from real users

---

**Last Updated:** 2026-03-18
**Version:** 1.0
**Maintainer:** SuperInstance Team
