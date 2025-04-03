# PKP Permissions Manager

A comprehensive manager for PKP (Programmable Key Pair) permissions that provides a unified interface for managing LitAction and Address permissions with batch operations.

## Features

- **Unified API**: Consistent interface for all permission operations
- **Batch Operations**: Perform multiple permission changes efficiently
- **Type Safety**: Full TypeScript type definitions
- **Comprehensive Logging**: Detailed logging for debugging

## Installation

The Permissions Manager is part of the PKP Auth Service and doesn't require separate installation.

## Usage

### Creating a Permissions Manager

```typescript
import { PKPPermissionsManager } from 'services/lit/LitChainClient/apis/abstract/PKPPermissionsManager';
import { datilDevNetworkContext } from 'services/lit/LitNetwork/vDatil/datil-dev/networkContext';

// Create the permissions manager with a PKP identifier
const manager = new PKPPermissionsManager(
  { tokenId: 'YOUR_TOKEN_ID' }, // Can also use { pubkey: "0x..." } or { address: "0x..." }
  datilDevNetworkContext
);
```

### Managing LitAction Permissions

```typescript
// Add a permitted LitAction
await manager.addPermittedAction({
  ipfsId: 'QmYourIpfsId',
  scopes: ['sign-anything'],
});

// Check if a LitAction is permitted
const isPermitted = await manager.isPermittedAction({
  ipfsId: 'QmYourIpfsId',
});

// Get all permitted LitActions
const litActions = await manager.getPermittedActions();

// Remove a permitted LitAction
await manager.removePermittedAction({
  ipfsId: 'QmYourIpfsId',
});
```

### Managing Address Permissions

```typescript
// Add a permitted address
await manager.addPermittedAddress({
  address: '0xYourAddress',
  scopes: ['sign-anything'],
});

// Check if an address is permitted
const isAddressPermitted = await manager.isPermittedAddress({
  address: '0xYourAddress',
});

// Get all permitted addresses
const addresses = await manager.getPermittedAddresses();

// Remove a permitted address
await manager.removePermittedAddress({
  address: '0xYourAddress',
});
```

### Getting Permissions Context

```typescript
// Get comprehensive permissions context
const context = await manager.getPermissionsContext();

// Use context for efficient permission checks
if (context.isActionPermitted('0xActionHash')) {
  // Action is permitted
}

if (context.isAddressPermitted('0xAddress')) {
  // Address is permitted
}

// Access all permissions
console.log(context.actions); // All permitted LitActions
console.log(context.addresses); // All permitted addresses
```

### Batch Operations

```typescript
// Perform multiple operations in a single call
await manager.batchUpdatePermissions([
  {
    type: 'addAction',
    ipfsId: 'QmNewLitAction',
    scopes: ['sign-anything'],
  },
  {
    type: 'addAddress',
    address: '0xNewAddress',
    scopes: ['sign-anything'],
  },
  {
    type: 'removeAction',
    ipfsId: 'QmOldLitAction',
  },
  {
    type: 'removeAddress',
    address: '0xOldAddress',
  },
]);
```

### Revoking All Permissions

```typescript
// Revoke all permissions for the PKP
await manager.revokeAllPermissions();
```

### Getting PKPs by Address

```typescript
// Static method to get all PKPs associated with an address
const pkps = await PKPPermissionsManager.getPKPsByAddress(
  '0xYourAddress',
  datilDevNetworkContext
);
```

## API Reference

### Constructor

```typescript
constructor(identifier: PkpIdentifierRaw, networkContext: DatilContext)
```

- `identifier`: PKP identifier (tokenId, pubkey, or address)
- `networkContext`: Network context for contract interactions

### Instance Methods

#### LitAction Permissions

- `addPermittedAction(params: { ipfsId: string; scopes: ScopeString[] })`: Add a permitted LitAction
- `removePermittedAction(params: { ipfsId: string })`: Remove a permitted LitAction
- `isPermittedAction(params: { ipfsId: string })`: Check if a LitAction is permitted
- `getPermittedActions()`: Get all permitted LitActions

#### Address Permissions

- `addPermittedAddress(params: { address: string; scopes: ScopeString[] })`: Add a permitted address
- `removePermittedAddress(params: { address: string })`: Remove a permitted address
- `isPermittedAddress(params: { address: string })`: Check if an address is permitted
- `getPermittedAddresses()`: Get all permitted addresses

#### Comprehensive Management

- `getPermissionsContext()`: Get comprehensive permissions context
- `revokeAllPermissions()`: Revoke all permissions for a PKP
- `batchUpdatePermissions(operations)`: Perform batch permission operations

### Static Methods

- `getPKPsByAddress(address: string, networkContext: DatilContext)`: Get all PKPs associated with an address

## Types

### ScopeString

Available permission scopes:

- `"no-permissions"`: No permissions granted
- `"sign-anything"`: Permission to sign any message
- `"personal-sign"`: Permission for personal signatures only

## License

This code is part of the PKP Auth Service and is subject to its license terms.
