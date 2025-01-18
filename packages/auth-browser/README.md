# Auth Browser

Browser-specific authentication utilities for the Lit Protocol, enabling seamless connection to various blockchain networks including Ethereum, Cosmos, and Solana.

## Installation

```bash
yarn add @lit-protocol/auth-browser
```

## Quick Start

```typescript
import { checkAndSignAuthMessage } from '@lit-protocol/auth-browser';

// Generate an authSig with long expiration
const expiration = new Date(
  Date.now() + 1000 * 60 * 60 * 24 * 30
).toISOString();
const authSig = await checkAndSignAuthMessage({
  chain: 'ethereum',
  expiration: expiration,
});
```

## Key Features

- Multi-chain authentication support
  - Ethereum
  - Cosmos
  - Solana
- Convenient network connection management
- Automatic signature generation
- Flexible expiration handling
- Network disconnection utilities

## Authentication Methods

- Standard Authentication: Quick connect with default settings
- Custom Expiration: Control signature validity period
- Multi-Chain Support: Connect to different networks
- Network Management: Connect and disconnect as needed
