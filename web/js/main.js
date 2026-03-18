/**
 * Constraint Theory - Main JavaScript
 * Version: 1.0
 * Date: 2026-03-18
 */

// ============================================
// UTILITY FUNCTIONS
// ============================================

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => document.querySelectorAll(selector);

// Debounce function for performance
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

// Throttle function for scroll events
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

// ============================================
// NAVIGATION
// ============================================

class Navigation {
  constructor() {
    this.nav = $('.nav');
    this.navToggle = $('.nav-toggle');
    this.navMenu = $('.nav-menu');
    this.navLinks = $$('.nav-link');
    this.init();
  }

  init() {
    if (this.navToggle) {
      this.navToggle.addEventListener('click', () => this.toggleMenu());
    }

    // Close menu when clicking on a link
    this.navLinks.forEach(link => {
      link.addEventListener('click', () => this.closeMenu());
    });

    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
      if (!this.nav.contains(e.target)) {
        this.closeMenu();
      }
    });

    // Active link highlighting
    this.highlightActiveLink();

    // Scroll effect
    this.handleScroll();
    window.addEventListener('scroll', throttle(() => this.handleScroll(), 100));
  }

  toggleMenu() {
    this.navMenu.classList.toggle('open');
  }

  closeMenu() {
    this.navMenu.classList.remove('open');
  }

  highlightActiveLink() {
    const currentPath = window.location.pathname;
    this.navLinks.forEach(link => {
      if (link.getAttribute('href') === currentPath) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });
  }

  handleScroll() {
    if (window.scrollY > 50) {
      this.nav.classList.add('scrolled');
    } else {
      this.nav.classList.remove('scrolled');
    }
  }
}

// ============================================
// AGENT SIMULATION
// ============================================

class AgentSimulation {
  constructor(canvas, connectionCanvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.connectionCanvas = connectionCanvas;
    this.connectionCtx = connectionCanvas?.getContext('2d');
    this.agents = [];
    this.maxAgents = 1000;
    this.queryRadius = 0.2;
    this.selectedAgent = null;
    this.queryResults = [];
    this.connectionDistance = 100;

    this.metrics = {
      agentCount: 0,
      queryTime: 0,
      memoryUsage: 0
    };

    this.init();
  }

  init() {
    this.resize();
    window.addEventListener('resize', debounce(() => this.resize(), 100));

    // Add initial agents
    for (let i = 0; i < 50; i++) {
      this.addAgent();
    }

    // Event listeners
    this.canvas.addEventListener('click', (e) => this.handleClick(e));
    this.canvas.addEventListener('contextmenu', (e) => this.handleRightClick(e));

    // Start animation loop
    this.animate();
  }

  resize() {
    const rect = this.canvas.parentElement.getBoundingClientRect();
    this.canvas.width = rect.width;
    this.canvas.height = rect.height;

    if (this.connectionCanvas) {
      this.connectionCanvas.width = rect.width;
      this.connectionCanvas.height = rect.height;
    }

    this.draw();
  }

  addAgent(x, y) {
    if (this.agents.length >= this.maxAgents) return;

    const agent = {
      x: x ?? Math.random(),
      y: y ?? Math.random(),
      id: this.agents.length + 1,
      vx: (Math.random() - 0.5) * 0.001,
      vy: (Math.random() - 0.5) * 0.001,
      pulse: Math.random() * Math.PI * 2
    };

    this.agents.push(agent);
    this.metrics.agentCount = this.agents.length;
    this.updateMetrics();
  }

  handleClick(e) {
    const rect = this.canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) / this.canvas.width;
    const y = (e.clientY - rect.top) / this.canvas.height;

    this.addAgent(x, y);

    // Add particle effect
    this.addParticles(x * this.canvas.width, y * this.canvas.height);

    this.draw();
  }

  addParticles(x, y) {
    // Create burst particles
    const particles = [];
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2;
      particles.push({
        x: x,
        y: y,
        vx: Math.cos(angle) * 2,
        vy: Math.sin(angle) * 2,
        life: 1
      });
    }

    // Animate particles
    const animateParticles = () => {
      let alive = false;

      particles.forEach(p => {
        if (p.life > 0) {
          alive = true;
          p.x += p.vx;
          p.y += p.vy;
          p.life -= 0.02;

          this.ctx.fillStyle = `oklch(0.72 0.19 145 / ${p.life})`;
          this.ctx.beginPath();
          this.ctx.arc(p.x, p.y, 2, 0, Math.PI * 2);
          this.ctx.fill();
        }
      });

      if (alive) {
        requestAnimationFrame(animateParticles);
      }
    };

    animateParticles();
  }

  handleRightClick(e) {
    e.preventDefault();

    const rect = this.canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) / this.canvas.width;
    const y = (e.clientY - rect.top) / this.canvas.height;

    // Find nearest agent
    let nearest = null;
    let minDist = Infinity;

    this.agents.forEach(agent => {
      const dx = agent.x - x;
      const dy = agent.y - y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < minDist) {
        minDist = dist;
        nearest = agent;
      }
    });

    if (nearest && minDist < 0.1) {
      this.selectedAgent = nearest;
      this.queryNeighbors(nearest);
      this.draw();
    }
  }

  queryNeighbors(agent) {
    const startTime = performance.now();

    this.queryResults = this.agents.filter(a => {
      if (a.id === agent.id) return false;

      const dx = a.x - agent.x;
      const dy = a.y - agent.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      return dist <= this.queryRadius;
    });

    const endTime = performance.now();
    this.metrics.queryTime = (endTime - startTime).toFixed(2);

    // Estimate memory usage
    this.metrics.memoryUsage = (
      (this.agents.length * 24) / 1024
    ).toFixed(2);

    this.updateMetrics();
  }

  updateMetrics() {
    const agentCountEl = document.querySelector('[data-metric="agent-count"]');
    const queryTimeEl = document.querySelector('[data-metric="query-time"]');
    const memoryUsageEl = document.querySelector('[data-metric="memory-usage"]');

    if (agentCountEl) agentCountEl.textContent = this.metrics.agentCount;
    if (queryTimeEl) queryTimeEl.textContent = `${this.metrics.queryTime}ms`;
    if (memoryUsageEl) memoryUsageEl.textContent = `${this.metrics.memoryUsage}MB`;
  }

  drawConnections() {
    if (!this.connectionCtx) return;

    const ctx = this.connectionCtx;
    const { width, height } = this.connectionCanvas;

    ctx.clearRect(0, 0, width, height);

    // Draw connections between nearby agents
    ctx.strokeStyle = 'oklch(0.72 0.19 145 / 0.2)';
    ctx.lineWidth = 1;

    for (let i = 0; i < this.agents.length; i++) {
      for (let j = i + 1; j < this.agents.length; j++) {
        const a = this.agents[i];
        const b = this.agents[j];

        const dx = (a.x - b.x) * width;
        const dy = (a.y - b.y) * height;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < this.connectionDistance) {
          ctx.globalAlpha = 1 - (dist / this.connectionDistance);
          ctx.beginPath();
          ctx.moveTo(a.x * width, a.y * height);
          ctx.lineTo(b.x * width, b.y * height);
          ctx.stroke();
        }
      }
    }

    ctx.globalAlpha = 1;
  }

  updateAgents() {
    this.agents.forEach(agent => {
      // Update position with slow drift
      agent.x += agent.vx;
      agent.y += agent.vy;

      // Bounce off edges
      if (agent.x < 0 || agent.x > 1) agent.vx *= -1;
      if (agent.y < 0 || agent.y > 1) agent.vy *= -1;

      // Clamp to bounds
      agent.x = Math.max(0, Math.min(1, agent.x));
      agent.y = Math.max(0, Math.min(1, agent.y));

      // Update pulse
      agent.pulse += 0.05;
    });
  }

  draw() {
    const { width, height } = this.canvas;
    const ctx = this.ctx;

    // Clear canvas
    ctx.fillStyle = 'oklch(0.10 0.01 145)';
    ctx.fillRect(0, 0, width, height);

    // Draw grid
    ctx.strokeStyle = 'oklch(0.25 0.02 145)';
    ctx.lineWidth = 0.5;
    const gridSize = 50;

    for (let x = 0; x < width; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }

    for (let y = 0; y < height; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    // Update agent positions
    this.updateAgents();

    // Draw connections
    this.drawConnections();

    // Draw agents
    this.agents.forEach(agent => {
      const x = agent.x * width;
      const y = agent.y * height;
      const pulseSize = 4 + Math.sin(agent.pulse) * 1;

      // Draw glow
      if (agent.id === this.selectedAgent?.id || this.queryResults.includes(agent)) {
        ctx.shadowColor = agent.id === this.selectedAgent?.id
          ? 'oklch(0.72 0.19 145)'
          : 'oklch(0.65 0.18 230)';
        ctx.shadowBlur = 15;
      }

      ctx.beginPath();
      ctx.arc(x, y, pulseSize, 0, Math.PI * 2);

      if (agent.id === this.selectedAgent?.id) {
        ctx.fillStyle = 'oklch(0.72 0.19 145)';
      } else if (this.queryResults.includes(agent)) {
        ctx.fillStyle = 'oklch(0.65 0.18 230)';
      } else {
        ctx.fillStyle = 'oklch(0.65 0.02 145)';
      }

      ctx.fill();
      ctx.shadowBlur = 0;
    });

    // Draw query radius
    if (this.selectedAgent) {
      const x = this.selectedAgent.x * width;
      const y = this.selectedAgent.y * height;
      const radius = this.queryRadius * Math.min(width, height);

      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.strokeStyle = 'oklch(0.72 0.19 145)';
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 5]);
      ctx.stroke();
      ctx.setLineDash([]);
    }
  }

  animate() {
    this.draw();
    requestAnimationFrame(() => this.animate());
  }

  reset() {
    this.agents = [];
    this.selectedAgent = null;
    this.queryResults = [];
    this.metrics = {
      agentCount: 0,
      queryTime: 0,
      memoryUsage: 0
    };
    this.updateMetrics();
    this.draw();
  }

  addMultipleAgents(count) {
    for (let i = 0; i < count; i++) {
      this.addAgent();
    }
    this.draw();
  }
}

// ============================================
// SCROLL ANIMATIONS
// ============================================

class ScrollAnimations {
  constructor() {
    this.elements = $$('.animate-on-scroll');
    this.init();
  }

  init() {
    // Check elements on load
    this.checkElements();

    // Check elements on scroll
    window.addEventListener('scroll', throttle(() => {
      this.checkElements();
    }, 100));

    // Check elements on resize
    window.addEventListener('resize', debounce(() => {
      this.checkElements();
    }, 100));
  }

  checkElements() {
    const triggerBottom = window.innerHeight * 0.8;

    this.elements.forEach(el => {
      const elTop = el.getBoundingClientRect().top;

      if (elTop < triggerBottom) {
        el.classList.add('is-visible');
      }
    });
  }
}

// ============================================
// CODE BLOCK COPY FUNCTIONALITY
// ============================================

class CodeBlockCopy {
  constructor() {
    this.copyButtons = $$('.code-copy-btn');
    this.init();
  }

  init() {
    this.copyButtons.forEach(btn => {
      btn.addEventListener('click', () => this.handleCopy(btn));
    });
  }

  async handleCopy(btn) {
    const codeBlock = btn.closest('.code-block');
    const code = codeBlock.querySelector('code').textContent;

    try {
      await navigator.clipboard.writeText(code);

      // Update button text
      const originalText = btn.textContent;
      btn.textContent = 'Copied!';
      btn.classList.add('copied');

      setTimeout(() => {
        btn.textContent = originalText;
        btn.classList.remove('copied');
      }, 2000);
    } catch (err) {
      console.error('Failed to copy code:', err);
    }
  }
}

// ============================================
// SMOOTH SCROLL
// ============================================

class SmoothScroll {
  constructor() {
    this.links = $$('a[href^="#"]');
    this.init();
  }

  init() {
    this.links.forEach(link => {
      link.addEventListener('click', (e) => this.handleClick(e));
    });
  }

  handleClick(e) {
    const href = e.currentTarget.getAttribute('href');

    if (href === '#') return;

    const target = $(href);

    if (target) {
      e.preventDefault();

      const offsetTop = target.offsetTop - 80; // Account for fixed header

      window.scrollTo({
        top: offsetTop,
        behavior: 'smooth'
      });
    }
  }
}

// ============================================
// INITIALIZATION
// ============================================

let navigation;
let agentSimulation;
let scrollAnimations;
let codeBlockCopy;
let smoothScroll;

document.addEventListener('DOMContentLoaded', () => {
  // Initialize components
  navigation = new Navigation();

  // Initialize agent simulation if canvas exists
  const canvas = $('#agent-canvas');
  const connectionCanvas = $('#connection-canvas');
  if (canvas) {
    agentSimulation = new AgentSimulation(canvas, connectionCanvas);

    // Setup demo controls
    const addAgentBtn = $('#add-agent-btn');
    const add10AgentsBtn = $('#add-10-agents-btn');
    const add100AgentsBtn = $('#add-100-agents-btn');
    const resetBtn = $('#reset-btn');

    if (addAgentBtn) {
      addAgentBtn.addEventListener('click', () => agentSimulation.addAgent());
    }

    if (add10AgentsBtn) {
      add10AgentsBtn.addEventListener('click', () => agentSimulation.addMultipleAgents(10));
    }

    if (add100AgentsBtn) {
      add100AgentsBtn.addEventListener('click', () => agentSimulation.addMultipleAgents(100));
    }

    if (resetBtn) {
      resetBtn.addEventListener('click', () => agentSimulation.reset());
    }
  }

  // Initialize scroll animations
  scrollAnimations = new ScrollAnimations();

  // Initialize code block copy
  codeBlockCopy = new CodeBlockCopy();

  // Initialize smooth scroll
  smoothScroll = new SmoothScroll();

  // Add animate-on-scroll class to elements
  const animatedElements = $$('.card, .comparison-card, .technical-step');
  animatedElements.forEach(el => {
    el.classList.add('animate-on-scroll');
    el.style.opacity = '0';
    el.style.transform = 'translateY(20px)';
    el.style.transition = 'opacity 0.6s ease-out, transform 0.6s ease-out';
  });
});

// Add CSS for scroll animations
const style = document.createElement('style');
style.textContent = `
  .animate-on-scroll.is-visible {
    opacity: 1 !important;
    transform: translateY(0) !important;
  }
`;
document.head.appendChild(style);

// ============================================
// EXPORTS
// ============================================

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    Navigation,
    AgentSimulation,
    ScrollAnimations,
    CodeBlockCopy,
    SmoothScroll
  };
}
