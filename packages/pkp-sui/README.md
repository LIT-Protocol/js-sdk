# pkp-sui

The `PKPSuiWallet` class is a specialized wallet for the SUI blockchain using signing scheme based on ECDSA Secp256k1. It's modified version of `SignerWithProvider` class from the `@mysten/sui.js` library. This class extends the 'PKPBase' class and implements the 'Signer' interface. Unlike `RawSigner` from the `@mysten/sui.js`, `PKPSuiWallet` does not store private keys. Despite these differences, it retains all functionality.

Note: Since LitAction uses WebAssembly, additional settings are required to use it in Chrome extension.

# Getting Started

```
yarn add @lit-protocol/pkp-sui @mysten/sui.js
```

# Examples

## Create a wallet and get the address
```typescript
import { PKPSuiWallet } from '@lit-protocol/pkp-sui';
import { JsonRpcProvider, mainnetConnection } from '@mysten/sui.js';

const pkpSuiWallet = new PKPSuiWallet(
  {
    controllerAuthSig: AuthSig,
    pkpPubKey: PKPPubKey,
  },
  new JsonRpcProvider(mainnetConnection)
);
return await pkpSuiWallet.getAddress();
```

## Change wallet rpc/network 
```typescript
import { JsonRpcProvider, testnetConnection, Connection } from '@mysten/sui.js';
// connect to testnet
pkpSuiWallet.connect(new JsonRpcProvider(testnetConnection));
// connect to custom rpcUrl
pkpSuiWallet.connect(new JsonRpcProvider(new Connection({ fullnode: rpcUrl })));
```

## Transfer Sui
```typescript
import { TransactionBlock } from '@mysten/sui.js';

const tx = new TransactionBlock();
const [coin] = tx.splitCoins(tx.gas, [tx.pure(amount)]);
tx.transferObjects([coin], tx.pure(recipient));

return await pkpSuiWallet.signAndExecuteTransactionBlock({
  transactionBlock: tx,
});
```

## Stake Sui
```typescript
import { SUI_SYSTEM_STATE_OBJECT_ID, TransactionBlock } from '@mysten/sui.js';

const tx = new TransactionBlock();
const stakeCoin = tx.splitCoins(tx.gas, [tx.pure(amount)]);
tx.moveCall({
  target: '0x3::sui_system::request_add_stake',
  arguments: [
    tx.object(SUI_SYSTEM_STATE_OBJECT_ID),
    stakeCoin,
    tx.pure(validator),
  ],
});
return await pkpSuiWallet.signAndExecuteTransactionBlock({
  transactionBlock: tx,
});
```

## Get balance
```typescript
const provider = new JsonRpcProvider(mainnetConnection);
const address = await pkpSuiWallet.getAddress();
const balance = await provider.getBalance(address);
```

## Sign message
```typescript
await pkpSuiWallet.signMessage({ message });
```

## Sign transaction
```typescript
await pkpSuiWallet.signTransactionBlock({ transactionBlock });
```

## dryRunTransactionBlock for estimating transaction result
```typescript
await pkpSuiWallet.dryRunTransactionBlock({ transactionBlock });
```

# Running unit tests

Run `nx test pkp-sui` to execute the unit tests via [Jest](https://jestjs.io).
If test 3,4 fail, It means sui testnet has been reset. Use sui testnet faucet to get some sui and try again.
