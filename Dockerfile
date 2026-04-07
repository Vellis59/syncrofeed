# syntax=docker/dockerfile:1

FROM node:22-alpine AS base
WORKDIR /app
RUN corepack enable

FROM base AS deps
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml* ./
RUN pnpm config set onlyBuiltDependencies better-sqlite3 && pnpm install --frozen-lockfile

FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN pnpm build

FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
RUN corepack enable
RUN apk add --no-cache python3 make g++

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml* ./
RUN pnpm config set onlyBuiltDependencies better-sqlite3 && pnpm install --prod --frozen-lockfile && pnpm rebuild better-sqlite3

COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/next.config.ts ./next.config.ts
COPY --from=builder /app/src ./src

RUN mkdir -p /app/data

EXPOSE 3000

CMD ["pnpm", "start"]
