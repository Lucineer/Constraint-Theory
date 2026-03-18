/**
 * Constraint Theory - Advanced Animations
 * Version: 1.0
 * Date: 2026-03-18
 * Description: Interactive animations and effects
 */

// ============================================
// UTILITY FUNCTIONS
// ============================================

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => document.querySelectorAll(selector);

// Check for reduced motion preference
const prefersReducedMotion = () =>
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// Throttle function for performance
const throttle = (func, limit) => {
  let inThrottle;
  return function(...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};

// Debounce function
const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

// Spring physics calculator
const springPhysics = {
  tension: 300,
  friction: 20,

  calculate(current, target, velocity = 0) {
    const spring = this.tension;
    const damper = this.friction;
    const displacement = target - current;
    const acceleration = (spring * displacement) - (damper * velocity);
    return {
      position: current + velocity,
      velocity: velocity + acceleration
    };
  }
};

// ============================================
// MOUSE TRACKING GLOW EFFECT
// ============================================

class MouseTrackingGlow {
  constructor(options = {}) {
    this.element = options.element;
    this.intensity = options.intensity || 0.5;
    this.radius = options.radius || 300;
    this.enabled = !prefersReducedMotion();

    if (!this.enabled) return;

    this.init();
  }

  init() {
    this.glow = document.createElement('div');
    this.glow.className = 'mouse-glow';
    this.glow.style.cssText = `
      position: fixed;
      width: ${this.radius}px;
      height: ${this.radius}px;
      background: radial-gradient(circle,
        oklch(0.72 0.19 145 / ${this.intensity}) 0%,
        transparent 70%
      );
      border-radius: 50%;
      pointer-events: none;
      z-index: 9999;
      transform: translate(-50%, -50%);
      transition: opacity 0.3s ease;
      opacity: 0;
    `;
    document.body.appendChild(this.glow);

    document.addEventListener('mousemove', throttle((e) => this.update(e), 16));
    document.addEventListener('mouseenter', () => this.show());
    document.addEventListener('mouseleave', () => this.hide());
  }

  update(e) {
    if (!this.enabled) return;
    this.glow.style.left = e.clientX + 'px';
    this.glow.style.top = e.clientY + 'px';
  }

  show() {
    if (!this.enabled) return;
    this.glow.style.opacity = '1';
  }

  hide() {
    if (!this.enabled) return;
    this.glow.style.opacity = '0';
  }

  destroy() {
    if (this.glow) {
      this.glow.remove();
    }
  }
}

// ============================================
// 3D TILT EFFECT FOR CARDS
// ============================================

class Card3DTilt {
  constructor(element, options = {}) {
    this.element = element;
    this.maxTilt = options.maxTilt || 10;
    this.scale = options.scale || 1.05;
    this.enabled = !prefersReducedMotion();

    if (!this.enabled) return;

    this.init();
  }

  init() {
    this.element.addEventListener('mousemove', (e) => this.handleMove(e));
    this.element.addEventListener('mouseleave', () => this.reset());
  }

  handleMove(e) {
    if (!this.enabled) return;

    const rect = this.element.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX = ((y - centerY) / centerY) * this.maxTilt;
    const rotateY = ((centerX - x) / centerX) * this.maxTilt;

    this.element.style.transform = `
      perspective(1000px)
      rotateX(${rotateX}deg)
      rotateY(${rotateY}deg)
      scale(${this.scale})
    `;
  }

  reset() {
    if (!this.enabled) return;
    this.element.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale(1)';
  }
}

// ============================================
// MAGNETIC BUTTON EFFECT
// ============================================

class MagneticButton {
  constructor(element, options = {}) {
    this.element = element;
    this.strength = options.strength || 0.3;
    this.enabled = !prefersReducedMotion();

    if (!this.enabled) return;

    this.init();
  }

  init() {
    this.element.addEventListener('mousemove', (e) => this.handleMove(e));
    this.element.addEventListener('mouseleave', () => this.reset());
  }

  handleMove(e) {
    if (!this.enabled) return;

    const rect = this.element.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;

    this.element.style.transform = `
      translate(${x * this.strength}px, ${y * this.strength}px)
    `;
  }

  reset() {
    if (!this.enabled) return;
    this.element.style.transform = 'translate(0, 0)';
  }
}

// ============================================
// STAGGERED ENTRANCE ANIMATION
// ============================================

class StaggeredAnimation {
  constructor(container, options = {}) {
    this.container = container;
    this.selector = options.selector || '> *';
    this.delay = options.delay || 100;
    this.enabled = !prefersReducedMotion();

    if (!this.enabled) return;

    this.init();
  }

  init() {
    this.items = this.container.querySelectorAll(this.selector);
    this.items.forEach((item, index) => {
      item.style.opacity = '0';
      item.style.transform = 'translateY(20px)';
      item.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
      item.style.transitionDelay = `${index * this.delay}ms`;
    });

    // Trigger animation
    requestAnimationFrame(() => {
      this.items.forEach(item => {
        item.style.opacity = '1';
        item.style.transform = 'translateY(0)';
      });
    });
  }
}

// ============================================
// PARALLAX EFFECT
// ============================================

class ParallaxEffect {
  constructor(options = {}) {
    this.elements = document.querySelectorAll('[data-parallax]');
    this.speed = options.speed || 0.5;
    this.enabled = !prefersReducedMotion();

    if (!this.enabled) return;

    this.init();
  }

  init() {
    window.addEventListener('scroll', throttle(() => this.update(), 16));
    this.update();
  }

  update() {
    if (!this.enabled) return;

    const scrollY = window.scrollY;

    this.elements.forEach(element => {
      const speed = element.dataset.parallax || this.speed;
      const yPos = -(scrollY * speed);
      element.style.transform = `translateY(${yPos}px)`;
    });
  }
}

// ============================================
// SCROLL PROGRESS INDICATOR
// ============================================

class ScrollProgress {
  constructor(options = {}) {
    this.color = options.color || 'oklch(0.72 0.19 145)';
    this.height = options.height || '3px';
    this.position = options.position || 'top';

    this.init();
  }

  init() {
    // Create progress bar
    this.progressBar = document.createElement('div');
    this.progressBar.className = 'scroll-progress-bar';
    this.progressBar.style.cssText = `
      position: fixed;
      ${this.position}: 0;
      left: 0;
      width: 0%;
      height: ${this.height};
      background: ${this.color};
      z-index: 10000;
      transition: width 0.1s linear;
    `;
    document.body.appendChild(this.progressBar);

    // Update on scroll
    window.addEventListener('scroll', throttle(() => this.update(), 50));
    this.update();
  }

  update() {
    const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
    const scrollPercent = (window.scrollY / scrollHeight) * 100;
    this.progressBar.style.width = `${scrollPercent}%`;
  }
}

// ============================================
// INTERSECTION OBSERVER ANIMATIONS
// ============================================

class IntersectionAnimations {
  constructor(options = {}) {
    this.selector = options.selector || '.scroll-animate';
    this.threshold = options.threshold || 0.1;
    this.rootMargin = options.rootMargin || '0px 0px -100px 0px';
    this.enabled = !prefersReducedMotion();

    if (!this.enabled) return;

    this.init();
  }

  init() {
    this.elements = document.querySelectorAll(this.selector);

    const observerOptions = {
      threshold: this.threshold,
      rootMargin: this.rootMargin
    };

    this.observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          this.observer.unobserve(entry.target);
        }
      });
    }, observerOptions);

    this.elements.forEach(el => this.observer.observe(el));
  }

  destroy() {
    if (this.observer) {
      this.observer.disconnect();
    }
  }
}

// ============================================
// RIPPLE EFFECT
// ============================================

class RippleEffect {
  constructor(element) {
    this.element = element;
    this.enabled = !prefersReducedMotion();

    if (!this.enabled) return;

    this.init();
  }

  init() {
    this.element.addEventListener('click', (e) => this.create(e));
  }

  create(e) {
    if (!this.enabled) return;

    const rect = this.element.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const ripple = document.createElement('span');
    ripple.className = 'ripple';
    ripple.style.left = x + 'px';
    ripple.style.top = y + 'px';

    this.element.appendChild(ripple);

    setTimeout(() => ripple.remove(), 600);
  }
}

// ============================================
// PARTICLE SYSTEM
// ============================================

class ParticleSystem {
  constructor(container, options = {}) {
    this.container = container;
    this.particleCount = options.count || 50;
    this.size = options.size || 4;
    this.color = options.color || 'oklch(0.72 0.19 145)';
    this.speed = options.speed || 1;
    this.enabled = !prefersReducedMotion();

    if (!this.enabled) return;

    this.particles = [];
    this.init();
  }

  init() {
    for (let i = 0; i < this.particleCount; i++) {
      this.createParticle();
    }

    this.animate();
  }

  createParticle() {
    const particle = document.createElement('div');
    particle.className = 'particle';
    particle.style.cssText = `
      position: absolute;
      width: ${this.size}px;
      height: ${this.size}px;
      background: ${this.color};
      border-radius: 50%;
      left: ${Math.random() * 100}%;
      top: ${Math.random() * 100}%;
      opacity: ${Math.random() * 0.5 + 0.2};
      --tx: ${(Math.random() - 0.5) * 100}px;
      --ty: ${(Math.random() - 0.5) * 100}px;
    `;

    this.container.appendChild(particle);
    this.particles.push({
      element: particle,
      x: parseFloat(particle.style.left),
      y: parseFloat(particle.style.top),
      vx: (Math.random() - 0.5) * this.speed,
      vy: (Math.random() - 0.5) * this.speed
    });
  }

  animate() {
    if (!this.enabled) return;

    this.particles.forEach(particle => {
      particle.x += particle.vx;
      particle.y += particle.vy;

      // Wrap around
      if (particle.x < 0) particle.x = 100;
      if (particle.x > 100) particle.x = 0;
      if (particle.y < 0) particle.y = 100;
      if (particle.y > 100) particle.y = 0;

      particle.element.style.left = particle.x + '%';
      particle.element.style.top = particle.y + '%';
    });

    requestAnimationFrame(() => this.animate());
  }
}

// ============================================
// CONNECTION LINES
// ============================================

class ConnectionLines {
  constructor(canvas, options = {}) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.points = options.points || [];
    this.maxDistance = options.maxDistance || 150;
    this.enabled = !prefersReducedMotion();

    if (!this.enabled) return;

    this.init();
  }

  init() {
    this.resize();
    window.addEventListener('resize', debounce(() => this.resize(), 100));
    this.animate();
  }

  resize() {
    const rect = this.canvas.parentElement.getBoundingClientRect();
    this.canvas.width = rect.width;
    this.canvas.height = rect.height;
  }

  addPoint(x, y) {
    this.points.push({ x, y, vx: 0, vy: 0 });
  }

  animate() {
    if (!this.enabled) return;

    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // Draw connections
    this.ctx.strokeStyle = 'oklch(0.72 0.19 145 / 0.2)';
    this.ctx.lineWidth = 1;

    for (let i = 0; i < this.points.length; i++) {
      for (let j = i + 1; j < this.points.length; j++) {
        const dx = this.points[i].x - this.points[j].x;
        const dy = this.points[i].y - this.points[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < this.maxDistance) {
          this.ctx.globalAlpha = 1 - (dist / this.maxDistance);
          this.ctx.beginPath();
          this.ctx.moveTo(this.points[i].x, this.points[i].y);
          this.ctx.lineTo(this.points[j].x, this.points[j].y);
          this.ctx.stroke();
        }
      }
    }

    this.ctx.globalAlpha = 1;

    requestAnimationFrame(() => this.animate());
  }
}

// ============================================
// TYPING EFFECT
// ============================================

class TypingEffect {
  constructor(element, options = {}) {
    this.element = element;
    this.text = options.text || element.textContent;
    this.speed = options.speed || 50;
    this.cursor = options.cursor !== false;
    this.enabled = !prefersReducedMotion();

    if (!this.enabled) {
      element.textContent = this.text;
      return;
    }

    this.init();
  }

  init() {
    this.element.textContent = '';

    if (this.cursor) {
      this.element.style.borderRight = '2px solid oklch(0.72 0.19 145)';
      this.element.style.animation = 'blinkCursor 0.75s step-end infinite';
    }

    let i = 0;
    const type = () => {
      if (i < this.text.length) {
        this.element.textContent += this.text.charAt(i);
        i++;
        setTimeout(type, this.speed);
      } else if (this.cursor) {
        setTimeout(() => {
          this.element.style.animation = 'none';
          this.element.style.borderRight = 'none';
        }, 2000);
      }
    };

    type();
  }
}

// ============================================
// SCROLL INDICATOR
// ============================================

class ScrollIndicator {
  constructor(options = {}) {
    this.text = options.text || 'Scroll to explore';
    this.position = options.position || 'bottom';

    this.init();
  }

  init() {
    this.indicator = document.createElement('div');
    this.indicator.className = 'scroll-indicator';
    this.indicator.innerHTML = `
      <div class="scroll-indicator-text">${this.text}</div>
      <div class="scroll-indicator-arrow">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M12 5v14M19 12l-7 7-7-7"/>
        </svg>
      </div>
    `;
    this.indicator.style.cssText = `
      position: fixed;
      ${this.position}: 2rem;
      left: 50%;
      transform: translateX(-50%);
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.5rem;
      color: var(--muted-foreground);
      font-size: var(--text-body-sm);
      z-index: 100;
      animation: scrollBounce 2s ease-in-out infinite;
      cursor: pointer;
    `;

    document.body.appendChild(this.indicator);

    this.indicator.addEventListener('click', () => {
      window.scrollTo({
        top: window.innerHeight,
        behavior: 'smooth'
      });
    });

    // Hide after scrolling
    window.addEventListener('scroll', () => {
      if (window.scrollY > 100) {
        this.indicator.style.opacity = '0';
      } else {
        this.indicator.style.opacity = '1';
      }
    });
  }
}

// ============================================
// CODE REVEAL ANIMATION
// ============================================

class CodeReveal {
  constructor(codeBlock, options = {}) {
    this.codeBlock = codeBlock;
    this.lineDelay = options.lineDelay || 100;
    this.enabled = !prefersReducedMotion();

    if (!this.enabled) return;

    this.init();
  }

  init() {
    const lines = this.codeBlock.querySelectorAll('pre code');
    if (!lines.length) return;

    const code = lines[0];
    const codeLines = code.textContent.split('\n');

    code.innerHTML = codeLines.map((line, i) =>
      `<span style="display: block; animation-delay: ${i * this.lineDelay}ms">${line || ' '}</span>`
    ).join('');

    code.classList.add('code-reveal');
  }
}

// ============================================
// HERO ENHANCEMENTS
// ============================================

class HeroEnhancements {
  constructor(heroSection) {
    this.hero = heroSection;
    this.enabled = !prefersReducedMotion();

    if (!this.enabled) return;

    this.init();
  }

  init() {
    // Add floating shapes
    this.addFloatingShapes();

    // Add mouse tracking glow
    this.glow = new MouseTrackingGlow({
      intensity: 0.3,
      radius: 400
    });
  }

  addFloatingShapes() {
    const shapes = ['circle', 'triangle', 'square'];
    const container = this.hero.querySelector('.floating-elements');

    if (!container) return;

    for (let i = 0; i < 15; i++) {
      const shape = document.createElement('div');
      const shapeType = shapes[Math.floor(Math.random() * shapes.length)];

      shape.className = `hero-shape hero-shape-${shapeType}`;
      shape.style.cssText = `
        left: ${Math.random() * 100}%;
        top: ${Math.random() * 100}%;
        animation: float ${5 + Math.random() * 5}s ease-in-out infinite;
        animation-delay: ${Math.random() * 5}s;
        opacity: ${0.1 + Math.random() * 0.2};
        transform: scale(${0.5 + Math.random() * 1});
      `;

      container.appendChild(shape);
    }
  }
}

// ============================================
// METRICS CHART
// ============================================

class MetricsChart {
  constructor(canvas, options = {}) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.data = options.data || [];
    this.maxDataPoints = options.maxDataPoints || 50;
    this.lineColor = options.lineColor || 'oklch(0.72 0.19 145)';
    this.fillColor = options.fillColor || 'oklch(0.72 0.19 145 / 0.1)';
    this.enabled = !prefersReducedMotion();

    this.init();
  }

  init() {
    this.resize();
    window.addEventListener('resize', debounce(() => this.resize(), 100));
    this.animate();
  }

  resize() {
    const rect = this.canvas.parentElement.getBoundingClientRect();
    this.canvas.width = rect.width;
    this.canvas.height = rect.height;
  }

  addData(value) {
    this.data.push(value);
    if (this.data.length > this.maxDataPoints) {
      this.data.shift();
    }
  }

  animate() {
    if (!this.enabled) return;

    const ctx = this.ctx;
    const width = this.canvas.width;
    const height = this.canvas.height;

    ctx.clearRect(0, 0, width, height);

    if (this.data.length < 2) {
      requestAnimationFrame(() => this.animate());
      return;
    }

    // Draw area
    ctx.fillStyle = this.fillColor;
    ctx.beginPath();
    ctx.moveTo(0, height);

    this.data.forEach((value, i) => {
      const x = (i / (this.maxDataPoints - 1)) * width;
      const y = height - (value / 100) * height;
      ctx.lineTo(x, y);
    });

    ctx.lineTo(width, height);
    ctx.closePath();
    ctx.fill();

    // Draw line
    ctx.strokeStyle = this.lineColor;
    ctx.lineWidth = 2;
    ctx.beginPath();

    this.data.forEach((value, i) => {
      const x = (i / (this.maxDataPoints - 1)) * width;
      const y = height - (value / 100) * height;

      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });

    ctx.stroke();

    requestAnimationFrame(() => this.animate());
  }
}

// ============================================
// INITIALIZATION
// ============================================

// Initialize all animations when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  // Skip if reduced motion preferred
  if (prefersReducedMotion()) {
    // Add visible class to all scroll-animate elements
    $$('.scroll-animate').forEach(el => {
      el.classList.add('is-visible');
    });
    return;
  }

  // Initialize 3D tilt for cards
  $$('.card').forEach(card => {
    new Card3DTilt(card);
  });

  // Initialize magnetic buttons
  $$('.btn').forEach(btn => {
    new MagneticButton(btn);
  });

  // Initialize ripple effects
  $$('.ripple-container').forEach(container => {
    new RippleEffect(container);
  });

  // Initialize intersection animations
  new IntersectionAnimations();

  // Initialize scroll progress
  new ScrollProgress();

  // Initialize parallax
  new ParallaxEffect();

  // Initialize hero enhancements
  const hero = $('.hero');
  if (hero) {
    new HeroEnhancements(hero);
  }

  // Initialize scroll indicator
  new ScrollIndicator();

  // Initialize staggered animations for feature grids
  $$('.features-grid').forEach(grid => {
    new StaggeredAnimation(grid);
  });
});

// ============================================
// EXPORTS
// ============================================

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    MouseTrackingGlow,
    Card3DTilt,
    MagneticButton,
    StaggeredAnimation,
    ParallaxEffect,
    ScrollProgress,
    IntersectionAnimations,
    RippleEffect,
    ParticleSystem,
    ConnectionLines,
    TypingEffect,
    ScrollIndicator,
    CodeReveal,
    HeroEnhancements,
    MetricsChart
  };
}
