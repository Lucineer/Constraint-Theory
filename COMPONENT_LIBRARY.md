# Constraint Theory - Component Library Specifications

**Version:** 1.0
**Date:** 2026-03-18
**Based On:** Lucineer Component System
**Adapted For:** Constraint Theory (Technical/Academic Audience)

---

## Component Overview

### Component Categories

1. **Layout Components** - Structure and containers
2. **Navigation Components** - Navigation and menus
3. **Content Components** - Text and media display
4. **Form Components** - Input and controls
5. **Feedback Components** - Alerts and notifications
6. **Data Components** - Tables and charts
7. **Interactive Components** - Demos and simulations

---

## 1. Layout Components

### Container

**Purpose:** Wrapper for content with consistent max-width and padding

**Variants:**
- `default` - Max width 1280px
- `narrow` - Max width 768px
- `wide` - Max width 1536px
- `full` - Full width

**Props:**
```typescript
interface ContainerProps {
  variant?: 'default' | 'narrow' | 'wide' | 'full';
  className?: string;
  children: React.ReactNode;
}
```

**Usage:**
```tsx
<Container variant="default">
  <h1>Page Title</h1>
  <p>Page content</p>
</Container>
```

**Styling:**
```css
.container {
  width: 100%;
  max-width: var(--container-xl);
  margin: 0 auto;
  padding: 0 var(--container-padding);
}

.container-narrow {
  max-width: var(--container-md);
}

.container-wide {
  max-width: var(--container-2xl);
}

.container-full {
  max-width: 100%;
}
```

---

### Section

**Purpose:** Vertical section with consistent padding

**Variants:**
- `default` - 80px vertical padding
- `compact` - 40px vertical padding
- `spacious` - 120px vertical padding

**Props:**
```typescript
interface SectionProps {
  variant?: 'default' | 'compact' | 'spacious';
  className?: string;
  children: React.ReactNode;
}
```

**Usage:**
```tsx
<Section variant="default">
  <h2>Section Title</h2>
  <p>Section content</p>
</Section>
```

**Styling:**
```css
.section {
  padding: var(--section-padding-vertical) 0;
}

.section-compact {
  padding: var(--spacing-10) 0;
}

.section-spacious {
  padding: var(--spacing-32) 0;
}
```

---

### Grid

**Purpose:** CSS Grid layout for component arrangement

**Variants:**
- `2` - 2 columns
- `3` - 3 columns
- `4` - 4 columns
- `6` - 6 columns

**Props:**
```typescript
interface GridProps {
  cols?: 2 | 3 | 4 | 6;
  gap?: 'sm' | 'md' | 'lg';
  className?: string;
  children: React.ReactNode;
}
```

**Usage:**
```tsx
<Grid cols={3} gap="md">
  <Card>Card 1</Card>
  <Card>Card 2</Card>
  <Card>Card 3</Card>
</Grid>
```

**Styling:**
```css
.grid {
  display: grid;
  grid-template-columns: repeat(var(--grid-cols), 1fr);
  gap: var(--gap-md);
}

.grid-gap-sm {
  gap: var(--gap-sm);
}

.grid-gap-lg {
  gap: var(--gap-lg);
}
```

---

## 2. Navigation Components

### Navigation (Main)

**Purpose:** Primary site navigation with responsive menu

**Features:**
- Logo with gradient text
- Desktop navigation links
- Mobile hamburger menu
- Active link highlighting
- Dropdown submenus
- Smooth scroll to sections

**Props:**
```typescript
interface NavigationProps {
  links: NavLink[];
  currentPath?: string;
}

interface NavLink {
  label: string;
  href: string;
  icon?: LucideIcon;
  description?: string;
  subItems?: NavLink[];
}
```

**Usage:**
```tsx
<Navigation
  links={[
    { label: 'Home', href: '/' },
    { label: 'Features', href: '/#features' },
    { label: 'Demo', href: '/#demo' },
    { label: 'Docs', href: '/docs' },
    { label: 'About', href: '/about' },
  ]}
  currentPath="/"
/>
```

**Styling:**
```css
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

---

### Footer

**Purpose:** Site footer with links and information

**Sections:**
- Product (Features, Demo, Docs)
- Resources (Blog, Papers, GitHub)
- Company (About, Contact)
- Legal (Privacy, Terms)
- Social links
- Copyright

**Props:**
```typescript
interface FooterProps {
  columns?: FooterColumn[];
  socialLinks?: SocialLink[];
}

interface FooterColumn {
  title: string;
  links: FooterLink[];
}

interface FooterLink {
  label: string;
  href: string;
}

interface SocialLink {
  platform: 'github' | 'twitter' | 'linkedin';
  href: string;
}
```

**Usage:**
```tsx
<Footer
  columns={[
    {
      title: 'Product',
      links: [
        { label: 'Features', href: '/#features' },
        { label: 'Demo', href: '/#demo' },
        { label: 'Documentation', href: '/docs' },
      ],
    },
    // ... more columns
  ]}
  socialLinks={[
    { platform: 'github', href: 'https://github.com/SuperInstance/constrainttheory' },
  ]}
/>
```

---

## 3. Content Components

### Hero

**Purpose:** Main hero section with gradient text and CTAs

**Features:**
- Large heading with gradient text
- Subheading with value proposition
- Primary and secondary CTAs
- Floating geometric elements
- Animated background gradient
- Fade-in animations

**Props:**
```typescript
interface HeroProps {
  headline: string;
  subhead: string;
  primaryCta: CtaButton;
  secondaryCta?: CtaButton;
  showFloatingElements?: boolean;
}

interface CtaButton {
  label: string;
  href: string;
  variant?: 'primary' | 'secondary';
}
```

**Usage:**
```tsx
<Hero
  headline="Geometric Substrate for Cellularized Agent Infrastructure"
  subhead="O(log n) spatial queries. Deterministic output. No hallucinations."
  primaryCta={{ label: 'Get Started', href: '/docs/getting-started' }}
  secondaryCta={{ label: 'View Documentation', href: '/docs' }}
  showFloatingElements={true}
/>
```

**Styling:**
```css
.hero {
  position: relative;
  min-height: 600px;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: var(--spacing-20) var(--container-padding);
}

.hero-gradient {
  background:
    radial-gradient(ellipse at 30% 20%, oklch(0.72 0.19 145 / 0.15) 0%, transparent 50%),
    radial-gradient(ellipse at 70% 60%, oklch(0.65 0.15 180 / 0.1) 0%, transparent 50%),
    radial-gradient(ellipse at 50% 100%, oklch(0.68 0.18 280 / 0.08) 0%, transparent 50%);
}

.hero-headline {
  font-size: var(--text-display-2xl);
  font-weight: var(--font-weight-bold);
  line-height: var(--leading-tight);
  letter-spacing: var(--tracking-tight);
  margin-bottom: var(--spacing-6);
}

.hero-subhead {
  font-size: var(--text-heading-xl);
  color: oklch(0.65 0.02 145);
  margin-bottom: var(--spacing-8);
  max-width: 800px;
  margin-left: auto;
  margin-right: auto;
}
```

---

### Card

**Purpose:** Container for related content with hover effects

**Variants:**
- `default` - Standard card with border
- `elevated` - Card with shadow
- `outlined` - Card with emphasized border
- `ghost` - Minimal card

**Props:**
```typescript
interface CardProps {
  variant?: 'default' | 'elevated' | 'outlined' | 'ghost';
  className?: string;
  children: React.ReactNode;
  href?: string; // If provided, card is clickable
}

interface CardHeaderProps {
  title: string;
  description?: string;
  icon?: LucideIcon;
  action?: React.ReactNode;
}

interface CardContentProps {
  children: React.ReactNode;
}

interface CardFooterProps {
  children: React.ReactNode;
}
```

**Usage:**
```tsx
<Card>
  <CardHeader
    title="O(log n) Spatial Queries"
    description="Lightning-fast agent lookups with KD-tree indexing"
    icon={Search}
  />
  <CardContent>
    <p>Query agents by position in logarithmic time.</p>
  </CardContent>
  <CardFooter>
    <Button variant="ghost">Learn More →</Button>
  </CardFooter>
</Card>
```

**Styling:**
```css
.card {
  background: oklch(0.12 0.01 145);
  border: 1px solid oklch(0.25 0.02 145);
  border-radius: var(--radius-xl);
  padding: var(--card-padding);
  transition: all var(--duration-normal) var(--ease-smooth);
}

.card:hover {
  transform: translateY(-8px);
  box-shadow:
    0 20px 40px oklch(0 0 0 / 0.3),
    0 0 60px oklch(0.72 0.19 145 / 0.1);
  border-color: oklch(0.72 0.19 145 / 0.5);
}
```

---

### CodeBlock

**Purpose:** Display code with syntax highlighting and Mac-style header

**Features:**
- Mac-style window controls (red, yellow, green dots)
- Syntax highlighting (Prism.js or Shiki)
- Copy to clipboard button
- Language indicator
- Line numbers (optional)

**Props:**
```typescript
interface CodeBlockProps {
  code: string;
  language?: string;
  showLineNumbers?: boolean;
  copyable?: boolean;
  filename?: string;
}
```

**Usage:**
```tsx
<CodeBlock
  language="rust"
  code={`use constraint_theory_core::{PythagoreanManifold, snap};

let manifold = PythagoreanManifold::new(200);
let vec = [0.6f32, 0.8];
let (snapped, noise) = snap(&manifold, vec);

println!("Snapped: ({}, {})", snapped[0], snapped[1]);`}
  showLineNumbers={true}
  copyable={true}
  filename="src/main.rs"
/>
```

**Styling:**
```css
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

.code-header {
  background: oklch(0.15 0.01 145);
  border-bottom: 1px solid oklch(0.25 0.02 145);
  padding: var(--spacing-3) var(--spacing-4);
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
}

.code-content {
  padding: var(--spacing-5);
  overflow-x: auto;
  font-size: var(--text-code-md);
  line-height: var(--leading-relaxed);
}
```

---

## 4. Form Components

### Button

**Purpose:** Interactive button with multiple variants

**Variants:**
- `default` - Primary gradient button
- `secondary` - Outlined button
- `ghost` - Minimal button
- `link` - Text-only link

**Sizes:**
- `sm` - Small button
- `default` - Default size
- `lg` - Large button

**Props:**
```typescript
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'secondary' | 'ghost' | 'link';
  size?: 'sm' | 'default' | 'lg';
  leftIcon?: LucideIcon;
  rightIcon?: LucideIcon;
  children: React.ReactNode;
}
```

**Usage:**
```tsx
<Button variant="default" size="lg">
  Get Started
</Button>

<Button variant="secondary" leftIcon={Download}>
  Download
</Button>

<Button variant="ghost" rightIcon={ArrowRight}>
  Learn More
</Button>
```

**Styling:**
```css
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
```

---

### Input

**Purpose:** Text input field with validation

**Variants:**
- `default` - Standard input
- `error` - Input with error state
- `success` - Input with success state

**Props:**
```typescript
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  success?: string;
  leftIcon?: LucideIcon;
  rightIcon?: LucideIcon;
}
```

**Usage:**
```tsx
<Input
  type="email"
  label="Email Address"
  placeholder="you@example.com"
  error={errors.email}
  leftIcon={Mail}
/>
```

**Styling:**
```css
.input {
  width: 100%;
  padding: var(--input-padding);
  font-size: var(--text-body-md);
  font-family: var(--font-sans);
  background: oklch(0.20 0.02 145);
  border: 1px solid oklch(0.25 0.02 145);
  border-radius: var(--radius-md);
  color: oklch(0.98 0.005 145);
  transition: all var(--duration-base) var(--ease-smooth);
}

.input:focus {
  outline: none;
  border-color: oklch(0.72 0.19 145);
  box-shadow: 0 0 0 3px oklch(0.72 0.19 145 / 0.1);
}

.input-error {
  border-color: oklch(0.55 0.22 27);
}

.input-error:focus {
  box-shadow: 0 0 0 3px oklch(0.55 0.22 27 / 0.1);
}
```

---

## 5. Feedback Components

### Alert

**Purpose:** Display messages with semantic styling

**Variants:**
- `info` - Informational message (blue)
- `success` - Success message (green)
- `warning` - Warning message (amber)
- `error` - Error message (red)

**Props:**
```typescript
interface AlertProps {
  variant?: 'info' | 'success' | 'warning' | 'error';
  title?: string;
  children: React.ReactNode;
  dismissible?: boolean;
}
```

**Usage:**
```tsx
<Alert variant="info" title="Information">
  This is an informational message for the user.
</Alert>

<Alert variant="success" title="Success!">
  Your changes have been saved successfully.
</Alert>

<Alert variant="error" title="Error" dismissible>
  Something went wrong. Please try again.
</Alert>
```

**Styling:**
```css
.alert {
  display: flex;
  align-items: flex-start;
  gap: var(--spacing-3);
  padding: var(--spacing-4);
  border-radius: var(--radius-lg);
  border: 1px solid;
  background: oklch(0.12 0.01 145);
}

.alert-info {
  border-color: oklch(0.65 0.18 230 / 0.5);
  background: oklch(0.65 0.18 230 / 0.1);
}

.alert-success {
  border-color: oklch(0.72 0.19 145 / 0.5);
  background: oklch(0.72 0.19 145 / 0.1);
}

.alert-warning {
  border-color: oklch(0.75 0.18 60 / 0.5);
  background: oklch(0.75 0.18 60 / 0.1);
}

.alert-error {
  border-color: oklch(0.55 0.22 27 / 0.5);
  background: oklch(0.55 0.22 27 / 0.1);
}
```

---

## 6. Data Components

### Table

**Purpose:** Display tabular data with sorting and filtering

**Features:**
- Sortable columns
- Hover states
- Responsive design
- Pagination (optional)

**Props:**
```typescript
interface TableProps<T> {
  data: T[];
  columns: Column<T>[];
  sortable?: boolean;
  filterable?: boolean;
}

interface Column<T> {
  key: keyof T;
  label: string;
  sortable?: boolean;
  filterable?: boolean;
  render?: (value: any, row: T) => React.ReactNode;
}
```

**Usage:**
```tsx
<Table
  data={benchmarks}
  columns={[
    { key: 'operation', label: 'Operation' },
    { key: 'complexity', label: 'Complexity' },
    { key: 'performance', label: 'Performance (ops/sec)' },
  ]}
  sortable={true}
/>
```

**Styling:**
```css
.table-container {
  width: 100%;
  overflow-x: auto;
  border-radius: var(--radius-xl);
  border: 1px solid oklch(0.25 0.02 145);
}

.table {
  width: 100%;
  border-collapse: collapse;
  font-size: var(--text-body-sm);
}

.table th {
  background: oklch(0.12 0.01 145);
  padding: var(--spacing-4);
  text-align: left;
  border-bottom: 2px solid oklch(0.25 0.02 145);
  font-weight: var(--font-weight-semibold);
  color: oklch(0.98 0.005 145);
}

.table td {
  padding: var(--spacing-4);
  border-bottom: 1px solid oklch(0.20 0.01 145);
  color: oklch(0.98 0.005 145);
}

.table tr:hover {
  background: oklch(0.72 0.19 145 / 0.05);
}
```

---

## 7. Interactive Components

### AgentSimulation

**Purpose:** Interactive canvas for agent visualization

**Features:**
- Click to add agents
- Right-click to query neighbors
- Real-time performance metrics
- Visual query radius
- Agent count display
- Reset button

**Props:**
```typescript
interface AgentSimulationProps {
  maxAgents?: number;
  queryRadius?: number;
  onMetricsChange?: (metrics: SimulationMetrics) => void;
}

interface SimulationMetrics {
  agentCount: number;
  queryTime: number;
  memoryUsage: number;
}
```

**Usage:**
```tsx
<AgentSimulation
  maxAgents={1000}
  queryRadius={0.2}
  onMetricsChange={(metrics) => console.log(metrics)}
/>
```

**Styling:**
```css
.simulation-container {
  position: relative;
  width: 100%;
  height: 600px;
  background: oklch(0.10 0.01 145);
  border: 1px solid oklch(0.25 0.02 145);
  border-radius: var(--radius-xl);
  overflow: hidden;
}

.simulation-canvas {
  width: 100%;
  height: 100%;
  cursor: crosshair;
}

.simulation-controls {
  position: absolute;
  bottom: var(--spacing-4);
  left: var(--spacing-4);
  display: flex;
  gap: var(--spacing-2);
}

.simulation-metrics {
  position: absolute;
  top: var(--spacing-4);
  right: var(--spacing-4);
  background: oklch(0.12 0.01 145 / 0.9);
  backdrop-filter: blur(8px);
  border: 1px solid oklch(0.25 0.02 145);
  border-radius: var(--radius-lg);
  padding: var(--spacing-3);
  font-family: var(--font-mono);
  font-size: var(--text-code-sm);
}
```

---

### CoordinateConverter

**Purpose:** Interactive tool for coordinate conversion

**Features:**
- Real-time conversion
- Multiple format support (Cartesian, Dodecet, Spherical)
- Code export
- Visualization

**Props:**
```typescript
interface CoordinateConverterProps {
  formats?: ('cartesian' | 'dodecet' | 'spherical')[];
  onConvert?: (result: ConversionResult) => void;
}

interface ConversionResult {
  input: string;
  output: Record<string, string>;
  code?: string;
}
```

**Usage:**
```tsx
<CoordinateConverter
  formats={['cartesian', 'dodecet', 'spherical']}
  onConvert={(result) => console.log(result)}
/>
```

---

## Component Composition Examples

### Feature Section

```tsx
<Section variant="default">
  <Container>
    <h2 className={styles.sectionTitle}>Features</h2>
    <Grid cols={3} gap="lg">
      <Card>
        <CardHeader
          title="O(log n) Queries"
          icon={Search}
          description="Lightning-fast spatial queries"
        />
        <CardContent>
          <p>Query agents by position in logarithmic time using KD-tree indexing.</p>
        </CardContent>
        <CardFooter>
          <Button variant="ghost">Learn More →</Button>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader
          title="Deterministic Output"
          icon={Shield}
          description="No hallucinations, guaranteed"
        />
        <CardContent>
          <p>Mathematical guarantees ensure consistent, reproducible results.</p>
        </CardContent>
        <CardFooter>
          <Button variant="ghost">Learn More →</Button>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader
          title="Cellular Agents"
          icon={Users}
          description="Scalable multiagent systems"
        />
        <CardContent>
          <p>Build sophisticated multiagent systems that scale to thousands of agents.</p>
        </CardContent>
        <CardFooter>
          <Button variant="ghost">Learn More →</Button>
        </CardFooter>
      </Card>
    </Grid>
  </Container>
</Section>
```

### Documentation Page

```tsx
<Container>
  <div className={styles.docLayout}>
    <aside className={styles.docSidebar}>
      <Navigation links={docLinks} />
    </aside>

    <main className={styles.docContent}>
      <h1>Getting Started</h1>

      <Alert variant="info" title="Prerequisites">
        Ensure you have Rust and Cargo installed before proceeding.
      </Alert>

      <Section variant="compact">
        <h2>Installation</h2>
        <CodeBlock
          language="bash"
          code="cargo install constraint-theory-core"
          copyable={true}
        />
      </Section>

      <Section variant="compact">
        <h2>Quick Start</h2>
        <CodeBlock
          language="rust"
          code={quickStartCode}
          showLineNumbers={true}
          copyable={true}
        />
      </Section>
    </main>
  </div>
</Container>
```

---

## Accessibility Guidelines

### Keyboard Navigation

- All interactive elements must be keyboard accessible
- Tab order should follow visual flow
- Focus indicators must be visible (2px outline)
- Skip links for main content

### Screen Readers

- Use semantic HTML (nav, main, article, etc.)
- Provide alt text for images
- Use ARIA labels where necessary
- Announce dynamic content changes

### Color Contrast

- Normal text: 4.5:1 minimum
- Large text: 3:1 minimum
- UI components: 3:1 minimum
- Use OKLCH for perceptual uniformity

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

## Performance Guidelines

### Code Splitting

- Lazy load routes
- Dynamic imports for heavy components
- Split vendor bundles

### Image Optimization

- Use WebP format
- Lazy load images
- Provide responsive sizes
- Use blur-up placeholders

### Bundle Size

- Tree shake unused code
- Minimize dependencies
- Use lightweight alternatives
- Monitor bundle size

---

## Testing Strategy

### Unit Tests

- Test component rendering
- Test user interactions
- Test edge cases
- Test accessibility

### Integration Tests

- Test component composition
- Test data flow
- Test navigation
- Test forms

### Visual Regression

- Screenshot testing
- Cross-browser testing
- Responsive testing
- Theme testing

---

## Maintenance

### Version Control

- Semantic versioning (MAJOR.MINOR.PATCH)
- Changelog for each release
- Migration guides for breaking changes

### Documentation

- Prop tables for each component
- Usage examples
- Storybook stories (optional)
- JSDoc comments

### Deprecation

- Mark deprecated components
- Provide migration path
- Remove in next major version

---

## Resources

### Component Libraries

- shadcn/ui: https://ui.shadcn.com
- Radix UI: https://www.radix-ui.com
- Headless UI: https://headlessui.com
- Chakra UI: https://chakra-ui.com

### Design Inspiration

- Lucineer: https://github.com/SuperInstance/lucineer
- Vercel: https://vercel.com/design
- Linear: https://linear.app/design
- GitHub: https://github.com/design

### Documentation

- React Docs: https://react.dev
- Next.js Docs: https://nextjs.org/docs
- Tailwind CSS: https://tailwindcss.com/docs
- Framer Motion: https://www.framer.com/motion

---

**Document Version:** 1.0
**Last Updated:** 2026-03-18
**Status:** Complete - Ready for Implementation
**Next Review:** After Phase 2 completion
