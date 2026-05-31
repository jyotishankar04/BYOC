# ── Stage 1: Install all dependencies ─────────────────────────────────────────
FROM node:22-alpine AS deps
WORKDIR /app

RUN npm install -g pnpm@10.33.0

COPY package.json pnpm-lock.yaml .npmrc ./
RUN pnpm install --frozen-lockfile

# ── Stage 2: Build ─────────────────────────────────────────────────────────────
FROM node:22-alpine AS builder
WORKDIR /app

RUN npm install -g pnpm@10.33.0

COPY package.json pnpm-lock.yaml ./
COPY prisma ./prisma
COPY --from=deps /app/node_modules ./node_modules

RUN pnpm exec prisma generate

COPY src ./src
COPY tsconfig.json ./
RUN pnpm build

# ── Stage 3: Production runtime ────────────────────────────────────────────────
FROM node:22-alpine AS runner
WORKDIR /app

RUN npm install -g pnpm@10.33.0

COPY package.json pnpm-lock.yaml .npmrc ./
RUN pnpm install --frozen-lockfile --prod

COPY --from=builder /app/dist ./dist
COPY prisma ./prisma
COPY prisma.config.ts ./

# Generate Prisma client while still root so engine binaries are pre-extracted;
# the node user won't need write access to node_modules at runtime.
RUN pnpm exec prisma generate

RUN printf '#!/bin/sh\nset -e\npnpm exec prisma migrate deploy\nexec node dist/src/server.js\n' > start.sh && chmod +x start.sh

EXPOSE 4000

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -qO- http://localhost:4000/health/ready || exit 1

USER node

CMD ["sh", "start.sh"]
