<div align="center">
<h1>Lit Protocol Javascript/Typescript SDK V6.0.0</h1>

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
| [@lit-protocol/bls-sdk](https://github.com/LIT-Protocol/js-sdk/tree/master/packages/bls-sdk)                                     | ![bls-sdk](https://img.shields.io/badge/-universal-8A6496 'bls-sdk')                                     | <a target="_blank" href="https://www.npmjs.com/package/@lit-protocol/bls-sdk"><img src="https://img.shields.io/npm/v/@lit-protocol/bls-sdk"/></a>                                     |
| [@lit-protocol/constants](https://github.com/LIT-Protocol/js-sdk/tree/master/packages/constants)                                 | ![constants](https://img.shields.io/badge/-universal-8A6496 'constants')                                 | <a target="_blank" href="https://www.npmjs.com/package/@lit-protocol/constants"><img src="https://img.shields.io/npm/v/@lit-protocol/constants"/></a>                                 |
| [@lit-protocol/contracts-sdk](https://github.com/LIT-Protocol/js-sdk/tree/master/packages/contracts-sdk)                         | ![contracts-sdk](https://img.shields.io/badge/-universal-8A6496 'contracts-sdk')                         | <a target="_blank" href="https://www.npmjs.com/package/@lit-protocol/contracts-sdk"><img src="https://img.shields.io/npm/v/@lit-protocol/contracts-sdk"/></a>                         |
| [@lit-protocol/core](https://github.com/LIT-Protocol/js-sdk/tree/master/packages/core)                                           | ![core](https://img.shields.io/badge/-universal-8A6496 'core')                                           | <a target="_blank" href="https://www.npmjs.com/package/@lit-protocol/core"><img src="https://img.shields.io/npm/v/@lit-protocol/core"/></a>                                           |
| [@lit-protocol/crypto](https://github.com/LIT-Protocol/js-sdk/tree/master/packages/crypto)                                       | ![crypto](https://img.shields.io/badge/-universal-8A6496 'crypto')                                       | <a target="_blank" href="https://www.npmjs.com/package/@lit-protocol/crypto"><img src="https://img.shields.io/npm/v/@lit-protocol/crypto"/></a>                                       |
| [@lit-protocol/ecdsa-sdk](https://github.com/LIT-Protocol/js-sdk/tree/master/packages/ecdsa-sdk)                                 | ![ecdsa-sdk](https://img.shields.io/badge/-universal-8A6496 'ecdsa-sdk')                                 | <a target="_blank" href="https://www.npmjs.com/package/@lit-protocol/ecdsa-sdk"><img src="https://img.shields.io/npm/v/@lit-protocol/ecdsa-sdk"/></a>                                 |
| [@lit-protocol/encryption](https://github.com/LIT-Protocol/js-sdk/tree/master/packages/encryption)                               | ![encryption](https://img.shields.io/badge/-universal-8A6496 'encryption')                               | <a target="_blank" href="https://www.npmjs.com/package/@lit-protocol/encryption"><img src="https://img.shields.io/npm/v/@lit-protocol/encryption"/></a>                               |
| [@lit-protocol/logger](https://github.com/LIT-Protocol/js-sdk/tree/master/packages/logger)                                       | ![logger](https://img.shields.io/badge/-universal-8A6496 'logger')                                       | <a target="_blank" href="https://www.npmjs.com/package/@lit-protocol/logger"><img src="https://img.shields.io/npm/v/@lit-protocol/logger"/></a>                                       |
| [@lit-protocol/misc](https://github.com/LIT-Protocol/js-sdk/tree/master/packages/misc)                                           | ![misc](https://img.shields.io/badge/-universal-8A6496 'misc')                                           | <a target="_blank" href="https://www.npmjs.com/package/@lit-protocol/misc"><img src="https://img.shields.io/npm/v/@lit-protocol/misc"/></a>                                           |
| [@lit-protocol/nacl](https://github.com/LIT-Protocol/js-sdk/tree/master/packages/nacl)                                           | ![nacl](https://img.shields.io/badge/-universal-8A6496 'nacl')                                           | <a target="_blank" href="https://www.npmjs.com/package/@lit-protocol/nacl"><img src="https://img.shields.io/npm/v/@lit-protocol/nacl"/></a>                                           |
| [@lit-protocol/pkp-base](https://github.com/LIT-Protocol/js-sdk/tree/master/packages/pkp-base)                                   | ![pkp-base](https://img.shields.io/badge/-universal-8A6496 'pkp-base')                                   | <a target="_blank" href="https://www.npmjs.com/package/@lit-protocol/pkp-base"><img src="https://img.shields.io/npm/v/@lit-protocol/pkp-base"/></a>                                   |
| [@lit-protocol/pkp-client](https://github.com/LIT-Protocol/js-sdk/tree/master/packages/pkp-client)                               | ![pkp-client](https://img.shields.io/badge/-universal-8A6496 'pkp-client')                               | <a target="_blank" href="https://www.npmjs.com/package/@lit-protocol/pkp-client"><img src="https://img.shields.io/npm/v/@lit-protocol/pkp-client"/></a>                               |
| [@lit-protocol/pkp-cosmos](https://github.com/LIT-Protocol/js-sdk/tree/master/packages/pkp-cosmos)                               | ![pkp-cosmos](https://img.shields.io/badge/-universal-8A6496 'pkp-cosmos')                               | <a target="_blank" href="https://www.npmjs.com/package/@lit-protocol/pkp-cosmos"><img src="https://img.shields.io/npm/v/@lit-protocol/pkp-cosmos"/></a>                               |
| [@lit-protocol/pkp-ethers](https://github.com/LIT-Protocol/js-sdk/tree/master/packages/pkp-ethers)                               | ![pkp-ethers](https://img.shields.io/badge/-universal-8A6496 'pkp-ethers')                               | <a target="_blank" href="https://www.npmjs.com/package/@lit-protocol/pkp-ethers"><img src="https://img.shields.io/npm/v/@lit-protocol/pkp-ethers"/></a>                               |
| [@lit-protocol/pkp-sui](https://github.com/LIT-Protocol/js-sdk/tree/master/packages/pkp-sui)                                     | ![pkp-sui](https://img.shields.io/badge/-universal-8A6496 'pkp-sui')                                     | <a target="_blank" href="https://www.npmjs.com/package/@lit-protocol/pkp-sui"><img src="https://img.shields.io/npm/v/@lit-protocol/pkp-sui"/></a>                                     |
| [@lit-protocol/pkp-walletconnect](https://github.com/LIT-Protocol/js-sdk/tree/master/packages/pkp-walletconnect)                 | ![pkp-walletconnect](https://img.shields.io/badge/-universal-8A6496 'pkp-walletconnect')                 | <a target="_blank" href="https://www.npmjs.com/package/@lit-protocol/pkp-walletconnect"><img src="https://img.shields.io/npm/v/@lit-protocol/pkp-walletconnect"/></a>                 |
| [@lit-protocol/sev-snp-utils-sdk](https://github.com/LIT-Protocol/js-sdk/tree/master/packages/sev-snp-utils-sdk)                 | ![sev-snp-utils-sdk](https://img.shields.io/badge/-universal-8A6496 'sev-snp-utils-sdk')                 | <a target="_blank" href="https://www.npmjs.com/package/@lit-protocol/sev-snp-utils-sdk"><img src="https://img.shields.io/npm/v/@lit-protocol/sev-snp-utils-sdk"/></a>                 |
| [@lit-protocol/types](https://github.com/LIT-Protocol/js-sdk/tree/master/packages/types)                                         | ![types](https://img.shields.io/badge/-universal-8A6496 'types')                                         | <a target="_blank" href="https://www.npmjs.com/package/@lit-protocol/types"><img src="https://img.shields.io/npm/v/@lit-protocol/types"/></a>                                         |
| [@lit-protocol/uint8arrays](https://github.com/LIT-Protocol/js-sdk/tree/master/packages/uint8arrays)                             | ![uint8arrays](https://img.shields.io/badge/-universal-8A6496 'uint8arrays')                             | <a target="_blank" href="https://www.npmjs.com/package/@lit-protocol/uint8arrays"><img src="https://img.shields.io/npm/v/@lit-protocol/uint8arrays"/></a>                             |
| [@lit-protocol/wrapped-keys](https://github.com/LIT-Protocol/js-sdk/tree/master/packages/wrapped-keys)                           | ![wrapped-keys](https://img.shields.io/badge/-universal-8A6496 'wrapped-keys')                           | <a target="_blank" href="https://www.npmjs.com/package/@lit-protocol/wrapped-keys"><img src="https://img.shields.io/npm/v/@lit-protocol/wrapped-keys"/></a>                           |
| [@lit-protocol/auth-browser](https://github.com/LIT-Protocol/js-sdk/tree/master/packages/auth-browser)                           | ![auth-browser](https://img.shields.io/badge/-browser-E98869 'auth-browser')                             | <a target="_blank" href="https://www.npmjs.com/package/@lit-protocol/auth-browser"><img src="https://img.shields.io/npm/v/@lit-protocol/auth-browser"/></a>                           |
| [@lit-protocol/misc-browser](https://github.com/LIT-Protocol/js-sdk/tree/master/packages/misc-browser)                           | ![misc-browser](https://img.shields.io/badge/-browser-E98869 'misc-browser')                             | <a target="_blank" href="https://www.npmjs.com/package/@lit-protocol/misc-browser"><img src="https://img.shields.io/npm/v/@lit-protocol/misc-browser"/></a>                           |

<!-- autogen:package:end -->

## API Doc

| Version          | Link                                                     |
| ---------------- | -------------------------------------------------------- |
| V6 (Beta)        | [6.x.x docs](https://v6-api-doc-lit-js-sdk.vercel.app/)  |
| V5 (**Current**) | [5.x.x docs](https://v3.api-docs.getlit.dev/)            |
| V2               | [2.x.x docs](http://docs.lit-js-sdk-v2.litprotocol.com/) |

</div>

# Contributing and developing to this SDK

## Prerequisite

- node (v19.x or above)

## Recommended

- NX Console: https://nx.dev/core-features/integrate-with-editors

# Quick Start

The following commands will help you start developing with this repository.

First, install the dependencies via yarn:

```
yarn
```

## Building

You can build the project with the following commands:

```
// for local development - It stripped away operations that don't matter for local dev
yarn build:dev

// you should never need to use yarn build unless you want to test or publish it
yarn build
```

## Running Test Apps

The test apps are configured to automatically import all modules and expose all module functions. For browsers, you can access these functions using `window.LitJsSdk_<package_name>.<function_name>`

```jsx
// Running apps...
// react: http://localhost:4003
// nodejs: in the terminal
yarn apps
```

or running individually

```
// react
yarn nx run react:serve

// nodejs
yarn nx run nodejs:serve
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

By default, NX provides a command to generate a library
`nx generate @nx/js:library`. However, it doesn't have an esbuild built-in so that we've created a custom tool that modify the build commands.

```js
yarn gen:lib <package-name> <tag>
```

## Create a new react demo app using the Lit JS SDK

```js
yarn tools --create --react contracts-sdk --demo
```

## Deleting a package or app

```
// delete an app from ./app/<app-name>
yarn delete:app <app-name>

// delete a package from ./packages/<package-name>
yarn delete:package <package-name>
```

## Building

```jsx
yarn build
```

### Building target package

```jsx
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

## Publishing

You must have at least nodejs v18 to do this.

1. Install the latest packages with `yarn install`

2. Run `yarn bump` to bump the version

3. Build all the packages with `yarn build`

4. Run the unit tests with `yarn test:unit` & e2e node tests `yarn test:local` locally & ensure that they pass

5. Update the docs with `yarn gen:docs --push`

6. Finally, publish with the `@cayenne` tag: `yarn publish:cayenne`

7. Commit these changes "Published version X.X.X"

### Publishing to Serrano / Jalapno

```sh
git checkout serrano
yarn bump
yarn build
yarn node ./tools/scripts/pub.mjs --tag serrano-jalapeno
```

## Testing

### Quick Start on E2E Testing

The following will serve the react testing app and launch the cypress e2e testing after

```sh
yarn test:local
```

### Environments

There are currently three environments can be tested on, each of which can be generated from a custom command, which would automatically import all the libraries in `./packages/*`. The UI of HTML & React are visually identical but they are using different libraries.

| Environment | Generate Command  | Test Location              |
| ----------- | ----------------- | -------------------------- |
| React       | `yarn gen:react`  | http://localhost:4003      |
| NodeJs      | `yarn gen:nodejs` | `yarn nx run nodejs:serve` |

### Unit Tests

```jsx
yarn test:unit
```

### E2E Testing with Metamask using Cypress (for Browser)

<b>React</b>

```jsx
// E2E React
yarn tools --test --e2e react
```

## Testing with a Local Lit Node

First, deploy your Lit Node Contracts, since the correct addresses will be pulled from the `../lit-assets/blockchain/contracts/deployed-lit-node-contracts-temp.json` file.

Set these two env vars:

```sh
export LIT_JS_SDK_LOCAL_NODE_DEV="true"
export LIT_JS_SDK_FUNDED_WALLET_PRIVATE_KEY="putAFundedPrivateKeyOnChronicleHere"
```

Run:

```sh
yarn update:contracts-sdk --fetch
yarn update:contracts-sdk --gen
yarn build:packages
```

To run manual tests:

```sh
 yarn nx run nodejs:serve
```

## ENV Vars

- LIT_JS_SDK_GITHUB_ACCESS_TOKEN - a github access token to get the contract ABIs from a private repo
- LIT_JS_SDK_LOCAL_NODE_DEV - set to true to use a local node
- LIT_JS_SDK_FUNDED_WALLET_PRIVATE_KEY - set to a funded wallet on Chronicle Testnet

# Dockerfile

...coming soon

## Other Commands

### Interactive graph dependencies using NX

```
yarn graph
```

![](https://i.ibb.co/2dLyMTW/Screenshot-2022-11-15-at-15-18-46.png)

# FAQs & Common Errors

<details>
<summary>(React) Failed to parse source map from</summary>

In your React package.json, add `GENERATE_SOURCEMAP=false` to your start script

eg.

```
  "scripts": {
    "start": "GENERATE_SOURCEMAP=false react-scripts start",
    "build": "react-scripts build",
    "test": "react-scripts test",
    "eject": "react-scripts eject"
  },
```

</details>

<details>
<summary>Web bundling using esbuild</summary>

It’s currently using a custom plugin [@websaam/nx-esbuild](https://www.npmjs.com/package/@websaam/nx-esbuild) which is a fork from [@wanews/nx-esbuild](https://www.npmjs.com/package/@wanews/nx-esbuild)

```json
"_buildWeb": {
    "executor": "@websaam/nx-esbuild:package",
    "options": {
      "banner": {
        "js": "import { createRequire } from 'module';const require = createRequire(import.meta.url);"
      },
      "globalName": "LitJsSdk_CoreBrowser",
      "outfile":"dist/packages/core-browser-vanilla/core-browser.js",
      "entryPoints": ["./packages/core-browser/src/index.ts"],
      "define": { "global": "window" },
      "plugins":[
        {
          "package": "esbuild-node-builtins",
          "function": "nodeBuiltIns"
        }
      ]
    }
  }
```

</details>

<details>
<summary>Reference Error: crypto is not defined</summary>

```js
import crypto, { createHash } from 'crypto';
Object.defineProperty(globalThis, 'crypto', {
  value: {
    getRandomValues: (arr: any) => crypto.randomBytes(arr.length),
    subtle: {
      digest: (algorithm: string, data: Uint8Array) => {
        return new Promise((resolve, reject) =>
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

</details>
<details>
<summary>error Command failed with exit code 13.</summary>

Make sure your node version is above v18.0.0

</details>
