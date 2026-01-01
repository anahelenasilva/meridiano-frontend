# Next.js Dockerfile for Static Export
FROM node:20-alpine AS builder

# Install pnpm (or npm/yarn)
RUN npm install -g pnpm

WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml* ./

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source code
COPY . .

# Build arguments for environment variables
ARG NEXT_PUBLIC_API_BASE_URL
ENV NEXT_PUBLIC_API_BASE_URL=$NEXT_PUBLIC_API_BASE_URL

# Build Next.js static export
RUN pnpm run build

# Production stage with nginx
FROM nginx:alpine

# Copy built files from builder stage
# Next.js static export outputs to 'out' directory by default
COPY --from=builder /app/out /usr/share/nginx/html/meridian

# Copy nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget --quiet --tries=1 --spider http://127.0.0.1/meridian/ || exit 1

# Start nginx
CMD ["nginx", "-g", "daemon off;"]