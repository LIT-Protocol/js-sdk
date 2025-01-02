# PKP Ethers

A specialized Ethereum wallet implementation using Lit Protocol's PKP (Programmable Key Pair) technology, built as an extension of ethers.js Wallet. This package provides secure transaction signing and account management through Lit nodes without storing private keys locally.

## Installation

```bash
yarn add @lit-protocol/pkp-ethers ethers
```

## Quick Start

```typescript
import { PKPEthersWallet } from '@lit-protocol/pkp-ethers';

// Initialize wallet
const wallet = new PKPEthersWallet({
  controllerAuthSig: authSig,
  pkpPubKey: publicKey,
});

// Get wallet address
const address = await wallet.getAddress();

// Sign transaction
const signedTx = await wallet.signTransaction({
  to: recipient,
  value: ethers.utils.parseEther('0.1'),
});
```

## Key Features

- Secure transaction signing via LIT nodes
- Full ethers.js Wallet compatibility
- JSON-RPC request handling
- Balance and nonce management
- Gas estimation support
- Message signing capabilities

## Core Functionality

- Transaction Management: Sign and send transactions
- Account Operations: Get balances and transaction counts
- Message Signing: Sign messages and typed data
- Network Integration: Connect to any EVM network
- Gas Handling: Estimate and manage gas costs

For detailed API documentation, visit:
https://docs.ethers.org/v4/api-wallet.html
