# Crypto

A comprehensive cryptographic toolkit for the Lit Protocol SDK that handles secure key operations, encryption/decryption, and advanced cryptographic schemes.

## Installation

```bash
yarn add @lit-protocol/crypto
```

## Quick Start

```typescript
import { 
  generatePrivateKey,
  encryptWithSignature 
} from '@lit-protocol/crypto';

// Generate a new private key
const privateKey = await generatePrivateKey();

// Encrypt data with signature
const encryptedData = await encryptWithSignature(data, signature);
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
