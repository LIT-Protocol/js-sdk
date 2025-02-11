<div align="center">
<h1>Lit Protocol Javascript/Typescript SDK V7.x.x</h1>

<img src="https://i.ibb.co/p2xfzK1/Screenshot-2022-11-15-at-09-56-57.png">
<br/>
<a href="https://twitter.com/LitProtocol"><img src="https://img.shields.io/twitter/follow/litprotocol?label=Follow&style=social"/></a>
<br/>
<br/>
The Lit JavaScript SDK provides developers with a framework for implementing Lit functionality into their own applications. Find installation instructions in the docs to get started with the Lit SDK based on your use case:
<br/>
<br/>

<a href="https://developer.litprotocol.com/v3/sdk/installation"><img src="https://i.ibb.co/fDqdXLq/button-go-to-docs.png" /></a>

<a href="https://developer.litprotocol.com/v3/sdk/installation">
https://developer.litprotocol.com/SDK/Explanation/installation
</a>

</div>

<div align="left">

# Quick Start

### NodeJS Exclusive

Removed browser-specific methods, e.g., checkAndSignAuthSig

```
yarn add @lit-protocol/lit-node-client-nodejs
```

or..

### Isomorphic Implementation

Operable in both Node.js and the browser

```
yarn add @lit-protocol/lit-node-client
```

</div>

<div align="center">

# Packages

📝 If you're looking to use the Lit SDK, you're probably all set with just the lit-node-client <link>. <br/>Get started with interacting with Lit network!

<!-- autogen:package:start -->

| Package                                                                                                                    | Category                                                                                        | Download                                                                                                                                                                        |
| -------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [@lit-protocol/lit-node-client-nodejs](https://github.com/LIT-Protocol/js-sdk/tree/master/packages/lit-node-client-nodejs) | ![lit-node-client-nodejs](https://img.shields.io/badge/-nodejs-2E8B57 'lit-node-client-nodejs') | <a target="_blank" href="https://www.npmjs.com/package/@lit-protocol/lit-node-client-nodejs"><img src="https://img.shields.io/npm/v/@lit-protocol/lit-node-client-nodejs"/></a> |
| [@lit-protocol/lit-node-client](https://github.com/LIT-Protocol/js-sdk/tree/master/packages/lit-node-client)               | ![lit-node-client](https://img.shields.io/badge/-universal-8A6496 'lit-node-client')            | <a target="_blank" href="https://www.npmjs.com/package/@lit-protocol/lit-node-client"><img src="https://img.shields.io/npm/v/@lit-protocol/lit-node-client"/></a>               |

If you're a tech-savvy user and wish to utilize only specific submodules that our main module relies upon, you can find individual packages listed below. This way, you can import only the necessary packages that cater to your specific use case::

| Package                                                                                                                          | Category                                                                                                 | Download                                                                                                                                                                              |
| -------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [@lit-protocol/access-control-conditions](https://github.com/LIT-Protocol/js-sdk/tree/master/packages/access-control-conditions) | ![access-control-conditions](https://img.shields.io/badge/-universal-8A6496 'access-control-conditions') | <a target="_blank" href="https://www.npmjs.com/package/@lit-protocol/access-control-conditions"><img src="https://img.shields.io/npm/v/@lit-protocol/access-control-conditions"/></a> |
| [@lit-protocol/auth-helpers](https://github.com/LIT-Protocol/js-sdk/tree/master/packages/auth-helpers)                           | ![auth-helpers](https://img.shields.io/badge/-universal-8A6496 'auth-helpers')                           | <a target="_blank" href="https://www.npmjs.com/package/@lit-protocol/auth-helpers"><img src="https://img.shields.io/npm/v/@lit-protocol/auth-helpers"/></a>                           |
| [@lit-protocol/constants](https://github.com/LIT-Protocol/js-sdk/tree/master/packages/constants)                                 | ![constants](https://img.shields.io/badge/-universal-8A6496 'constants')                                 | <a target="_blank" href="https://www.npmjs.com/package/@lit-protocol/constants"><img src="https://img.shields.io/npm/v/@lit-protocol/constants"/></a>                                 |
| [@lit-protocol/contracts-sdk](https://github.com/LIT-Protocol/js-sdk/tree/master/packages/contracts-sdk)                         | ![contracts-sdk](https://img.shields.io/badge/-universal-8A6496 'contracts-sdk')                         | <a target="_blank" href="https://www.npmjs.com/package/@lit-protocol/contracts-sdk"><img src="https://img.shields.io/npm/v/@lit-protocol/contracts-sdk"/></a>                         |
| [@lit-protocol/core](https://github.com/LIT-Protocol/js-sdk/tree/master/packages/core)                                           | ![core](https://img.shields.io/badge/-universal-8A6496 'core')                                           | <a target="_blank" href="https://www.npmjs.com/package/@lit-protocol/core"><img src="https://img.shields.io/npm/v/@lit-protocol/core"/></a>                                           |
| [@lit-protocol/crypto](https://github.com/LIT-Protocol/js-sdk/tree/master/packages/crypto)                                       | ![crypto](https://img.shields.io/badge/-universal-8A6496 'crypto')                                       | <a target="_blank" href="https://www.npmjs.com/package/@lit-protocol/crypto"><img src="https://img.shields.io/npm/v/@lit-protocol/crypto"/></a>                                       |
| [@lit-protocol/encryption](https://github.com/LIT-Protocol/js-sdk/tree/master/packages/encryption)                               | ![encryption](https://img.shields.io/badge/-universal-8A6496 'encryption')                               | <a target="_blank" href="https://www.npmjs.com/package/@lit-protocol/encryption"><img src="https://img.shields.io/npm/v/@lit-protocol/encryption"/></a>                               |
| [@lit-protocol/event-listener](https://github.com/LIT-Protocol/js-sdk/tree/master/packages/event-listener)                       | ![event-listener](https://img.shields.io/badge/-universal-8A6496 'event-listener')                       | <a target="_blank" href="https://www.npmjs.com/package/@lit-protocol/event-listener"><img src="https://img.shields.io/npm/v/@lit-protocol/event-listener"/></a>                       |
| [@lit-protocol/logger](https://github.com/LIT-Protocol/js-sdk/tree/master/packages/logger)                                       | ![logger](https://img.shields.io/badge/-universal-8A6496 'logger')                                       | <a target="_blank" href="https://www.npmjs.com/package/@lit-protocol/logger"><img src="https://img.shields.io/npm/v/@lit-protocol/logger"/></a>                                       |
| [@lit-protocol/misc](https://github.com/LIT-Protocol/js-sdk/tree/master/packages/misc)                                           | ![misc](https://img.shields.io/badge/-universal-8A6496 'misc')                                           | <a target="_blank" href="https://www.npmjs.com/package/@lit-protocol/misc"><img src="https://img.shields.io/npm/v/@lit-protocol/misc"/></a>                                           |
| [@lit-protocol/nacl](https://github.com/LIT-Protocol/js-sdk/tree/master/packages/nacl)                                           | ![nacl](https://img.shields.io/badge/-universal-8A6496 'nacl')                                           | <a target="_blank" href="https://www.npmjs.com/package/@lit-protocol/nacl"><img src="https://img.shields.io/npm/v/@lit-protocol/nacl"/></a>                                           |
| [@lit-protocol/pkp-base](https://github.com/LIT-Protocol/js-sdk/tree/master/packages/pkp-base)                                   | ![pkp-base](https://img.shields.io/badge/-universal-8A6496 'pkp-base')                                   | <a target="_blank" href="https://www.npmjs.com/package/@lit-protocol/pkp-base"><img src="https://img.shields.io/npm/v/@lit-protocol/pkp-base"/></a>                                   |
| [@lit-protocol/pkp-cosmos](https://github.com/LIT-Protocol/js-sdk/tree/master/packages/pkp-cosmos)                               | ![pkp-cosmos](https://img.shields.io/badge/-universal-8A6496 'pkp-cosmos')                               | <a target="_blank" href="https://www.npmjs.com/package/@lit-protocol/pkp-cosmos"><img src="https://img.shields.io/npm/v/@lit-protocol/pkp-cosmos"/></a>                               |
| [@lit-protocol/pkp-ethers](https://github.com/LIT-Protocol/js-sdk/tree/master/packages/pkp-ethers)                               | ![pkp-ethers](https://img.shields.io/badge/-universal-8A6496 'pkp-ethers')                               | <a target="_blank" href="https://www.npmjs.com/package/@lit-protocol/pkp-ethers"><img src="https://img.shields.io/npm/v/@lit-protocol/pkp-ethers"/></a>                               |
| [@lit-protocol/pkp-sui](https://github.com/LIT-Protocol/js-sdk/tree/master/packages/pkp-sui)                                     | ![pkp-sui](https://img.shields.io/badge/-universal-8A6496 'pkp-sui')                                     | <a target="_blank" href="https://www.npmjs.com/package/@lit-protocol/pkp-sui"><img src="https://img.shields.io/npm/v/@lit-protocol/pkp-sui"/></a>                                     |
| [@lit-protocol/pkp-walletconnect](https://github.com/LIT-Protocol/js-sdk/tree/master/packages/pkp-walletconnect)                 | ![pkp-walletconnect](https://img.shields.io/badge/-universal-8A6496 'pkp-walletconnect')                 | <a target="_blank" href="https://www.npmjs.com/package/@lit-protocol/pkp-walletconnect"><img src="https://img.shields.io/npm/v/@lit-protocol/pkp-walletconnect"/></a>                 |
| [@lit-protocol/types](https://github.com/LIT-Protocol/js-sdk/tree/master/packages/types)                                         | ![types](https://img.shields.io/badge/-universal-8A6496 'types')                                         | <a target="_blank" href="https://www.npmjs.com/package/@lit-protocol/types"><img src="https://img.shields.io/npm/v/@lit-protocol/types"/></a>                                         |
| [@lit-protocol/uint8arrays](https://github.com/LIT-Protocol/js-sdk/tree/master/packages/uint8arrays)                             | ![uint8arrays](https://img.shields.io/badge/-universal-8A6496 'uint8arrays')                             | <a target="_blank" href="https://www.npmjs.com/package/@lit-protocol/uint8arrays"><img src="https://img.shields.io/npm/v/@lit-protocol/uint8arrays"/></a>                             |
| [@lit-protocol/wasm](https://github.com/LIT-Protocol/js-sdk/tree/master/packages/wasm)                                           | ![wasm](https://img.shields.io/badge/-universal-8A6496 'wasm')                                           | <a target="_blank" href="https://www.npmjs.com/package/@lit-protocol/wasm"><img src="https://img.shields.io/npm/v/@lit-protocol/wasm"/></a>                                           |
| [@lit-protocol/wrapped-keys](https://github.com/LIT-Protocol/js-sdk/tree/master/packages/wrapped-keys)                           | ![wrapped-keys](https://img.shields.io/badge/-universal-8A6496 'wrapped-keys')                           | <a target="_blank" href="https://www.npmjs.com/package/@lit-protocol/wrapped-keys"><img src="https://img.shields.io/npm/v/@lit-protocol/wrapped-keys"/></a>                           |
| [@lit-protocol/wrapped-keys-lit-actions](https://github.com/LIT-Protocol/js-sdk/tree/master/packages/wrapped-keys-lit-actions)   | ![wrapped-keys-lit-actions](https://img.shields.io/badge/-universal-8A6496 'wrapped-keys-lit-actions')   | <a target="_blank" href="https://www.npmjs.com/package/@lit-protocol/wrapped-keys-lit-actions"><img src="https://img.shields.io/npm/v/@lit-protocol/wrapped-keys-lit-actions"/></a>   |
| [@lit-protocol/auth-browser](https://github.com/LIT-Protocol/js-sdk/tree/master/packages/auth-browser)                           | ![auth-browser](https://img.shields.io/badge/-browser-E98869 'auth-browser')                             | <a target="_blank" href="https://www.npmjs.com/package/@lit-protocol/auth-browser"><img src="https://img.shields.io/npm/v/@lit-protocol/auth-browser"/></a>                           |
| [@lit-protocol/misc-browser](https://github.com/LIT-Protocol/js-sdk/tree/master/packages/misc-browser)                           | ![misc-browser](https://img.shields.io/badge/-browser-E98869 'misc-browser')                             | <a target="_blank" href="https://www.npmjs.com/package/@lit-protocol/misc-browser"><img src="https://img.shields.io/npm/v/@lit-protocol/misc-browser"/></a>                           |

<!-- autogen:package:end -->

## API Doc

| Version      | Link                                                     |
| ------------ | -------------------------------------------------------- |
| V7 (Current) | [7.x.x docs](https://v7-api-doc-lit-js-sdk.vercel.app/)  |
| V6           | [6.x.x docs](https://v6-api-doc-lit-js-sdk.vercel.app/)  |
| V5           | [5.x.x docs](https://v3.api-docs.getlit.dev/)            |
| V2           | [2.x.x docs](http://docs.lit-js-sdk-v2.litprotocol.com/) |

</div>

# Contributing and developing to this SDK

## Prerequisites

Before you begin, ensure you have the following installed:

- Node.js v19.0.0 or later
- Rust v1.70.0 or later
- [wasm-pack](https://github.com/rustwasm/wasm-pack) for WebAssembly compilation

## Development Tools

Recommended for better development experience:

- [NX Console](https://nx.dev/core-features/integrate-with-editors) - Visual Studio Code extension for NX workspace management

# Quick Start

To start developing with this repository:

1. Install dependencies:

```
yarn
```

2. Build the packages:

```
yarn build:dev
```

## Building

Build the project using one of these commands:

```
// For local development (optimized, excludes production-only operations)
yarn build:dev

// For testing and publishing (full build with all operations)
yarn build
```

## Run unit tests

```
yarn test:unit
```

## Run E2E tests in nodejs

```
yarn test:local
```

# Advanced

## Creating a new library

`nx generate @nx/js:library`

## Building

```sh
yarn build
```

### Building target package

```sh
yarn nx run <project-name>:build
```

## Building Local Changes

During development you may wish to build your code changes in `packages/` in a client application to test the correctness of the functionality.

If you would like to establish a dependency between packages within this monorepo and an external client application that consumes these packages:

1. Run `npm link` at the root of the specific package you are making code changes in.

```
cd ./packages/*/<package-name>
npm link
```

2. Build the packages with or without dependencies

```
yarn build
# or
yarn nx run lit-node-client-nodejs:build --with-deps=false
```

3. In the client application, run `npm link <package> --save` to ensure that the `package.json` of the client application is updated with a `file:` link to the dependency. This effectively creates a symlink in the `node_modules` of the client application to the local dependency in this repository.

```
cd path/to/client-application
npm link <package> --save
```

Having done this setup, this is what the development cycle looks like moving forward:

1. Make code change
2. Rebuild specific package
3. Rebuild client application.

### Building Rust Components

For changes to WebAssembly components in `packages/wasm`, refer to the [WebAssembly build guide](./packages/wasm/README.md).

## Publishing New Versions

Prerequisites:

- Node.js v18.0.0 or later

Publishing steps:

1. Create a release PR:

   - Create a new branch from master with format `vX.X.X-Publish`
   - Add changelog as PR description
   - Add "Release" label to the PR
   - Reference example: https://github.com/LIT-Protocol/js-sdk/pull/753

2. After PR approval, proceed with publishing:
   - Update dependencies: `yarn install`
   - Increment version: `yarn bump`
   - Build packages: `yarn build`
   - Run tests:
     - Unit tests: `yarn test:unit`
     - E2E tests: `yarn test:local`
   - Generate documentation: `yarn gen:docs --push`
   - Publish packages: `yarn publish:packages`
   - Commit with message: "Published version X.X.X"

## Testing Guide

### Available Test Commands

| Command           | Description                          |
| ----------------- | ------------------------------------ |
| `yarn test:unit`  | Run unit tests for all packages      |
| `yarn test:local` | Run E2E tests in Node.js environment |

### Running Tests

1. Unit Tests:

   ```sh
   yarn test:unit
   ```

2. End-to-End Tests:

   ```sh
   yarn test:local
   ```

   Optional Environment Variables:

   - NETWORK=<network_name> (datil, datil-test, datil-dev, etc.)
   - DEBUG=true/false

   Optional Flags:

   - --filter=<test-name>

   See more in `local-tests/README.md`

## Local Development with Lit Node

### Setup Local Environment

1. Deploy Lit Node Contracts (addresses will be read from `../lit-assets/blockchain/contracts/deployed-lit-node-contracts-temp.json`)

2. Configure environment variables:

```sh
# Enable local node development
export LIT_JS_SDK_LOCAL_NODE_DEV="true"

# Set funded wallet for Chronicle testnet
export LIT_JS_SDK_FUNDED_WALLET_PRIVATE_KEY="your-funded-private-key"
```

## Environment Variables

| Variable                               | Description                 | Usage                                                        |
| -------------------------------------- | --------------------------- | ------------------------------------------------------------ |
| `LIT_JS_SDK_GITHUB_ACCESS_TOKEN`       | GitHub access token         | Required for accessing contract ABIs from private repository |
| `LIT_JS_SDK_LOCAL_NODE_DEV`            | Local node development flag | Set to `true` to use a local Lit node                        |
| `LIT_JS_SDK_FUNDED_WALLET_PRIVATE_KEY` | Funded wallet private key   | Required for Chronicle Testnet transactions                  |

# Error Handling Guide

## Overview

The SDK implements a robust error handling system using [@openagenda/verror](https://github.com/OpenAgenda/verror). This system provides:

- Detailed error information with cause tracking
- Error composition and chaining
- Additional context through metadata
- Compatibility with native JavaScript Error handling

## Using Error Handling

### Basic Example

```ts
import { VError } from '@openagenda/verror';
import { LitNodeClientBadConfigError } from '@lit-protocol/constants';

try {
  // Simulate an error condition
  const someNativeError = new Error('some native error');

  // Throw a Lit-specific error with context
  throw new LitNodeClientBadConfigError(
    {
      cause: someNativeError,
      info: { foo: 'bar' },
      meta: { baz: 'qux' },
    },
    'some useful message'
  );
} catch (e) {
  // Access error details
  console.log(e.name); // LitNodeClientBadConfigError
  console.log(e.message); // some useful message: some native error
  console.log(e.info); // { foo: 'bar' }
  console.log(e.baz); // qux

  // Additional error information
  // - VError.cause(e): Original error (someNativeError)
  // - VError.info(e): Additional context ({ foo: 'bar' })
  // - VError.meta(e): Metadata ({ baz: 'qux', code: 'lit_node_client_bad_config_error', kind: 'Config' })
  // - VError.fullStack(e): Complete error chain stack trace
}
```

## Creating Custom Errors

To add new error types:

1. Locate `packages/constants/src/lib/errors.ts`
2. Add your error definition to the `LIT_ERROR` object
3. Export the new error class
4. Import and use in your code with relevant context:
   ```ts
   throw new YourCustomError(
     {
       cause: originalError,
       info: {
         /* context */
       },
       meta: {
         /* metadata */
       },
     },
     'Error message'
   );
   ```

# Dockerfile

...coming soon

## Other Commands

# Core Systems and Services

The Lit Protocol SDK provides the following core systems:

- Cryptographic key management (PKP - Programmable Key Pair)
- Blockchain wallet interactions (Ethereum, Solana, Cosmos)
- Decentralized authentication and authorization
- Distributed computing and signing
- Smart contract management
- Access control and encryption services

# Main Functions and Classes

Key components available across packages:

- `PKPEthersWallet`: Ethereum wallet management for PKP
- `LitNodeClient`: Network interaction client
- `executeJs()`: Decentralized JavaScript execution
- `signMessageWithEncryptedKey()`: Cryptographic signing
- `generatePrivateKey()`: Key generation utilities
- `TinnyEnvironment`: Testing environment setup

# Troubleshooting Guide

## Common Issues and Solutions

### Crypto API Error

**Problem:** "Reference Error: crypto is not defined"

**Solution:**
Add the following polyfill for environments without native crypto:

```js
import crypto, { createHash } from 'crypto';

// Add crypto to global scope
Object.defineProperty(globalThis, 'crypto', {
  value: {
    // Implement getRandomValues
    getRandomValues: (arr: any) => crypto.randomBytes(arr.length),

    // Implement subtle crypto
    subtle: {
      digest: (algorithm: string, data: Uint8Array) => {
        return new Promise((resolve) =>
          resolve(
            createHash(algorithm.toLowerCase().replace('-', ''))
              .update(data)
              .digest()
          )
        );
      },
    },
  },
});
```

### Unexpected Error on Node

**Problem:** Exit code 13

**Solution:**
Make sure your node version is above v18.0.0
