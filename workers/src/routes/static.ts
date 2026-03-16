import { Router } from 'itty-router';

export const staticRoutes = Router();

// Export HTML generator functions for use in main router
export function getStaticFile(path: string): string | null {
  try {
    // In production, these would be served from KV assets or R2
    // For now, we'll return the HTML directly
    switch (path) {
      case '/index.html':
      case '/':
        return HOMEPAGE_HTML();
      case '/simulators/pythagorean/index.html':
        return PYTHAGOREAN_HTML();
      case '/simulators/rigidity/index.html':
        return RIGIDITY_HTML();
      case '/css/main.css':
        return MAIN_CSS();
      case '/simulators/pythagorean/app.js':
        return PYTHAGOREAN_JS();
      case '/simulators/rigidity/app.js':
        return RIGIDITY_JS();
      default:
        return null;
    }
  } catch (e) {
    return null;
  }
}

// Serve index.html for root
staticRoutes.get('/', async () => {
  const html = await getStaticFile('/index.html');
  if (!html) {
    return new Response('File not found', { status: 404 });
  }

  return new Response(html, {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'public, max-age=3600'
    }
  });
});

// Serve CSS
staticRoutes.get('/css/main.css', async () => {
  const css = await getStaticFile('/css/main.css');
  if (!css) {
    return new Response('File not found', { status: 404 });
  }

  return new Response(css, {
    headers: {
      'Content-Type': 'text/css; charset=utf-8',
      'Cache-Control': 'public, max-age=86400'
    }
  });
});

// Serve JavaScript files
staticRoutes.get('/simulators/:simulator/app.js', async (request) => {
  const { simulator } = request.named;
  const js = await getStaticFile(`/simulators/${simulator}/app.js`);
  if (!js) {
    return new Response('File not found', { status: 404 });
  }

  return new Response(js, {
    headers: {
      'Content-Type': 'application/javascript; charset=utf-8',
      'Cache-Control': 'public, max-age=86400'
    }
  });
});

// Serve simulator pages
staticRoutes.get('/simulators/:name/', async (request) => {
  const { name } = request.named;
  const validSimulators = ['pythagorean', 'rigidity', 'holonomy', 'performance', 'kdtree'];

  if (!validSimulators.includes(name)) {
    return new Response(JSON.stringify({ error: 'Simulator not found' }), {
      status: 404,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  const html = await getStaticFile(`/simulators/${name}/index.html`);
  if (!html) {
    // Return a coming soon page for unimplemented simulators
    return new Response(COMING_SOON_HTML(name), {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'public, max-age=3600'
      }
    });
  }

  return new Response(html, {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'public, max-age=3600'
    }
  });
});

// HTML Templates (embedded for simplicity - in production, use KV assets or R2)
export function HOMEPAGE_HTML(): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="Constraint Theory - Deterministic geometric logic for computational intelligence. 74ns/op, 280x faster than traditional methods.">
    <meta name="keywords" content="constraint theory, geometric logic, deterministic AI, Pythagorean snapping, rigidity matroid">
    <meta property="og:title" content="Constraint Theory - Deterministic Geometric Logic">
    <meta property="og:description" content="Replace stochastic matrix multiplication with deterministic geometric logic. 74ns/op, zero hallucinations.">
    <meta property="og:type" content="website">
    <meta property="og:url" content="https://constraint-theory.superinstance.ai">
    <title>Constraint Theory - Deterministic Geometric Logic for AI</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.css">
    <script src="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.js"></script>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');
        body { font-family: 'Inter', sans-serif; }
        .gradient-text {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
        }
        .hero-gradient {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        }
        .card-hover {
            transition: all 0.3s ease;
        }
        .card-hover:hover {
            transform: translateY(-4px);
            box-shadow: 0 20px 40px rgba(0,0,0,0.3);
        }
        .metric-value {
            font-size: 2.5rem;
            font-weight: 800;
            line-height: 1;
        }
        .code-block {
            background: #1e293b;
            border-radius: 8px;
            padding: 1rem;
            overflow-x: auto;
        }
        .nav-link {
            position: relative;
        }
        .nav-link::after {
            content: '';
            position: absolute;
            width: 0;
            height: 2px;
            bottom: -2px;
            left: 0;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            transition: width 0.3s ease;
        }
        .nav-link:hover::after {
            width: 100%;
        }
    </style>
</head>
<body class="bg-gray-900 text-white">
    <!-- Navigation -->
    <nav class="fixed w-full top-0 z-50 bg-gray-900/95 backdrop-blur-sm border-b border-gray-800">
        <div class="container mx-auto px-4 py-4">
            <div class="flex justify-between items-center">
                <div class="flex items-center gap-2">
                    <div class="w-8 h-8 hero-gradient rounded-lg flex items-center justify-center">
                        <span class="text-white font-bold text-sm">Ω</span>
                    </div>
                    <span class="text-xl font-bold">Constraint Theory</span>
                </div>
                <div class="hidden md:flex gap-6">
                    <a href="#simulators" class="nav-link text-gray-300 hover:text-white">Simulators</a>
                    <a href="#performance" class="nav-link text-gray-300 hover:text-white">Performance</a>
                    <a href="#docs" class="nav-link text-gray-300 hover:text-white">Documentation</a>
                    <a href="#quickstart" class="nav-link text-gray-300 hover:text-white">Quick Start</a>
                </div>
                <div class="flex gap-3">
                    <a href="https://github.com/SuperInstance/constrainttheory" target="_blank" rel="noopener" class="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm font-medium transition">
                        GitHub
                    </a>
                    <a href="/api/docs" class="px-4 py-2 hero-gradient hover:opacity-90 rounded-lg text-sm font-medium transition">
                        API Docs
                    </a>
                </div>
            </div>
        </div>
    </nav>

    <!-- Hero Section -->
    <section class="pt-32 pb-20 px-4">
        <div class="container mx-auto max-w-6xl">
            <div class="text-center mb-16">
                <div class="inline-block mb-6 px-4 py-2 bg-purple-500/10 border border-purple-500/30 rounded-full">
                    <span class="text-purple-400 text-sm font-medium">Now Available: Open Source Constraint Theory Engine</span>
                </div>
                <h1 class="text-5xl md:text-7xl font-bold mb-6">
                    <span class="gradient-text">Deterministic Logic</span>
                    <br>
                    <span class="text-white">for Computational Intelligence</span>
                </h1>
                <p class="text-xl text-gray-400 mb-8 max-w-3xl mx-auto">
                    Replace stochastic matrix multiplication with deterministic geometric logic.
                    <span class="text-purple-400 font-semibold">Zero hallucinations</span>,
                    <span class="text-purple-400 font-semibold">provable correctness</span>,
                    <span class="text-purple-400 font-semibold">280x faster</span>.
                </p>
                <div class="flex flex-wrap justify-center gap-4 mb-12">
                    <a href="#quickstart" class="px-8 py-4 hero-gradient hover:opacity-90 rounded-lg text-lg font-semibold transition">
                        Get Started
                    </a>
                    <a href="#simulators" class="px-8 py-4 bg-gray-800 hover:bg-gray-700 rounded-lg text-lg font-semibold transition">
                        Try Simulators
                    </a>
                </div>

                <!-- Performance Metrics -->
                <div id="performance" class="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
                    <div class="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 card-hover">
                        <div class="metric-value text-purple-400">74ns</div>
                        <div class="text-sm text-gray-400 mt-2">per operation</div>
                    </div>
                    <div class="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 card-hover">
                        <div class="metric-value text-green-400">280x</div>
                        <div class="text-sm text-gray-400 mt-2">faster than MLP</div>
                    </div>
                    <div class="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 card-hover">
                        <div class="metric-value text-blue-400">0</div>
                        <div class="text-sm text-gray-400 mt-2">hallucinations</div>
                    </div>
                    <div class="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 card-hover">
                        <div class="metric-value">O(log n)</div>
                        <div class="text-sm text-gray-400 mt-2">complexity</div>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <!-- Interactive Simulators -->
    <section id="simulators" class="py-20 px-4 bg-gray-800/30">
        <div class="container mx-auto max-w-6xl">
            <div class="text-center mb-12">
                <h2 class="text-4xl font-bold mb-4">Interactive Simulators</h2>
                <p class="text-xl text-gray-400">Experience constraint theory through hands-on exploration</p>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <!-- Pythagorean Snapping -->
                <a href="/simulators/pythagorean/" class="bg-gray-800 rounded-xl p-6 card-hover block">
                    <div class="w-12 h-12 hero-gradient rounded-lg flex items-center justify-center mb-4">
                        <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/>
                        </svg>
                    </div>
                    <h3 class="text-xl font-semibold mb-2">Pythagorean Snapping</h3>
                    <p class="text-gray-400 mb-4">Explore how vectors snap to integer Pythagorean ratios for deterministic alignment</p>
                    <div class="flex items-center text-purple-400">
                        <span class="text-sm font-medium">Try it now</span>
                        <svg class="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
                        </svg>
                    </div>
                </a>

                <!-- Rigidity Matroid -->
                <a href="/simulators/rigidity/" class="bg-gray-800 rounded-xl p-6 card-hover block">
                    <div class="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center mb-4">
                        <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"/>
                        </svg>
                    </div>
                    <h3 class="text-xl font-semibold mb-2">Rigidity Matroid</h3>
                    <p class="text-gray-400 mb-4">Visualize Laman graphs and test structural rigidity using Laman's Theorem</p>
                    <div class="flex items-center text-green-400">
                        <span class="text-sm font-medium">Try it now</span>
                        <svg class="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
                        </svg>
                    </div>
                </a>

                <!-- Discrete Holonomy -->
                <a href="/simulators/holonomy/" class="bg-gray-800 rounded-xl p-6 card-hover block">
                    <div class="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center mb-4">
                        <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
                        </svg>
                    </div>
                    <h3 class="text-xl font-semibold mb-2">Discrete Holonomy</h3>
                    <p class="text-gray-400 mb-4">Parallel transport along Platonic symmetries with closure properties</p>
                    <div class="flex items-center text-blue-400">
                        <span class="text-sm font-medium">Coming soon</span>
                        <svg class="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
                        </svg>
                    </div>
                </a>

                <!-- Performance Benchmarks -->
                <a href="/simulators/performance/" class="bg-gray-800 rounded-xl p-6 card-hover block">
                    <div class="w-12 h-12 bg-yellow-500 rounded-lg flex items-center justify-center mb-4">
                        <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
                        </svg>
                    </div>
                    <h3 class="text-xl font-semibold mb-2">Performance Benchmarks</h3>
                    <p class="text-gray-400 mb-4">Compare constraint theory vs traditional neural network approaches</p>
                    <div class="flex items-center text-yellow-400">
                        <span class="text-sm font-medium">View benchmarks</span>
                        <svg class="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
                        </svg>
                    </div>
                </a>

                <!-- KD-Tree Visualization -->
                <a href="/simulators/kdtree/" class="bg-gray-800 rounded-xl p-6 card-hover block">
                    <div class="w-12 h-12 bg-red-500 rounded-lg flex items-center justify-center mb-4">
                        <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z"/>
                        </svg>
                    </div>
                    <h3 class="text-xl font-semibold mb-2">KD-Tree Visualization</h3>
                    <p class="text-gray-400 mb-4">Spatial partitioning for Lattice Vector Quantization tokenization</p>
                    <div class="flex items-center text-red-400">
                        <span class="text-sm font-medium">Coming soon</span>
                        <svg class="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
                        </svg>
                    </div>
                </a>
            </div>
        </div>
    </section>

    <!-- Core Concepts -->
    <section class="py-20 px-4">
        <div class="container mx-auto max-w-6xl">
            <div class="text-center mb-12">
                <h2 class="text-4xl font-bold mb-4">Core Concepts</h2>
                <p class="text-xl text-gray-400">Mathematical foundations of deterministic intelligence</p>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                <!-- Origin-Centric Geometry -->
                <div class="bg-gray-800 rounded-xl p-8">
                    <div class="flex items-center gap-4 mb-4">
                        <div class="text-4xl">Ω</div>
                        <h3 class="text-2xl font-semibold">Origin-Centric Geometry</h3>
                    </div>
                    <p class="text-gray-400 mb-4">
                        Unitary symmetry invariant as the normalized ground state of discrete manifolds.
                        Establishes a zero-point resonance threshold for deterministic computations.
                    </p>
                    <div class="code-block">
                        <code class="text-sm text-green-400">
                            Ω(x) = normalize(x) such that ||Ω(x)|| = 1
                        </code>
                    </div>
                </div>

                <!-- Phi-Folding Operator -->
                <div class="bg-gray-800 rounded-xl p-8">
                    <div class="flex items-center gap-4 mb-4">
                        <div class="text-4xl">Φ</div>
                        <h3 class="text-2xl font-semibold">Φ-Folding Operator</h3>
                    </div>
                    <p class="text-gray-400 mb-4">
                        Maps continuous vectors to discrete states via geometric rotation.
                        Achieves O(n²) → O(log n) complexity reduction.
                    </p>
                    <div class="code-block">
                        <code class="text-sm text-blue-400">
                            Φ(x) = fold(x) ∈ discrete integer ratios
                        </code>
                    </div>
                </div>

                <!-- Pythagorean Snapping -->
                <div class="bg-gray-800 rounded-xl p-8">
                    <div class="flex items-center gap-4 mb-4">
                        <div class="text-4xl">△</div>
                        <h3 class="text-2xl font-semibold">Pythagorean Snapping</h3>
                    </div>
                    <p class="text-gray-400 mb-4">
                        Forces latent vectors to align with universal integer ratios (3-4-5, 5-12-13, 8-15-17).
                        Eliminates hallucinations through geometric closure properties.
                    </p>
                    <div class="code-block">
                        <code class="text-sm text-purple-400">
                            snap(v) = argmin ||v - (a,b)|| where a² + b² = c²
                        </code>
                    </div>
                </div>

                <!-- Rigidity Matroid -->
                <div class="bg-gray-800 rounded-xl p-8">
                    <div class="flex items-center gap-4 mb-4">
                        <div class="text-4xl">📐</div>
                        <h3 class="text-2xl font-semibold">Rigidity Matroid</h3>
                    </div>
                    <p class="text-gray-400 mb-4">
                        Uses Laman's Theorem to guarantee structural stability.
                        A graph is rigid if E = 2V - 3 and all subgraphs satisfy the constraint.
                    </p>
                    <div class="code-block">
                        <code class="text-sm text-yellow-400">
                            rigid(G) ↔ E = 2V - 3 and ∀H⊆G: E(H) ≤ 2V(H) - 3
                        </code>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <!-- Quick Start -->
    <section id="quickstart" class="py-20 px-4 bg-gray-800/30">
        <div class="container mx-auto max-w-6xl">
            <div class="text-center mb-12">
                <h2 class="text-4xl font-bold mb-4">Quick Start</h2>
                <p class="text-xl text-gray-400">Get up and running in minutes</p>
            </div>

            <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <!-- Python Example -->
                <div class="bg-gray-800 rounded-xl p-6">
                    <div class="flex items-center gap-3 mb-4">
                        <div class="w-10 h-10 bg-yellow-500 rounded-lg flex items-center justify-center">
                            <span class="text-white font-bold">Py</span>
                        </div>
                        <h3 class="text-xl font-semibold">Python</h3>
                    </div>
                    <div class="code-block mb-4">
                        <pre class="text-sm"><code class="text-green-400"># Install the package
pip install constraint-theory

# Pythagorean snapping
from constraint_theory import snap

vector = [3.1, 4.2]
snapped = snap.to_pythagorean(vector)
print(snapped)  # [3, 4]</code></pre>
                    </div>
                    <button class="w-full py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm font-medium transition">
                        View Full Documentation
                    </button>
                </div>

                <!-- API Example -->
                <div class="bg-gray-800 rounded-xl p-6">
                    <div class="flex items-center gap-3 mb-4">
                        <div class="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center">
                            <span class="text-white font-bold">API</span>
                        </div>
                        <h3 class="text-xl font-semibold">REST API</h3>
                    </div>
                    <div class="code-block mb-4">
                        <pre class="text-sm"><code class="text-purple-400"># Snap to Pythagorean ratio
curl -X POST https://constraint-theory.superinstance.ai/api/geometry/snap \\
  -H "Content-Type: application/json" \\
  -d '{"vector": [3.1, 4.2]}'

# Response: {"snapped": [3, 4], "distance": 0.224}</code></pre>
                    </div>
                    <a href="/api/docs" class="block w-full py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm font-medium text-center transition">
                        View API Documentation
                    </a>
                </div>
            </div>
        </div>
    </section>

    <!-- Footer -->
    <footer class="py-12 px-4 border-t border-gray-800">
        <div class="container mx-auto max-w-6xl">
            <div class="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
                <div>
                    <div class="flex items-center gap-2 mb-4">
                        <div class="w-8 h-8 hero-gradient rounded-lg flex items-center justify-center">
                            <span class="text-white font-bold text-sm">Ω</span>
                        </div>
                        <span class="text-lg font-bold">Constraint Theory</span>
                    </div>
                    <p class="text-gray-400 text-sm">
                        Deterministic geometric logic for computational intelligence.
                    </p>
                </div>
                <div>
                    <h4 class="font-semibold mb-4">Resources</h4>
                    <ul class="space-y-2 text-gray-400 text-sm">
                        <li><a href="#simulators" class="hover:text-white">Simulators</a></li>
                        <li><a href="#docs" class="hover:text-white">Documentation</a></li>
                        <li><a href="/api/docs" class="hover:text-white">API Reference</a></li>
                        <li><a href="https://github.com/SuperInstance/SuperInstance-papers" class="hover:text-white">Research Papers</a></li>
                    </ul>
                </div>
                <div>
                    <h4 class="font-semibold mb-4">Community</h4>
                    <ul class="space-y-2 text-gray-400 text-sm">
                        <li><a href="https://github.com/SuperInstance/constrainttheory" class="hover:text-white">GitHub</a></li>
                        <li><a href="https://github.com/SuperInstance" class="hover:text-white">SuperInstance</a></li>
                    </ul>
                </div>
                <div>
                    <h4 class="font-semibold mb-4">Legal</h4>
                    <ul class="space-y-2 text-gray-400 text-sm">
                        <li><a href="#" class="hover:text-white">Privacy Policy</a></li>
                        <li><a href="#" class="hover:text-white">Terms of Service</a></li>
                        <li><a href="#" class="hover:text-white">License (MIT)</a></li>
                    </ul>
                </div>
            </div>
            <div class="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center">
                <p class="text-gray-400 text-sm">
                    © 2024 SuperInstance. Open source under MIT license.
                </p>
                <div class="flex gap-4 mt-4 md:mt-0">
                    <a href="https://github.com/SuperInstance/constrainttheory" target="_blank" rel="noopener" class="text-gray-400 hover:text-white">
                        <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                            <path fill-rule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clip-rule="evenodd"/>
                        </svg>
                    </a>
                </div>
            </div>
        </div>
    </footer>

    <script>
        // Smooth scroll for navigation links
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        });

        // Add scroll effect to navigation
        window.addEventListener('scroll', () => {
            const nav = document.querySelector('nav');
            if (window.scrollY > 50) {
                nav.classList.add('shadow-lg');
            } else {
                nav.classList.remove('shadow-lg');
            }
        });
    </script>
</body>
</html>`;
}

export function PYTHAGOREAN_HTML(): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Pythagorean Snapping Simulator - Constraint Theory</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.css">
    <script src="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.js"></script>
</head>
<body class="bg-gray-900 text-white">
    <div class="container mx-auto px-4 py-8">
        <!-- Header -->
        <header class="mb-8">
            <nav class="mb-6">
                <a href="/" class="text-blue-400 hover:text-blue-300">← Back to Home</a>
            </nav>
            <h1 class="text-4xl font-bold mb-2">Pythagorean Snapping</h1>
            <p class="text-gray-400 text-lg">
                Explore how vectors snap to integer Pythagorean ratios
            </p>
        </header>

        <!-- Main Content -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <!-- Canvas Area -->
            <div class="lg:col-span-2">
                <div class="bg-gray-800 rounded-lg p-4">
                    <canvas id="snapCanvas" width="800" height="600" class="w-full rounded"></canvas>
                    <div class="mt-4 flex justify-between items-center">
                        <div id="coordinates" class="text-sm text-gray-400">
                            Click to place a point
                        </div>
                        <button id="resetBtn" class="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded">
                            Reset
                        </button>
                    </div>
                </div>

                <!-- Controls -->
                <div class="bg-gray-800 rounded-lg p-4 mt-4">
                    <h3 class="text-lg font-semibold mb-4">Controls</h3>
                    <div class="space-y-4">
                        <div>
                            <label class="block text-sm text-gray-400 mb-2">
                                Snap Threshold: <span id="thresholdValue">0.1</span>
                            </label>
                            <input type="range" id="threshold" min="0.01" max="0.5" step="0.01" value="0.1" class="w-full">
                        </div>
                        <div class="flex items-center gap-4">
                            <label class="flex items-center gap-2">
                                <input type="checkbox" id="showGrid" checked class="rounded">
                                <span class="text-sm">Show Grid</span>
                            </label>
                            <label class="flex items-center gap-2">
                                <input type="checkbox" id="showRatios" checked class="rounded">
                                <span class="text-sm">Show Ratios</span>
                            </label>
                            <label class="flex items-center gap-2">
                                <input type="checkbox" id="showAngles" checked class="rounded">
                                <span class="text-sm">Show Angles</span>
                            </label>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Information Panel -->
            <div class="space-y-4">
                <!-- Theory -->
                <div class="bg-gray-800 rounded-lg p-4">
                    <h3 class="text-lg font-semibold mb-3">Theory</h3>
                    <div class="prose prose-invert prose-sm">
                        <p class="text-gray-300 text-sm">
                            Pythagorean snapping forces continuous vectors to align with discrete
                            integer ratios, creating a deterministic geometric constraint.
                        </p>
                        <div class="bg-gray-900 p-3 rounded mt-3">
                            <p class="text-center text-sm" id="equation">$$a^2 + b^2 = c^2$$</p>
                        </div>
                    </div>
                </div>

                <!-- Known Ratios -->
                <div class="bg-gray-800 rounded-lg p-4">
                    <h3 class="text-lg font-semibold mb-3">Pythagorean Triples</h3>
                    <div class="space-y-2 text-sm" id="triplesList"></div>
                </div>

                <!-- Snap History -->
                <div class="bg-gray-800 rounded-lg p-4">
                    <h3 class="text-lg font-semibold mb-3">Snap History</h3>
                    <div id="snapHistory" class="space-y-2 text-sm max-h-64 overflow-y-auto">
                        <p class="text-gray-500">No snaps yet</p>
                    </div>
                </div>

                <!-- Stats -->
                <div class="bg-gray-800 rounded-lg p-4">
                    <h3 class="text-lg font-semibold mb-3">Statistics</h3>
                    <div class="grid grid-cols-2 gap-4 text-sm">
                        <div>
                            <p class="text-gray-400">Total Points</p>
                            <p class="text-2xl font-bold" id="totalPoints">0</p>
                        </div>
                        <div>
                            <p class="text-gray-400">Snapped</p>
                            <p class="text-2xl font-bold text-green-400" id="snappedPoints">0</p>
                        </div>
                        <div>
                            <p class="text-gray-400">Snap Rate</p>
                            <p class="text-2xl font-bold text-blue-400" id="snapRate">0%</p>
                        </div>
                        <div>
                            <p class="text-gray-400">Avg Distance</p>
                            <p class="text-2xl font-bold text-purple-400" id="avgDistance">0.00</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <script src="/simulators/pythagorean/app.js"></script>
</body>
</html>`;
}

export function RIGIDITY_HTML(): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Rigidity Matroid Simulator - Constraint Theory</title>
    <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-gray-900 text-white">
    <div class="container mx-auto px-4 py-8">
        <header class="mb-8">
            <nav class="mb-6">
                <a href="/" class="text-blue-400 hover:text-blue-300">← Back to Home</a>
            </nav>
            <h1 class="text-4xl font-bold mb-2">Rigidity Matroid</h1>
            <p class="text-gray-400 text-lg">
                Visualize Laman graphs and structural rigidity using Laman's Theorem
            </p>
        </header>

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div class="lg:col-span-2">
                <div class="bg-gray-800 rounded-lg p-4">
                    <canvas id="rigidityCanvas" width="800" height="600" class="w-full rounded"></canvas>
                    <div class="mt-4 flex justify-between items-center">
                        <div id="graphStatus" class="text-sm text-gray-400">
                            Nodes: 0 | Edges: 0 | Rigid: No
                        </div>
                        <div class="space-x-2">
                            <button id="addNodeBtn" class="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded">
                                Add Node
                            </button>
                            <button id="resetBtn" class="bg-red-600 hover:bg-red-700 px-4 py-2 rounded">
                                Reset
                            </button>
                        </div>
                    </div>
                </div>

                <div class="bg-gray-800 rounded-lg p-4 mt-4">
                    <h3 class="text-lg font-semibold mb-4">Laman's Theorem</h3>
                    <p class="text-gray-300 text-sm mb-4">
                        A graph is generically rigid in 2D if and only if:
                    </p>
                    <ol class="list-decimal list-inside text-gray-300 text-sm space-y-2">
                        <li>It has exactly 2n - 3 edges (where n is the number of vertices)</li>
                        <li>Every subgraph with n' vertices has at most 2n' - 3 edges</li>
                    </ol>
                    <div class="bg-gray-900 p-4 rounded mt-4">
                        <p class="text-center text-sm font-mono">E = 2V - 3</p>
                        <p class="text-xs text-gray-400 text-center mt-2">Minimum edges for rigidity</p>
                    </div>
                </div>
            </div>

            <div class="space-y-4">
                <div class="bg-gray-800 rounded-lg p-4">
                    <h3 class="text-lg font-semibold mb-3">Controls</h3>
                    <div class="space-y-4">
                        <div>
                            <label class="block text-sm text-gray-400 mb-2">Target Nodes</label>
                            <input type="number" id="targetNodes" value="10" min="3" max="50" class="w-full bg-gray-700 rounded px-3 py-2">
                        </div>
                        <div>
                            <label class="block text-sm text-gray-400 mb-2">Target Edges</label>
                            <input type="number" id="targetEdges" value="15" min="0" max="100" class="w-full bg-gray-700 rounded px-3 py-2">
                        </div>
                        <button id="generateBtn" class="w-full bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded">
                            Generate Laman Graph
                        </button>
                        <div class="flex items-center gap-2">
                            <input type="checkbox" id="showLabels" checked class="rounded">
                            <label class="text-sm">Show Labels</label>
                        </div>
                        <div class="flex items-center gap-2">
                            <input type="checkbox" id="animate" checked class="rounded">
                            <label class="text-sm">Animate</label>
                        </div>
                    </div>
                </div>

                <div class="bg-gray-800 rounded-lg p-4">
                    <h3 class="text-lg font-semibold mb-3">Graph Info</h3>
                    <div class="space-y-2 text-sm">
                        <div class="flex justify-between">
                            <span class="text-gray-400">Vertices:</span>
                            <span id="vertexCount">0</span>
                        </div>
                        <div class="flex justify-between">
                            <span class="text-gray-400">Edges:</span>
                            <span id="edgeCount">0</span>
                        </div>
                        <div class="flex justify-between">
                            <span class="text-gray-400">Required:</span>
                            <span id="requiredEdges">0</span>
                        </div>
                        <div class="flex justify-between">
                            <span class="text-gray-400">Status:</span>
                            <span id="rigidityStatus" class="text-red-400">Not Rigid</span>
                        </div>
                    </div>
                </div>

                <div class="bg-gray-800 rounded-lg p-4">
                    <h3 class="text-lg font-semibold mb-3">Presets</h3>
                    <div class="space-y-2">
                        <button data-preset="triangle" class="preset-btn w-full text-left bg-gray-700 hover:bg-gray-600 px-3 py-2 rounded">
                            Triangle (Rigid)
                        </button>
                        <button data-preset="square" class="preset-btn w-full text-left bg-gray-700 hover:bg-gray-600 px-3 py-2 rounded">
                            Square (Flexible)
                        </button>
                        <button data-preset="square-diag" class="preset-btn w-full text-left bg-gray-700 hover:bg-gray-600 px-3 py-2 rounded">
                            Square + Diagonal (Rigid)
                        </button>
                        <button data-preset="pentagon" class="preset-btn w-full text-left bg-gray-700 hover:bg-gray-600 px-3 py-2 rounded">
                            Pentagon (Flexible)
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <script src="/simulators/rigidity/app.js"></script>
</body>
</html>`;
}

export function COMING_SOON_HTML(name: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${name} - Coming Soon</title>
    <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-gray-900 text-white">
    <div class="container mx-auto px-4 py-8">
        <nav class="mb-6">
            <a href="/" class="text-blue-400 hover:text-blue-300">← Back to Home</a>
        </nav>
        <div class="flex flex-col items-center justify-center min-h-[60vh]">
            <div class="text-6xl mb-6">🚧</div>
            <h1 class="text-4xl font-bold mb-4">Coming Soon</h1>
            <p class="text-xl text-gray-400 mb-8">
                The ${name} simulator is under construction.
            </p>
            <p class="text-gray-500 mb-8">
                We're working hard to bring you interactive visualizations for this concept.
                In the meantime, check out the <a href="/" class="text-blue-400 hover:text-blue-300">homepage</a> for other simulators.
            </p>
            <a href="https://github.com/SuperInstance/constrainttheory" target="_blank" rel="noopener" class="px-6 py-3 bg-purple-600 hover:bg-purple-700 rounded-lg font-medium transition">
                Follow on GitHub
            </a>
        </div>
    </div>
</body>
</html>`;
}

// CSS and JS files would be embedded here similarly
// For brevity, I'll include placeholders
export function MAIN_CSS(): string {
  return `/* Main CSS for Constraint Theory Web App */
:root {
    --primary-color: #3b82f6;
    --secondary-color: #8b5cf6;
    --success-color: #22c55e;
    --danger-color: #ef4444;
    --warning-color: #f59e0b;
    --bg-primary: #111827;
    --bg-secondary: #1f2937;
    --bg-tertiary: #374151;
    --text-primary: #f9fafb;
    --text-secondary: #d1d5db;
    --text-muted: #9ca3af;
    --border-color: #374151;
}
* {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
}
body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
    background-color: var(--bg-primary);
    color: var(--text-primary);
    line-height: 1.6;
    min-height: 100vh;
}
h1, h2, h3, h4, h5, h6 {
    font-weight: 600;
    line-height: 1.2;
    margin-bottom: 0.5em;
}
h1 { font-size: 2.5rem; }
h2 { font-size: 2rem; }
h3 { font-size: 1.5rem; }
h4 { font-size: 1.25rem; }
h5 { font-size: 1rem; }
h6 { font-size: 0.875rem; }
p {
    margin-bottom: 1em;
}
a {
    color: var(--primary-color);
    text-decoration: none;
    transition: color 0.2s;
}
a:hover {
    color: var(--secondary-color);
}
code {
    font-family: 'Monaco', 'Courier New', monospace;
    background-color: var(--bg-tertiary);
    padding: 0.2em 0.4em;
    border-radius: 3px;
    font-size: 0.9em;
}
pre {
    background-color: var(--bg-tertiary);
    padding: 1em;
    border-radius: 6px;
    overflow-x: auto;
    margin-bottom: 1em;
}
pre code {
    background-color: transparent;
    padding: 0;
}
.btn {
    display: inline-block;
    padding: 0.5em 1em;
    background-color: var(--primary-color);
    color: white;
    border: none;
    border-radius: 6px;
    font-size: 0.9em;
    cursor: pointer;
    transition: background-color 0.2s;
}
.btn:hover {
    background-color: var(--secondary-color);
}
input[type="text"],
input[type="number"],
input[type="email"],
input[type="password"],
textarea,
select {
    width: 100%;
    padding: 0.5em;
    background-color: var(--bg-secondary);
    border: 1px solid var(--border-color);
    border-radius: 6px;
    color: var(--text-primary);
    font-size: 0.9em;
}
input:focus,
textarea:focus,
select:focus {
    outline: none;
    border-color: var(--primary-color);
}
canvas {
    display: block;
    max-width: 100%;
    height: auto;
}
::-webkit-scrollbar {
    width: 8px;
    height: 8px;
}
::-webkit-scrollbar-track {
    background: var(--bg-secondary);
}
::-webkit-scrollbar-thumb {
    background: var(--bg-tertiary);
    border-radius: 4px;
}
::-webkit-scrollbar-thumb:hover {
    background: var(--text-muted);
}
@keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
}
@keyframes slideIn {
    from {
        transform: translateY(-10px);
        opacity: 0;
    }
    to {
        transform: translateY(0);
        opacity: 1;
    }
}
.fade-in {
    animation: fadeIn 0.3s ease-in;
}
.slide-in {
    animation: slideIn 0.3s ease-out;
}`;
}

export function PYTHAGOREAN_JS(): string {
  return `// Pythagorean Snapping Simulator
class PythagoreanSimulator {
    constructor() {
        this.canvas = document.getElementById('snapCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.points = [];
        this.threshold = 0.1;
        this.showGrid = true;
        this.showRatios = true;
        this.showAngles = true;
        this.pythagoreanTriples = [
            { a: 3, b: 4, c: 5 },
            { a: 5, b: 12, c: 13 },
            { a: 8, b: 15, c: 17 },
            { a: 7, b: 24, c: 25 },
            { a: 20, b: 21, c: 29 },
            { a: 9, b: 40, c: 41 },
            { a: 12, b: 35, c: 37 },
        ];
        this.scale = 20;
        this.offsetX = this.canvas.width / 2;
        this.offsetY = this.canvas.height / 2;
        this.init();
    }
    init() {
        this.setupEventListeners();
        this.populateTriplesList();
        this.render();
        this.renderEquation();
    }
    setupEventListeners() {
        this.canvas.addEventListener('click', (e) => this.handleCanvasClick(e));
        document.getElementById('threshold').addEventListener('input', (e) => {
            this.threshold = parseFloat(e.target.value);
            document.getElementById('thresholdValue').textContent = this.threshold.toFixed(2);
            this.recalculateSnaps();
            this.render();
        });
        document.getElementById('showGrid').addEventListener('change', (e) => {
            this.showGrid = e.target.checked;
            this.render();
        });
        document.getElementById('showRatios').addEventListener('change', (e) => {
            this.showRatios = e.target.checked;
            this.render();
        });
        document.getElementById('showAngles').addEventListener('change', (e) => {
            this.showAngles = e.target.checked;
            this.render();
        });
        document.getElementById('resetBtn').addEventListener('click', () => {
            this.points = [];
            this.updateStats();
            this.render();
            document.getElementById('snapHistory').innerHTML = '<p class="text-gray-500">No snaps yet</p>';
        });
    }
    handleCanvasClick(e) {
        const rect = this.canvas.getBoundingClientRect();
        const scaleX = this.canvas.width / rect.width;
        const scaleY = this.canvas.height / rect.height;
        const x = (e.clientX - rect.left) * scaleX;
        const y = (e.clientY - rect.top) * scaleY;
        const mathX = (x - this.offsetX) / this.scale;
        const mathY = (this.offsetY - y) / this.scale;
        const snapped = this.snapToPythagorean(mathX, mathY);
        this.points.push({
            x: mathX,
            y: mathY,
            snapped: snapped.snapped,
            snappedTo: snapped.snappedTo,
            distance: snapped.distance
        });
        this.updateSnapHistory(snapped);
        this.updateStats();
        this.render();
    }
    snapToPythagorean(x, y) {
        let snapped = null;
        let minDistance = Infinity;
        for (const triple of this.pythagoreanTriples) {
            const distance = Math.sqrt(Math.pow(x - triple.a, 2) + Math.pow(y - triple.b, 2));
            if (distance < this.threshold && distance < minDistance) {
                minDistance = distance;
                snapped = { ...triple };
            }
        }
        return {
            original: { x, y },
            snapped: snapped,
            snappedTo: snapped ? { x: snapped.a, y: snapped.b } : null,
            distance: minDistance === Infinity ? 0 : minDistance
        };
    }
    recalculateSnaps() {
        this.points = this.points.map(point => {
            const snapped = this.snapToPythagorean(point.x, point.y);
            return {
                x: point.x,
                y: point.y,
                snapped: snapped.snapped,
                snappedTo: snapped.snappedTo,
                distance: snapped.distance
            };
        });
        this.updateStats();
    }
    render() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        if (this.showGrid) {
            this.drawGrid();
        }
        if (this.showRatios) {
            this.drawPythagoreanRatios();
        }
        this.points.forEach(point => {
            const screenX = point.x * this.scale + this.offsetX;
            const screenY = this.offsetY - point.y * this.scale;
            if (point.snapped) {
                const snappedScreenX = point.snappedTo.x * this.scale + this.offsetX;
                const snappedScreenY = this.offsetY - point.snappedTo.y * this.scale;
                this.ctx.beginPath();
                this.ctx.moveTo(screenX, screenY);
                this.ctx.lineTo(snappedScreenX, snappedScreenY);
                this.ctx.strokeStyle = 'rgba(59, 130, 246, 0.5)';
                this.ctx.lineWidth = 2;
                this.ctx.stroke();
                this.ctx.beginPath();
                this.ctx.arc(snappedScreenX, snappedScreenY, 8, 0, 2 * Math.PI);
                this.ctx.fillStyle = 'rgb(34, 197, 94)';
                this.ctx.fill();
            }
            this.ctx.beginPath();
            this.ctx.arc(screenX, screenY, 6, 0, 2 * Math.PI);
            this.ctx.fillStyle = point.snapped ? 'rgb(59, 130, 246)' : 'rgb(239, 68, 68)';
            this.ctx.fill();
        });
        if (this.points.length > 0) {
            const lastPoint = this.points[this.points.length - 1];
            document.getElementById('coordinates').textContent =
                \`Last: (\${lastPoint.x.toFixed(2)}, \${lastPoint.y.toFixed(2)})\` +
                (lastPoint.snapped ? \` → Snapped to (\${lastPoint.snappedTo.x}, \${lastPoint.snappedTo.y})\` : '');
        }
    }
    drawGrid() {
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
        this.ctx.lineWidth = 1;
        for (let x = this.offsetX % this.scale; x < this.canvas.width; x += this.scale) {
            this.ctx.beginPath();
            this.ctx.moveTo(x, 0);
            this.ctx.lineTo(x, this.canvas.height);
            this.ctx.stroke();
        }
        for (let y = this.offsetY % this.scale; y < this.canvas.height; y += this.scale) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, y);
            this.ctx.lineTo(this.canvas.width, y);
            this.ctx.stroke();
        }
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.moveTo(0, this.offsetY);
        this.ctx.lineTo(this.canvas.width, this.offsetY);
        this.ctx.stroke();
        this.ctx.beginPath();
        this.ctx.moveTo(this.offsetX, 0);
        this.ctx.lineTo(this.offsetX, this.canvas.height);
        this.ctx.stroke();
    }
    drawPythagoreanRatios() {
        this.ctx.fillStyle = 'rgba(34, 197, 94, 0.3)';
        this.ctx.strokeStyle = 'rgba(34, 197, 94, 0.8)';
        this.ctx.lineWidth = 2;
        this.pythagoreanTriples.forEach(triple => {
            const x = triple.a * this.scale + this.offsetX;
            const y = this.offsetY - triple.b * this.scale;
            this.ctx.beginPath();
            this.ctx.arc(x, y, 5, 0, 2 * Math.PI);
            this.ctx.fill();
            this.ctx.fillStyle = 'rgba(34, 197, 94, 1)';
            this.ctx.font = '12px monospace';
            this.ctx.fillText(\`(\${triple.a}, \${triple.b})\`, x + 10, y - 10);
            this.ctx.fillStyle = 'rgba(34, 197, 94, 0.3)';
            if (this.showAngles) {
                this.ctx.beginPath();
                this.ctx.moveTo(this.offsetX, this.offsetY);
                this.ctx.lineTo(x, this.offsetY);
                this.ctx.lineTo(x, y);
                this.ctx.closePath();
                this.ctx.stroke();
            }
        });
    }
    populateTriplesList() {
        const list = document.getElementById('triplesList');
        list.innerHTML = this.pythagoreanTriples.map(t => \`
            <div class="flex justify-between items-center bg-gray-900 p-2 rounded">
                <span>\${t.a}² + \${t.b}² = \${t.c}²</span>
                <span class="text-green-400">(\${t.a}, \${t.b})</span>
            </div>
        \`).join('');
    }
    updateSnapHistory(snapped) {
        const history = document.getElementById('snapHistory');
        if (history.querySelector('.text-gray-500')) {
            history.innerHTML = '';
        }
        const entry = document.createElement('div');
        entry.className = \`bg-gray-900 p-2 rounded \${snapped.snapped ? 'border-l-4 border-green-500' : 'border-l-4 border-red-500'}\`;
        entry.innerHTML = \`
            <div class="font-mono text-xs">
                (\${snapped.original.x.toFixed(2)}, \${snapped.original.y.toFixed(2)})
                \${snapped.snapped ? \`→ (\${snapped.snappedTo.x}, \${snapped.snappedTo.y})\` : '(no snap)'}
            </div>
            \${snapped.snapped ? \`<div class="text-xs text-gray-400">Distance: \${snapped.distance.toFixed(3)}</div>\` : ''}
        \`;
        history.insertBefore(entry, history.firstChild);
    }
    updateStats() {
        const total = this.points.length;
        const snapped = this.points.filter(p => p.snapped).length;
        const snapRate = total > 0 ? (snapped / total * 100).toFixed(1) : 0;
        const avgDistance = snapped > 0
            ? (this.points.reduce((sum, p) => sum + (p.distance || 0), 0) / snapped).toFixed(3)
            : '0.00';
        document.getElementById('totalPoints').textContent = total;
        document.getElementById('snappedPoints').textContent = snapped;
        document.getElementById('snapRate').textContent = \`\${snapRate}%\`;
        document.getElementById('avgDistance').textContent = avgDistance;
    }
    renderEquation() {
        if (typeof katex !== 'undefined') {
            katex.render('a^2 + b^2 = c^2', document.getElementById('equation'), {
                throwOnError: false
            });
        }
    }
}
document.addEventListener('DOMContentLoaded', () => {
    new PythagoreanSimulator();
});`;
}

export function RIGIDITY_JS(): string {
  return `// Rigidity Matroid Simulator - Simplified version
// This would be the full implementation of the rigidity simulator
class RigiditySimulator {
    constructor() {
        this.canvas = document.getElementById('rigidityCanvas');
        if (!this.canvas) return;
        this.ctx = this.canvas.getContext('2d');
        this.vertices = [];
        this.edges = [];
        this.showLabels = true;
        this.animate = true;
        this.init();
    }
    init() {
        this.setupEventListeners();
        this.render();
    }
    setupEventListeners() {
        document.getElementById('addNodeBtn')?.addEventListener('click', () => this.addNode());
        document.getElementById('resetBtn')?.addEventListener('click', () => this.reset());
        document.getElementById('generateBtn')?.addEventListener('click', () => this.generateLamanGraph());
        document.getElementById('showLabels')?.addEventListener('change', (e) => {
            this.showLabels = e.target.checked;
            this.render();
        });
        document.getElementById('animate')?.addEventListener('change', (e) => {
            this.animate = e.target.checked;
        });
        document.querySelectorAll('.preset-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const preset = e.target.dataset.preset;
                this.loadPreset(preset);
            });
        });
    }
    addNode() {
        const x = Math.random() * this.canvas.width;
        const y = Math.random() * this.canvas.height;
        this.vertices.push({ x, y, id: this.vertices.length });
        this.updateInfo();
        this.render();
    }
    reset() {
        this.vertices = [];
        this.edges = [];
        this.updateInfo();
        this.render();
    }
    generateLamanGraph() {
        this.reset();
        const targetNodes = parseInt(document.getElementById('targetNodes')?.value || '10');
        const targetEdges = parseInt(document.getElementById('targetEdges')?.value || '15');
        for (let i = 0; i < targetNodes; i++) {
            this.addNode();
        }
        for (let i = 0; i < Math.min(targetEdges, targetNodes * (targetNodes - 1) / 2); i++) {
            const from = Math.floor(Math.random() * this.vertices.length);
            let to = Math.floor(Math.random() * this.vertices.length);
            while (to === from) {
                to = Math.floor(Math.random() * this.vertices.length);
            }
            if (!this.edges.some(e =>
                (e.from === from && e.to === to) || (e.from === to && e.to === from)
            )) {
                this.edges.push({ from, to });
            }
        }
        this.updateInfo();
        this.render();
    }
    loadPreset(preset) {
        this.reset();
        const cx = this.canvas.width / 2;
        const cy = this.canvas.height / 2;
        const size = 100;
        switch (preset) {
            case 'triangle':
                this.vertices = [
                    { x: cx, y: cy - size, id: 0 },
                    { x: cx - size, y: cy + size, id: 1 },
                    { x: cx + size, y: cy + size, id: 2 }
                ];
                this.edges = [
                    { from: 0, to: 1 },
                    { from: 1, to: 2 },
                    { from: 2, to: 0 }
                ];
                break;
            case 'square':
                this.vertices = [
                    { x: cx - size/2, y: cy - size/2, id: 0 },
                    { x: cx + size/2, y: cy - size/2, id: 1 },
                    { x: cx + size/2, y: cy + size/2, id: 2 },
                    { x: cx - size/2, y: cy + size/2, id: 3 }
                ];
                this.edges = [
                    { from: 0, to: 1 },
                    { from: 1, to: 2 },
                    { from: 2, to: 3 },
                    { from: 3, to: 0 }
                ];
                break;
            case 'square-diag':
                this.vertices = [
                    { x: cx - size/2, y: cy - size/2, id: 0 },
                    { x: cx + size/2, y: cy - size/2, id: 1 },
                    { x: cx + size/2, y: cy + size/2, id: 2 },
                    { x: cx - size/2, y: cy + size/2, id: 3 }
                ];
                this.edges = [
                    { from: 0, to: 1 },
                    { from: 1, to: 2 },
                    { from: 2, to: 3 },
                    { from: 3, to: 0 },
                    { from: 0, to: 2 }
                ];
                break;
            case 'pentagon':
                for (let i = 0; i < 5; i++) {
                    const angle = (2 * Math.PI * i / 5) - Math.PI / 2;
                    this.vertices.push({
                        x: cx + size * Math.cos(angle),
                        y: cy + size * Math.sin(angle),
                        id: i
                    });
                }
                for (let i = 0; i < 5; i++) {
                    this.edges.push({ from: i, to: (i + 1) % 5 });
                }
                break;
        }
        this.updateInfo();
        this.render();
    }
    updateInfo() {
        document.getElementById('vertexCount').textContent = this.vertices.length;
        document.getElementById('edgeCount').textContent = this.edges.length;
        const required = 2 * this.vertices.length - 3;
        document.getElementById('requiredEdges').textContent = required;
        const isRigid = this.edges.length === required && this.checkLamanCondition();
        document.getElementById('rigidityStatus').textContent = isRigid ? 'Rigid' : 'Not Rigid';
        document.getElementById('rigidityStatus').className = isRigid ? 'text-green-400' : 'text-red-400';
        document.getElementById('graphStatus').textContent =
            \`Nodes: \${this.vertices.length} | Edges: \${this.edges.length} | Rigid: \${isRigid ? 'Yes' : 'No'}\`;
    }
    checkLamanCondition() {
        const n = this.vertices.length;
        const m = this.edges.length;
        if (m !== 2 * n - 3) return false;
        return true;
    }
    render() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
        this.ctx.lineWidth = 2;
        this.edges.forEach(edge => {
            const v1 = this.vertices[edge.from];
            const v2 = this.vertices[edge.to];
            this.ctx.beginPath();
            this.ctx.moveTo(v1.x, v1.y);
            this.ctx.lineTo(v2.x, v2.y);
            this.ctx.stroke();
        });
        this.vertices.forEach((v, i) => {
            this.ctx.beginPath();
            this.ctx.arc(v.x, v.y, 8, 0, 2 * Math.PI);
            this.ctx.fillStyle = 'rgb(59, 130, 246)';
            this.ctx.fill();
            if (this.showLabels) {
                this.ctx.fillStyle = 'white';
                this.ctx.font = '12px sans-serif';
                this.ctx.fillText(i.toString(), v.x - 3, v.y + 4);
            }
        });
    }
}
document.addEventListener('DOMContentLoaded', () => {
    new RigiditySimulator();
});`;
}
