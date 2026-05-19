FROM node:20-alpine AS builder

WORKDIR /app

# Build React client
COPY client/package*.json ./client/
RUN cd client && npm ci

COPY client/ ./client/
RUN cd client && npm run build

# ---- Production image ----
FROM node:20-alpine

WORKDIR /app

# Install server deps
COPY server/package*.json ./server/
RUN cd server && npm ci --omit=dev

COPY server/ ./server/

# Copy built client into server's public folder
RUN mkdir -p server/public
COPY --from=builder /app/client/dist ./server/public/

EXPOSE 3000

CMD ["node", "server/index.js"]
