# Auth Helpers

Advanced authentication utilities for managing blockchain resource permissions and capabilities within the Lit Protocol ecosystem. Built on top of SIWE (Sign-In with Ethereum) and SIWE-RECAP for robust authentication flows.

## Installation

```bash
yarn add @lit-protocol/auth-helpers
```

## Quick Start

```typescript
import {
  encodeSessionCapabilities,
  verifyCapabilities,
} from '@lit-protocol/auth-helpers';

// Encode session capabilities
const encoded = await encodeSessionCapabilities(capabilities);

// Verify resource capabilities
const isValid = await verifyCapabilities(resource, capabilities);
```

## Key Features

- Session capability management
- SIWE integration and extensions
- Resource permission handling
- Proof and attestation support
- Custom capability verification
- Lit Protocol-specific methods

## Core Functionality

- Capability Encoding/Decoding: Manage session permissions
- Resource Verification: Check access rights
- SIWE Message Enhancement: Add capability information
- Permission Management: Handle resource access
- Proof System: Manage attestations and verifications
