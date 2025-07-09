Here are the files that need to be updated when adding new ABI methods:

`packages/networks/src/networks/vNaga/LitChainClient/contract-manager/createContractsManager.ts` is the file that creates the contracts manager. This is where use define the ABI signatures we want to use. We use the `@lit-protocol/contracts` package's constants `nagaDevSignatures` to get the ABI signatures. eg `nagaDevSignatures.PaymentDelegation`

Networks are defined in the `packages/networks/src/networks` directory. For each network, it will be prefixed with `v` and the name of the network. Right now, there's only one network, `vNaga`. Then, within the network, we have different environments. For example, `vNaga/envs/naga-dev`.

Then, for each environment, we have `createChainManager` which is essentially an object that binds the methods we want to expose to the user to the actual methods that are available on the chain.

These methods are defined in the `packages/networks/src/networks/vNaga/LitChainClient/apis` directory. There are two types of methods:

1. High-level methods: These are the methods that are exposed to the user. They are defined in the `packages/networks/src/networks/vNaga/envs/naga-dev/chain-manager/createChainManager.ts` file.
2. Raw contract methods: These are the raw contract methods that are defined in the `packages/networks/src/networks/vNaga/LitChainClient/apis/rawContractApis` directory.

For example, for payment manager, we are using the Ledger contract ABIs in the `packages/networks/src/networks/vNaga/LitChainClient/apis/rawContractApis/ledger` directory. Then, we will create a higher level methods in `packages/networks/src/networks/vNaga/LitChainClient/apis/highLevelApis/PaymentManager/PaymentManager.ts`

Then, we need to update the `packages/lit-client/src/lib/LitClient/createLitClient.ts` file to add the new methods to the LitClient. (See getPaymentManager for an example). LitClient is the main entry point for the user to interact the Lit Protocol.

Finally, we need to update the test in `e2e/src/e2e.spec.ts` to add the new methods to the test. See `e2e/src/helper/tests/pkp-permissions-manager-flow.ts` as reference.

To ensure we have implemented correctly, we need to run this command:

```
NETWORK=naga-dev bun run test:e2e <test-name>
```

These are the ABI methods that need to be added:

...methods

Here's the source of the `<Your Contract>` contract:

Smart Contract Source:

```
```

ABIs:

```
```