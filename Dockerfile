FROM oven/bun:1.3.6 AS app

WORKDIR /app

ENV NODE_ENV=production
ENV SKIP_ENV_VALIDATION=1
ENV PORT=3000

# Dependencies (prisma schema is needed because bun runs postinstall)
COPY bun.lock package.json ./
COPY prisma ./prisma
RUN bun install --frozen-lockfile

# Build application
COPY . .
RUN bun run db:generate
RUN bun run build

EXPOSE 3000

CMD ["bun", "run", "start", "--", "--hostname", "0.0.0.0", "--port", "3000"]
