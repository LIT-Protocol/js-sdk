# Lit Node Client

This module is the main interface for interacting with the Lit Protocol network. It provides a robust client implementation that handles network communication, authentication, and node interactions in both browser and Node.js environments.

## Installation

```bash
yarn add @lit-protocol/lit-node-client
```

## Quick Start

```typescript
import { LitNodeClient } from '@lit-protocol/lit-node-client';

// Initialize the client
const client = new LitNodeClient({
  litNetwork: 'datil',
});

// Connect to the network
await client.connect();
```

## Key Features

- Seamless authentication with Lit nodes
- Default authentication callback using `checkAndSignAuthMessage`
- Cross-platform support (browser and Node.js)
- Network connection management
- Secure node communication
- Automatic request handling and retries
