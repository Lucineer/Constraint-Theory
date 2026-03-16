FROM node:20-alpine

# Metadata
LABEL maintainer="SuperInstance"
LABEL description="Cloudflare Worker Docker container for constraint theory"
LABEL version="1.0.0"

# Install system dependencies
RUN apk add --no-cache \
    python3 \
    py3-pip \
    rust \
    wasm-pack \
    cargo \
    build-base \
    openssl-dev \
    && rm -rf /var/cache/apk/*

# Set working directory
WORKDIR /app

# Create app user
RUN addgroup -g 1001 -S constraint && \
    adduser -S -u 1001 -G constraint constraint

# Copy WASM package
COPY packages/constraint-theory-wasm ./wasm
RUN chown -R constraint:constraint ./wasm

# Build WASM module
USER constraint
RUN cd /app/wasm && \
    cargo install wasm-pack && \
    wasm-pack build --target web --scope superinstance

# Copy Python simulation backend
COPY --chown=constraint:constraint docker/simulations ./simulations
RUN cd /app/simulations && \
    pip3 install --no-cache-dir --user -r requirements.txt

# Copy Worker code
COPY --chown=constraint:constraint workers ./workers
RUN cd /app/workers && \
    npm ci --production && \
    npm run build

# Copy entrypoint script
COPY --chown=constraint:constraint docker/entrypoint.sh /app/entrypoint.sh
RUN chmod +x /app/entrypoint.sh

# Create directories for runtime
RUN mkdir -p /app/data /app/logs

# Set environment variables
ENV NODE_ENV=production
ENV PORT=8080
ENV WORKERS_BINDING=constraint-theory-api

# Expose port
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD node -e "require('http').get('http://localhost:8080/health', (r) => { process.exit(r.statusCode === 200 ? 0 : 1) })"

# Switch to app user
USER constraint

# Set entrypoint
ENTRYPOINT ["/app/entrypoint.sh"]
