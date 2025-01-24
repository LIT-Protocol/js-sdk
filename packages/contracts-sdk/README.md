# Lit Protocol Contracts SDK (Typescript)

ContractsSDK is a bundled package that allows you to make calls to Lit Protocol smart contracts. Some contracts come with additional abstracted functions that can be accessed by appending `Util` to the contract variable name, for example, `pkpNftContract` becomes `pkpNftContractUtil`.

Demo: https://demo-contracts-sdk-react.vercel.app/

# Installation

```
yarn add @lit-protocol/contracts-sdk
```

# Quick Start

## Initialize an instance

We provide several ways to initialize an LitContracts instance, you can pass in your private key, ask itself to randomly generate one, your own signer, a PKP signer, etc.

```js
// Most common way. Using your Metamask/Brave or any other third party wallet
const litContracts = new LitContracts();

// use a random private key
const litContracts = new LitContracts({ randomPrivatekey: true });

// use a random private key and store it in the local storage
const litContracts = new LitContracts({
  randomPrivatekey: true,
  options: {
    storeOrUseStorageKey: true,
  },
});

// use private key from local storage
const litContracts = new LitContracts({
  options: {
    storeOrUseStorageKey: true,
  },
});

// use custom private key
const litContracts = new LitContracts({
  privateKey: TEST_FUNDED_PRIVATE_KEY,
});

// custom signer
const privateKey = TEST_FUNDED_PRIVATE_KEY;
const provider = new ethers.providers.Web3Provider(window.ethereum, 'any');
const signer = new ethers.Wallet(privateKey, provider);

const litContracts = new LitContracts({ signer });

// with a pkp wallet
// see more in https://github.com/LIT-Protocol/pkp-ethers
const pkpWallet = new PKPWallet({
  pkpPubKey: PKP_PUBKEY,
  controllerAuthSig: CONTROLLER_AUTHSIG,
  provider: 'https://rpc-mumbai.maticvigil.com',
});

await pkpWallet.init();

const litContracts = new LitContracts({ signer: pkpWallet });
```