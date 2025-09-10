# PKP Auth Services

This package contains the PKP Authentication Services & Login Server for the Lit Protocol.

# Auth Server

## Getting started

```shell
pnpm install @lit-protocol/auth-services
```

### Usage

```ts
import { createLitAuthServer } from '@lit-protocol/auth-services';
import { startAuthServiceWorker } from '@lit-protocol/auth-services';

const litAuthServer = createLitAuthServer({
  port: Number(3001),
  host: '0.0.0.0',
  network: process.env['NETWORK'],
  litTxsenderRpcUrl: process.env['LIT_TXSENDER_RPC_URL'] as string,
  litTxsenderPrivateKey: process.env['LIT_TXSENDER_PRIVATE_KEY'],
  enableApiKeyGate: true,
  stytchProjectId: process.env['STYTCH_PROJECT_ID'],
  stytchSecretKey: process.env['STYTCH_SECRET'],
  maxRequestsPerWindow: Number(process.env['MAX_REQUESTS_PER_WINDOW']),
  windowMs: Number(process.env['WINDOW_MS']),
  redisUrl: process.env['REDIS_URL'] as string,
});

// Start the auth server
await litAuthServer.start();

// Requires REDIS_URL
await startAuthServiceWorker({
  litTxsenderRpcUrl: process.env['LIT_TXSENDER_RPC_URL'] as string,
  redisUrl: process.env['REDIS_URL'] as string,
});
```

# Login Server

## Getting started

```shell
pnpm install @lit-protocol/auth-services
```

### Usage

```ts
import { createLitLoginServer } from '@lit-protocol/auth-services';

const litLoginServer = createLitLoginServer({
  port: Number(process.env['LOGIN_SERVER_PORT']),
  host: process.env['LOGIN_SERVER_HOST'],
  stateExpirySeconds: 30,
  socialProviders: {
    google: {
      clientId: process.env['LOGIN_SERVER_GOOGLE_CLIENT_ID'] as string,
      clientSecret: process.env['LOGIN_SERVER_GOOGLE_CLIENT_SECRET'] as string,
    },
    discord: {
      clientId: process.env['LOGIN_SERVER_DISCORD_CLIENT_ID'] as string,
      clientSecret: process.env['LOGIN_SERVER_DISCORD_CLIENT_SECRET'] as string,
    },
  },
});

await litLoginServer.start();
```