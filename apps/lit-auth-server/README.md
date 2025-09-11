# Getting started

## Building the server

```
nx run lit-auth-server:build
```

# Running the server

```
pnpm nx run lit-auth-server:serve:production

or

node ./dist/apps/lit-auth-server/main.cjs
```

# Building for Docker

```
docker build -f apps/lit-auth-server/Dockerfile -t lit-auth-server .
```

# Running Docker image

```
docker run --rm -p 3000:3000 --env-file ./apps/lit-auth-server/.env lit-auth-server

// or with individual env variables
docker run -rm -p 3000:3000 -e AUTH_SERVER_HOST=0.0.0.0 -e NETWORK=naga-dev -e LIT_TXSENDER_RPC_URL=xxx -e LIT_TXSENDER_PRIVATE_KEY=xxx -e LOG_LEVEL=debug -e ENABLE_API_KEY_GATE=false -e STYTCH_PROJECT_ID=xxx -e STYTCH_SECRET=xxx -e MAX_REQUESTS_PER_WINDOW=10 -e WINDOW_MS=10000 -e REDIS_URL=redis://default:xxx@redis-11111.c222.aaa.com:19810 lit-auth-server
```

# Publishing Docker

1. Login to GHCR

```
echo $GHCR_PAT | docker login ghcr.io -u USERNAME --password-stdin
```

2. Tag your local image

```
docker tag lit-auth-server:latest ghcr.io/lit-protocol/lit-auth-server:latest
```

3. Push it

```
docker push ghcr.io/lit-protocol/lit-auth-server:latest
```

## Building for linux/amd64

```
docker buildx build \
  --platform linux/amd64 \
  -t ghcr.io/lit-protocol/lit-auth-server:latest \
  -f ./apps/lit-auth-server/Dockerfile \
  --push \
  .
```

## Verify after push

```
docker pull ghcr.io/lit-protocol/lit-auth-server:latest
docker inspect ghcr.io/lit-protocol/lit-auth-server:latest --format '{{.Architecture}}'
```