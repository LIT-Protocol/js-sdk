# PKPCosmos

The `PKPCosmosWallet` class is a specialized wallet for the Cosmos blockchain, based on the `DirectSecp256k1HdWallet` class from the `@cosmjs/proto-signing` library. This class wraps the `PKPBase` class and implements the `OfflineDirectSigner` and `PKPClientHelpers` interfaces. The wallet can generate its own Bech32 address (address), manage account data (`getAccounts`), and sign transactions (`signDirect`) with the private key using a LIT node client. It can also create a SigningStargateClient instance (`getClient`), prepare transaction data (formSendTx), and sign a transaction following the SigningStargateClient.sign method (`sign`). The class supports the customization of the Cosmos RPC URL (`rpc`) and the Bech32 address prefix (`addressPrefix`).

# Getting Started

```
yarn add @lit-protocol/pkp-cosmos
```

# Examples

https://github.com/LIT-Protocol/js-sdk/blob/master/packages/pkp-cosmos/src/lib/pkp-cosmos.spec.ts
