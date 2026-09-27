# -----------------------------------------------------------
# Stage 1: Build & Compile (Node 22)
# -----------------------------------------------------------
FROM node:22-alpine AS builder

WORKDIR /app

# Install all dependencies for build phase
COPY package*.json ./
RUN npm ci

# Copy full application codebase
COPY . .

# Build Vite client SPA and bundle Express backend
RUN npm run build

# -----------------------------------------------------------
# Stage 2: Minimal Production Runtime
# -----------------------------------------------------------
FROM node:22-alpine AS runner

WORKDIR /app

# Production environment configuration
ENV NODE_ENV=production
ENV PORT=3000
ENV DATA_DIR=/app/data
ENV TRADING_MODE=PAPER_ONLY

# Install only production dependencies
COPY package*.json ./
RUN npm ci --omit=dev && npm cache clean --force

# Copy compiled artifacts from builder stage
COPY --from=builder /app/dist ./dist

# Provision persistent data directory and unprivileged nexus user
RUN mkdir -p /app/data && \
    addgroup -g 1001 -S nexus && \
    adduser -u 1001 -S nexus -G nexus && \
    chown -R nexus:nexus /app

USER nexus

EXPOSE 3000

# Health check probes the live Node & SQLite health endpoint
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget -qO- http://localhost:3000/api/health || exit 1

CMD ["node", "dist/server.cjs"]
