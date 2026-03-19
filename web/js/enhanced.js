/**
 * Constraint Theory - Enhanced Interactive Features
 * Version: 2.0
 * Date: 2026-03-18
 * Description: Interactive animations and effects for the landing page
 */

(function() {
  'use strict';

  // ============================================
  // CONFIGURATION
  // ============================================

  const CONFIG = {
    particles: {
      count: 80,
      connectionDistance: 150,
      mouseDistance: 200,
      baseSpeed: 0.3
    },
    stats: {
      animationDuration: 2000,
      easing: 'easeOutExpo'
    },
    parallax: {
      enabled: true,
      intensity: 0.15
    },
    scroll: {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    }
  };

  // ============================================
  // UTILITY FUNCTIONS
  // ============================================

  const utils = {
    // Linear interpolation
    lerp: (start, end, factor) => start + (end - start) * factor,

    // Clamp value between min and max
    clamp: (value, min, max) => Math.min(Math.max(value, min), max),

    // Easing functions
    easing: {
      easeOutExpo: (t) => t === 1 ? 1 : 1 - Math.pow(2, -10 * t),
      easeOutQuart: (t) => 1 - Math.pow(1 - t, 4),
      easeOutCubic: (t) => 1 - Math.pow(1 - t, 3)
    },

    // Check if element is in viewport
    isInViewport: (element, threshold = 0.1) => {
      const rect = element.getBoundingClientRect();
      const windowHeight = window.innerHeight || document.documentElement.clientHeight;
      const windowWidth = window.innerWidth || document.documentElement.clientWidth;

      const vertInView = (rect.top <= windowHeight) && ((rect.top + rect.height) >= 0);
      const horInView = (rect.left <= windowWidth) && ((rect.left + rect.width) >= 0);

      return vertInView && horInView;
    },

    // Debounce function
    debounce: (func, wait) => {
      let timeout;
      return function executedFunction(...args) {
        const later = () => {
          clearTimeout(timeout);
          func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
      };
    },

    // Throttle function
    throttle: (func, limit) => {
      let inThrottle;
      return function(...args) {
        if (!inThrottle) {
          func.apply(this, args);
          inThrottle = true;
          setTimeout(() => inThrottle = false, limit);
        }
      };
    }
  };

  // ============================================
  // PARTICLE BACKGROUND SYSTEM
  // ============================================

  class ParticleSystem {
    constructor(canvas) {
      this.canvas = canvas;
      this.ctx = canvas.getContext('2d');
      this.particles = [];
      this.mouse = { x: null, y: null };
      this.animationId = null;
      this.resizeObserver = null;

      this.init();
    }

    init() {
      this.resize();
      this.createParticles();
      this.setupEventListeners();
      this.animate();
    }

    resize() {
      const dpr = window.devicePixelRatio || 1;
      const rect = this.canvas.getBoundingClientRect();

      this.canvas.width = rect.width * dpr;
      this.canvas.height = rect.height * dpr;

      this.ctx.scale(dpr, dpr);

      this.width = rect.width;
      this.height = rect.height;
    }

    createParticles() {
      this.particles = [];

      for (let i = 0; i < CONFIG.particles.count; i++) {
        this.particles.push({
          x: Math.random() * this.width,
          y: Math.random() * this.height,
          vx: (Math.random() - 0.5) * CONFIG.particles.baseSpeed,
          vy: (Math.random() - 0.5) * CONFIG.particles.baseSpeed,
          radius: Math.random() * 2 + 1,
          opacity: Math.random() * 0.5 + 0.2
        });
      }
    }

    setupEventListeners() {
      // Mouse move
      window.addEventListener('mousemove', utils.throttle((e) => {
        this.mouse.x = e.clientX;
        this.mouse.y = e.clientY;
      }, 50));

      // Mouse leave
      window.addEventListener('mouseleave', () => {
        this.mouse.x = null;
        this.mouse.y = null;
      });

      // Resize
      this.resizeObserver = new ResizeObserver(utils.debounce(() => {
        this.resize();
        this.createParticles();
      }, 250));

      this.resizeObserver.observe(this.canvas.parentElement);
    }

    updateParticle(particle) {
      // Update position
      particle.x += particle.vx;
      particle.y += particle.vy;

      // Wrap around edges
      if (particle.x < 0) particle.x = this.width;
      if (particle.x > this.width) particle.x = 0;
      if (particle.y < 0) particle.y = this.height;
      if (particle.y > this.height) particle.y = 0;

      // Mouse interaction
      if (this.mouse.x !== null && this.mouse.y !== null) {
        const dx = this.mouse.x - particle.x;
        const dy = this.mouse.y - particle.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < CONFIG.particles.mouseDistance) {
          const force = (CONFIG.particles.mouseDistance - distance) / CONFIG.particles.mouseDistance;
          const angle = Math.atan2(dy, dx);

          particle.vx -= Math.cos(angle) * force * 0.5;
          particle.vy -= Math.sin(angle) * force * 0.5;
        }
      }

      // Apply friction
      particle.vx *= 0.99;
      particle.vy *= 0.99;

      // Minimum speed
      const speed = Math.sqrt(particle.vx * particle.vx + particle.vy * particle.vy);
      if (speed < 0.1) {
        particle.vx += (Math.random() - 0.5) * 0.1;
        particle.vy += (Math.random() - 0.5) * 0.1;
      }

      // Limit speed
      const maxSpeed = 2;
      if (speed > maxSpeed) {
        particle.vx = (particle.vx / speed) * maxSpeed;
        particle.vy = (particle.vy / speed) * maxSpeed;
      }
    }

    drawParticle(particle) {
      this.ctx.beginPath();
      this.ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
      this.ctx.fillStyle = `rgba(115, 200, 180, ${particle.opacity})`;
      this.ctx.fill();
    }

    drawConnections() {
      for (let i = 0; i < this.particles.length; i++) {
        for (let j = i + 1; j < this.particles.length; j++) {
          const dx = this.particles[i].x - this.particles[j].x;
          const dy = this.particles[i].y - this.particles[j].y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < CONFIG.particles.connectionDistance) {
            const opacity = (1 - distance / CONFIG.particles.connectionDistance) * 0.15;
            this.ctx.beginPath();
            this.ctx.strokeStyle = `rgba(115, 200, 180, ${opacity})`;
            this.ctx.lineWidth = 1;
            this.ctx.moveTo(this.particles[i].x, this.particles[i].y);
            this.ctx.lineTo(this.particles[j].x, this.particles[j].y);
            this.ctx.stroke();
          }
        }
      }
    }

    animate() {
      this.ctx.clearRect(0, 0, this.width, this.height);

      // Update and draw particles
      this.particles.forEach(particle => {
        this.updateParticle(particle);
        this.drawParticle(particle);
      });

      // Draw connections
      this.drawConnections();

      this.animationId = requestAnimationFrame(() => this.animate());
    }

    destroy() {
      if (this.animationId) {
        cancelAnimationFrame(this.animationId);
      }
      if (this.resizeObserver) {
        this.resizeObserver.disconnect();
      }
    }
  }

  // ============================================
  // STATS COUNTER ANIMATION
  // ============================================

  class StatsCounter {
    constructor(element) {
      this.element = element;
      this.target = parseInt(element.dataset.count) || 0;
      this.suffix = element.dataset.suffix || '';
      this.prefix = element.dataset.prefix || '';
      this.format = element.dataset.format === 'true';
      this.current = 0;
      this.animated = false;
      this.duration = CONFIG.stats.animationDuration;
      this.startTime = null;

      // Check if already visible
      if (utils.isInViewport(element, 0.5)) {
        this.start();
      }
    }

    formatNumber(num) {
      if (!this.format) return num;

      if (num >= 1000000) {
        return (num / 1000000).toFixed(1) + 'M';
      } else if (num >= 1000) {
        return (num / 1000).toFixed(1) + 'K';
      }
      return num.toString();
    }

    start() {
      if (this.animated) return;
      this.animated = true;
      this.startTime = performance.now();
      this.animate();
    }

    animate(currentTime = null) {
      if (this.startTime === null) {
        this.startTime = currentTime;
      }

      const elapsed = currentTime - this.startTime;
      const progress = Math.min(elapsed / this.duration, 1);
      const easedProgress = utils.easing.easeOutExpo(progress);

      this.current = Math.floor(this.target * easedProgress);
      this.element.textContent = this.prefix + this.formatNumber(this.current) + this.suffix;

      if (progress < 1) {
        requestAnimationFrame((time) => this.animate(time));
      } else {
        this.element.textContent = this.prefix + this.formatNumber(this.target) + this.suffix;
      }
    }
  }

  // ============================================
  // PARALLAX EFFECT
  // ============================================

  class ParallaxEffect {
    constructor(elements) {
      this.elements = elements;
      this.mouse = { x: 0, y: 0 };
      this.targetMouse = { x: 0, y: 0 };
      this.animationId = null;

      this.init();
    }

    init() {
      this.setupEventListeners();
      this.animate();
    }

    setupEventListeners() {
      window.addEventListener('mousemove', (e) => {
        // Normalize mouse position from -1 to 1
        this.targetMouse.x = (e.clientX / window.innerWidth) * 2 - 1;
        this.targetMouse.y = (e.clientY / window.innerHeight) * 2 - 1;
      });
    }

    animate() {
      // Smooth mouse following
      this.mouse.x = utils.lerp(this.mouse.x, this.targetMouse.x, 0.05);
      this.mouse.y = utils.lerp(this.mouse.y, this.targetMouse.y, 0.05);

      // Apply parallax to each element
      this.elements.forEach(element => {
        const speed = parseFloat(element.dataset.speed) || 0.05;
        const x = this.mouse.x * speed * 100;
        const y = this.mouse.y * speed * 100;

        element.style.transform = `translate(${x}px, ${y}px)`;
      });

      this.animationId = requestAnimationFrame(() => this.animate());
    }

    destroy() {
      if (this.animationId) {
        cancelAnimationFrame(this.animationId);
      }
    }
  }

  // ============================================
  // SCROLL ANIMATIONS
  // ============================================

  class ScrollAnimations {
    constructor() {
      this.elements = document.querySelectorAll('.animate-on-scroll');
      this.observers = [];

      this.init();
    }

    init() {
      // Check for reduced motion preference
      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      if (prefersReducedMotion) {
        this.elements.forEach(el => el.classList.add('animate-visible'));
        return;
      }

      this.setupObserver();
    }

    setupObserver() {
      const options = {
        threshold: CONFIG.scroll.threshold,
        rootMargin: CONFIG.scroll.rootMargin
      };

      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-visible');
            observer.unobserve(entry.target);
          }
        });
      }, options);

      this.elements.forEach(element => {
        observer.observe(element);
        this.observers.push(observer);
      });
    }

    destroy() {
      this.observers.forEach(observer => observer.disconnect());
    }
  }

  // ============================================
  // MOBILE NAVIGATION
  // ============================================

  class MobileNavigation {
    constructor() {
      this.nav = document.querySelector('.nav');
      this.toggle = document.querySelector('.nav-toggle');
      this.menu = document.querySelector('.nav-menu');
      this.isOpen = false;

      this.init();
    }

    init() {
      if (!this.toggle || !this.menu) return;

      this.setupEventListeners();
    }

    setupEventListeners() {
      this.toggle.addEventListener('click', () => this.toggleMenu());

      // Close menu on link click
      const links = this.menu.querySelectorAll('.nav-link');
      links.forEach(link => {
        link.addEventListener('click', () => this.closeMenu());
      });

      // Close menu on outside click
      document.addEventListener('click', (e) => {
        if (this.isOpen && !this.nav.contains(e.target)) {
          this.closeMenu();
        }
      });

      // Close menu on escape key
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && this.isOpen) {
          this.closeMenu();
        }
      });
    }

    toggleMenu() {
      this.isOpen ? this.closeMenu() : this.openMenu();
    }

    openMenu() {
      this.isOpen = true;
      this.menu.classList.add('nav-menu-open');
      this.toggle.classList.add('nav-toggle-active');
      document.body.style.overflow = 'hidden';
    }

    closeMenu() {
      this.isOpen = false;
      this.menu.classList.remove('nav-menu-open');
      this.toggle.classList.remove('nav-toggle-active');
      document.body.style.overflow = '';
    }
  }

  // ============================================
  // RIPPLE EFFECT
  // ============================================

  class RippleEffect {
    constructor(buttons) {
      this.buttons = buttons;
      this.init();
    }

    init() {
      this.buttons.forEach(button => {
        button.addEventListener('click', (e) => this.createRipple(e, button));
      });
    }

    createRipple(event, button) {
      const ripple = document.createElement('span');
      const rect = button.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height);
      const x = event.clientX - rect.left - size / 2;
      const y = event.clientY - rect.top - size / 2;

      ripple.style.width = ripple.style.height = `${size}px`;
      ripple.style.left = `${x}px`;
      ripple.style.top = `${y}px`;
      ripple.classList.add('ripple');

      // Remove existing ripples
      const existingRipple = button.querySelector('.ripple');
      if (existingRipple) {
        existingRipple.remove();
      }

      button.appendChild(ripple);

      // Remove ripple after animation
      setTimeout(() => ripple.remove(), 600);
    }
  }

  // ============================================
  // INITIALIZATION
  // ============================================

  let particleSystem = null;
  let parallaxEffect = null;
  let scrollAnimations = null;
  let mobileNavigation = null;
  let rippleEffect = null;

  function init() {
    // Wait for DOM
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', init);
      return;
    }

    // Initialize particle system
    const canvas = document.getElementById('bg-canvas');
    if (canvas) {
      particleSystem = new ParticleSystem(canvas);
    }

    // Initialize stats counters
    const statValues = document.querySelectorAll('.stat-value[data-count]');
    statValues.forEach(stat => {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const counter = new StatsCounter(entry.target);
            observer.unobserve(entry.target);
          }
        });
      }, { threshold: 0.5 });

      observer.observe(stat);
    });

    // Initialize parallax effect
    const floatingShapes = document.querySelectorAll('.shape[data-speed]');
    if (floatingShapes.length > 0 && window.matchMedia('(min-width: 768px)').matches) {
      parallaxEffect = new ParallaxEffect(floatingShapes);
    }

    // Initialize scroll animations
    scrollAnimations = new ScrollAnimations();

    // Initialize mobile navigation
    mobileNavigation = new MobileNavigation();

    // Initialize ripple effect
    const rippleButtons = document.querySelectorAll('.ripple-container');
    if (rippleButtons.length > 0) {
      rippleEffect = new RippleEffect(rippleButtons);
    }

    // Add hardware acceleration hints
    const animatedElements = document.querySelectorAll('.animate-hardware');
    animatedElements.forEach(el => {
      el.style.transform = 'translateZ(0)';
      el.style.willChange = 'transform, opacity';
    });

    console.log('[Enhanced] All features initialized');
  }

  // Cleanup on page unload
  window.addEventListener('beforeunload', () => {
    if (particleSystem) particleSystem.destroy();
    if (parallaxEffect) parallaxEffect.destroy();
    if (scrollAnimations) scrollAnimations.destroy();
  });

  // Initialize
  init();

})();
