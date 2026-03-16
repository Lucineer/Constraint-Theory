#!/bin/sh
set -e

echo "Starting Constraint Theory Worker..."
echo "Environment: ${ENVIRONMENT:-development}"
echo "API Version: ${API_VERSION:-v1}"

# Wait for Redis if configured
if [ -n "$REDIS_HOST" ]; then
    echo "Waiting for Redis at $REDIS_HOST..."
    while ! nc -z "$REDIS_HOST" 6379; do
        sleep 1
    done
    echo "Redis is ready!"
fi

# Start the worker
cd /app/workers

if [ "$NODE_ENV" = "production" ]; then
    echo "Starting production worker..."
    exec node dist/index.js
else
    echo "Starting development worker..."
    exec npx wrangler dev --local --port 8080
fi
