# Multi-stage production Dockerfile for Waste Collection Frontend on Google Cloud Run
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . ./

# Build production assets
RUN npm run build

FROM nginx:1.25-alpine AS runner

COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Google Cloud Run default port is 8080
EXPOSE 8080

CMD ["nginx", "-g", "daemon off;"]
