# Lit Protocol Constants

This submodule exports various constants values and errors that are used in Lit Protocol.

Note: This is the top-most package in the Lit Protocol SDK monorepo. It imports no other package and is potentially imported by all other packages.

### node.js / browser

```
yarn add @lit-protocol/constants
```

## Adding new Lit Protocol Constants

In files under `./src/lib` you can add any value there. Remember to define it `as const` to ensure it is immutable and allow TypeScript to better infer the derived types.

### Updating Lit supported chains

In file `./src/lib/constants/constants.ts` you can update the Lit supported chains.

1. Add the chain key to the corresponding chain key array based on the chain type (EVM, SVM or Cosmos)
2. Add chain data to the corresponding chain data object based on the chain type (EVM, SVM or Cosmos)

| Chain keys               | Chain data          |
| ------------------------ | ------------------- |
| `LIT_CHAINS_KEYS`        | `LIT_CHAINS`        |
| `LIT_SVM_CHAINS_KEYS`    | `LIT_SVM_CHAINS`    |
| `LIT_COSMOS_CHAINS_KEYS` | `LIT_COSMOS_CHAINS` |
