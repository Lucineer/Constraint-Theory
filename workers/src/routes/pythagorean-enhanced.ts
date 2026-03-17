export function PYTHAGOREAN_ENHANCED_HTML(): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Pythagorean Snapping 3D - Constraint Theory</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap');

        body {
            font-family: 'Inter', sans-serif;
            background: linear-gradient(135deg, #0f0f23 0%, #1a1a2e 50%, #16213e 100%);
        }

        .code-font {
            font-family: 'JetBrains Mono', monospace;
        }

        .glass-panel {
            background: rgba(255, 255, 255, 0.05);
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .glow-text {
            text-shadow: 0 0 20px rgba(99, 102, 241, 0.5);
        }

        .code-block {
            background: linear-gradient(135deg, #1e1e3f 0%, #2d2d5a 100%);
            border: 1px solid rgba(99, 102, 241, 0.3);
            box-shadow: 0 4px 20px rgba(99, 102, 241, 0.1);
        }

        .metric-card {
            background: linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(139, 92, 246, 0.1) 100%);
            border: 1px solid rgba(99, 102, 241, 0.2);
        }

        .precision-exact {
            color: #22c55e;
            text-shadow: 0 0 10px rgba(34, 197, 94, 0.5);
        }

        .precision-approx {
            color: #ef4444;
            text-shadow: 0 0 10px rgba(239, 68, 68, 0.5);
        }

        #canvas-container {
            position: relative;
            width: 100%;
            height: 600px;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 8px 32px rgba(99, 102, 241, 0.3);
        }

        .slider-container input[type="range"] {
            -webkit-appearance: none;
            width: 100%;
            height: 6px;
            border-radius: 3px;
            background: linear-gradient(90deg, #6366f1 0%, #8b5cf6 100%);
            outline: none;
        }

        .slider-container input[type="range"]::-webkit-slider-thumb {
            -webkit-appearance: none;
            appearance: none;
            width: 18px;
            height: 18px;
            border-radius: 50%;
            background: white;
            cursor: pointer;
            box-shadow: 0 2px 8px rgba(99, 102, 241, 0.5);
        }

        @keyframes float {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-10px); }
        }

        .float-animation {
            animation: float 3s ease-in-out infinite;
        }
    </style>
</head>
<body class="text-white min-h-screen">
    <div class="container mx-auto px-4 py-8">
        <!-- Header -->
        <header class="mb-8">
            <nav class="mb-6">
                <a href="/" class="text-indigo-400 hover:text-indigo-300 transition flex items-center gap-2">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
                    </svg>
                    Back to Home
                </a>
            </nav>
            <div class="flex items-center justify-between">
                <div>
                    <h1 class="text-5xl font-bold mb-2 bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent glow-text">
                        Pythagorean Snapping 3D
                    </h1>
                    <p class="text-gray-400 text-lg">
                        Experience deterministic geometric alignment with real-time 3D visualization
                    </p>
                </div>
                <div class="float-animation">
                    <div class="text-6xl">📐</div>
                </div>
            </div>
        </header>
        <!-- Main content continues in next file segment -->
        <div id="main-content"></div>
    </div>
</body>
</html>`;
}
