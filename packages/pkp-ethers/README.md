# Getting started

This module presents a modified version of `new ethers.Wallet()`, known as `PKPEthersWallet`. Unlike its counterpart, `PKPEthersWallet` does not store private keys nor does it support the creation of random wallets.

Despite these differences, it retains the ability to sign and send transactions, process JSON requests, retrieve balance and transaction count, among other functionalities, just like a standard ethers.js Wallet instance.

API: https://docs.ethers.org/v4/api-wallet.html


```
yarn add @lit-protocol/pkp-ethers ethers
```

More info here:
https://github.com/LIT-Protocol/pkp-ethers/tree/master/packages/wallet
