# Generating Local Network Context for Lit Protocol

The Lit network contexts, which include smart contract addresses and ABIs, typically come from the `@lit-protocol/contracts` package (a separate repository at https://github.com/LIT-Protocol/lit-contracts/). However, these contexts are designed for established networks.

## Local Network Setup

For local development (running Lit nodes on your machine), you need to generate a `networkContext.json` file in the `lit-assets` directory. This is typically done by running the deploy script after starting your local Anvil chain.

## Version Compatibility Changes

In version 7 or earlier, you could simply copy and paste the `networkContext.json` file, and it would work when setting the network to `custom` when running with Tinny (E2E test suite).

However, in version 8, we've optimised by removing redundant and unused ABIs from the JSON file and enforced strongly typed ABIs. This optimization introduced an additional conversion layer that extracts only the necessary ABI methods, which must be run manually for local network contexts.

## Generating Custom Context

To generate the proper context:

1. Locate the `getCustomContext` file in the network-specific folder (in this case, `vNaga/naga-develop` folder)
2. Use the `generateSignaturesFromContext` helper function from the `@lit-protocol/contracts` repository

Here's an example of how to use this function:

```ts
import { generateSignaturesFromContext } from "@lit-protocol/contracts/custom-network-signatures";

await generateSignaturesFromContext({
  jsonFilePath:
    "/Users/anson/Projects/lit-assets/blockchain/contracts/networkContext.json", // in lit assets repo
  networkName: "naga-develop",
  outputDir: "./naga-develop-signatures",
  useScriptDirectory: true,
  callerPath: import.meta.url,
});
```