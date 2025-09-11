# Getting started

## Building the server

```
nx run lit-login-server:build
```

# Running the server

```
pnpm nx run lit-login-server:serve:production

or

node ./dist/apps/lit-login-server/main.cjs
```

# Building for Docker

```
docker build -f apps/lit-login-server/Dockerfile -t lit-login-server .
```

# Running Docker image

```
docker run --rm -p 3001:3001 --env-file ./apps/lit-login-server/.env lit-login-server

// or with individual env variables
docker run -rm -p 3001:3001 -e LOGIN_SERVER_HOST=0.0.0.0 -e ORIGIN=http://localhost:3300 -e LOGIN_SERVER_GOOGLE_CLIENT_ID=xxx -e LOGIN_SERVER_GOOGLE_CLIENT_SECRET=xxx -e LOGIN_SERVER_DISCORD_CLIENT_ID=xxx -e LOGIN_SERVER_DISCORD_CLIENT_SECRET=xxx lit-login-server
```

# Publishing Docker

1. Login to GHCR

```
echo $GHCR_PAT | docker login ghcr.io -u USERNAME --password-stdin
```

2. Tag your local image

```
docker tag lit-login-server:latest ghcr.io/lit-protocol/lit-login-server:latest
```

3. Push it

```
docker push ghcr.io/lit-protocol/lit-login-server:latest
```

## Building for linux/amd64

```
docker buildx build \
  --platform linux/amd64 \
  -t ghcr.io/lit-protocol/lit-login-server:latest \
  -f ./apps/lit-login-server/Dockerfile \
  --push \
  .
```

## Verify after push

```
docker pull ghcr.io/lit-protocol/lit-login-server:latest
docker inspect ghcr.io/lit-protocol/lit-login-server:latest --format '{{.Architecture}}'
```
