/**
 * Monitoring and alerting utilities for Cloudflare Workers
 */

export interface AlertConfig {
  enabled: boolean;
  thresholds: {
    latency: { warning: number; critical: number };
    errorRate: { warning: number; critical: number };
    cacheHitRate: { warning: number; critical: number };
  };
  notifications: {
    email?: string;
    webhook?: string;
    slack?: string;
  };
}

export interface Alert {
  id: string;
  type: 'latency' | 'errorRate' | 'cacheHitRate' | 'availability';
  level: 'warning' | 'critical';
  message: string;
  timestamp: Date;
  metrics: Record<string, number>;
}

/**
 * Check metrics against thresholds and generate alerts
 */
export function checkMetrics(
  metrics: {
    latency: number;
    errorRate: number;
    cacheHitRate: number;
    availability: number;
  },
  config: AlertConfig
): Alert[] {
  const alerts: Alert[] = [];
  const timestamp = new Date();

  // Check latency
  if (metrics.latency > config.thresholds.latency.critical) {
    alerts.push({
      id: generateAlertId(),
      type: 'latency',
      level: 'critical',
      message: `Critical: Average latency is ${metrics.latency}ms (threshold: ${config.thresholds.latency.critical}ms)`,
      timestamp,
      metrics: { latency: metrics.latency },
    });
  } else if (metrics.latency > config.thresholds.latency.warning) {
    alerts.push({
      id: generateAlertId(),
      type: 'latency',
      level: 'warning',
      message: `Warning: Average latency is ${metrics.latency}ms (threshold: ${config.thresholds.latency.warning}ms)`,
      timestamp,
      metrics: { latency: metrics.latency },
    });
  }

  // Check error rate
  if (metrics.errorRate > config.thresholds.errorRate.critical) {
    alerts.push({
      id: generateAlertId(),
      type: 'errorRate',
      level: 'critical',
      message: `Critical: Error rate is ${(metrics.errorRate * 100).toFixed(2)}% (threshold: ${(config.thresholds.errorRate.critical * 100).toFixed(2)}%)`,
      timestamp,
      metrics: { errorRate: metrics.errorRate },
    });
  } else if (metrics.errorRate > config.thresholds.errorRate.warning) {
    alerts.push({
      id: generateAlertId(),
      type: 'errorRate',
      level: 'warning',
      message: `Warning: Error rate is ${(metrics.errorRate * 100).toFixed(2)}% (threshold: ${(config.thresholds.errorRate.warning * 100).toFixed(2)}%)`,
      timestamp,
      metrics: { errorRate: metrics.errorRate },
    });
  }

  // Check cache hit rate
  if (metrics.cacheHitRate < config.thresholds.cacheHitRate.critical) {
    alerts.push({
      id: generateAlertId(),
      type: 'cacheHitRate',
      level: 'critical',
      message: `Critical: Cache hit rate is ${(metrics.cacheHitRate * 100).toFixed(2)}% (threshold: ${(config.thresholds.cacheHitRate.critical * 100).toFixed(2)}%)`,
      timestamp,
      metrics: { cacheHitRate: metrics.cacheHitRate },
    });
  } else if (metrics.cacheHitRate < config.thresholds.cacheHitRate.warning) {
    alerts.push({
      id: generateAlertId(),
      type: 'cacheHitRate',
      level: 'warning',
      message: `Warning: Cache hit rate is ${(metrics.cacheHitRate * 100).toFixed(2)}% (threshold: ${(config.thresholds.cacheHitRate.warning * 100).toFixed(2)}%)`,
      timestamp,
      metrics: { cacheHitRate: metrics.cacheHitRate },
    });
  }

  // Check availability
  if (metrics.availability < 0.99) {
    alerts.push({
      id: generateAlertId(),
      type: 'availability',
      level: 'critical',
      message: `Critical: Availability is ${(metrics.availability * 100).toFixed(2)}% (threshold: 99%)`,
      timestamp,
      metrics: { availability: metrics.availability },
    });
  }

  return alerts;
}

/**
 * Send alert notification
 */
export async function sendAlert(
  alert: Alert,
  config: AlertConfig,
  env: any
): Promise<void> {
  const notifications = [];

  // Send email
  if (config.notifications.email) {
    notifications.push(sendEmailAlert(alert, config.notifications.email, env));
  }

  // Send webhook
  if (config.notifications.webhook) {
    notifications.push(sendWebhookAlert(alert, config.notifications.webhook));
  }

  // Send Slack
  if (config.notifications.slack) {
    notifications.push(sendSlackAlert(alert, config.notifications.slack));
  }

  await Promise.allSettled(notifications);
}

/**
 * Send email alert (via SendGrid or similar)
 */
async function sendEmailAlert(
  alert: Alert,
  email: string,
  env: any
): Promise<void> {
  // This would integrate with SendGrid, Mailgun, or similar
  console.log(`[EMAIL ALERT] To: ${email}`, alert.message);
}

/**
 * Send webhook alert
 */
async function sendWebhookAlert(alert: Alert, webhook: string): Promise<void> {
  try {
    await fetch(webhook, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(alert),
    });
  } catch (error) {
    console.error('Failed to send webhook alert:', error);
  }
}

/**
 * Send Slack alert
 */
async function sendSlackAlert(alert: Alert, webhook: string): Promise<void> {
  try {
    const color = alert.level === 'critical' ? 'danger' : 'warning';

    await fetch(webhook, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        attachments: [
          {
            color,
            title: `${alert.level.toUpperCase()}: ${alert.type}`,
            text: alert.message,
            fields: [
              {
                title: 'Timestamp',
                value: alert.timestamp.toISOString(),
                short: true,
              },
              ...Object.entries(alert.metrics).map(([key, value]) => ({
                title: key,
                value: typeof value === 'number' ? value.toFixed(2) : value,
                short: true,
              })),
            ],
          },
        ],
      }),
    });
  } catch (error) {
    console.error('Failed to send Slack alert:', error);
  }
}

/**
 * Generate unique alert ID
 */
function generateAlertId(): string {
  return `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Store alert in KV for historical analysis
 */
export async function storeAlert(alert: Alert, env: any): Promise<void> {
  try {
    const key = `alert:${alert.id}`;
    await env.ALERTS.put(key, JSON.stringify(alert), {
      expirationTtl: 60 * 60 * 24 * 7, // 7 days
    });
  } catch (error) {
    console.error('Failed to store alert:', error);
  }
}

/**
 * Get recent alerts
 */
export async function getRecentAlerts(
  env: any,
  limit: number = 100
): Promise<Alert[]> {
  try {
    const keys = await env.ALERTS.list({ limit });
    const alerts = await Promise.all(
      keys.keys.map(async (key: any) => {
        const alert = await env.ALERTS.get(key.name);
        return alert ? JSON.parse(alert) : null;
      })
    );
    return alerts.filter(Boolean).sort((a, b) =>
      b.timestamp.getTime() - a.timestamp.getTime()
    );
  } catch (error) {
    console.error('Failed to get alerts:', error);
    return [];
  }
}

/**
 * Uptime monitoring
 */
export interface UptimeCheck {
  url: string;
  interval: number; // seconds
  timeout: number; // milliseconds
  expectedStatus: number;
}

export async function checkUptime(check: UptimeCheck): Promise<{
  up: boolean;
  status: number;
  latency: number;
  timestamp: Date;
}> {
  const start = Date.now();

  try {
    const response = await fetch(check.url, {
      signal: AbortSignal.timeout(check.timeout),
    });

    const latency = Date.now() - start;

    return {
      up: response.status === check.expectedStatus,
      status: response.status,
      latency,
      timestamp: new Date(),
    };
  } catch (error) {
    return {
      up: false,
      status: 0,
      latency: Date.now() - start,
      timestamp: new Date(),
    };
  }
}

/**
 * Synthetic monitoring
 */
export interface SyntheticCheck {
  name: string;
  url: string;
  steps: Array<{
    name: string;
    action: () => Promise<boolean>;
  }>;
}

export async function runSyntheticCheck(
  check: SyntheticCheck
): Promise<{
  name: string;
  passed: boolean;
  steps: Array<{
    name: string;
    passed: boolean;
    duration: number;
  }>;
  totalDuration: number;
  timestamp: Date;
}> {
  const start = Date.now();
  const steps = [];

  for (const step of check.steps) {
    const stepStart = Date.now();
    try {
      const passed = await step.action();
      steps.push({
        name: step.name,
        passed,
        duration: Date.now() - stepStart,
      });
    } catch (error) {
      steps.push({
        name: step.name,
        passed: false,
        duration: Date.now() - stepStart,
      });
    }
  }

  const passed = steps.every(step => step.passed);

  return {
    name: check.name,
    passed,
    steps,
    totalDuration: Date.now() - start,
    timestamp: new Date(),
  };
}

/**
 * Default alert configuration
 */
export const DEFAULT_ALERT_CONFIG: AlertConfig = {
  enabled: true,
  thresholds: {
    latency: { warning: 100, critical: 500 },
    errorRate: { warning: 0.01, critical: 0.05 },
    cacheHitRate: { warning: 0.5, critical: 0.3 },
  },
  notifications: {
    // Configure these via environment variables or secrets
    email: process.env.ALERT_EMAIL,
    webhook: process.env.ALERT_WEBHOOK,
    slack: process.env.ALERT_SLACK,
  },
};

/**
 * Example synthetic checks for Constraint Theory
 */
export const SYNTHETIC_CHECKS: SyntheticCheck[] = [
  {
    name: 'Pythagorean Simulator Health',
    url: 'https://constrainttheory.com/simulators/pythagorean/',
    steps: [
      {
        name: 'Page loads',
        action: async () => {
          const response = await fetch('https://constrainttheory.com/simulators/pythagorean/');
          return response.ok;
        },
      },
      {
        name: 'API responds',
        action: async () => {
          const response = await fetch('https://constrainttheory.com/api/simulators/pythagorean/config');
          const data = await response.json();
          return data.initialRatios && Array.isArray(data.initialRatios);
        },
      },
    ],
  },
  {
    name: 'API Health Check',
    url: 'https://constrainttheory.com/api/health',
    steps: [
      {
        name: 'Health endpoint',
        action: async () => {
          const response = await fetch('https://constrainttheory.com/health');
          const data = await response.json();
          return data.status === 'healthy';
        },
      },
    ],
  },
];
