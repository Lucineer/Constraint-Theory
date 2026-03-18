# Constraint Theory - Design System

**Version:** 1.0
**Date:** 2026-03-18
**Inspired By:** Lucineer Design System
**Adapted For:** Constraint Theory (Academic/Technical Audience)

---

## Design Philosophy

**Core Principle:** "Mild Cyberpunk meets Academic Rigor"

Balance the sophisticated, tech-forward aesthetic of cyberpunk with the credibility and precision required for academic and technical audiences. Think "hacker-chic meets research publication."

**Key Attributes:**
- **Technical:** Monospace fonts, code-like aesthetics, terminal-inspired layouts
- **Precise:** Grid-based alignment, mathematical notation, clear hierarchy
- **Sophisticated:** Dark themes with high-contrast accents, subtle animations
- **Credible:** Professional typography, academic formatting, rigorous documentation

---

## Color System

### Color Space: OKLCH

We use OKLCH (OkLab Lightness, Chroma, Hue) for perceptually uniform colors that scale consistently across different displays and lighting conditions.

**Format:** `oklch(lightness chroma hue)`
- Lightness: 0-1 (0=black, 1=white)
- Chroma: 0-0.4 (0=gray, 0.4=vivid)
- Hue: 0-360 (degrees around color wheel)

### Primary Palette

```css
/* Foundation - Dark Backgrounds */
--background: oklch(0.08 0.01 145);        /* #1a1d1e - Nearly black with slight green tint */
--foreground: oklch(0.98 0.005 145);       /* #f7f8f8 - Off-white */
--card: oklch(0.12 0.01 145);              /* #242829 - Slightly lighter than background */
--card-foreground: oklch(0.98 0.005 145);  /* #f7f8f8 - Off-white */

/* Primary Accent - Teal/Green */
--primary: oklch(0.72 0.19 145);           /* #00d4aa - Bright teal-green */
--primary-foreground: oklch(0.08 0.01 145);/* #1a1d1e - Dark background */

/* Secondary - Muted Green */
--secondary: oklch(0.18 0.02 145);         /* #354040 - Muted teal */
--secondary-foreground: oklch(0.98 0.005 145); /* #f7f8f8 - Off-white */

/* Accent Colors - Semantic */
--accent-blue: oklch(0.65 0.18 230);       /* #4a90e2 - Blue */
--accent-amber: oklch(0.75 0.18 60);       /* #f5a623 - Amber/Gold */
--accent-purple: oklch(0.68 0.18 280);     /* #9b59b6 - Purple */
--accent-red: oklch(0.55 0.22 27);         /* #e74c3c - Red */

/* Muted - Subtle Backgrounds */
--muted: oklch(0.18 0.01 145);            /* #333a3a - Dark gray-green */
--muted-foreground: oklch(0.65 0.02 145);  /* #8b9e9e - Medium gray-green */

/* Borders & Inputs */
--border: oklch(0.25 0.02 145);            /* #404a4a - Subtle border */
--input: oklch(0.20 0.02 145);            /* #3a4444 - Input background */

/* Interactive States */
--ring: oklch(0.72 0.19 145);              /* #00d4aa - Focus ring (same as primary) */
--selection: oklch(0.72 0.19 145 / 0.3);  /* #00d4aa with 30% opacity */
```

### Semantic Color Usage

| Color | Purpose | Example |
|-------|---------|---------|
| **Primary** | CTAs, links, important elements | Get Started button, navigation links |
| **Secondary** | Secondary actions, tags | Cancel button, category labels |
| **Blue** | Information, data, research | Performance metrics, data points |
| **Amber** | Warnings, highlights | Important notes, featured content |
| **Purple** | Advanced features, research | Academic papers, advanced topics |
| **Red** | Errors, destructive actions | Error messages, delete buttons |
| **Muted** | Disabled states, subtle UI | Disabled buttons, placeholder text |

### Gradient Definitions

```css
/* Hero Gradient - Multi-layer radial gradients */
.hero-gradient {
  background:
    radial-gradient(ellipse at 30% 20%, oklch(0.72 0.19 145 / 0.15) 0%, transparent 50%),
    radial-gradient(ellipse at 70% 60%, oklch(0.65 0.15 180 / 0.1) 0%, transparent 50%),
    radial-gradient(ellipse at 50% 100%, oklch(0.68 0.18 280 / 0.08) 0%, transparent 50%);
}

/* Text Gradient - For headings */
.gradient-text {
  background: linear-gradient(135deg,
    oklch(0.72 0.19 145) 0%,
    oklch(0.80 0.15 160) 50%,
    oklch(0.85 0.12 175) 100%
  );
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

/* Card Hover - Subtle gradient */
.card-hover-gradient {
  background: linear-gradient(135deg,
    oklch(0.12 0.01 145) 0%,
    oklch(0.15 0.01 145) 100%
  );
}
```

### Glow Effects

```css
/* Primary Glow - Teal */
.glow-primary {
  box-shadow:
    0 0 30px oklch(0.72 0.19 145 / 0.4),
    0 0 60px oklch(0.72 0.19 145 / 0.15);
}

/* Blue Glow - For data elements */
.glow-blue {
  box-shadow:
    0 0 30px oklch(0.65 0.18 230 / 0.4),
    0 0 60px oklch(0.65 0.18 230 / 0.15);
}

/* Amber Glow - For highlights */
.glow-amber {
  box-shadow:
    0 0 30px oklch(0.75 0.18 60 / 0.4),
    0 0 60px oklch(0.75 0.18 60 / 0.15);
}

/* Purple Glow - For research/advanced */
.glow-purple {
  box-shadow:
    0 0 30px oklch(0.68 0.18 280 / 0.4),
    0 0 60px oklch(0.68 0.18 280 / 0.15);
}
```

---

## Typography System

### Font Families

```css
/* Primary Font - Geist Sans (Body Text) */
--font-sans: 'Geist', var(--font-geist-sans), system-ui, -apple-system, sans-serif;

/* Monospace Font - Geist Mono (Code/Technical) */
--font-mono: 'Geist Mono', var(--font-geist-mono), ui-monospace, 'SF Mono', Menlo, monospace;

/* Fallback Fonts */
--font-heading: 'Geist', system-ui, -apple-system, sans-serif;
--font-body: 'Geist', system-ui, -apple-system, sans-serif;
--font-code: 'Geist Mono', ui-monospace, 'SF Mono', Menlo, 'Courier New', monospace;
```

**Alternative (if Geist unavailable):**
- Sans: Inter, system-ui
- Mono: JetBrains Mono, Fira Code, SF Mono

### Type Scale

```css
/* Display - Hero/Headings */
--text-display-2xl: 4.5rem;     /* 72px - Main hero title */
--text-display-xl: 3.75rem;     /* 60px - Section titles */
--text-display-lg: 3rem;        /* 48px - Large headings */

/* Headings */
--text-heading-3xl: 2.25rem;    /* 36px - Page headings */
--text-heading-2xl: 1.875rem;   /* 30px - Section headings */
--text-heading-xl: 1.5rem;      /* 24px - Subsection headings */
--text-heading-lg: 1.25rem;     /* 20px - Card titles */
--text-heading-md: 1.125rem;    /* 18px - Small headings */
--text-heading-sm: 1rem;        /* 16px - Minimal headings */

/* Body */
--text-body-lg: 1.125rem;       /* 18px - Large body text */
--text-body-md: 1rem;           /* 16px - Default body text */
--text-body-sm: 0.875rem;       /* 14px - Small body text */
--text-body-xs: 0.75rem;        /* 12px - Caption text */

/* Monospace (Code/Math) */
--text-code-lg: 1rem;           /* 16px - Large code blocks */
--text-code-md: 0.875rem;       /* 14px - Default code */
--text-code-sm: 0.75rem;        /* 12px - Small code/inline */
--text-code-xs: 0.625rem;       /* 10px - Tiny code */
```

### Font Weights

```css
--font-weight-thin: 100;        /* Thin - Rarely used */
--font-weight-extralight: 200;  /* Extra Light - Rarely used */
--font-weight-light: 300;       /* Light - Subtle text */
--font-weight-normal: 400;      /* Normal - Body text */
--font-weight-medium: 500;      /* Medium - Emphasized body */
--font-weight-semibold: 600;    /* Semibold - Headings, buttons */
--font-weight-bold: 700;        /* Bold - Strong emphasis */
--font-weight-extrabold: 800;   /* Extra Bold - Rarely used */
--font-weight-black: 900;       /* Black - Display text */
```

### Line Heights

```css
--leading-tight: 1.25;          /* Tight - Headings */
--leading-snug: 1.375;          /* Snug - Subheadings */
--leading-normal: 1.5;          /* Normal - Body text */
--leading-relaxed: 1.625;       /* Relaxed - Long-form content */
--leading-loose: 2;             /* Loose - Special cases */
```

### Letter Spacing

```css
--tracking-tighter: -0.05em;    /* Tighter - Display text */
--tracking-tight: -0.025em;     /* Tight - Headings */
--tracking-normal: 0;           /* Normal - Body text */
--tracking-wide: 0.025em;       /* Wide - Small text, uppercase */
--tracking-wider: 0.05em;       /* Wider - Labels, buttons */
--tracking-widest: 0.1em;       /* Widest - Special cases */
```

### Typography Usage Guidelines

| Element | Size | Weight | Line Height | Letter Spacing | Font Family |
|---------|------|--------|-------------|----------------|-------------|
| **Hero Title** | 4.5rem | 700 | 1.25 | -0.02em | Sans |
| **Section Title** | 3rem | 600 | 1.25 | -0.01em | Sans |
| **Card Title** | 1.25rem | 600 | 1.375 | 0 | Sans |
| **Body Text** | 1rem | 400 | 1.5 | 0 | Sans |
| **Caption** | 0.875rem | 400 | 1.5 | 0 | Sans |
| **Code Block** | 0.875rem | 400 | 1.6 | 0 | Mono |
| **Inline Code** | 0.875em | 400 | 1.5 | 0 | Mono |
| **Button** | 0.875rem | 600 | 1.5 | 0.025em | Sans |

---

## Spacing System

### Spacing Scale (8pt Grid)

```css
--spacing-0: 0;
--spacing-px: 1px;
--spacing-0_5: 0.125rem;   /* 2px */
--spacing-1: 0.25rem;      /* 4px */
--spacing-1_5: 0.375rem;   /* 6px */
--spacing-2: 0.5rem;       /* 8px */
--spacing-2_5: 0.625rem;   /* 10px */
--spacing-3: 0.75rem;      /* 12px */
--spacing-3_5: 0.875rem;   /* 14px */
--spacing-4: 1rem;         /* 16px */
--spacing-5: 1.25rem;      /* 20px */
--spacing-6: 1.5rem;       /* 24px */
--spacing-7: 1.75rem;      /* 28px */
--spacing-8: 2rem;         /* 32px */
--spacing-9: 2.25rem;      /* 36px */
--spacing-10: 2.5rem;      /* 40px */
--spacing-11: 2.75rem;     /* 44px */
--spacing-12: 3rem;        /* 48px */
--spacing-14: 3.5rem;      /* 56px */
--spacing-16: 4rem;        /* 64px */
--spacing-20: 5rem;        /* 80px */
--spacing-24: 6rem;        /* 96px */
--spacing-32: 8rem;        /* 128px */
--spacing-40: 10rem;       /* 160px */
--spacing-48: 12rem;       /* 192px */
--spacing-56: 14rem;       /* 224px */
--spacing-64: 16rem;       /* 256px */
```

### Component Spacing

```css
/* Section Padding */
--section-padding-vertical: var(--spacing-20);   /* 80px */
--section-padding-horizontal: var(--spacing-6);  /* 24px */

/* Container Padding */
--container-padding: var(--spacing-6);           /* 24px */

/* Card Padding */
--card-padding: var(--spacing-6);                /* 24px */
--card-padding-sm: var(--spacing-4);             /* 16px */
--card-padding-lg: var(--spacing-8);             /* 32px */

/* Button Padding */
--button-padding: var(--spacing-2) var(--spacing-4);  /* 8px 16px */
--button-padding-sm: var(--spacing-1_5) var(--spacing-3);  /* 6px 12px */
--button-padding-lg: var(--spacing-3) var(--spacing-6);  /* 12px 24px */

/* Input Padding */
--input-padding: var(--spacing-2) var(--spacing-3);  /* 8px 12px */
```

---

## Layout System

### Container Widths

```css
/* Container Max Widths */
--container-sm: 640px;      /* Small containers */
--container-md: 768px;      /* Medium containers */
--container-lg: 1024px;     /* Large containers */
--container-xl: 1280px;     /* Extra large containers */
--container-2xl: 1536px;    /* 2X large containers */
```

### Grid System

```css
/* Grid Columns */
--grid-cols-1: 1;
--grid-cols-2: 2;
--grid-cols-3: 3;
--grid-cols-4: 4;
--grid-cols-6: 6;
--grid-cols-12: 12;

/* Grid Gaps */
--gap-sm: var(--spacing-4);     /* 16px */
--gap-md: var(--spacing-6);     /* 24px */
--gap-lg: var(--spacing-8);     /* 32px */
--gap-xl: var(--spacing-12);    /* 48px */
```

### Responsive Breakpoints

```css
/* Breakpoints */
--breakpoint-sm: 640px;     /* Small tablets */
--breakpoint-md: 768px;     /* Tablets */
--breakpoint-lg: 1024px;    /* Laptops */
--breakpoint-xl: 1280px;    /* Desktops */
--breakpoint-2xl: 1536px;   /* Large screens */
```

---

## Border Radius

```css
--radius-none: 0;
--radius-sm: 0.25rem;       /* 4px - Small elements */
--radius-md: 0.375rem;      /* 6px - Buttons, inputs */
--radius-lg: 0.5rem;        /* 8px - Cards */
--radius-xl: 0.75rem;       /* 12px - Large cards */
--radius-2xl: 1rem;         /* 16px - Special cases */
--radius-3xl: 1.5rem;       /* 24px - Hero elements */
--radius-full: 9999px;      /* Pill buttons, badges */
```

### Usage

| Element | Border Radius |
|---------|---------------|
| **Buttons** | 0.375rem (6px) |
| **Inputs** | 0.375rem (6px) |
| **Cards** | 0.75rem (12px) |
| **Code Blocks** | 0.75rem (12px) |
| **Tooltips** | 0.5rem (8px) |
| **Pill Badges** | 9999px (full) |

---

## Shadows

```css
/* Shadow Elevations */
--shadow-xs: 0 1px 2px 0 rgb(0 0 0 / 0.05);
--shadow-sm: 0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1);
--shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
--shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
--shadow-xl: 0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1);
--shadow-2xl: 0 25px 50px -12px rgb(0 0 0 / 0.25);

/* Colored Shadows (Glow Effects) */
--shadow-glow-primary: 0 0 30px oklch(0.72 0.19 145 / 0.4);
--shadow-glow-blue: 0 0 30px oklch(0.65 0.18 230 / 0.4);
--shadow-glow-amber: 0 0 30px oklch(0.75 0.18 60 / 0.4);
--shadow-glow-purple: 0 0 30px oklch(0.68 0.18 280 / 0.4);

/* Inner Shadow */
--shadow-inner: inset 0 2px 4px 0 rgb(0 0 0 / 0.05);
```

---

## Animation System

### Timing Functions

```css
--ease-linear: linear;
--ease-in: cubic-bezier(0.4, 0, 1, 1);
--ease-out: cubic-bezier(0, 0, 0.2, 1);
--ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);

/* Custom Easing */
--ease-smooth: cubic-bezier(0.4, 0, 0.2, 1);
--ease-bounce: cubic-bezier(0.68, -0.55, 0.265, 1.55);
```

### Durations

```css
--duration-fast: 150ms;       /* Quick transitions */
--duration-base: 200ms;       /* Default transitions */
--duration-normal: 300ms;     /* Normal animations */
--duration-slow: 500ms;       /* Slow animations */
--duration-slower: 1000ms;    /* Very slow animations */
```

### Key Animations

```css
/* Fade In Up */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Fade In */
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

/* Slide In */
@keyframes slideIn {
  from {
    transform: translateX(-100%);
  }
  to {
    transform: translateX(0);
  }
}

/* Pulse Glow */
@keyframes pulseGlow {
  0%, 100% {
    box-shadow: 0 0 20px oklch(0.72 0.19 145 / 0.3);
  }
  50% {
    box-shadow: 0 0 40px oklch(0.72 0.19 145 / 0.5);
  }
}

/* Float */
@keyframes float {
  0%, 100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-20px);
  }
}

/* Shimmer (Loading) */
@keyframes shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

/* Gradient Shift */
@keyframes gradientShift {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}
```

### Animation Classes

```css
/* Entrance Animations */
.animate-fade-in-up {
  animation: fadeInUp var(--duration-normal) var(--ease-out);
}

.animate-fade-in {
  animation: fadeIn var(--duration-normal) var(--ease-out);
}

/* Continuous Animations */
.animate-pulse-glow {
  animation: pulseGlow 2s ease-in-out infinite;
}

.animate-float {
  animation: float 6s ease-in-out infinite;
}

/* Hover Effects */
.hover-lift {
  transition: transform var(--duration-normal) var(--ease-smooth);
}

.hover-lift:hover {
  transform: translateY(-8px);
}

.hover-glow:hover {
  box-shadow: var(--shadow-glow-primary);
}
```

---

## Component Specifications

### Button

```css
/* Base Button Styles */
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-2);
  padding: var(--button-padding);
  font-size: var(--text-body-sm);
  font-weight: var(--font-weight-semibold);
  border-radius: var(--radius-md);
  transition: all var(--duration-base) var(--ease-smooth);
  cursor: pointer;
  border: none;
  outline: none;
}

/* Button Variants */
.btn-primary {
  background: linear-gradient(135deg,
    oklch(0.72 0.19 145) 0%,
    oklch(0.65 0.22 145) 100%
  );
  color: oklch(0.08 0.01 145);
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 30px oklch(0.72 0.19 145 / 0.4);
}

.btn-secondary {
  background: transparent;
  color: oklch(0.72 0.19 145);
  border: 2px solid oklch(0.72 0.19 145);
}

.btn-secondary:hover {
  background: oklch(0.72 0.19 145 / 0.1);
  transform: translateY(-2px);
}

.btn-ghost {
  background: transparent;
  color: oklch(0.72 0.19 145);
}

.btn-ghost:hover {
  background: oklch(0.72 0.19 145 / 0.1);
}

/* Button Sizes */
.btn-sm {
  padding: var(--button-padding-sm);
  font-size: var(--text-body-xs);
}

.btn-lg {
  padding: var(--button-padding-lg);
  font-size: var(--text-body-md);
}
```

### Card

```css
/* Base Card */
.card {
  background: oklch(0.12 0.01 145);
  border: 1px solid oklch(0.25 0.02 145);
  border-radius: var(--radius-xl);
  padding: var(--card-padding);
  transition: all var(--duration-normal) var(--ease-smooth);
}

/* Card Hover */
.card:hover {
  transform: translateY(-8px);
  box-shadow:
    0 20px 40px oklch(0 0 0 / 0.3),
    0 0 60px oklch(0.72 0.19 145 / 0.1);
  border-color: oklch(0.72 0.19 145 / 0.5);
}

/* Card Header */
.card-header {
  padding: var(--spacing-4) var(--spacing-6);
  border-bottom: 1px solid oklch(0.25 0.02 145);
}

.card-title {
  font-size: var(--text-heading-lg);
  font-weight: var(--font-weight-semibold);
  color: oklch(0.98 0.005 145);
}

.card-description {
  font-size: var(--text-body-sm);
  color: oklch(0.65 0.02 145);
  margin-top: var(--spacing-2);
}

/* Card Content */
.card-content {
  padding: var(--spacing-6);
}

/* Card Footer */
.card-footer {
  padding: var(--spacing-4) var(--spacing-6);
  border-top: 1px solid oklch(0.25 0.02 145);
}
```

### Code Block

```css
/* Code Block Container */
.code-block {
  font-family: var(--font-mono);
  background: linear-gradient(135deg,
    oklch(0.12 0.01 145) 0%,
    oklch(0.15 0.01 145) 100%
  );
  border: 1px solid oklch(0.25 0.02 145);
  border-radius: var(--radius-xl);
  overflow: hidden;
}

/* Code Header */
.code-header {
  background: oklch(0.15 0.01 145);
  border-bottom: 1px solid oklch(0.25 0.02 145);
  padding: var(--spacing-3) var(--spacing-4);
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
}

/* Code Dots (Mac-style) */
.code-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
}

.code-dot-red {
  background: oklch(0.55 0.22 27);
}

.code-dot-yellow {
  background: oklch(0.50 0.18 85);
}

.code-dot-green {
  background: oklch(0.45 0.15 145);
}

/* Code Content */
.code-content {
  padding: var(--spacing-5);
  overflow-x: auto;
  font-size: var(--text-code-md);
  line-height: var(--leading-relaxed);
}

/* Inline Code */
code {
  font-family: var(--font-mono);
  font-size: var(--text-code-sm);
  background: oklch(0.15 0.01 145);
  border: 1px solid oklch(0.25 0.02 145);
  border-radius: var(--radius-sm);
  padding: 0.125em 0.375em;
}
```

### Navigation

```css
/* Navigation Bar */
.nav {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 50;
  background: oklch(0.08 0.01 145 / 0.95);
  backdrop-filter: blur(12px);
  border-bottom: 1px solid oklch(0.25 0.02 145);
}

/* Nav Container */
.nav-container {
  max-width: var(--container-xl);
  margin: 0 auto;
  padding: 0 var(--container-padding);
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

/* Nav Link */
.nav-link {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  padding: var(--spacing-2) var(--spacing-4);
  border-radius: var(--radius-md);
  font-size: var(--text-body-sm);
  font-weight: var(--font-weight-medium);
  color: oklch(0.65 0.02 145);
  transition: all var(--duration-base) var(--ease-smooth);
  text-decoration: none;
}

.nav-link:hover {
  color: oklch(0.98 0.005 145);
  background: oklch(0.18 0.01 145);
}

.nav-link.active {
  color: oklch(0.72 0.19 145);
  background: oklch(0.72 0.19 145 / 0.1);
}
```

### Table

```css
/* Table Container */
.table-container {
  width: 100%;
  overflow-x: auto;
  border-radius: var(--radius-xl);
  border: 1px solid oklch(0.25 0.02 145);
}

/* Table */
.comparison-table {
  width: 100%;
  border-collapse: collapse;
  font-size: var(--text-body-sm);
}

/* Table Header */
.comparison-table th {
  background: oklch(0.12 0.01 145);
  padding: var(--spacing-4);
  text-align: left;
  border-bottom: 2px solid oklch(0.25 0.02 145);
  font-weight: var(--font-weight-semibold);
  color: oklch(0.98 0.005 145);
}

/* Table Cell */
.comparison-table td {
  padding: var(--spacing-4);
  border-bottom: 1px solid oklch(0.20 0.01 145);
  color: oklch(0.98 0.005 145);
}

/* Table Row Hover */
.comparison-table tr:hover {
  background: oklch(0.72 0.19 145 / 0.05);
}
```

---

## Accessibility

### Focus States

```css
/* Focus Visible */
*:focus-visible {
  outline: 2px solid oklch(0.72 0.19 145);
  outline-offset: 2px;
}

/* Focus Ring */
.focus-ring:focus-visible {
  box-shadow:
    0 0 0 2px oklch(0.08 0.01 145),
    0 0 0 4px oklch(0.72 0.19 145);
}
```

### Color Contrast

All color combinations meet WCAG 2.1 AA standards:
- Normal text: 4.5:1 minimum contrast ratio
- Large text: 3:1 minimum contrast ratio
- UI components: 3:1 minimum contrast ratio

### Reduced Motion

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

---

## Responsive Design

### Mobile-First Approach

All components designed mobile-first, with breakpoints for larger screens:

```css
/* Base (Mobile) */
.component {
  /* Mobile styles */
}

/* Small Tablets */
@media (min-width: 640px) {
  .component {
    /* Small tablet styles */
  }
}

/* Tablets */
@media (min-width: 768px) {
  .component {
    /* Tablet styles */
  }
}

/* Laptops */
@media (min-width: 1024px) {
  .component {
    /* Laptop styles */
  }
}

/* Desktops */
@media (min-width: 1280px) {
  .component {
    /* Desktop styles */
  }
}
```

---

## Usage Examples

### Tailwind Configuration

```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        background: 'oklch(0.08 0.01 145)',
        foreground: 'oklch(0.98 0.005 145)',
        primary: {
          DEFAULT: 'oklch(0.72 0.19 145)',
          foreground: 'oklch(0.08 0.01 145)',
        },
        secondary: {
          DEFAULT: 'oklch(0.18 0.02 145)',
          foreground: 'oklch(0.98 0.005 145)',
        },
        // ... rest of colors
      },
      fontFamily: {
        sans: ['Geist', 'system-ui', 'sans-serif'],
        mono: ['Geist Mono', 'ui-monospace', 'monospace'],
      },
      spacing: {
        // ... spacing scale
      },
      borderRadius: {
        // ... border radius
      },
      animation: {
        'fade-in-up': 'fadeInUp 0.3s ease-out',
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
        'float': 'float 6s ease-in-out infinite',
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
    require('tailwindcss-animate'),
  ],
};
```

### CSS Variables Approach

```css
/* globals.css */
:root {
  /* Colors */
  --background: oklch(0.08 0.01 145);
  --foreground: oklch(0.98 0.005 145);
  --primary: oklch(0.72 0.19 145);
  --primary-foreground: oklch(0.08 0.01 145);

  /* Typography */
  --font-sans: 'Geist', system-ui, sans-serif;
  --font-mono: 'Geist Mono', ui-monospace, monospace;

  /* Spacing */
  --spacing-1: 0.25rem;
  --spacing-2: 0.5rem;
  --spacing-4: 1rem;
  --spacing-6: 1.5rem;
  --spacing-8: 2rem;

  /* Effects */
  --radius: 0.75rem;
  --shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
  --shadow-glow: 0 0 30px oklch(0.72 0.19 145 / 0.4);
}

body {
  background: var(--background);
  color: var(--foreground);
  font-family: var(--font-sans);
}
```

---

## Design Tokens Summary

### Complete Token Reference

| Category | Tokens | Purpose |
|----------|--------|---------|
| **Colors** | 20+ | Backgrounds, text, accents, semantic |
| **Typography** | 15+ | Sizes, weights, line heights, spacing |
| **Spacing** | 30+ | 8pt grid system, component padding |
| **Layout** | 10+ | Containers, grids, breakpoints |
| **Effects** | 15+ | Shadows, glows, animations, transitions |
| **Borders** | 8 | Radius values for different elements |

### Token Naming Convention

```css
--{category}-{concept}-{variant}-{size}

Examples:
--color-primary-500          /* Color - Primary - Medium shade */
--spacing-card-padding-lg    /* Spacing - Card padding - Large */
--text-heading-3xl           /* Text - Heading - Extra large 3 */
--radius-button              /* Radius - Button - Default */
--shadow-glow-primary        /* Shadow - Glow - Primary color */
```

---

## Design Principles Application

### 1. Technical Precision

**Implementation:**
- Monospace fonts for code/technical content
- Grid-based layouts for mathematical precision
- Clear visual hierarchy for complex information

### 2. Academic Credibility

**Implementation:**
- Professional typography (Geist)
- Subtle animations (not distracting)
- High contrast for readability
- Clean, uncluttered layouts

### 3. Cyberpunk Sophistication

**Implementation:**
- Dark theme with neon accents
- Subtle glow effects
- Terminal-inspired code blocks
- Gradient text for headings

### 4. User-Centric Design

**Implementation:**
- Progressive disclosure of complexity
- Clear calls-to-action
- Accessible color contrasts
- Responsive across all devices

---

## Maintenance & Updates

### Version Control

- **Current Version:** 1.0
- **Update Policy:** Semantic versioning (MAJOR.MINOR.PATCH)
- **Change Log:** Document all changes in CHANGELOG.md

### Design Review Process

1. **Proposal:** Suggest changes in design review
2. **Discussion:** Team review and feedback
3. **Approval:** Design lead approval
4. **Implementation:** Update tokens and components
5. **Testing:** Visual regression testing
6. **Documentation:** Update this document

### Token Updates

When updating design tokens:
1. Update CSS variables in `globals.css`
2. Update Tailwind config in `tailwind.config.js`
3. Update component examples
4. Run visual regression tests
5. Update documentation

---

## Resources

### Design Tools

- **Color Picker:** [OKLCH Color Picker](https://oklch.com)
- **Font Testing:** [Font Pair](https://fontpair.co)
- **Accessibility:** [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)
- **Animation:** [Framer Motion](https://www.framer.com/motion/)

### Inspiration

- **Lucineer:** https://github.com/SuperInstance/lucineer
- **shadcn/ui:** https://ui.shadcn.com
- **Vercel Design:** https://vercel.com/design
- **Linear Design:** https://linear.app/design

### Documentation

- **OKLCH Spec:** https://www.w3.org/TR/css-color-4/#ok-lab
- **WCAG 2.1:** https://www.w3.org/WAI/WCAG21/quickref/
- **Tailwind CSS:** https://tailwindcss.com/docs

---

**Document Version:** 1.0
**Last Updated:** 2026-03-18
**Next Review:** 2026-04-18
**Maintainer:** Design System Team
