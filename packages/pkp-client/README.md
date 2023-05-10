# PKP-Client

It provides a PKPClient class that manages multiple wallets for different blockchain networks (e.g., Ethereum and Cosmos) and offers a convenient way to create and interact with these wallets.

# Getting Started

```
yarn add @lit-protocol/pkp-client
```

# Init

```js
const pkpClient = new PKPClient({
  controllerAuthSig: LITCONFIG.CONTROLLER_AUTHSIG,
  pkpPubKey: PKP_PUBKEY,
  cosmosAddressPrefix: 'cosmos',
});

await pkpClient.connect();

// using a eth wallet
const pkpEthWallet = pkpClient.getEthWallet();

// using a cosmos wallet
const pkpCosmosWallet = pkpClient.getCosmosWallet();

// using a btc wallet (coming soon)

```

More examples here:
https://github.com/LIT-Protocol/js-sdk/blob/master/packages/pkp-client/src/lib/pkp-client.spec.ts
