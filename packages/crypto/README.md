# Crypto

A comprehensive cryptographic toolkit for the Lit Protocol SDK that handles secure key operations, encryption/decryption, and advanced cryptographic schemes.

## Installation

```bash
yarn add @lit-protocol/crypto
```

## Quick Start

```typescript
import { generateSessionKeyPair, encrypt } from '@lit-protocol/crypto';

// Generate a new key pair
const keyPair = await generateSessionKeyPair();

// Encrypt data with public key and identity param
const encryptedData = await encrypt(
  keyPair.slice(2),
  new Uint8Array([1, 2, 3]),
  new Uint8Array([4, 5, 6])
);
```

## Key Features

- Private key generation and management
- BLS and ECDSA cryptographic schemes
- Secure key import/export
- Data encryption and decryption
- Cryptographic share management
- Signature generation and verification

## Supported Operations

- Key Generation: Create secure cryptographic keys
- Encryption/Decryption: Protect sensitive data
- Share Management: Handle distributed key shares
- Signature Operations: Generate and verify cryptographic signatures
