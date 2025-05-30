# Use Bun's official image
FROM oven/bun:1 AS base

WORKDIR /app

# Copy the entire monorepo (since packages depend on each other)
COPY . .

# Install dependencies from root (handles monorepo workspace)
RUN bun install --frozen-lockfile

# Build the project
RUN bun run build

# Set working directory to auth-services
WORKDIR /app/packages/auth-services

# Render provides PORT automatically
ENV PORT=3000
EXPOSE $PORT

# Run the server
CMD ["bun", "run", "src/auth-server/server.ts"]