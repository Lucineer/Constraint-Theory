import { Router } from 'itty-router';
import { apiRoutes } from './routes/api';
import { HOMEPAGE_HTML, PYTHAGOREAN_HTML, RIGIDITY_HTML, COMING_SOON_HTML, PYTHAGOREAN_JS, RIGIDITY_JS } from './routes/static';

// Create router
const router = Router();

// Health check
router.get('/health', () => {
  return Response.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: 'v1'
  });
});

// API documentation
router.get('/api', () => {
  return Response.json({
    version: 'v1',
    title: 'Constraint Theory API',
    description: 'RESTful API for constraint theory computations and simulations',
    baseUrl: '/api',
    endpoints: {
      health: 'GET /health',
      docs: 'GET /api',
      snap: 'POST /api/geometry/snap',
      solve: 'POST /api/constraints/solve',
      validate: 'POST /api/constraints/validate',
    },
  });
});

// Serve homepage at root - MUST BE FIRST
router.get('/', () => {
  try {
    // Try calling the HOMEPAGE_HTML function
    const html = HOMEPAGE_HTML();
    return new Response(html, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'public, max-age=3600'
      }
    });
  } catch (error) {
    console.error('Error serving homepage:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response('Error loading homepage: ' + errorMessage, { status: 500 });
  }
});

// Mount API routes
router.route('/api', apiRoutes);

// Serve simulator JavaScript files (hardcoded routes)
router.get('/simulators/pythagorean/app.js', () => {
  try {
    const js = PYTHAGOREAN_JS();
    return new Response(js, {
      headers: {
        'Content-Type': 'application/javascript; charset=utf-8',
        'Cache-Control': 'public, max-age=86400'
      }
    });
  } catch (error) {
    console.error('Error serving simulator JS:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response('Error loading simulator JS: ' + errorMessage, { status: 500 });
  }
});

router.get('/simulators/rigidity/app.js', () => {
  try {
    const js = RIGIDITY_JS();
    return new Response(js, {
      headers: {
        'Content-Type': 'application/javascript; charset=utf-8',
        'Cache-Control': 'public, max-age=86400'
      }
    });
  } catch (error) {
    console.error('Error serving simulator JS:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response('Error loading simulator JS: ' + errorMessage, { status: 500 });
  }
});

// Serve simulator pages (hardcoded routes)
router.get('/simulators/pythagorean/', () => {
  try {
    const html = PYTHAGOREAN_HTML();
    return new Response(html, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'public, max-age=3600'
      }
    });
  } catch (error) {
    console.error('Error serving simulator:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response('Error loading simulator: ' + errorMessage, { status: 500 });
  }
});

router.get('/simulators/rigidity/', () => {
  try {
    const html = RIGIDITY_HTML();
    return new Response(html, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'public, max-age=3600'
      }
    });
  } catch (error) {
    console.error('Error serving simulator:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response('Error loading simulator: ' + errorMessage, { status: 500 });
  }
});

// Coming soon pages for other simulators
router.get('/simulators/holonomy/', () => {
  return new Response(COMING_SOON_HTML('holonomy'), {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'public, max-age=3600'
    }
  });
});

router.get('/simulators/performance/', () => {
  return new Response(COMING_SOON_HTML('performance'), {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'public, max-age=3600'
    }
  });
});

router.get('/simulators/kdtree/', () => {
  return new Response(COMING_SOON_HTML('kdtree'), {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'public, max-age=3600'
    }
  });
});

// Export for Cloudflare Workers
export interface Env {
  ENVIRONMENT?: string;
  API_VERSION?: string;
  CORS_ORIGIN?: string;
  // KV namespaces (optional - add these in Cloudflare dashboard first)
  // SESSION_STORE?: KVNamespace;
  // CACHE?: KVNamespace;
}

export default {
  fetch: (request: Request, env: Env, ctx: ExecutionContext) =>
    router.handle(request).catch(err => {
      console.error('Unhandled error:', err);
      return Response.json({
        error: 'Internal Server Error',
        message: 'An unexpected error occurred'
      }, { status: 500 });
    })
};
