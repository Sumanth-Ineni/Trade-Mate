# Multi-stage Dockerfile for building and running the TypeScript Node service
FROM node:20 AS builder
WORKDIR /app

# Install dependencies (including dev deps needed for tsc)
COPY package.json package-lock.json* ./
RUN npm install --legacy-peer-deps || npm install

# Copy source and build
COPY . .
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

# Install only production dependencies
COPY package.json package-lock.json* ./
RUN npm install --production --legacy-peer-deps || npm install --production

# Copy compiled output
COPY --from=builder /app/dist ./dist

# Copy a sample env file (do NOT store secrets in source control)
COPY .env.example ./.env.example

EXPOSE 3001
CMD ["node", "dist/index.js"]
