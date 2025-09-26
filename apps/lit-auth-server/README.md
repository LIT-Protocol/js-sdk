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

# Building the Docker image

```
nx run lit-auth-server:docker-build
```
