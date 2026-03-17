import { Router } from 'itty-router';

export const apiExplorerRoutes = Router();

// API Explorer HTML
const API_EXPLORER_HTML = () => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Constraint Theory API Explorer</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: #333;
      line-height: 1.6;
    }

    .container {
      max-width: 1400px;
      margin: 0 auto;
      padding: 20px;
    }

    header {
      background: rgba(255, 255, 255, 0.95);
      backdrop-filter: blur(10px);
      padding: 30px;
      border-radius: 15px;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
      margin-bottom: 30px;
    }

    h1 {
      font-size: 2.5em;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      margin-bottom: 10px;
    }

    .subtitle {
      color: #666;
      font-size: 1.1em;
    }

    .main-content {
      display: grid;
      grid-template-columns: 350px 1fr;
      gap: 20px;
    }

    .sidebar {
      background: rgba(255, 255, 255, 0.95);
      backdrop-filter: blur(10px);
      padding: 20px;
      border-radius: 15px;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
      height: fit-content;
      position: sticky;
      top: 20px;
    }

    .endpoint-list {
      list-style: none;
    }

    .endpoint-item {
      padding: 15px;
      margin-bottom: 10px;
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.3s ease;
      border: 2px solid transparent;
    }

    .endpoint-item:hover {
      background: #f8f9fa;
      border-color: #667eea;
      transform: translateX(5px);
    }

    .endpoint-item.active {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border-color: #667eea;
    }

    .method {
      display: inline-block;
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 0.8em;
      font-weight: bold;
      margin-right: 8px;
    }

    .method.get { background: #10b981; color: white; }
    .method.post { background: #3b82f6; color: white; }
    .method.put { background: #f59e0b; color: white; }
    .method.delete { background: #ef4444; color: white; }

    .endpoint-path {
      font-family: 'Courier New', monospace;
      font-size: 0.9em;
    }

    .explorer-area {
      background: rgba(255, 255, 255, 0.95);
      backdrop-filter: blur(10px);
      padding: 30px;
      border-radius: 15px;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
    }

    .endpoint-details {
      display: none;
    }

    .endpoint-details.active {
      display: block;
    }

    .endpoint-title {
      font-size: 2em;
      margin-bottom: 10px;
      color: #667eea;
    }

    .endpoint-description {
      color: #666;
      margin-bottom: 20px;
      font-size: 1.1em;
    }

    .section {
      margin-bottom: 30px;
    }

    .section-title {
      font-size: 1.3em;
      margin-bottom: 15px;
      color: #333;
      display: flex;
      align-items: center;
    }

    .section-title::before {
      content: '';
      display: inline-block;
      width: 4px;
      height: 20px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      margin-right: 10px;
    }

    .code-block {
      background: #1e1e1e;
      color: #d4d4d4;
      padding: 20px;
      border-radius: 8px;
      overflow-x: auto;
      font-family: 'Courier New', monospace;
      font-size: 0.9em;
      line-height: 1.5;
      margin-bottom: 15px;
    }

    .code-block .keyword { color: #569cd6; }
    .code-block .string { color: #ce9178; }
    .code-block .number { color: #b5cea8; }
    .code-block .comment { color: #6a9955; }
    .code-block .property { color: #9cdcfe; }

    .try-it-out {
      background: #f8f9fa;
      padding: 20px;
      border-radius: 8px;
      margin-bottom: 20px;
    }

    .input-group {
      margin-bottom: 15px;
    }

    .input-group label {
      display: block;
      margin-bottom: 5px;
      font-weight: 600;
      color: #333;
    }

    .input-group input,
    .input-group textarea,
    .input-group select {
      width: 100%;
      padding: 10px;
      border: 2px solid #e0e0e0;
      border-radius: 6px;
      font-size: 0.95em;
      transition: border-color 0.3s ease;
    }

    .input-group input:focus,
    .input-group textarea:focus,
    .input-group select:focus {
      outline: none;
      border-color: #667eea;
    }

    .btn {
      padding: 12px 24px;
      border: none;
      border-radius: 6px;
      font-size: 1em;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
      display: inline-block;
    }

    .btn-primary {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
    }

    .btn-primary:hover {
      transform: translateY(-2px);
      box-shadow: 0 5px 15px rgba(102, 126, 234, 0.4);
    }

    .btn-secondary {
      background: #e0e0e0;
      color: #333;
      margin-left: 10px;
    }

    .btn-secondary:hover {
      background: #d0d0d0;
    }

    .response-area {
      margin-top: 20px;
      display: none;
    }

    .response-area.show {
      display: block;
    }

    .response-status {
      padding: 10px 15px;
      border-radius: 6px;
      margin-bottom: 15px;
      font-weight: 600;
    }

    .response-status.success {
      background: #d4edda;
      color: #155724;
      border: 1px solid #c3e6cb;
    }

    .response-status.error {
      background: #f8d7da;
      color: #721c24;
      border: 1px solid #f5c6cb;
    }

    .response-body {
      background: #1e1e1e;
      color: #d4d4d4;
      padding: 20px;
      border-radius: 8px;
      overflow-x: auto;
      font-family: 'Courier New', monospace;
      font-size: 0.9em;
      max-height: 400px;
      overflow-y: auto;
    }

    .tabs {
      display: flex;
      gap: 10px;
      margin-bottom: 15px;
      border-bottom: 2px solid #e0e0e0;
      padding-bottom: 10px;
    }

    .tab {
      padding: 8px 16px;
      background: none;
      border: none;
      cursor: pointer;
      font-size: 1em;
      font-weight: 600;
      color: #666;
      transition: all 0.3s ease;
      border-bottom: 2px solid transparent;
      margin-bottom: -12px;
    }

    .tab:hover {
      color: #667eea;
    }

    .tab.active {
      color: #667eea;
      border-bottom-color: #667eea;
    }

    .tab-content {
      display: none;
    }

    .tab-content.active {
      display: block;
    }

    .parameter-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 15px;
    }

    .parameter-table th,
    .parameter-table td {
      padding: 12px;
      text-align: left;
      border-bottom: 1px solid #e0e0e0;
    }

    .parameter-table th {
      background: #f8f9fa;
      font-weight: 600;
      color: #333;
    }

    .parameter-table tr:hover {
      background: #f8f9fa;
    }

    .required {
      color: #ef4444;
      font-weight: 600;
    }

    .optional {
      color: #10b981;
    }

    .loading {
      display: inline-block;
      width: 20px;
      height: 20px;
      border: 3px solid rgba(255, 255, 255, 0.3);
      border-radius: 50%;
      border-top-color: white;
      animation: spin 1s ease-in-out infinite;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    .badge {
      display: inline-block;
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 0.8em;
      font-weight: 600;
      margin-left: 10px;
    }

    .badge.stable {
      background: #d4edda;
      color: #155724;
    }

    .badge.experimental {
      background: #fff3cd;
      color: #856404;
    }

    @media (max-width: 1024px) {
      .main-content {
        grid-template-columns: 1fr;
      }

      .sidebar {
        position: relative;
        top: 0;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <header>
      <h1>🚀 Constraint Theory API Explorer</h1>
      <p class="subtitle">Interactive API documentation and testing platform</p>
    </header>

    <div class="main-content">
      <aside class="sidebar">
        <h3 style="margin-bottom: 15px;">Endpoints</h3>
        <ul class="endpoint-list">
          <li class="endpoint-item active" data-endpoint="health">
            <span class="method get">GET</span>
            <span class="endpoint-path">/health</span>
          </li>
          <li class="endpoint-item" data-endpoint="snap">
            <span class="method post">POST</span>
            <span class="endpoint-path">/api/geometry/snap</span>
          </li>
          <li class="endpoint-item" data-endpoint="solve">
            <span class="method post">POST</span>
            <span class="endpoint-path">/api/constraints/solve</span>
          </li>
          <li class="endpoint-item" data-endpoint="validate">
            <span class="method post">POST</span>
            <span class="endpoint-path">/api/constraints/validate</span>
          </li>
          <li class="endpoint-item" data-endpoint="simulators">
            <span class="method get">GET</span>
            <span class="endpoint-path">/api/simulators</span>
          </li>
          <li class="endpoint-item" data-endpoint="transform">
            <span class="method post">POST</span>
            <span class="endpoint-path">/api/geometry/transform</span>
          </li>
          <li class="endpoint-item" data-endpoint="intersect">
            <span class="method post">POST</span>
            <span class="endpoint-path">/api/geometry/intersect</span>
          </li>
          <li class="endpoint-item" data-endpoint="optimize">
            <span class="method post">POST</span>
            <span class="endpoint-path">/api/constraints/optimize</span>
          </li>
        </ul>
      </aside>

      <main class="explorer-area">
        <!-- Health Check Endpoint -->
        <div class="endpoint-details active" data-endpoint="health">
          <h2 class="endpoint-title">Health Check</h2>
          <p class="endpoint-description">Check API health status</p>

          <div class="section">
            <h3 class="section-title">Request</h3>
            <div class="code-block">
              <span class="keyword">GET</span> /health
            </div>
          </div>

          <div class="section">
            <h3 class="section-title">Response</h3>
            <div class="code-block">
{
  <span class="property">"status"</span>: <span class="string">"healthy"</span>,
  <span class="property">"timestamp"</span>: <span class="string">"2026-03-16T10:30:00Z"</span>,
  <span class="property">"version"</span>: <span class="string">"v1"</span>
}
            </div>
          </div>

          <div class="section">
            <h3 class="section-title">Try It Out</h3>
            <div class="try-it-out">
              <button class="btn btn-primary" onclick="tryHealth()">
                Send Request
              </button>
            </div>
            <div class="response-area" id="health-response"></div>
          </div>
        </div>

        <!-- Snap Endpoint -->
        <div class="endpoint-details" data-endpoint="snap">
          <h2 class="endpoint-title">Snap Vector <span class="badge stable">Stable</span></h2>
          <p class="endpoint-description">Snap a 2D vector to the nearest Pythagorean ratio</p>

          <div class="section">
            <h3 class="section-title">Request</h3>
            <div class="code-block">
              <span class="keyword">POST</span> /api/geometry/snap
            </div>
          </div>

          <div class="section">
            <h3 class="section-title">Parameters</h3>
            <table class="parameter-table">
              <thead>
                <tr>
                  <th>Field</th>
                  <th>Type</th>
                  <th>Required</th>
                  <th>Description</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>vector</td>
                  <td>object</td>
                  <td><span class="required">Yes</span></td>
                  <td>2D vector to snap</td>
                </tr>
                <tr>
                  <td>vector.x</td>
                  <td>number</td>
                  <td><span class="required">Yes</span></td>
                  <td>X component</td>
                </tr>
                <tr>
                  <td>vector.y</td>
                  <td>number</td>
                  <td><span class="required">Yes</span></td>
                  <td>Y component</td>
                </tr>
                <tr>
                  <td>threshold</td>
                  <td>number</td>
                  <td><span class="optional">No</span></td>
                  <td>Maximum distance to snap (default: 0.1)</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div class="section">
            <h3 class="section-title">Request Body</h3>
            <div class="code-block">
{
  <span class="property">"vector"</span>: {
    <span class="property">"x"</span>: <span class="number">0.6</span>,
    <span class="property">"y"</span>: <span class="number">0.8</span>
  },
  <span class="property">"threshold"</span>: <span class="number">0.1</span>
}
            </div>
          </div>

          <div class="section">
            <h3 class="section-title">Response</h3>
            <div class="code-block">
{
  <span class="property">"original"</span>: {
    <span class="property">"x"</span>: <span class="number">0.6</span>,
    <span class="property">"y"</span>: <span class="number">0.8</span>
  },
  <span class="property">"snapped"</span>: {
    <span class="property">"x"</span>: <span class="number">0.6</span>,
    <span class="property">"y"</span>: <span class="number">0.8</span>
  },
  <span class="property">"snappedTo"</span>: <span class="string">"pythagorean_ratio"</span>,
  <span class="property">"distance"</span>: <span class="number">0</span>,
  <span class="property">"ratio"</span>: {
    <span class="property">"a"</span>: <span class="number">3</span>,
    <span class="property">"b"</span>: <span class="number">4</span>,
    <span class="property">"c"</span>: <span class="number">5</span>
  }
}
            </div>
          </div>

          <div class="section">
            <h3 class="section-title">Try It Out</h3>
            <div class="try-it-out">
              <div class="input-group">
                <label>X Coordinate:</label>
                <input type="number" id="snap-x" value="0.6" step="0.01">
              </div>
              <div class="input-group">
                <label>Y Coordinate:</label>
                <input type="number" id="snap-y" value="0.8" step="0.01">
              </div>
              <div class="input-group">
                <label>Threshold:</label>
                <input type="number" id="snap-threshold" value="0.1" step="0.01" min="0" max="1">
              </div>
              <button class="btn btn-primary" onclick="trySnap()">
                Snap Vector
              </button>
            </div>
            <div class="response-area" id="snap-response"></div>
          </div>

          <div class="section">
            <h3 class="section-title">Code Examples</h3>
            <div class="tabs">
              <button class="tab active" data-tab="snap-javascript">JavaScript</button>
              <button class="tab" data-tab="snap-python">Python</button>
              <button class="tab" data-tab="snap-curl">cURL</button>
            </div>
            <div class="tab-content active" id="snap-javascript">
              <div class="code-block">
<span class="keyword">const</span> response = <span class="keyword">await</span> fetch(
  <span class="string">'/api/geometry/snap'</span>,
  {
    method: <span class="string">'POST'</span>,
    headers: {
      <span class="string">'Content-Type'</span>: <span class="string">'application/json'</span>
    },
    body: JSON.stringify({
      vector: { x: <span class="number">0.6</span>, y: <span class="number">0.8</span> },
      threshold: <span class="number">0.1</span>
    })
  }
);

<span class="keyword">const</span> result = <span class="keyword">await</span> response.json();
console.log(result.snapped);
              </div>
            </div>
            <div class="tab-content" id="snap-python">
              <div class="code-block">
<span class="keyword">import</span> requests

response = requests.post(
    <span class="string">'/api/geometry/snap'</span>,
    json={
        <span class="string">'vector'</span>: {<span class="string">'x'</span>: <span class="number">0.6</span>, <span class="string">'y'</span>: <span class="number">0.8</span>},
        <span class="string">'threshold'</span>: <span class="number">0.1</span>
    }
)

result = response.json()
print(result[<span class="string">'snapped'</span>])
              </div>
            </div>
            <div class="tab-content" id="snap-curl">
              <div class="code-block">
curl -X POST /api/geometry/snap \\
  -H <span class="string">"Content-Type: application/json"</span> \\
  -d <span class="string>'{
    "vector": {"x": 0.6, "y": 0.8},
    "threshold": 0.1
  }'</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Solve Constraints Endpoint -->
        <div class="endpoint-details" data-endpoint="solve">
          <h2 class="endpoint-title">Solve Constraints <span class="badge stable">Stable</span></h2>
          <p class="endpoint-description">Solve a system of geometric constraints</p>

          <div class="section">
            <h3 class="section-title">Request</h3>
            <div class="code-block">
              <span class="keyword">POST</span> /api/constraints/solve
            </div>
          </div>

          <div class="section">
            <h3 class="section-title">Request Body</h3>
            <div class="code-block">
{
  <span class="property">"constraints"</span>: [
    {
      <span class="property">"id"</span>: <span class="string">"c1"</span>,
      <span class="property">"type"</span>: <span class="string">"distance"</span>,
      <span class="property">"entities"</span>: [<span class="string">"p1"</span>, <span class="string">"p2"</span>],
      <span class="property">"value"</span>: <span class="number">5.0</span>,
      <span class="property">"tolerance"</span>: <span class="number">0.001</span>
    }
  ],
  <span class="property">"entities"</span>: {
    <span class="property">"p1"</span>: {
      <span class="property">"type"</span>: <span class="string">"point"</span>,
      <span class="property">"position"</span>: {<span class="property">"x"</span>: <span class="number">0</span>, <span class="property">"y"</span>: <span class="number">0</span>}
    },
    <span class="property">"p2"</span>: {
      <span class="property">"type"</span>: <span class="string">"point"</span>,
      <span class="property">"position"</span>: {<span class="property">"x"</span>: <span class="number">1</span>, <span class="property">"y"</span>: <span class="number">0</span>}
    }
  },
  <span class="property">"solver"</span>: <span class="string">"geometric"</span>,
  <span class="property">"maxIterations"</span>: <span class="number">1000</span>,
  <span class="property">"convergence"</span>: <span class="number">0.0001</span>
}
            </div>
          </div>

          <div class="section">
            <h3 class="section-title">Response</h3>
            <div class="code-block">
{
  <span class="property">"solved"</span>: <span class="keyword">true</span>,
  <span class="property">"iterations"</span>: <span class="number">42</span>,
  <span class="property">"convergence"</span>: <span class="number">0.00001</span>,
  <span class="property">"result"</span>: {
    <span class="property">"p1"</span>: {<span class="property">"x"</span>: <span class="number">0</span>, <span class="property">"y"</span>: <span class="number">0</span>},
    <span class="property">"p2"</span>: {<span class="property">"x"</span>: <span class="number">5</span>, <span class="property">"y"</span>: <span class="number">0</span>}
  },
  <span class="property">"constraints"</span>: [
    {
      <span class="property">"id"</span>: <span class="string">"c1"</span>,
      <span class="property">"satisfied"</span>: <span class="keyword">true</span>,
      <span class="property">"error"</span>: <span class="number">0</span>
    }
  ]
}
            </div>
          </div>
        </div>

        <!-- Validate Constraints Endpoint -->
        <div class="endpoint-details" data-endpoint="validate">
          <h2 class="endpoint-title">Validate Constraints <span class="badge stable">Stable</span></h2>
          <p class="endpoint-description">Validate a constraint system without solving</p>

          <div class="section">
            <h3 class="section-title">Request</h3>
            <div class="code-block">
              <span class="keyword">POST</span> /api/constraints/validate
            </div>
          </div>

          <div class="section">
            <h3 class="section-title">Request Body</h3>
            <div class="code-block">
{
  <span class="property">"constraints"</span>: [
    {
      <span class="property">"id"</span>: <span class="string">"c1"</span>,
      <span class="property">"type"</span>: <span class="string">"distance"</span>,
      <span class="property">"entities"</span>: [<span class="string">"p1"</span>, <span class="string">"p2"</span>],
      <span class="property">"value"</span>: <span class="number">5.0</span>
    }
  ]
}
            </div>
          </div>

          <div class="section">
            <h3 class="section-title">Response</h3>
            <div class="code-block">
{
  <span class="property">"valid"</span>: <span class="keyword">true</span>,
  <span class="property">"constraints"</span>: [
    {
      <span class="property">"id"</span>: <span class="string">"c1"</span>,
      <span class="property">"valid"</span>: <span class="keyword">true</span>,
      <span class="property">"satisfiable"</span>: <span class="keyword">true</span>,
      <span class="property">"dependencies"</span>: []
    }
  ],
  <span class="property">"rigidity"</span>: {
    <span class="property">"isRigid"</span>: <span class="keyword">true</span>,
    <span class="property">"type"</span>: <span class="string">"minimally_rigid"</span>,
    <span class="property">"lamanCondition"</span>: <span class="string">"2*n - 3 = 3 edges"</span>
  }
}
            </div>
          </div>
        </div>

        <!-- Simulators Endpoint -->
        <div class="endpoint-details" data-endpoint="simulators">
          <h2 class="endpoint-title">List Simulators <span class="badge stable">Stable</span></h2>
          <p class="endpoint-description">List all available simulators</p>

          <div class="section">
            <h3 class="section-title">Request</h3>
            <div class="code-block">
              <span class="keyword">GET</span> /api/simulators
            </div>
          </div>

          <div class="section">
            <h3 class="section-title">Response</h3>
            <div class="code-block">
{
  <span class="property">"simulators"</span>: [
    {
      <span class="property">"id"</span>: <span class="string">"pythagorean"</span>,
      <span class="property">"name"</span>: <span class="string">"Pythagorean Snapping"</span>,
      <span class="property">"description"</span>: <span class="string">"Interactive visualization of integer ratio snapping"</span>,
      <span class="property">"path"</span>: <span class="string">"/simulators/pythagorean"</span>,
      <span class="property">"status"</span>: <span class="string">"stable"</span>,
      <span class="property">"features"</span>: [<span class="string">"real-time"</span>, <span class="string">"interactive"</span>, <span class="string">"visualization"</span>]
    },
    {
      <span class="property">"id"</span>: <span class="string">"rigidity"</span>,
      <span class="property">"name"</span>: <span class="string">"Rigidity Matroid"</span>,
      <span class="property">"description"</span>: <span class="string">"Laman graph rigidity visualization"</span>,
      <span class="property">"path"</span>: <span class="string">"/simulators/rigidity"</span>,
      <span class="property">"status"</span>: <span class="string">"stable"</span>,
      <span class="property">"features"</span>: [<span class="string">"graph-editor"</span>, <span class="string">"laman-check"</span>, <span class="string">"stress-test"</span>]
    }
  ]
}
            </div>
          </div>
        </div>

        <!-- Transform Endpoint -->
        <div class="endpoint-details" data-endpoint="transform">
          <h2 class="endpoint-title">Transform Vectors <span class="badge stable">Stable</span></h2>
          <p class="endpoint-description">Apply geometric transformations to vectors</p>

          <div class="section">
            <h3 class="section-title">Request</h3>
            <div class="code-block">
              <span class="keyword">POST</span> /api/geometry/transform
            </div>
          </div>

          <div class="section">
            <h3 class="section-title">Request Body</h3>
            <div class="code-block">
{
  <span class="property">"vectors"</span>: [
    {<span class="property">"x"</span>: <span class="number">0.6</span>, <span class="property">"y"</span>: <span class="number">0.8</span>},
    {<span class="property">"x"</span>: <span class="number">0.36</span>, <span class="property">"y"</span>: <span class="number">0.48</span>}
  ],
  <span class="property">"transform"</span>: {
    <span class="property">"type"</span>: <span class="string">"rotate"</span>,
    <span class="property">"angle"</span>: <span class="number">45</span>,
    <span class="property">"degrees"</span>: <span class="keyword">true</span>
  }
}
            </div>
          </div>
        </div>

        <!-- Intersect Endpoint -->
        <div class="endpoint-details" data-endpoint="intersect">
          <h2 class="endpoint-title">Intersect Objects <span class="badge experimental">Experimental</span></h2>
          <p class="endpoint-description">Find intersections between geometric objects</p>

          <div class="section">
            <h3 class="section-title">Request</h3>
            <div class="code-block">
              <span class="keyword">POST</span> /api/geometry/intersect
            </div>
          </div>

          <div class="section">
            <h3 class="section-title">Request Body</h3>
            <div class="code-block">
{
  <span class="property">"objects"</span>: [
    {
      <span class="property">"type"</span>: <span class="string">"line"</span>,
      <span class="property">"start"</span>: {<span class="property">"x"</span>: <span class="number">0</span>, <span class="property">"y"</span>: <span class="number">0</span>},
      <span class="property">"end"</span>: {<span class="property">"x"</span>: <span class="number">1</span>, <span class="property">"y"</span>: <span class="number">1</span>}
    },
    {
      <span class="property">"type"</span>: <span class="string">"circle"</span>,
      <span class="property">"center"</span>: {<span class="property">"x"</span>: <span class="number">0.5</span>, <span class="property">"y"</span>: <span class="number">0.5</span>},
      <span class="property">"radius"</span>: <span class="number">0.5</span>
    }
  ]
}
            </div>
          </div>
        </div>

        <!-- Optimize Endpoint -->
        <div class="endpoint-details" data-endpoint="optimize">
          <h2 class="endpoint-title">Optimize Constraints <span class="badge experimental">Experimental</span></h2>
          <p class="endpoint-description">Optimize constraint system for performance</p>

          <div class="section">
            <h3 class="section-title">Request</h3>
            <div class="code-block">
              <span class="keyword">POST</span> /api/constraints/optimize
            </div>
          </div>

          <div class="section">
            <h3 class="section-title">Request Body</h3>
            <div class="code-block">
{
  <span class="property">"constraints"</span>: [
    {
      <span class="property">"id"</span>: <span class="string">"c1"</span>,
      <span class="property">"type"</span>: <span class="string">"distance"</span>,
      <span class="property">"entities"</span>: [<span class="string">"p1"</span>, <span class="string">"p2"</span>],
      <span class="property">"value"</span>: <span class="number">5.0</span>
    }
  ],
  <span class="property">"objective"</span>: <span class="string">"minimize_energy"</span>,
  <span class="property">"parameters"</span>: {
    <span class="property">"useGPU"</span>: <span class="keyword">true</span>,
    <span class="property">"algorithm"</span>: <span class="string">"conjugate_gradient"</span>
  }
}
            </div>
          </div>
        </div>
      </main>
    </div>
  </div>

  <script>
    // Endpoint switching
    document.querySelectorAll('.endpoint-item').forEach(item => {
      item.addEventListener('click', () => {
        // Remove active class from all items
        document.querySelectorAll('.endpoint-item').forEach(i => i.classList.remove('active'));
        document.querySelectorAll('.endpoint-details').forEach(d => d.classList.remove('active'));

        // Add active class to clicked item
        item.classList.add('active');
        const endpoint = item.dataset.endpoint;
        document.querySelector(\`.endpoint-details[data-endpoint="\${endpoint}"]\`).classList.add('active');
      });
    });

    // Tab switching
    document.querySelectorAll('.tab').forEach(tab => {
      tab.addEventListener('click', () => {
        const tabName = tab.dataset.tab;

        // Remove active class from all tabs and contents
        tab.parentElement.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));

        // Add active class to clicked tab
        tab.classList.add('active');
        document.getElementById(tabName).classList.add('active');
      });
    });

    // Try Health Check
    async function tryHealth() {
      const responseArea = document.getElementById('health-response');
      responseArea.classList.add('show');
      responseArea.innerHTML = '<div class="response-body">Loading...</div>';

      try {
        const response = await fetch('/health');
        const data = await response.json();

        responseArea.innerHTML = \`
          <div class="response-status success">
            ✓ Status: \${response.status} \${response.statusText}
          </div>
          <div class="response-body">\${JSON.stringify(data, null, 2)}</div>
        \`;
      } catch (error) {
        responseArea.innerHTML = \`
          <div class="response-status error">
            ✗ Error: \${error.message}
          </div>
        \`;
      }
    }

    // Try Snap
    async function trySnap() {
      const x = parseFloat(document.getElementById('snap-x').value);
      const y = parseFloat(document.getElementById('snap-y').value);
      const threshold = parseFloat(document.getElementById('snap-threshold').value);

      const responseArea = document.getElementById('snap-response');
      responseArea.classList.add('show');
      responseArea.innerHTML = '<div class="response-body"><span class="loading"></span> Processing...</div>';

      try {
        const response = await fetch('/api/geometry/snap', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            vector: { x, y },
            threshold
          })
        });

        const data = await response.json();

        if (response.ok) {
          responseArea.innerHTML = \`
            <div class="response-status success">
              ✓ Status: \${response.status} \${response.statusText}
            </div>
            <div class="response-body">\${JSON.stringify(data, null, 2)}</div>
          \`;
        } else {
          responseArea.innerHTML = \`
            <div class="response-status error">
              ✗ Error: \${data.error}
            </div>
            <div class="response-body">\${JSON.stringify(data, null, 2)}</div>
          \`;
        }
      } catch (error) {
        responseArea.innerHTML = \`
          <div class="response-status error">
            ✗ Error: \${error.message}
          </div>
        \`;
      }
    }

    // Auto-load health check on page load
    window.addEventListener('load', () => {
      tryHealth();
    });
  </script>
</body>
</html>
`;

// Serve API Explorer
apiExplorerRoutes.get('/', () => {
  return new Response(API_EXPLORER_HTML(), {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'public, max-age=3600'
    }
  });
});

// API endpoint for explorer to fetch data
apiExplorerRoutes.get('/endpoints', () => {
  return Response.json({
    endpoints: [
      {
        id: 'health',
        method: 'GET',
        path: '/health',
        description: 'Check API health status',
        stable: true
      },
      {
        id: 'snap',
        method: 'POST',
        path: '/api/geometry/snap',
        description: 'Snap a 2D vector to the nearest Pythagorean ratio',
        stable: true
      },
      {
        id: 'solve',
        method: 'POST',
        path: '/api/constraints/solve',
        description: 'Solve a system of geometric constraints',
        stable: true
      },
      {
        id: 'validate',
        method: 'POST',
        path: '/api/constraints/validate',
        description: 'Validate a constraint system without solving',
        stable: true
      },
      {
        id: 'simulators',
        method: 'GET',
        path: '/api/simulators',
        description: 'List all available simulators',
        stable: true
      },
      {
        id: 'transform',
        method: 'POST',
        path: '/api/geometry/transform',
        description: 'Apply geometric transformations to vectors',
        stable: true
      },
      {
        id: 'intersect',
        method: 'POST',
        path: '/api/geometry/intersect',
        description: 'Find intersections between geometric objects',
        stable: false
      },
      {
        id: 'optimize',
        method: 'POST',
        path: '/api/constraints/optimize',
        description: 'Optimize constraint system for performance',
        stable: false
      }
    ]
  });
});
