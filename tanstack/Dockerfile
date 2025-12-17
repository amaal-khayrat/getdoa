FROM node:24-alpine AS base

# Set working directory
WORKDIR /app

# Install pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# Install dependencies only when needed
FROM base AS deps
WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml* ./

# Install dependencies
RUN pnpm install --frozen-lockfile

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app

# Copy node modules and source files
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build the application
ENV NODE_ENV production
RUN pnpm build

# Production image, copy all the files and run
FROM node:20-alpine AS runner
WORKDIR /app

# Set environment to production
ENV NODE_ENV production

# Install necessary production packages and enable pnpm
RUN apk --no-cache add curl tzdata && \
    corepack enable && \
    corepack prepare pnpm@latest --activate

# Set timezone
ENV TZ=Asia/Kuala_Lumpur

# Create a non-root user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 appuser

# Copy build output and necessary files
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/vite.config.js ./vite.config.js

# Set correct ownership
RUN chown -R appuser:nodejs /app

# Use the non-root user
USER appuser

# Expose the port
EXPOSE 3000

# Start the application using pnpm (as per user requirements)
CMD ["pnpm", "run", "serve"]