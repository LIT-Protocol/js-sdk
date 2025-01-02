# PKP WalletConnect

A WalletConnect integration for Lit Protocol's PKP (Programmable Key Pair) system, enabling secure dApp connections and session management. This package wraps WalletConnect's Web3Wallet to provide seamless PKP integration with decentralized applications.

## Installation

```bash
yarn add @lit-protocol/pkp-walletconnect
```

## Quick Start

```typescript
import { PKPWalletConnect } from '@lit-protocol/pkp-walletconnect';

// Initialize WalletConnect client
const client = new PKPWalletConnect({
  projectId: 'your-project-id',
  metadata: {
    name: 'Your App',
    description: 'Your app description',
    url: 'https://your-app.com',
    icons: ['https://your-app.com/icon.png'],
  },
});

// Handle session proposals
client.on('session_proposal', async (proposal) => {
  const approved = await client.approveSession(proposal);
});

// Handle session requests
client.on('session_request', async (request) => {
  const response = await client.respondToRequest(request);
});
```

## Key Features

- WalletConnect v2.0 integration
- dApp pairing management
- Session proposal handling
- Request/response management
- Multi-chain support
- Event handling system

## Core Functionality

- Session Management: Handle dApp connections
- Request Processing: Respond to session requests
- Pairing: Manage PKP-dApp pairings
- Event Handling: Subscribe to WalletConnect events
- Chain Configuration: Support multiple blockchains

For detailed API documentation, visit the [API reference](https://docs.lit-js-sdk-v2.litprotocol.com/modules/pkp_walletconnect_src.html).

## Development

### Building

Run `nx build pkp-walletconnect` to build the library.

### Testing

Run `nx test pkp-walletconnect` to execute the unit tests.
