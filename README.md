<div align="center">
  <h1>Lit Protocol Javascript/Typescript SDK V8.x.x</h1>
  <img src="https://i.ibb.co/p2xfzK1/Screenshot-2022-11-15-at-09-56-57.png">
  <br/>
  <a href="https://twitter.com/LitProtocol">
    <img src="https://img.shields.io/twitter/follow/litprotocol?label=Follow&style=social"/>
  </a>
  <br/>
  <br/>
  The Lit JavaScript SDK provides developers with a framework for implementing Lit functionality into their own applications. Find installation instructions in the docs to get started with the Lit SDK based on your use case:
  <br/>
  <br/>
  <a href="https://developer.litprotocol.com/v3/sdk/installation">
    <img src="https://i.ibb.co/fDqdXLq/button-go-to-docs.png" />
  </a>

  <a href="https://developer.litprotocol.com/v3/sdk/installation">
    https://developer.litprotocol.com/SDK/Explanation/installation
  </a>
</div>

# Quick Start

The `@lit-protocol/lit-client` package is the core interface for interacting with the Lit Protocol network, and is operable in both Node.js and the browser.

Install with your preferred package manager:

```
yarn add @lit-protocol/lit-client
```

# Packages

<!-- autogen:package:start -->
<div align="center">

| Package                                                                                            | Category                                                                   | Download                                                                                                                                                |
| -------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [@lit-protocol/lit-client](https://github.com/LIT-Protocol/js-sdk/tree/master/packages/lit-client) | ![lit-client](https://img.shields.io/badge/-universal-8A6496 "lit-client") | <a target="_blank" href="https://www.npmjs.com/package/@lit-protocol/lit-client"><img src="https://img.shields.io/npm/v/@lit-protocol/lit-client"/></a> |

</div>
If you're a tech-savvy user and wish to utilize only specific submodules that our main module relies upon, you can find individual packages listed below. This way, you can import only the necessary packages that cater to your specific use case:

<div align="center">

| Package                                                                                                                                          | Category                                                                                                                 | Download                                                                                                                                                                                              |
| ------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [@lit-protocol/access-control-conditions](https://github.com/LIT-Protocol/js-sdk/tree/master/packages/access-control-conditions)                 | ![access-control-conditions](https://img.shields.io/badge/-universal-8A6496 "access-control-conditions")                 | <a target="_blank" href="https://www.npmjs.com/package/@lit-protocol/access-control-conditions"><img src="https://img.shields.io/npm/v/@lit-protocol/access-control-conditions"/></a>                 |
| [@lit-protocol/access-control-conditions-schemas](https://github.com/LIT-Protocol/js-sdk/tree/master/packages/access-control-conditions-schemas) | ![access-control-conditions-schemas](https://img.shields.io/badge/-universal-8A6496 "access-control-conditions-schemas") | <a target="_blank" href="https://www.npmjs.com/package/@lit-protocol/access-control-conditions-schemas"><img src="https://img.shields.io/npm/v/@lit-protocol/access-control-conditions-schemas"/></a> |
| [@lit-protocol/auth](https://github.com/LIT-Protocol/js-sdk/tree/master/packages/auth)                                                           | ![auth](https://img.shields.io/badge/-universal-8A6496 "auth")                                                           | <a target="_blank" href="https://www.npmjs.com/package/@lit-protocol/auth"><img src="https://img.shields.io/npm/v/@lit-protocol/auth"/></a>                                                           |
| [@lit-protocol/auth-helpers](https://github.com/LIT-Protocol/js-sdk/tree/master/packages/auth-helpers)                                           | ![auth-helpers](https://img.shields.io/badge/-universal-8A6496 "auth-helpers")                                           | <a target="_blank" href="https://www.npmjs.com/package/@lit-protocol/auth-helpers"><img src="https://img.shields.io/npm/v/@lit-protocol/auth-helpers"/></a>                                           |
| [@lit-protocol/auth-services](https://github.com/LIT-Protocol/js-sdk/tree/master/packages/auth-services)                                         | ![auth-services](https://img.shields.io/badge/-universal-8A6496 "auth-services")                                         | <a target="_blank" href="https://www.npmjs.com/package/@lit-protocol/auth-services"><img src="https://img.shields.io/npm/v/@lit-protocol/auth-services"/></a>                                         |
| [@lit-protocol/constants](https://github.com/LIT-Protocol/js-sdk/tree/master/packages/constants)                                                 | ![constants](https://img.shields.io/badge/-universal-8A6496 "constants")                                                 | <a target="_blank" href="https://www.npmjs.com/package/@lit-protocol/constants"><img src="https://img.shields.io/npm/v/@lit-protocol/constants"/></a>                                                 |
| [@lit-protocol/crypto](https://github.com/LIT-Protocol/js-sdk/tree/master/packages/crypto)                                                       | ![crypto](https://img.shields.io/badge/-universal-8A6496 "crypto")                                                       | <a target="_blank" href="https://www.npmjs.com/package/@lit-protocol/crypto"><img src="https://img.shields.io/npm/v/@lit-protocol/crypto"/></a>                                                       |
| [@lit-protocol/logger](https://github.com/LIT-Protocol/js-sdk/tree/master/packages/logger)                                                       | ![logger](https://img.shields.io/badge/-universal-8A6496 "logger")                                                       | <a target="_blank" href="https://www.npmjs.com/package/@lit-protocol/logger"><img src="https://img.shields.io/npm/v/@lit-protocol/logger"/></a>                                                       |
| [@lit-protocol/networks](https://github.com/LIT-Protocol/js-sdk/tree/master/packages/networks)                                                   | ![networks](https://img.shields.io/badge/-universal-8A6496 "networks")                                                   | <a target="_blank" href="https://www.npmjs.com/package/@lit-protocol/networks"><img src="https://img.shields.io/npm/v/@lit-protocol/networks"/></a>                                                   |
| [@lit-protocol/schemas](https://github.com/LIT-Protocol/js-sdk/tree/master/packages/schemas)                                                     | ![schemas](https://img.shields.io/badge/-universal-8A6496 "schemas")                                                     | <a target="_blank" href="https://www.npmjs.com/package/@lit-protocol/schemas"><img src="https://img.shields.io/npm/v/@lit-protocol/schemas"/></a>                                                     |
| [@lit-protocol/types](https://github.com/LIT-Protocol/js-sdk/tree/master/packages/types)                                                         | ![types](https://img.shields.io/badge/-universal-8A6496 "types")                                                         | <a target="_blank" href="https://www.npmjs.com/package/@lit-protocol/types"><img src="https://img.shields.io/npm/v/@lit-protocol/types"/></a>                                                         |
| [@lit-protocol/wasm](https://github.com/LIT-Protocol/js-sdk/tree/master/packages/wasm)                                                           | ![wasm](https://img.shields.io/badge/-universal-8A6496 "wasm")                                                           | <a target="_blank" href="https://www.npmjs.com/package/@lit-protocol/wasm"><img src="https://img.shields.io/npm/v/@lit-protocol/wasm"/></a>                                                           |
| [@lit-protocol/wrapped-keys](https://github.com/LIT-Protocol/js-sdk/tree/master/packages/wrapped-keys)                                           | ![wrapped-keys](https://img.shields.io/badge/-universal-8A6496 "wrapped-keys")                                           | <a target="_blank" href="https://www.npmjs.com/package/@lit-protocol/wrapped-keys"><img src="https://img.shields.io/npm/v/@lit-protocol/wrapped-keys"/></a>                                           |
| [@lit-protocol/wrapped-keys-lit-actions](https://github.com/LIT-Protocol/js-sdk/tree/master/packages/wrapped-keys-lit-actions)                   | ![wrapped-keys-lit-actions](https://img.shields.io/badge/-universal-8A6496 "wrapped-keys-lit-actions")                   | <a target="_blank" href="https://www.npmjs.com/package/@lit-protocol/wrapped-keys-lit-actions"><img src="https://img.shields.io/npm/v/@lit-protocol/wrapped-keys-lit-actions"/></a>                   |

</div>

<!-- autogen:package:end -->

## API Docs

<div align="center">

| Version | Link                                                     |
| ------- | -------------------------------------------------------- |
| V8      | TBD                                                      |
| V7      | [7.x.x docs](https://v7-api-doc-lit-js-sdk.vercel.app/)  |
| V6      | [6.x.x docs](https://v6-api-doc-lit-js-sdk.vercel.app/)  |
| V5      | [5.x.x docs](https://v3.api-docs.getlit.dev/)            |
| V2      | [2.x.x docs](http://docs.lit-js-sdk-v2.litprotocol.com/) |

</div>

# Contributing to this SDK

### Prerequisites

- node (v20.x or above)
- bun (v1.2.10)
- python (v3.11.9 distutils is required)
- rust (v1.82.0 or above)
- [wasm-pack](https://github.com/rustwasm/wasm-pack)

### Recommended

- NX Console: https://nx.dev/core-features/integrate-with-editors

## Quick Start

The following commands will help you start developing with this repository.

First, install the dependencies via bun:

```
bun install
```

## Building

You can build the project with the following command:

```
// The command unlinks all packages, fixes missing dependencies,
// and then builds all packages sequentially (excluding wrapped-keys packages)
// to ensure a clean and complete build.
bun run build

// Automatically fixes missing dependencies across all packages and
// then builds only the affected packages (excluding wrapped-keys packages)
// to optimize build time.
bun run build:affected
```

### Building a Specific Package

To build a specific package, run the following command:

```
bunx nx run <package-name>:build
```

### Building changes to Rust source

If changes are made to `packages/wasm` see [here](./packages/wasm/README.md) for info on building from source.

## Testing

Run local unit tests once with:

```
bun run test:unit
```

or continuously as changes are made with:

```
bun run test:unit:watch
```

## Error Handling

This SDK uses custom error classes derived from [@openagenda/verror](https://github.com/OpenAgenda/verror) to handle errors between packages and to the SDK consumers.
Normal error handling is also supported as VError extends the native Error class, but using VError allows for better error composition and information propagation.
You can check their documentation for the extra fields that are added to the error object and methods on how to handle them in a safe way.

### Example

```ts
import { VError } from '@openagenda/verror';
import { LitNodeClientBadConfigError } from '@lit-protocol/constants';

try {
  const someNativeError = new Error('some native error');

  throw new LitNodeClientBadConfigError(
    {
      cause: someNativeError,
      info: {
        foo: 'bar',
      },
      meta: {
        baz: 'qux',
      },
    },
    'some useful message'
  );
} catch (e) {
  console.log(e.name); // LitNodeClientBadConfigError
  console.log(e.message); // some useful message: some native error
  console.log(e.info); // { foo: 'bar' }
  console.log(e.baz); // qux
  // VError.cause(e) is someNativeError
  // VError.info(e) is { foo: 'bar' }
  // VError.meta(e) is { baz: 'qux', code: 'lit_node_client_bad_config_error', kind: 'Config' }
  // Verror.fullStack(e) is the full stack trace composed of the error chain including the causes
}
```

## Creating a new error

In file `packages/constants/src/lib/errors.ts` you can find the list of errors that are currently supported and add new ones if needed.

To create and use a new error, you need to:

1. Add the error information to the `LIT_ERROR` object in `packages/constants/src/lib/errors.ts`
2. Export the error from the `errors.ts` file at the end of the file
3. Import the error where you need it
4. Throw the error in your code adding all the information a user might need to know about the error such as the cause, the info, etc.
