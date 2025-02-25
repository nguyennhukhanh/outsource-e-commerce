FROM node:21-alpine AS base
RUN apk update
RUN apk add --no-cache libc6-compat
RUN npm install -g bun

# Build stage
FROM base AS builder
WORKDIR /app
COPY . .

# Install dependencies
FROM base AS installer
WORKDIR /app

COPY --from=builder /app/.gitignore /app/.gitignore
COPY --from=builder /app/package.json /app/package.json
COPY --from=builder /app/bun.lockb /app/bun.lockb

RUN bun install

COPY --from=builder /app /app

# Generate logs and public files
RUN bun run generate:logs
RUN bun run generate:public

# Build the project
RUN bun run build

# Runtime stage
FROM base AS runner
WORKDIR /app

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nestjs

RUN mkdir -p /app/logs && chown nestjs:nodejs /app/logs
RUN mkdir -p /app/public && chown nestjs:nodejs /app/public

USER nestjs

COPY --from=installer --chown=nestjs:nodejs /app/package.json /app/package.json
COPY --from=installer --chown=nestjs:nodejs /app /app

EXPOSE 8888
ENV PORT 8888

CMD ["bun", "run", "start:prod"]
