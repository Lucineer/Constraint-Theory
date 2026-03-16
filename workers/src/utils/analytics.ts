/**
 * Analytics and monitoring utilities for Cloudflare Workers
 */

export interface AnalyticsData {
  request: {
    url: string;
    method: string;
    userAgent: string | null;
    referrer: string | null;
    ip: string;
  };
  response: {
    status: number;
    latency: number;
    cached: boolean;
  };
  custom: {
    simulator?: string;
    action?: string;
    error?: string;
  };
}

/**
 * Send analytics data to Cloudflare Analytics Engine
 */
export async function trackRequest(
  env: any,
  data: AnalyticsData
): Promise<void> {
  try {
    await env.ANALYTICS.writeDataPoint({
      blobs: [data.request.url, data.custom.simulator || 'none'],
      doubles: [data.response.latency, data.response.status],
      indexes: [
        data.request.method === 'GET' ? 0 : 1,
        data.response.cached ? 1 : 0,
        data.response.status >= 400 ? 1 : 0,
      ],
    });
  } catch (error) {
    console.error('Failed to write analytics:', error);
  }
}

/**
 * Track simulator usage
 */
export async function trackSimulatorUsage(
  env: any,
  simulator: string,
  action: string,
  duration: number
): Promise<void> {
  try {
    await env.SIMULATOR_ANALYTICS.writeDataPoint({
      blobs: [simulator, action],
      doubles: [duration],
      indexes: [getSimulatorIndex(simulator)],
    });
  } catch (error) {
    console.error('Failed to track simulator usage:', error);
  }
}

/**
 * Track errors
 */
export async function trackError(
  env: any,
  error: Error,
  context: {
    url: string;
    method: string;
    userAgent?: string;
  }
): Promise<void> {
  try {
    await env.ERROR_ANALYTICS.writeDataPoint({
      blobs: [error.message, context.url],
      doubles: [Date.now()],
      indexes: [getErrorCode(error)],
    });
  } catch (error) {
    console.error('Failed to track error:', error);
  }
}

/**
 * Get performance metrics
 */
export interface PerformanceMetrics {
  requestCount: number;
  averageLatency: number;
  errorRate: number;
  cacheHitRate: number;
  topSimulators: Array<{ name: string; count: number }>;
}

export async function getPerformanceMetrics(
  env: any,
  timeRange: '1h' | '24h' | '7d' | '30d' = '24h'
): Promise<PerformanceMetrics> {
  // This would query Analytics Engine
  // For now, return placeholder data
  return {
    requestCount: 0,
    averageLatency: 0,
    errorRate: 0,
    cacheHitRate: 0,
    topSimulators: [],
  };
}

/**
 * Helper functions
 */
function getSimulatorIndex(simulator: string): number {
  const simulators = ['pythagorean', 'rigidity', 'holonomy', 'performance', 'kdtree'];
  return simulators.indexOf(simulator);
}

function getErrorCode(error: Error): number {
  if (error.message.includes('timeout')) return 1;
  if (error.message.includes('not found')) return 2;
  if (error.message.includes('permission')) return 3;
  return 0; // Unknown error
}

/**
 * Performance monitoring middleware
 */
export function performanceMiddleware(request: Request, env: any) {
  const start = Date.now();

  return {
    async record(response: Response, custom: AnalyticsData['custom'] = {}) {
      const latency = Date.now() - start;
      const url = new URL(request.url);

      const analyticsData: AnalyticsData = {
        request: {
          url: url.pathname,
          method: request.method,
          userAgent: request.headers.get('User-Agent'),
          referrer: request.headers.get('Referer'),
          ip: request.headers.get('CF-Connecting-IP') || 'unknown',
        },
        response: {
          status: response.status,
          latency,
          cached: response.headers.get('X-Cache') === 'HIT',
        },
        custom,
      };

      await trackRequest(env, analyticsData);
    },
  };
}

/**
 * Health check metrics
 */
export interface HealthMetrics {
  status: 'healthy' | 'degraded' | 'unhealthy';
  uptime: number;
  memory: {
    used: number;
    limit: number;
    percentage: number;
  };
  cpu: {
    current: number;
    limit: number;
  };
  kv: {
    reads: number;
    writes: number;
    errors: number;
  };
}

export async function getHealthMetrics(env: any): Promise<HealthMetrics> {
  // This would collect actual metrics from the worker
  return {
    status: 'healthy',
    uptime: process.uptime ? process.uptime() : 0,
    memory: {
      used: 0,
      limit: 128, // MB
      percentage: 0,
    },
    cpu: {
      current: 0,
      limit: 30, // ms per request
    },
    kv: {
      reads: 0,
      writes: 0,
      errors: 0,
    },
  };
}

/**
 * Alert thresholds
 */
export const ALERT_THRESHOLDS = {
  latency: {
    warning: 100, // ms
    critical: 500, // ms
  },
  errorRate: {
    warning: 0.01, // 1%
    critical: 0.05, // 5%
  },
  cacheHitRate: {
    warning: 0.5, // 50%
    critical: 0.3, // 30%
  },
  cpu: {
    warning: 20, // ms
    critical: 28, // ms
  },
  memory: {
    warning: 0.7, // 70%
    critical: 0.9, // 90%
  },
};

/**
 * Check if metrics exceed thresholds
 */
export function checkThresholds(
  metrics: PerformanceMetrics
): Array<{ type: string; level: 'warning' | 'critical'; value: number }> {
  const alerts: Array<{ type: string; level: 'warning' | 'critical'; value: number }> = [];

  if (metrics.averageLatency > ALERT_THRESHOLDS.latency.critical) {
    alerts.push({ type: 'latency', level: 'critical', value: metrics.averageLatency });
  } else if (metrics.averageLatency > ALERT_THRESHOLDS.latency.warning) {
    alerts.push({ type: 'latency', level: 'warning', value: metrics.averageLatency });
  }

  if (metrics.errorRate > ALERT_THRESHOLDS.errorRate.critical) {
    alerts.push({ type: 'errorRate', level: 'critical', value: metrics.errorRate });
  } else if (metrics.errorRate > ALERT_THRESHOLDS.errorRate.warning) {
    alerts.push({ type: 'errorRate', level: 'warning', value: metrics.errorRate });
  }

  if (metrics.cacheHitRate < ALERT_THRESHOLDS.cacheHitRate.critical) {
    alerts.push({ type: 'cacheHitRate', level: 'critical', value: metrics.cacheHitRate });
  } else if (metrics.cacheHitRate < ALERT_THRESHOLDS.cacheHitRate.warning) {
    alerts.push({ type: 'cacheHitRate', level: 'warning', value: metrics.cacheHitRate });
  }

  return alerts;
}

/**
 * Format metrics for display
 */
export function formatMetrics(metrics: PerformanceMetrics): string {
  return `
Performance Metrics:
- Request Count: ${metrics.requestCount.toLocaleString()}
- Average Latency: ${metrics.averageLatency.toFixed(2)}ms
- Error Rate: ${(metrics.errorRate * 100).toFixed(2)}%
- Cache Hit Rate: ${(metrics.cacheHitRate * 100).toFixed(2)}%

Top Simulators:
${metrics.topSimulators.map(s => `  - ${s.name}: ${s.count.toLocaleString()}`).join('\n')}
  `.trim();
}
