# Lit Protocol Contracts SDK (Typescript)

ContractsSDK is a bundled package that allows you to make calls to Lit Protocol smart contracts. Some contracts come with additional abstracted functions that can be accessed by appending `Util` to the contract variable name, for example, `pkpNftContract` becomes `pkpNftContractUtil`.

## Installation

```js
yarn add @litprotocol/contracts-sdk
```

## Quick Start

```js
// -- custom rpc
// const litContracts = new LitContracts({
//     rpc: 'https://localhost:3000',
// });

// -- custom provider
// const litContracts = new LitContracts({
//     provider: new ethers.provider.JsonRpcProvider('https://localhost:300')
// })
//
// -- default: it uses the mumbai rpc from https://matic-mumbai.chainstacklabs.com
const litContracts = new LitContracts();

// example: using the pkpNftContract raw functions
const PKP_TOKEN_ID = BigNumber.from('38350640033302...4285614');
const PKP_ETH_ADDRESS = '0x...123';

let ethAddress = await litContracts.pkpNftContract.getEthAddress(PKP_TOKEN_ID);
let pkpPubKey = await litContracts.pkpNftContract.getPubKey(PKP_TOKEN_ID);
let mintCost = await litContracts.pkpNftContract.mintCost();

// accessing additional functions
let addressTokens =
  await litContracts.pkpNftContractUtil.read.getTokensByAddress(PKP_ETH_ADDRES);

let last2TokensOfTheContract =
  await litContracts.pkpNftContractUtil.read.getToken(2);

// example: using the pkpPermissionsContract raw functions
let permittedAddresses = await litContracts.pkpPermissionsContract(
  PKP_TOKEN_ID
);

// example of using addtional utils
let ipfsIsPermitted =
  await litContracts.pkpPermissionsContractUtil.read.isPermittedAction(
    PKP_TOKEN_ID,
    'QmZKLGf3vgYsboM7WVUS9X56cJSdLzQVacNp841wmEDRkW'
  );
```

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
