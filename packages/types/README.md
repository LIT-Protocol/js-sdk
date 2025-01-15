# Types

This package provides comprehensive TypeScript type definitions for the entire Lit Protocol ecosystem. It exports interfaces and types that ensure type safety and provide excellent IDE support across all Lit Protocol packages.

## Installation

```bash
yarn add @lit-protocol/types
```

## Quick Start

```typescript
import {
  AccessControlConditions,
  ChainProperties,
  AuthStatus,
  WalletProvider,
} from '@lit-protocol/types';

// Use types in your code
const conditions: AccessControlConditions = {
  // ... your conditions
};
```

## Available Types

- Access Control Conditions: Define access rules
- Chain Properties: Blockchain-specific configurations
- JSON Request/Response: Network communication types
- Authentication: Auth status and provider types
- Wallet Providers: Supported wallet options
- Node Configuration: Lit node setup types
- Protocol Interfaces: Core protocol definitions

## Benefits

- Full TypeScript support
- Enhanced code completion
- Compile-time type checking
- Better development experience
- Consistent type definitions across packages
