# Lit Protocol Contracts SDK (Typescript)

ContractsSDK is a bundled package that allows you to make calls to Lit Protocol smart contracts. Some contracts come with additional abstracted functions that can be accessed by appending `Util` to the contract variable name, for example, `pkpNftContract` becomes `pkpNftContractUtil`.

Demo: https://demo-contracts-sdk-react.vercel.app/

# Installation

```js
yarn add @lit-protocol/contracts-sdk
```

# Vanilla JS (UMD)

```html
<script src="https://cdn.jsdelivr.net/npm/@lit-protocol/contracts-sdk-vanilla/contracts-sdk.js"></script>
<script>
  (async () => {
    const { LitContracts } = LitJsSdk_contractsSdk;

    const litContracts = new LitContracts();
    await litContracts.connect();
  })();
</script>
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

## Other methods

They can can be accessed from `litContracts.`

![](https://i.ibb.co/rHyt81y/image.png)

# Contributing and developing to this SDK

## Config file

`lit-contracts.config.json`

If the directory structures have been changed on the [LitNodeContracts](https://github.com/LIT-Protocol/LitNodeContracts) repo, you will need to edit the config file.

```json
{
  "root": "https://raw.githubusercontent.com/LIT-Protocol/LitNodeContracts/main/",
  "contracts": "deployed_contracts_serrano.json",
  "abis": {
    "dir": "deployments/mumbai_80001/",
    "ignoreProperties": ["metadata", "bytecode", "deployedBytecode"]
  }
}
```

## Quick start

The `gen-code` and `fetch-contracts` actions are executed together in this action.

```js
node ./packages/contracts-sdk/tools.mjs --update
```

## fetch-contracts.mjs

This script fetches and processes ABI files for a set of deployed contracts. It writes the ABI files and contract data to the file system and runs a command to generate additional files based on the ABIs.

```js
node ./packages/contracts-sdk/tools.mjs --fetch
```

## gen-code.mjs

This script automatically generates a `contracts-sdk.ts`. It does this by reading the file names from a specified directory, generating import statements and declarations based on those file names, and replacing certain sections of the contracts-sdk.ts file with the generated content.

```js
node ./packages/contracts-sdk/tools.mjs --gen
```
