# Quick Start

This submodule defines a PKPBase class, providing shared wallet functionality for Ethers and Cosmos signers, responsible for managing public key compression, initializing and connecting to the LIT node, running LIT actions, and offering debug functions for logging and error handling.

| Method/Property                                                      | Description                                                                    |
| -------------------------------------------------------------------- | ------------------------------------------------------------------------------ |
| `compressPubKey(pubKey: string)`                                     | Compresses a provided public key                                               |
| `setUncompressPubKeyAndBuffer(prop: PKPBaseProp)`                    | Sets the uncompressed public key and its buffer representation                 |
| `setCompressedPubKeyAndBuffer(prop: PKPBaseProp)`                    | Sets the compressed public key and its buffer representation                   |
| `setLitAction(prop: PKPBaseProp)`                                    | Sets the Lit action to be executed by the LitNode client                       |
| `setLitActionJsParams<CustomType extends T = T>(params: CustomType)` | Sets the value of the `litActionJsParams` property to the given params object  |
| `createAndSetSessionSigs(sessionParams: GetSessionSigsProps)`        | Creates and sets the session sigs and their expiration                         |
| `init()`                                                             | Initializes the PKPBase instance by connecting to the LIT node                 |
| `runLitAction(toSign: Uint8Array, sigName: string)`                  | Runs the specified Lit action with the given parameters                        |
| `ensureLitNodeClientReady()`                                         | Ensures that the LitNode client is ready for use                               |
| `log(...args: any[])`                                                | Logs the provided arguments to the console, but only if debugging is enabled   |
| `throwError(message: string)`                                        | Logs an error message to the console and throws an Error with the same message |

### node.js / browser

```
yarn add @lit-protocol/pkp-base
```

### Vanilla JS (UMD)

```js
<script src="https://cdn.jsdelivr.net/npm/@lit-protocol/pkp-base-vanilla/pkp-base.js"></script>
<script>
  console.log(LitJsSdk_pkpBase);
</script>
```
