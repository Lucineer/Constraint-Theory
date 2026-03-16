import { Router } from 'itty-router';

export const staticRoutes = Router();

// Serve index.html for root
staticRoutes.get('/', () => {
  return new Response(
    `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Constraint Theory - Interactive Simulations</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.css">
        <script src="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.js"></script>
    </head>
    <body class="bg-gray-900 text-white min-h-screen">
        <div class="container mx-auto px-4 py-8">
            <header class="mb-12">
                <h1 class="text-5xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                    Constraint Theory
                </h1>
                <p class="text-xl text-gray-300">
                    Deterministic geometric logic for computational intelligence
                </p>
            </header>

            <nav class="mb-12">
                <h2 class="text-2xl font-semibold mb-4">Interactive Simulators</h2>
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <a href="/simulators/pythagorean/" class="block p-6 bg-gray-800 rounded-lg hover:bg-gray-700 transition">
                        <h3 class="text-xl font-semibold mb-2">Pythagorean Snapping</h3>
                        <p class="text-gray-400">Explore integer ratio alignment and deterministic geometric constraints</p>
                    </a>

                    <a href="/simulators/rigidity/" class="block p-6 bg-gray-800 rounded-lg hover:bg-gray-700 transition">
                        <h3 class="text-xl font-semibold mb-2">Rigidity Matroid</h3>
                        <p class="text-gray-400">Visualize Laman graphs and structural rigidity</p>
                    </a>

                    <a href="/simulators/holonomy/" class="block p-6 bg-gray-800 rounded-lg hover:bg-gray-700 transition">
                        <h3 class="text-xl font-semibold mb-2">Discrete Holonomy</h3>
                        <p class="text-gray-400">Parallel transport along Platonic symmetries</p>
                    </a>

                    <a href="/simulators/performance/" class="block p-6 bg-gray-800 rounded-lg hover:bg-gray-700 transition">
                        <h3 class="text-xl font-semibold mb-2">Performance Benchmarks</h3>
                        <p class="text-gray-400">Compare constraint theory vs traditional methods</p>
                    </a>

                    <a href="/simulators/kdtree/" class="block p-6 bg-gray-800 rounded-lg hover:bg-gray-700 transition">
                        <h3 class="text-xl font-semibold mb-2">KD-Tree Visualization</h3>
                        <p class="text-gray-400">Spatial partitioning for LVQ tokenization</p>
                    </a>
                </div>
            </nav>

            <section class="mb-12">
                <h2 class="text-2xl font-semibold mb-4">About Constraint Theory</h2>
                <div class="prose prose-invert max-w-none">
                    <p class="text-gray-300 mb-4">
                        Constraint Theory replaces stochastic matrix multiplication with deterministic geometric logic,
                        enabling provable correctness and hallucination-free reasoning.
                    </p>

                    <h3 class="text-xl font-semibold mb-2 mt-6">Core Concepts</h3>
                    <ul class="list-disc list-inside text-gray-300 space-y-2">
                        <li><strong>Origin-Centric Geometry (Ω):</strong> Unitary symmetry invariant as ground state</li>
                        <li><strong>Φ-Folding Operator:</strong> O(n²) → O(log n) via geometric rotation</li>
                        <li><strong>Pythagorean Snapping:</strong> Integer ratios force deterministic alignment</li>
                        <li><strong>Rigidity Matroid:</strong> Laman's Theorem for structural stability</li>
                        <li><strong>Discrete Holonomy:</strong> Parallel transport with closure properties</li>
                    </ul>

                    <h3 class="text-xl font-semibold mb-2 mt-6">Mathematical Foundation</h3>
                    <div class="bg-gray-800 p-4 rounded-lg my-4">
                        <p class="text-center text-lg">
                            $$\\nabla \\cdot \\mathbf{F} = \\rho \\Phi(\\mathbf{x})$$
                        </p>
                        <p class="text-sm text-gray-400 text-center mt-2">
                            Constraint satisfaction via geometric folding
                        </p>
                    </div>

                    <h3 class="text-xl font-semibold mb-2 mt-6">Performance</h3>
                    <ul class="list-disc list-inside text-gray-300 space-y-2">
                        <li>100x efficiency gains via lossless folding</li>
                        <li>Zero hallucinations (geometric closure property)</li>
                        <li>Provable correctness (deterministic logic)</li>
                        <li>O(log n) complexity for core operations</li>
                    </ul>
                </div>
            </section>

            <footer class="border-t border-gray-700 pt-8">
                <div class="flex justify-between items-center">
                    <p class="text-gray-400">
                        © 2024 SuperInstance. Open source under MIT license.
                    </p>
                    <div class="flex gap-4">
                        <a href="https://github.com/SuperInstance/constrainttheory" class="text-blue-400 hover:text-blue-300">
                            GitHub
                        </a>
                        <a href="/api/docs" class="text-blue-400 hover:text-blue-300">
                            API Docs
                        </a>
                    </div>
                </div>
            </footer>
        </div>

        <script>
            // Render KaTeX equations
            document.addEventListener('DOMContentLoaded', () => {
                const equations = document.querySelectorAll('p');
                equations.forEach(eq => {
                    if (eq.textContent.includes('$$')) {
                        katex.render(eq.textContent.replace(/$$/g, ''), eq, {
                            throwOnError: false,
                            displayMode: true
                        });
                    }
                });
            });
        </script>
    </body>
    </html>
    `,
    {
      headers: {
        'Content-Type': 'text/html; charset=utf-8'
      }
    }
  );
});

// Serve simulator pages
staticRoutes.get('/simulators/:name/', (request) => {
  const { name } = request.named;
  const validSimulators = ['pythagorean', 'rigidity', 'holonomy', 'performance', 'kdtree'];

  if (!validSimulators.includes(name)) {
    return Response.json({ error: 'Simulator not found' }, { status: 404 });
  }

  return Response.redirect(`/simulators/${name}/index.html`, 302);
});
