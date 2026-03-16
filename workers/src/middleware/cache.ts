interface Env {
  CACHE: KVNamespace;
}

export const cacheMiddleware = async (request: Request, env: Env, ctx: ExecutionContext) => {
  const url = new URL(request.url);
  const cacheKey = `cache:${url.pathname}:${request.method}`;

  // Skip cache for non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Check cache
  const cached = await env.CACHE.get(cacheKey, 'json');
  if (cached) {
    const response = Response.json(cached);
    response.headers.set('X-Cache', 'HIT');
    return response;
  }

  // Store original fetch
  const originalFetch = globalThis.fetch;

  // Override fetch to cache responses
  globalThis.fetch = async (input, init) => {
    const response = await originalFetch(input, init);

    if (response.ok) {
      const cloned = response.clone();
      const data = await cloned.json();

      // Cache for 5 minutes
      ctx.waitUntil(env.CACHE.put(cacheKey, JSON.stringify(data), {
        expirationTtl: 300
      }));
    }

    return response;
  };
};
