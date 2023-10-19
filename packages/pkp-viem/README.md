# pkp-viem

This module is a modified version of Custom Account interface `toAccount()` from `viem`. `PKPViemAccount` does not store private key but still has all the functionality of its counterpart. `PKPViemAccount` class extended `PKPBase` class and implemented `LocalAccount` from `viem`,

What is viem?
https://viem.sh/docs/introduction.html

API: https://viem.sh/docs/accounts/custom.html

# Getting Started

```
yarn add @lit-protocol/pkp-viem viem
```

# Examples

You can use Accoun action and Wallet action.
`PKPViemAccount` is a `LocalAccount`, User can use Account Action with it. <br>
using `createWalletClient` User can use Wallet Action.

Wallet Action: https://viem.sh/docs/actions/wallet/introduction.html <br>
Account Action: https://viem.sh/docs/accounts/custom.html

## Account Action

### Create a account and get the address

```typescript
import { PKPViemAccount } from 'viem';

const account = new PKPViemAccount({
  controllerAuthSig: AuthSig,
  pkpPubKey: PKPPubKey,
});

return account.address;
```

### Sign Message

```typescript
import { verifyMessage } from 'viem';

// returns signature
const signature = await account.signMessage({ message: 'Hello World' });
// check signing message is successful
const valid = await verifyMessage({
  address: account.address,
  message: 'Hello World',
  signature: signature,
});
```

### Sign TypedData

```typescript
// message
const message = {
  from: {
    name: 'Cow',
    wallet: '0xCD2a3d9F938E13CD947Ec05AbC7FE734Df8DD826',
  },
  to: {
    name: 'Bob',
    wallet: '0xbBbBBBBbbBBBbbbBbbBbbbbBBbBbbbbBbBbbBBbB',
  },
  contents: 'Hello, Bob!',
} as const;

// domain
const domain = {
  name: 'Ether Mail',
  version: '1',
  chainId: 1,
  verifyingContract: '0xCcCCccccCCCCcCCCCCCcCcCccCcCCCcCcccccccC',
} as const;

// The named list of all type definitions
const types = {
  Person: [
    { name: 'name', type: 'string' },
    { name: 'wallet', type: 'address' },
  ],
  Mail: [
    { name: 'from', type: 'Person' },
    { name: 'to', type: 'Person' },
    { name: 'contents', type: 'string' },
  ],
} as const;

// returns signature
const signature = await account.signTypedData({
  domain: {
    name: 'Ether Mail',
    version: '1',
    chainId: 1,
    verifyingContract: '0xCcCCccccCCCCcCCCCCCcCcCccCcCCCcCcccccccC',
  },
  types: {
    Person: [
      { name: 'name', type: 'string' },
      { name: 'wallet', type: 'address' },
    ],
    Mail: [
      { name: 'from', type: 'Person' },
      { name: 'to', type: 'Person' },
      { name: 'contents', type: 'string' },
    ],
  },
  primaryType: 'Mail',
  message: {
    from: {
      name: 'Cow',
      wallet: '0xCD2a3d9F938E13CD947Ec05AbC7FE734Df8DD826',
    },
    to: {
      name: 'Bob',
      wallet: '0xbBbBBBBbbBBBbbbBbbBbbbbBBbBbbbbBbBbbBBbB',
    },
    contents: 'Hello, Bob!',
  },
});

// check if signing TypedData is successful
const valid = await verifyTypedData({
  address: account.address,
  domain,
  types,
  primaryType: 'Mail',
  message,
  signature: signature,
});
```

### Sign Transaction

```typescript
// viem has a built-in serializer for Legacy, EIP-2930 (0x01) and EIP-1559 (0x02) transaction types
 You can pass legacy, eip2930, eip1559 as a type
const signature = await account.signTransaction({
  to: recipient,
  type: 'legacy',
});
```

## Wallet Client Action

### Create Wallet Client

```typescript
import { defineChain, createWalletClient, http } from 'viem';

// Define Custom Chain for Lit Chronicle
const chronicle = defineChain({
  id: 175177,
  name: 'Chronicle',
  network: 'chronicle',
  nativeCurrency: {
    decimals: 18,
    name: 'LIT',
    symbol: 'LIT',
  },
  rpcUrls: {
    default: {
      http: ['https://chain-rpc.litprotocol.com/http'],
    },
    public: {
      http: ['https://chain-rpc.litprotocol.com/http'],
    },
  },
});

const account = new PKPViemAccount({
  controllerAuthSig: AuthSig,
  pkpPubKey: PKPPubKey,
});

const walletClient = createWalletClient({
  account: account,
  transport: http(),
  chain: chronicle,
});
```

### Send Transaction

```typescript
const hash = await walletClient.sendTransaction({
  account,
  to: recipient,
  value: amount,
  chain: walletClient.chain,
});
```

### Send Raw transaction

```typescript
// get transaction request object from prepareTransactionRequest
const request = await walletClient.prepareTransactionRequest({
  account,
  to: recipient,
  value: amount,
  chain: walletClient.chain,
});

const signature = await walletClient.signTransaction(request);

const hash = await walletClient.sendRawTransaction({
  serializedTransaction: signature,
});
```
