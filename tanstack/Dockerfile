# Use consistent Node.js version for all stages
FROM node:24-alpine AS base

# Set working directory
WORKDIR /app

# Install pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# Install dependencies only when needed
FROM base AS deps
WORKDIR /app

# Copy package files for better layer caching
COPY package.json pnpm-lock.yaml* ./

# Install dependencies with frozen lockfile for reproducible builds
RUN pnpm install --frozen-lockfile --prod=false

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app

# Copy node modules and source files
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Set environment to production for build
ENV NODE_ENV=production
ENV VITE_NODE_ENV=production

# Build the application
RUN pnpm build

# Production image
FROM node:24-alpine AS runner
WORKDIR /app

# Set environment to production
ENV NODE_ENV=production
ENV HOSTNAME=0.0.0.0
ENV PORT=3230
ENV NITRO_HOST=0.0.0.0
ENV NITRO_PORT=3230

# Install necessary runtime packages
RUN apk add --no-cache curl tzdata && \
    corepack enable && \
    corepack prepare pnpm@latest --activate

# Set timezone
ENV TZ=Asia/Kuala_Lumpur

# Create a non-root user with proper home directory
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 --home /app appuser && \
    chown -R appuser:nodejs /app

# Copy built application from TanStack Start/Nitro output
COPY --from=builder --chown=appuser:nodejs /app/.output/server/index.mjs ./server/index.mjs
COPY --from=builder --chown=appuser:nodejs /app/.output/server/package.json ./server/package.json
COPY --from=builder --chown=appuser:nodejs /app/.output/server ./server
COPY --from=builder --chown=appuser:nodejs /app/.output/public ./public

# Copy drizzle migration files for database migrations
COPY --from=builder --chown=appuser:nodejs /app/drizzle ./server/drizzle

# Set working directory for the user
WORKDIR /app/server

# Install only production dependencies for the server
RUN pnpm install --prod

# Switch to non-root user
USER appuser

# Expose the port
EXPOSE 3230

# Health check to ensure the application is running
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:3230/health || exit 1

# Start the Nitro server
CMD ["node", "./index.mjs"]