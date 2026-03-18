# Animation Enhancement Guide

## Overview

This guide documents the advanced interactive elements and animations added to the Constraint Theory website. All animations are designed to be smooth (60fps), accessible, and performant.

## Table of Contents

1. [Animation Library](#animation-library)
2. [Interactive Effects](#interactive-effects)
3. [Scroll Animations](#scroll-animations)
4. [Demo Enhancements](#demo-enhancements)
5. [Performance Optimization](#performance-optimization)
6. [Accessibility](#accessibility)
7. [Browser Support](#browser-support)

---

## Animation Library

### CSS Animations (`animations.css`)

The animation library provides a comprehensive set of keyframe animations and utility classes:

#### Fade Animations
- `animate-fade-in-up` - Fade in with upward movement
- `animate-fade-in-down` - Fade in with downward movement
- `animate-fade-in-left` - Fade in from left
- `animate-fade-in-right` - Fade in from right
- `animate-fade-in` - Simple fade in
- `animate-fade-out` - Simple fade out

#### Scale Animations
- `animate-scale-in` - Scale up from 0.9 to 1
- `animate-scale-out` - Scale down from 1 to 0.9
- `animate-scale-pulse` - Continuous scale pulsing

#### Slide Animations
- `animate-slide-in-up` - Slide from bottom
- `animate-slide-in-down` - Slide from top
- `animate-slide-in-left` - Slide from left
- `animate-slide-in-right` - Slide from right

#### Float Animations
- `animate-float` - Floating motion (6s duration)
- `animate-float-slow` - Slower floating motion (8s duration)

#### Glow Animations
- `animate-pulse-glow` - Pulsing glow effect
- `animate-glow-pulse` - Alternative glow pulse

#### Special Effects
- `animate-shimmer` - Shimmer gradient effect
- `animate-morph` - Morphing border radius
- `animate-spin` - Continuous rotation
- `animate-bounce` - Bouncing motion

#### Delay Classes
- `.delay-100` through `.delay-1000` - Animation delays in 100ms increments

#### Duration Classes
- `.duration-fast` - 150ms
- `.duration-base` - 200ms
- `.duration-normal` - 300ms
- `.duration-slow` - 500ms
- `.duration-slower` - 1000ms

---

## Interactive Effects

### 3D Card Tilt

Feature cards have a 3D tilt effect on hover:

```html
<div class="card card-3d">
  <div class="card-3d-inner">
    <!-- Card content -->
  </div>
</div>
```

**JavaScript Class:** `Card3DTilt`

```javascript
new Card3DTilt(element, {
  maxTilt: 10,    // Maximum tilt angle in degrees
  scale: 1.05     // Scale factor on hover
});
```

### Magnetic Buttons

Buttons have a magnetic effect that pulls towards the cursor:

```html
<button class="btn magnetic-btn ripple-container">
  Click Me
</button>
```

**JavaScript Class:** `MagneticButton`

```javascript
new MagneticButton(element, {
  strength: 0.3   // Pull strength (0-1)
});
```

### Ripple Effect

Buttons show a ripple effect on click:

```html
<div class="ripple-container">
  <button class="btn">Click Me</button>
</div>
```

**JavaScript Class:** `RippleEffect`

### Mouse Tracking Glow

A subtle glow follows the mouse cursor:

**JavaScript Class:** `MouseTrackingGlow`

```javascript
new MouseTrackingGlow({
  intensity: 0.3,  // Glow intensity
  radius: 400      // Glow radius in pixels
});
```

---

## Scroll Animations

### Intersection Observer Animations

Elements animate as they enter the viewport:

```html
<div class="scroll-animate">
  This element fades in when scrolled into view
</div>

<div class="scroll-animate-left">
  This slides in from the left
</div>

<div class="scroll-animate-right">
  This slides in from the right
</div>

<div class="scroll-animate-scale">
  This scales in when visible
</div>
```

**JavaScript Class:** `IntersectionAnimations`

```javascript
new IntersectionAnimations({
  selector: '.scroll-animate',
  threshold: 0.1,           // 10% visible triggers animation
  rootMargin: '0px 0px -100px 0px'
});
```

### Scroll Progress Indicator

A progress bar shows scroll position:

**JavaScript Class:** `ScrollProgress`

```javascript
new ScrollProgress({
  color: 'oklch(0.72 0.19 145)',
  height: '3px',
  position: 'top'
});
```

### Parallax Effects

Elements move at different speeds when scrolling:

```html
<div data-parallax="0.5">
  Moves at half scroll speed
</div>
```

**JavaScript Class:** `ParallaxEffect`

### Staggered Animations

Children animate in sequence:

```html
<div class="stagger-container">
  <div>Animates first</div>
  <div>Animates second (100ms delay)</div>
  <div>Animates third (200ms delay)</div>
</div>
```

**JavaScript Class:** `StaggeredAnimation`

---

## Demo Enhancements

### Agent Simulation Features

The interactive demo includes:

1. **Particle Effects** - Burst animation when adding agents
2. **Connection Lines** - Dynamic lines between nearby agents
3. **Agent Pulsing** - Agents pulse with subtle size changes
4. **Agent Drift** - Agents slowly drift and bounce off edges

### Particle System

Create floating particles:

**JavaScript Class:** `ParticleSystem`

```javascript
new ParticleSystem(container, {
  count: 50,
  size: 4,
  color: 'oklch(0.72 0.19 145)',
  speed: 1
});
```

### Connection Lines

Draw dynamic connections between points:

**JavaScript Class:** `ConnectionLines`

```javascript
new ConnectionLines(canvas, {
  points: [...],
  maxDistance: 150
});
```

### Metrics Chart

Real-time performance visualization:

**JavaScript Class:** `MetricsChart`

```javascript
const chart = new MetricsChart(canvas, {
  data: [],
  maxDataPoints: 50,
  lineColor: 'oklch(0.72 0.19 145)',
  fillColor: 'oklch(0.72 0.19 145 / 0.1)'
});

chart.addData(75);  // Add value (0-100)
```

---

## Performance Optimization

### Hardware Acceleration

Animations use GPU acceleration where possible:

```css
.animate-hardware {
  will-change: transform;
  transform: translateZ(0);
  backface-visibility: hidden;
  perspective: 1000px;
}
```

### Throttling and Debouncing

Event handlers are throttled/debounced:

```javascript
// Throttle for high-frequency events (scroll, mousemove)
window.addEventListener('scroll', throttle(() => update(), 16));

// Debounce for resize events
window.addEventListener('resize', debounce(() => resize(), 100));
```

### Request Animation Frame

All animations use `requestAnimationFrame`:

```javascript
function animate() {
  update();
  draw();
  requestAnimationFrame(animate);
}
```

### Optimized Painting

Elements use CSS containment:

```css
.animate-optimize {
  contain: layout style paint;
}
```

---

## Accessibility

### Reduced Motion Support

All animations respect `prefers-reduced-motion`:

```css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

### JavaScript Detection

```javascript
const prefersReducedMotion = () =>
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;
```

When reduced motion is preferred:
- Animations are disabled
- Scroll elements become immediately visible
- Interactive effects are turned off
- Performance is optimized

### Focus Indicators

All interactive elements have visible focus states:

```css
*:focus-visible {
  outline: 2px solid var(--primary);
  outline-offset: 2px;
}
```

---

## Browser Support

### CSS Features

- CSS Custom Properties (CSS Variables)
- `oklch()` color space
- `backdrop-filter`
- `transform: perspective()`
- `will-change`
- `contain`

### JavaScript Features

- `IntersectionObserver`
- `requestAnimationFrame`
- ES6 Classes
- Arrow functions
- Template literals

### Fallbacks

For browsers without `oklch()` support, consider adding a fallback:

```css
:root {
  --primary: oklch(0.72 0.19 145);
  --primary-fallback: #10b981;  /* Fallback for older browsers */
}
```

---

## Usage Examples

### Adding a New Animation

1. **Define keyframes in `animations.css`:**

```css
@keyframes myAnimation {
  from {
    opacity: 0;
    transform: scale(0.8);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}
```

2. **Create utility class:**

```css
.animate-my-animation {
  animation: myAnimation 0.5s var(--ease-out) forwards;
}
```

3. **Apply to element:**

```html
<div class="animate-my-animation">
  Content
</div>
```

### Creating a Custom Interactive Effect

1. **Create JavaScript class in `animations.js`:**

```javascript
class MyCustomEffect {
  constructor(element, options = {}) {
    this.element = element;
    this.enabled = !prefersReducedMotion();

    if (!this.enabled) return;

    this.init();
  }

  init() {
    // Initialize effect
  }

  update() {
    // Update effect state
  }
}
```

2. **Initialize on DOM ready:**

```javascript
document.addEventListener('DOMContentLoaded', () => {
  $$('.my-custom-class').forEach(el => {
    new MyCustomEffect(el);
  });
});
```

---

## Performance Monitoring

### Measuring Animation Performance

Use Chrome DevTools:

1. Open Performance panel
2. Start recording
3. Interact with animations
4. Stop recording
5. Check for:
   - Frames consistently at 60fps
   - No long tasks (>50ms)
   - Minimal layout thrashing
   - Efficient paint cycles

### Key Metrics

- **FPS**: Should be 60fps (16.67ms per frame)
- **CLS**: Cumulative Layout Shift < 0.1
- **LCP**: Largest Contentful Paint < 2.5s
- **FID**: First Input Delay < 100ms

---

## Troubleshooting

### Animations Not Smooth

**Problem**: Animations are choppy or laggy

**Solutions**:
1. Use `transform` and `opacity` only (hardware-accelerated)
2. Add `will-change: transform` to animated elements
3. Reduce number of simultaneous animations
4. Use `contain` property to isolate repaints

### High CPU Usage

**Problem**: Animations causing high CPU usage

**Solutions**:
1. Throttle scroll/resize handlers
2. Use `IntersectionObserver` instead of scroll listeners
3. Reduce particle count in particle systems
4. Implement object pooling for frequently created objects

### Layout Shift

**Problem**: Page elements jumping during animations

**Solutions**:
1. Reserve space for animated elements
2. Use `transform` instead of changing position
3. Avoid animating `width`, `height`, `top`, `left`
4. Use `position: absolute` for animated elements

---

## Best Practices

1. **Always respect reduced motion preferences**
2. **Use `requestAnimationFrame` for animations**
3. **Throttle/debounce event handlers**
4. **Prefer CSS animations over JavaScript**
5. **Use hardware-accelerated properties**
6. **Test on low-end devices**
7. **Monitor performance metrics**
8. **Keep animations subtle and purposeful**

---

## Resources

- [Web Animations API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Animations_API)
- [CSS Animations](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Animations)
- [Performance](https://web.dev/performance/)
- [Accessibility](https://www.w3.org/WAI/WCAG21/Understanding/animation-from-interactions)
