# 🔮 Tarot Mystique API - Dockerfile
# Ancient Wisdom Containerized

# Use Node.js LTS Alpine for smaller image size
FROM node:18-alpine AS base

# Add necessary packages for Prisma
RUN apk add --no-cache openssl

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./
COPY prisma ./prisma/

# Install dependencies
RUN npm ci --only=production && npm cache clean --force

# Generate Prisma client
RUN npx prisma generate

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Production stage
FROM node:18-alpine AS production

# Add necessary packages
RUN apk add --no-cache openssl dumb-init

# Create non-root user
RUN addgroup -g 1001 -S tarot && \
    adduser -S tarot -u 1001

# Set working directory
WORKDIR /app

# Copy built application
COPY --from=base --chown=tarot:tarot /app/dist ./dist
COPY --from=base --chown=tarot:tarot /app/node_modules ./node_modules
COPY --from=base --chown=tarot:tarot /app/prisma ./prisma
COPY --from=base --chown=tarot:tarot /app/package*.json ./

# Create uploads directory
RUN mkdir -p /app/uploads && chown tarot:tarot /app/uploads

# Switch to non-root user
USER tarot

# Expose ports
EXPOSE 3000 3001

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1); }).on('error', () => { process.exit(1); });"

# Start the mystical server
CMD ["dumb-init", "node", "dist/main"]
