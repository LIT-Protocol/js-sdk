# Lit Protocol Contracts SDK

## Scripts

### gen-code.mjs

This script automatically generates a `contracts-sdk.ts`. It does this by reading the file names from a specified directory, generating import statements and declarations based on those file names, and replacing certain sections of the contracts-sdk.ts file with the generated content.

```js
node packages/contracts-sdk/gen-code.mjs
```

### fetch-contracts.mjs

This script fetches and processes ABI files for a set of deployed contracts. It writes the ABI files and contract data to the file system and runs a command to generate additional files based on the ABIs.

```
node packages/contracts-sdk/fetch-contracts.mjs
```