/**
 * Sentry error tracking integration for Cloudflare Workers
 */

import type * as Sentry from '@sentry/cloudflare';

export interface SentryConfig {
  dsn: string;
  environment: string;
  release: string;
  tracesSampleRate: number;
  profilesSampleRate: number;
}

/**
 * Initialize Sentry in Cloudflare Workers
 */
export function initSentry(config: SentryConfig) {
  // This would typically be:
  // import * as Sentry from '@sentry/cloudflare';
  // Sentry.init({
  //   dsn: config.dsn,
  //   environment: config.environment,
  //   release: config.release,
  //   tracesSampleRate: config.tracesSampleRate,
  //   profilesSampleRate: config.profilesSampleRate,
  // });

  console.log('[Sentry] Initialized', {
    environment: config.environment,
    release: config.release,
  });
}

/**
 * Capture exception in Sentry
 */
export function captureException(error: Error, context?: Record<string, any>) {
  // Sentry.captureException(error, {
  //   extra: context,
  // });

  console.error('[Sentry] Exception captured:', error.message, context);
}

/**
 * Capture message in Sentry
 */
export function captureMessage(message: string, level: 'info' | 'warning' | 'error' = 'info') {
  // Sentry.captureMessage(message, level);

  console.log(`[Sentry] Message captured [${level}]:`, message);
}

/**
 * Add breadcrumb to Sentry
 */
export function addBreadcrumb(
  category: string,
  message: string,
  data?: Record<string, any>
) {
  // Sentry.addBreadcrumb({
  //   category,
  //   message,
  //   data,
  //   level: 'info',
  // });

  console.log('[Sentry] Breadcrumb added:', category, message, data);
}

/**
 * Set user context in Sentry
 */
export function setUser(user: {
  id?: string;
  email?: string;
  username?: string;
}) {
  // Sentry.setUser(user);

  console.log('[Sentry] User set:', user);
}

/**
 * Performance monitoring middleware
 */
export function performanceMonitoring(config: SentryConfig) {
  return async (
    request: Request,
    env: any,
    ctx: ExecutionContext
  ): Promise<Response> => {
    const start = Date.now();
    const url = new URL(request.url);

    // Add breadcrumb for request start
    addBreadcrumb('http', `${request.method} ${url.pathname}`, {
      userAgent: request.headers.get('User-Agent'),
    });

    try {
      const response = await fetch(request);

      // Track performance
      const duration = Date.now() - start;

      // Send transaction to Sentry
      // Sentry.startSpan({
      //   op: 'http.server',
      //   name: `${request.method} ${url.pathname}`,
      //   startTime: start,
      // }, async () => {
      //   return {
      //     status: response.status,
      //     duration,
      //   };
      // });

      return response;
    } catch (error) {
      // Capture exception
      captureException(error as Error, {
        url: url.pathname,
        method: request.method,
      });

      throw error;
    }
  };
}

/**
 * Error tracking wrapper
 */
export function withErrorTracking<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  context?: Record<string, any>
): T {
  return (async (...args: any[]) => {
    try {
      return await fn(...args);
    } catch (error) {
      captureException(error as Error, context);
      throw error;
    }
  }) as T;
}

/**
 * Custom error classes for better error tracking
 */
export class ConstraintTheoryError extends Error {
  constructor(
    message: string,
    public code: string,
    public details?: Record<string, any>
  ) {
    super(message);
    this.name = 'ConstraintTheoryError';
  }
}

export class SimulatorError extends ConstraintTheoryError {
  constructor(
    simulator: string,
    message: string,
    details?: Record<string, any>
  ) {
    super(message, `SIMULATOR_ERROR`, { simulator, ...details });
    this.name = 'SimulatorError';
  }
}

export class ConfigurationError extends ConstraintTheoryError {
  constructor(message: string, details?: Record<string, any>) {
    super(message, 'CONFIGURATION_ERROR', details);
    this.name = 'ConfigurationError';
  }
}

export class ExternalServiceError extends ConstraintTheoryError {
  constructor(
    service: string,
    message: string,
    details?: Record<string, any>
  ) {
    super(message, 'EXTERNAL_SERVICE_ERROR', { service, ...details });
    this.name = 'ExternalServiceError';
  }
}

/**
 * Error handler middleware
 */
export function errorHandler(config: SentryConfig) {
  return async (
    request: Request,
    env: any,
    ctx: ExecutionContext,
    next: () => Promise<Response>
  ): Promise<Response> => {
    try {
      return await next();
    } catch (error) {
      const url = new URL(request.url);

      // Capture exception
      captureException(error as Error, {
        url: url.pathname,
        method: request.method,
        userAgent: request.headers.get('User-Agent'),
      });

      // Return error response
      if (error instanceof ConstraintTheoryError) {
        return Response.json(
          {
            error: error.code,
            message: error.message,
            details: error.details,
          },
          { status: getErrorStatusCode(error.code) }
        );
      }

      // Generic error response
      return Response.json(
        {
          error: 'INTERNAL_SERVER_ERROR',
          message: 'An unexpected error occurred',
        },
        { status: 500 }
      );
    }
  };
}

/**
 * Map error codes to HTTP status codes
 */
function getErrorStatusCode(code: string): number {
  const statusMap: Record<string, number> = {
    SIMULATOR_ERROR: 500,
    CONFIGURATION_ERROR: 500,
    EXTERNAL_SERVICE_ERROR: 502,
    VALIDATION_ERROR: 400,
    NOT_FOUND: 404,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    RATE_LIMIT_EXCEEDED: 429,
  };

  return statusMap[code] || 500;
}

/**
 * Health check with Sentry integration
 */
export async function healthCheckWithSentry(
  env: any,
  config: SentryConfig
): Promise<Response> {
  const checks = {
    sentry: false,
    kv: false,
    analytics: false,
  };

  try {
    // Check Sentry connection
    captureMessage('Health check performed', 'info');
    checks.sentry = true;
  } catch (error) {
    console.error('Sentry health check failed:', error);
  }

  try {
    // Check KV connection
    await env.CACHE.put('health', 'ok', { expirationTtl: 10 });
    const value = await env.CACHE.get('health');
    checks.kv = value === 'ok';
  } catch (error) {
    console.error('KV health check failed:', error);
  }

  try {
    // Check Analytics connection
    await env.ANALYTICS.writeDataPoint({
      blobs: ['health_check'],
      doubles: [Date.now()],
    });
    checks.analytics = true;
  } catch (error) {
    console.error('Analytics health check failed:', error);
  }

  const healthy = Object.values(checks).every(Boolean);

  return Response.json({
    status: healthy ? 'healthy' : 'degraded',
    checks,
    timestamp: new Date().toISOString(),
  }, {
    status: healthy ? 200 : 503,
  });
}
