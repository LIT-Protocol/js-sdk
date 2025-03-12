# LitChainClient

A TypeScript client for interacting with Lit Protocol's blockchain contracts. This client provides a type-safe interface for minting and managing Programmable Key Pairs (PKPs).

## Overview

LitChainClient abstracts blockchain interactions with Lit Protocol's smart contracts, offering both raw contract APIs and higher-level convenience functions.

## Available APIs

The client provides three main API objects:

### LitChainClientAPI (High-Level APIs)

**PKP Management:**

- `mintPKP` - Simplified interface for minting a new PKP

**Permissions Management:**

- `PKPPermissionsManager` - Class for managing permissions for PKPs
  - Provides methods for managing permissions using PKP identifiers (tokenId, pubkey, or address)

### LitChainClientRawAPI (Low-Level APIs / Direct Contract calls)

**PKP (Programmable Key Pair) Operations:**

- `pkp.read.tokenOfOwnerByIndex` - Get PKP token by owner and index
- `pkp.write.mintNextAndAddAuthMethods` - Mint a new PKP and add authentication methods
- `pkp.write.claimAndMintNextAndAddAuthMethodsWithTypes` - Claim, mint a PKP, and add auth methods with types

**Permission Operations:**

- `permission.read.getPermittedAddresses` - Get addresses with permissions for a PKP
- `permission.read.getPermittedActions` - Get permitted actions for a PKP
- `permission.read.isPermittedAddress` - Check if an address has permission
- `permission.read.isPermittedAction` - Check if an action is permitted
- `permission.write.addPermittedAction` - Add a permitted action
- `permission.write.removePermittedAction` - Remove a permitted action
- `permission.write.addPermittedAddress` - Add a permitted address
- `permission.write.removePermittedAddress` - Remove a permitted address

### LitChainClientUtils

**Utility Functions:**

- `createLitContracts` - Create contract instances for interacting with Lit Protocol

## Usage Examples

### Using High-Level API

```typescript
import { LitChainClientAPI } from "../LitChainClient/apis";

// Minting a PKP with simplified API
const result = await LitChainClientAPI.mintPKP(
  {
    authMethod: {
      authMethodType: 1,
      id: "example-id",
      pubkey: "0x...", // webAuthn only
    },
  },
  networkContext
);

// Using PKP Permissions Manager
const permissionsManager = new LitChainClientAPI.PKPPermissionsManager(
  networkContext
);
await permissionsManager.addPermittedAction(tokenId, actionId);
```

### Using Raw API

```typescript
import { LitChainClientRawAPI } from "../LitChainClient/apis";

// Using the raw API
const result = await LitChainClientRawAPI.pkp.write.mintNextAndAddAuthMethods(
  {
    keyType: 2,
    permittedAuthMethodTypes: [1],
    permittedAuthMethodIds: ["example-id"],
    permittedAuthMethodPubkeys: ["0x..."],
    permittedAuthMethodScopes: [[1, 2, 3]],
    addPkpEthAddressAsPermittedAddress: true,
    sendPkpToItself: false,
  },
  networkContext
);

// Using permission APIs
const isPermitted =
  await LitChainClientRawAPI.permission.read.isPermittedAddress(
    tokenId,
    address
  );
```

### Using Utilities

```typescript
import { LitChainClientUtils } from "../LitChainClient/apis";

// Create contract instances
const contracts = LitChainClientUtils.createLitContracts(networkContext);
```

## Configuration

The client is pre-configured for the Chronicle Yellowstone testnet. Configuration options are in `_config.ts`.

## API Structure

- **Raw Contract APIs** (`apis/rawContractApis/`):

  - `pkp/` - PKP contract functions
    - `read/` - Read-only functions
    - `write/` - State-changing functions
  - `permission/` - Permission functions
    - `read/` - Permission queries
    - `write/` - Permission modifications

- **High-Level APIs** (`apis/highLevelApis/`):

  - `mintPKP/` - Simplified PKP minting functions
  - `PKPPermissionsManager/` - Enhanced permission management

- **Utilities** (`apis/utils/`):
  - Helper functions for contract interactions
