# PKP Base

A foundational package providing shared wallet functionality for PKP (Programmable Key Pair) signers in the Lit Protocol ecosystem. This package manages public key operations, LIT node connections, and action execution.

## Installation

```bash
yarn add @lit-protocol/pkp-base
```

## Quick Start

```typescript
import { PKPBase } from '@lit-protocol/pkp-base';

// Initialize PKP Base
const pkpBase = new PKPBase({
  controllerAuthSig: authSig,
  pkpPubKey: publicKey,
});

// Connect to LIT node
await pkpBase.init();

// Run LIT action
const signature = await pkpBase.runLitAction(dataToSign, 'sign');
```

## Key Features

- Public key compression and management
- LIT node connection handling
- Session signature management
- LIT action execution
- Debug logging capabilities

## Core Methods

| Method | Description |
| ------ | ----------- |
| `init()` | Initialize and connect to LIT node |
| `compressPubKey()` | Compress public keys |
| `runLitAction()` | Execute LIT actions |
| `createAndSetSessionSigs()` | Manage session signatures |
| `ensureLitNodeClientReady()` | Verify node connection |

## Development

### Building

Run `nx build pkp-base` to build the library.

### Testing

Run `nx test pkp-base` to execute the unit tests.
