# PKP Cosmos

A specialized wallet implementation for the Cosmos blockchain ecosystem using Lit Protocol's PKP (Programmable Key Pair) technology. Built on top of `@cosmjs/proto-signing`, this package enables secure transaction signing and account management through Lit nodes.

## Installation

```bash
yarn add @lit-protocol/pkp-cosmos
```

## Quick Start

```typescript
import { PKPCosmosWallet } from '@lit-protocol/pkp-cosmos';

// Initialize wallet
const wallet = new PKPCosmosWallet({
  controllerAuthSig: authSig,
  pkpPubKey: publicKey,
  addressPrefix: 'cosmos',
});

// Get wallet address
const address = await wallet.getAddress();

// Sign transaction
const signedTx = await wallet.signDirect(address, {
  bodyBytes: tx.bodyBytes,
  authInfoBytes: tx.authInfoBytes,
  chainId: chainId,
});
```

## Key Features

- Bech32 address generation
- Account data management
- Transaction signing via LIT nodes
- SigningStargateClient integration
- Customizable RPC endpoints
- Flexible address prefix support

## Core Functionality

- Address Generation: Create Cosmos blockchain addresses
- Transaction Management: Sign and prepare transactions
- Client Integration: Create SigningStargateClient instances
- Account Operations: Manage account data and balances
- Network Configuration: Customize RPC URLs and prefixes
