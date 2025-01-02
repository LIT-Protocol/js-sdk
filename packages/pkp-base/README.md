# Quick Start

This submodule defines a PKPBase class, providing shared wallet functionality for PKP signers, responsible for managing public key compression, initializing and connecting to the LIT node, running LIT actions, and offering debug functions for logging and error handling.

| Method/Property                                                      | Description                                                                   |
| -------------------------------------------------------------------- | ----------------------------------------------------------------------------- |
| `compressPubKey(pubKey: string)`                                     | Compresses a provided public key                                              |
| `setUncompressPubKeyAndBuffer(prop: PKPBaseProp)`                    | Sets the uncompressed public key and its buffer representation                |
| `setCompressedPubKeyAndBuffer(prop: PKPBaseProp)`                    | Sets the compressed public key and its buffer representation                  |
| `setLitAction(prop: PKPBaseProp)`                                    | Sets the Lit action to be executed by the LitNode client                      |
| `setLitActionJsParams<CustomType extends T = T>(params: CustomType)` | Sets the value of the `litActionJsParams` property to the given params object |
| `createAndSetSessionSigs(sessionParams: GetSessionSigsProps)`        | Creates and sets the session sigs and their expiration                        |
| `init()`                                                             | Initializes the PKPBase instance by connecting to the LIT node                |
| `runLitAction(toSign: Uint8Array, sigName: string)`                  | Runs the specified Lit action with the given parameters                       |
| `ensureLitNodeClientReady()`                                         | Ensures that the LitNode client is ready for use                              |
| `log(...args: any[])`                                                | Logs the provided arguments to the console, but only if debugging is enabled  |

### node.js / browser

```
yarn add @lit-protocol/pkp-base
```

## Description

The `@lit-protocol/pkp-base` package provides a foundational class for managing PKP (Public Key Pair) signers. This class offers shared wallet functionality, including public key compression, initialization and connection to the LIT node, execution of LIT actions, and debugging capabilities.

## Installation

To install the `@lit-protocol/pkp-base` package, you can use either npm or yarn:

```bash
npm install @lit-protocol/pkp-base
```

or

```bash
yarn add @lit-protocol/pkp-base
```

## Usage

Here are some examples of how to use the `PKPBase` class provided by the `@lit-protocol/pkp-base` package:

### Compressing a Public Key

The `compressPubKey` method allows you to compress a provided public key.

```javascript
import { PKPBase } from '@lit-protocol/pkp-base';

const pkpBase = new PKPBase();
const compressedPubKey = pkpBase.compressPubKey('your-public-key');
console.log(compressedPubKey);
```

### Setting Uncompressed Public Key and Buffer

The `setUncompressPubKeyAndBuffer` method sets the uncompressed public key and its buffer representation.

```javascript
import { PKPBase } from '@lit-protocol/pkp-base';

const pkpBase = new PKPBase();
pkpBase.setUncompressPubKeyAndBuffer({ pubKey: 'your-public-key' });
```

### Initializing the PKPBase Instance

The `init` method initializes the PKPBase instance by connecting to the LIT node.

```javascript
import { PKPBase } from '@lit-protocol/pkp-base';

const pkpBase = new PKPBase();
await pkpBase.init();
```

### Running a LIT Action

The `runLitAction` method runs the specified LIT action with the given parameters.

```javascript
import { PKPBase } from '@lit-protocol/pkp-base';

const pkpBase = new PKPBase();
const toSign = new Uint8Array([/* your data */]);
const sigName = 'your-signature-name';
await pkpBase.runLitAction(toSign, sigName);
```

## Contributing

We welcome contributions to the `@lit-protocol/pkp-base` package. If you have any ideas, suggestions, or bug reports, please open an issue or submit a pull request on the GitHub repository.

## License

The `@lit-protocol/pkp-base` package is licensed under the MIT License. See the [LICENSE](LICENSE) file for more information.
