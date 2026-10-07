FROM node:24-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

ARG NEXT_PUBLIC_API_BASE_URL
ARG NEON_AUTH_URL

ENV NEXT_PUBLIC_API_BASE_URL=$NEXT_PUBLIC_API_BASE_URL
ENV NEON_AUTH_URL=$NEON_AUTH_URL
ENV NODE_ENV=production

RUN npm run build

FROM caddy:2-alpine

COPY --from=builder /app/out /usr/share/caddy
COPY Caddyfile /etc/caddy/Caddyfile