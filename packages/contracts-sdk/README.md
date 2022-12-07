# Lit Protocol Contracts SDK (Typescript)

ContractsSDK is a bundled package that allows you to make calls to Lit Protocol smart contracts. Some contracts come with additional abstracted functions that can be accessed by appending `Util` to the contract variable name, for example, `pkpNftContract` becomes `pkpNftContractUtil`.

Demo: https://demo-contracts-sdk-react.vercel.app/

## Installation

```js
yarn add @lit-protocol/contracts-sdk
```

## Vanilla JS

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

## Quick Start

### Initialize an instance

```js
// -- Default
// Environments:
//    -- [NodeJs]: It will generate a random private key to create a signer
//    -- [Browser]: It will use window.ethereum as a signer
// RPC: https://matic-mumbai.chainstacklabs.com
const litContracts = new LitContracts();
await litContracts.connect();

// -- custom rpc
const litContracts = new LitContracts({
  rpc: 'https://localhost:3000',
});

// -- custom signer
const privateKey =
  '0x4cc303e56f1ff14e762a33534d7fbaa8a76e52509fd96373f24045baae99cc38';
const provider = new ethers.providers.JsonRpcProvider(
  'https://matic-mumbai.chainstacklabs.com'
);
const signer = new ethers.Wallet(privateKey, provider);
const litContracts = new LitContracts({ signer });
await litContracts.connect();
```

### Usage

```js
// -------------------- READ --------------------
// -- calling the pkpNftContract raw functions
const PKP_TOKEN_ID = BigNumber.from('38350640033302...4285614');
const PKP_ETH_ADDRESS = '0x...123';

let ethAddress = await litContracts.pkpNftContract.getEthAddress(PKP_TOKEN_ID);
let pkpPubKey = await litContracts.pkpNftContract.getPubKey(PKP_TOKEN_ID);
let mintCost = await litContracts.pkpNftContract.mintCost();

// -- calling the pkpPermissionsContract raw functions
let permittedAddresses = await litContracts.pkpPermissionsContract(
  PKP_TOKEN_ID
);

// -------------------- ADDTIONAL READS --------------------
let ipfsIsPermitted =
  await litContracts.pkpPermissionsContractUtil.read.isPermittedAction(
    PKP_TOKEN_ID,
    'QmZKLGf3vgYsboM7WVUS9X56cJSdLzQVacNp841wmEDRkW'
  );

let addressTokens =
  await litContracts.pkpNftContractUtil.read.getTokensByAddress(PKP_ETH_ADDRES);

let last2TokensOfTheContract =
  await litContracts.pkpNftContractUtil.read.getToken(2);

// -------------------- WRITE --------------------
const tx = await contracts.pkpNftContract.mintNext(2, { value: mintCost });
const tx = await contracts.pkpNftContract.mintNext(2, {
  // The maximum units of gas for the transaction to use
  gasLimit: 23000,

  // The price (in wei) per unit of gas
  gasPrice: ethers.utils.parseUnits('9.0', 'gwei'),

  // The nonce to use in the transaction
  nonce: 123,

  // The amount to send with the transaction (i.e. msg.value)
  value: ethers.utils.parseEther('1.0'),

  // The chain ID (or network ID) to use
  chainId: 1,
});
```

### Other contracts can be accessed from `litContracts.`

![](https://i.ibb.co/rHyt81y/image.png)

# Dev scripts

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

## gen-code.mjs

This script automatically generates a `contracts-sdk.ts`. It does this by reading the file names from a specified directory, generating import statements and declarations based on those file names, and replacing certain sections of the contracts-sdk.ts file with the generated content.

```js
node ./packages/contracts-sdk/tools.mjs --fetch
```

## fetch-contracts.mjs

This script fetches and processes ABI files for a set of deployed contracts. It writes the ABI files and contract data to the file system and runs a command to generate additional files based on the ABIs.

```js
node ./packages/contracts-sdk/tools.mjs --gen
```
