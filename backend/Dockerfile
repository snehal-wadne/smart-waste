# Multi-stage production Dockerfile for Waste Collection Backend on Google Cloud Run
FROM node:20-alpine AS builder

WORKDIR /app

# Install OpenSSL for Prisma on Alpine
RUN apk add --no-cache openssl

COPY package*.json ./
COPY prisma ./prisma/

RUN npm ci
RUN npx prisma generate

FROM node:20-alpine AS runner

WORKDIR /app

RUN apk add --no-cache openssl

ENV NODE_ENV=production
# Google Cloud Run injects PORT (defaults to 8080)
ENV PORT=8080

COPY package*.json ./
RUN npm ci --only=production

COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY prisma ./prisma
COPY src ./src

# Create and use non-root user
USER node

EXPOSE 8080

CMD ["node", "src/server.js"]
