# Dockerfile for Constraint Theory Web Simulator
# Supports local development and testing

FROM node:18-alpine AS base

# Install dependencies for building
RUN apk add --no-cache \
    python3 \
    make \
    g++

# Build stage
FROM base AS builder
WORKDIR /app

# Copy package files
COPY package*.json ./
COPY wrangler.toml ./

# Install dependencies
RUN npm ci

# Copy source files
COPY static/ ./static/
COPY worker.ts ./

# Build application
RUN npm run build

# Production stage
FROM node:18-alpine AS production
WORKDIR /app

# Copy production dependencies
COPY package*.json ./
RUN npm ci --only=production

# Copy built assets
COPY --from=builder /app/static ./static
COPY --from=builder /app/worker.ts ./
COPY --from=builder /app/wrangler.toml ./

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Change ownership
RUN chown -R nodejs:nodejs /app

# Switch to non-root user
USER nodejs

# Expose port
EXPOSE 8787

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD node -e "require('http').get('http://localhost:8787/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Start application
CMD ["npm", "run", "dev"]
