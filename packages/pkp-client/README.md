# PKP-Client

This modules `PKPClient` manages multiple wallets for different blockchain networks (e.g., Ethereum and Cosmos) and offers a convenient way to create and interact with these wallets.

It provides the functionalities to register supported wallets (_registerSupportedWallets), retrieve a list of supported chains (getSupportedChains), and access wallets for specific chains (getWallet, getEthWallet, getCosmosWallet, getBtcWallet).

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
