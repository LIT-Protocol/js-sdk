# Lit Auth Client

A comprehensive authentication client for managing PKP (Programmable Key Pair) authentication with Lit Protocol. This package simplifies the integration of various authentication methods including social logins and Ethereum wallet sign-ins.

## Installation

```bash
yarn add @lit-protocol/lit-auth-client
```

## Quick Start

```typescript
import { LitAuthClient } from '@lit-protocol/lit-auth-client';

// Initialize the auth client
const client = new LitAuthClient({
  redirectUri: 'https://your-app.com/callback'
});

// Handle social login
await client.initializeGoogleLogin();

// Handle wallet authentication
await client.initializeWalletConnect();
```

## Key Features

- Social login integration
- Ethereum wallet authentication
- PKP minting and management
- Auth method linking
- Secure token handling
- Multiple provider support

## Documentation

For detailed API documentation, visit the [API reference](https://docs.lit-js-sdk-v2.litprotocol.com/modules/lit_auth_client_src.html).

## Development

### Building

Run `nx build lit-auth-client` to build the library.

### Testing

Run `nx test lit-auth-client` to execute the unit tests via [Jest](https://jestjs.io).
