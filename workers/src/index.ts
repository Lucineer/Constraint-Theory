import { Router } from 'itty-router';
import { corsMiddleware } from './middleware/cors';
import { cacheMiddleware } from './middleware/cache';
import { simulatorsRoutes } from './routes/simulators';
import { apiRoutes } from './routes/api';
import { staticRoutes } from './routes/static';

// Create router
const router = Router();

// Apply middleware
router.all('*', corsMiddleware);
router.all('*', cacheMiddleware);

// Health check
router.get('/health', () => {
  return Response.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: ENVIRONMENT.API_VERSION
  });
});

// Mount routes
router.route('/api/simulators', simulatorsRoutes);
router.route('/api', apiRoutes);
router.route('/', staticRoutes);

// 404 handler
router.all('*', () => {
  return Response.json({
    error: 'Not Found',
    message: 'The requested resource was not found',
    documentation: '/api/docs'
  }, { status: 404 });
});

// Error handler
router.all('*', (error: Error) => {
  console.error('Error:', error);
  return Response.json({
    error: 'Internal Server Error',
    message: error.message
  }, { status: 500 });
});

// Export for Cloudflare Workers
export interface Env {
  ENVIRONMENT: string;
  API_VERSION: string;
  CORS_ORIGIN: string;
  SESSION_STORE: KVNamespace;
  CACHE: KVNamespace;
}

export default {
  fetch: (request: Request, env: Env, ctx: ExecutionContext) =>
    router.handle(request, env, ctx).catch(err => {
      console.error('Unhandled error:', err);
      return Response.json({
        error: 'Internal Server Error',
        message: 'An unexpected error occurred'
      }, { status: 500 });
    })
};
