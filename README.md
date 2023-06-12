<div align="center">
<h1>Lit Protocol Javascript/Typescript SDK V2</h1>
<img src="https://i.ibb.co/p2xfzK1/Screenshot-2022-11-15-at-09-56-57.png">
<br/>
<a href="https://twitter.com/LitProtocol"><img src="https://img.shields.io/twitter/follow/litprotocol?label=Follow&style=social"/></a>
<br/>
<br/>
The Lit JavaScript SDK provides developers with a framework for implementing Lit functionality into their own applications. Find installation instructions in the docs to get started with the Lit SDK based on your use case:
<br/>
<br/>

<a href="https://developer.litprotocol.com/SDK/Explanation/installation"><img src="https://i.ibb.co/fDqdXLq/button-go-to-docs.png" /></a>

<a href="https://developer.litprotocol.com/SDK/Explanation/installation">
https://developer.litprotocol.com/SDK/Explanation/installation
</a>

<br /><br />
This new V2 SDK is written in Typescript and is a complete rewrite of the old SDK. It is much more modular and easier to use, and has a much smaller bundle size.

</div>

<div align="left">

[ChangeLog: All notable changes to this project will be documented in this file.](https://github.com/LIT-Protocol/js-sdk/blob/master/CHANGELOG.md)

# Quick Start

### NodeJS Only

Removed browser related methods eg. checkAndSignAuthSig

```
yarn add @lit-protocol/lit-node-client-nodejs
```

### (Isomorphic) works on Node.js/browser

```
yarn add @lit-protocol/lit-node-client
```

### Vanilla JS (UMD)

```js
<script src="https://cdn.jsdelivr.net/npm/@lit-protocol/lit-node-client-vanilla/lit-node-client.js"></script>
<script>
  const authSig = LitJsSdk_litNodeClient.checkAndSignAuthMessage({chain: 'ethereum'});
</script>
```

</div>

<div align="center">

# Packages

> 📝 If you're looking to use the Lit SDK, you're probably all set with just the lit-node-client <link>. It's got everything most folks need. However, if you're the type who likes to keep things super lean and mean, and you need to keep an eagle eye on your bundle size, we've got individual packages too.

Individual packages are below so that you can import the minimum required packages for your use case.

<!-- autogen:package:start -->

Package | Category | Version | Download
--- | --- | --- | ---
| [@lit-protocol/lit-node-client-nodejs](https://github.com/LIT-Protocol/js-sdk/tree/master/packages/lit-node-client-nodejs) | ![lit-node-client-nodejs](https://img.shields.io/badge/-nodejs-2E8B57 "lit-node-client-nodejs") | 2.2.24 | <a target="_blank" href="https://www.npmjs.com/package/@lit-protocol/lit-node-client-nodejs">npm</a><br/><a href="https://cdn.jsdelivr.net/npm/@lit-protocol/lit-node-client-nodejs-vanilla/lit-node-client-nodejs.min.js">Vanilla JS (UMD)</a>
| [@lit-protocol/lit-node-client](https://github.com/LIT-Protocol/js-sdk/tree/master/packages/lit-node-client) | ![lit-node-client](https://img.shields.io/badge/-universal-8A6496 "lit-node-client") | 2.2.24 | <a target="_blank" href="https://www.npmjs.com/package/@lit-protocol/lit-node-client">npm</a><br/><a href="https://cdn.jsdelivr.net/npm/@lit-protocol/lit-node-client-vanilla/lit-node-client.min.js">Vanilla JS (UMD)</a>
| [@lit-protocol/access-control-conditions](https://github.com/LIT-Protocol/js-sdk/tree/master/packages/access-control-conditions) | ![access-control-conditions](https://img.shields.io/badge/-universal-8A6496 "access-control-conditions") | 2.2.24 | <a target="_blank" href="https://www.npmjs.com/package/@lit-protocol/access-control-conditions">npm</a><br/><a href="https://cdn.jsdelivr.net/npm/@lit-protocol/access-control-conditions-vanilla/access-control-conditions.min.js">Vanilla JS (UMD)</a>
| [@lit-protocol/auth-helpers](https://github.com/LIT-Protocol/js-sdk/tree/master/packages/auth-helpers) | ![auth-helpers](https://img.shields.io/badge/-universal-8A6496 "auth-helpers") | 2.2.24 | <a target="_blank" href="https://www.npmjs.com/package/@lit-protocol/auth-helpers">npm</a><br/><a href="https://cdn.jsdelivr.net/npm/@lit-protocol/auth-helpers-vanilla/auth-helpers.min.js">Vanilla JS (UMD)</a>
| [@lit-protocol/bls-sdk](https://github.com/LIT-Protocol/js-sdk/tree/master/packages/bls-sdk) | ![bls-sdk](https://img.shields.io/badge/-universal-8A6496 "bls-sdk") | 2.2.24 | <a target="_blank" href="https://www.npmjs.com/package/@lit-protocol/bls-sdk">npm</a><br/><a href="https://cdn.jsdelivr.net/npm/@lit-protocol/bls-sdk-vanilla/bls-sdk.min.js">Vanilla JS (UMD)</a>
| [@lit-protocol/constants](https://github.com/LIT-Protocol/js-sdk/tree/master/packages/constants) | ![constants](https://img.shields.io/badge/-universal-8A6496 "constants") | 2.2.24 | <a target="_blank" href="https://www.npmjs.com/package/@lit-protocol/constants">npm</a><br/><a href="https://cdn.jsdelivr.net/npm/@lit-protocol/constants-vanilla/constants.min.js">Vanilla JS (UMD)</a>
| [@lit-protocol/contracts-sdk](https://github.com/LIT-Protocol/js-sdk/tree/master/packages/contracts-sdk) | ![contracts-sdk](https://img.shields.io/badge/-universal-8A6496 "contracts-sdk") | 2.2.24 | <a target="_blank" href="https://www.npmjs.com/package/@lit-protocol/contracts-sdk">npm</a><br/><a href="https://cdn.jsdelivr.net/npm/@lit-protocol/contracts-sdk-vanilla/contracts-sdk.min.js">Vanilla JS (UMD)</a>
| [@lit-protocol/core](https://github.com/LIT-Protocol/js-sdk/tree/master/packages/core) | ![core](https://img.shields.io/badge/-universal-8A6496 "core") | 2.2.24 | <a target="_blank" href="https://www.npmjs.com/package/@lit-protocol/core">npm</a><br/><a href="https://cdn.jsdelivr.net/npm/@lit-protocol/core-vanilla/core.min.js">Vanilla JS (UMD)</a>
| [@lit-protocol/crypto](https://github.com/LIT-Protocol/js-sdk/tree/master/packages/crypto) | ![crypto](https://img.shields.io/badge/-universal-8A6496 "crypto") | 2.2.24 | <a target="_blank" href="https://www.npmjs.com/package/@lit-protocol/crypto">npm</a><br/><a href="https://cdn.jsdelivr.net/npm/@lit-protocol/crypto-vanilla/crypto.min.js">Vanilla JS (UMD)</a>
| [@lit-protocol/ecdsa-sdk](https://github.com/LIT-Protocol/js-sdk/tree/master/packages/ecdsa-sdk) | ![ecdsa-sdk](https://img.shields.io/badge/-universal-8A6496 "ecdsa-sdk") | 2.2.24 | <a target="_blank" href="https://www.npmjs.com/package/@lit-protocol/ecdsa-sdk">npm</a><br/><a href="https://cdn.jsdelivr.net/npm/@lit-protocol/ecdsa-sdk-vanilla/ecdsa-sdk.min.js">Vanilla JS (UMD)</a>
| [@lit-protocol/encryption](https://github.com/LIT-Protocol/js-sdk/tree/master/packages/encryption) | ![encryption](https://img.shields.io/badge/-universal-8A6496 "encryption") | 2.2.24 | <a target="_blank" href="https://www.npmjs.com/package/@lit-protocol/encryption">npm</a><br/><a href="https://cdn.jsdelivr.net/npm/@lit-protocol/encryption-vanilla/encryption.min.js">Vanilla JS (UMD)</a>
| [@lit-protocol/lit-third-party-libs](https://github.com/LIT-Protocol/js-sdk/tree/master/packages/lit-third-party-libs) | ![lit-third-party-libs](https://img.shields.io/badge/-universal-8A6496 "lit-third-party-libs") | 2.2.24 | <a target="_blank" href="https://www.npmjs.com/package/@lit-protocol/lit-third-party-libs">npm</a><br/><a href="https://cdn.jsdelivr.net/npm/@lit-protocol/lit-third-party-libs-vanilla/lit-third-party-libs.min.js">Vanilla JS (UMD)</a>
| [@lit-protocol/misc](https://github.com/LIT-Protocol/js-sdk/tree/master/packages/misc) | ![misc](https://img.shields.io/badge/-universal-8A6496 "misc") | 2.2.24 | <a target="_blank" href="https://www.npmjs.com/package/@lit-protocol/misc">npm</a><br/><a href="https://cdn.jsdelivr.net/npm/@lit-protocol/misc-vanilla/misc.min.js">Vanilla JS (UMD)</a>
| [@lit-protocol/nacl](https://github.com/LIT-Protocol/js-sdk/tree/master/packages/nacl) | ![nacl](https://img.shields.io/badge/-universal-8A6496 "nacl") | 2.2.24 | <a target="_blank" href="https://www.npmjs.com/package/@lit-protocol/nacl">npm</a><br/><a href="https://cdn.jsdelivr.net/npm/@lit-protocol/nacl-vanilla/nacl.min.js">Vanilla JS (UMD)</a>
| [@lit-protocol/pkp-base](https://github.com/LIT-Protocol/js-sdk/tree/master/packages/pkp-base) | ![pkp-base](https://img.shields.io/badge/-universal-8A6496 "pkp-base") | 2.2.24 | <a target="_blank" href="https://www.npmjs.com/package/@lit-protocol/pkp-base">npm</a><br/><a href="https://cdn.jsdelivr.net/npm/@lit-protocol/pkp-base-vanilla/pkp-base.min.js">Vanilla JS (UMD)</a>
| [@lit-protocol/pkp-client](https://github.com/LIT-Protocol/js-sdk/tree/master/packages/pkp-client) | ![pkp-client](https://img.shields.io/badge/-universal-8A6496 "pkp-client") | 2.2.24 | <a target="_blank" href="https://www.npmjs.com/package/@lit-protocol/pkp-client">npm</a><br/><a href="https://cdn.jsdelivr.net/npm/@lit-protocol/pkp-client-vanilla/pkp-client.min.js">Vanilla JS (UMD)</a>
| [@lit-protocol/pkp-cosmos](https://github.com/LIT-Protocol/js-sdk/tree/master/packages/pkp-cosmos) | ![pkp-cosmos](https://img.shields.io/badge/-universal-8A6496 "pkp-cosmos") | 2.2.24 | <a target="_blank" href="https://www.npmjs.com/package/@lit-protocol/pkp-cosmos">npm</a><br/><a href="https://cdn.jsdelivr.net/npm/@lit-protocol/pkp-cosmos-vanilla/pkp-cosmos.min.js">Vanilla JS (UMD)</a>
| [@lit-protocol/pkp-ethers](https://github.com/LIT-Protocol/js-sdk/tree/master/packages/pkp-ethers) | ![pkp-ethers](https://img.shields.io/badge/-universal-8A6496 "pkp-ethers") | 2.2.24 | <a target="_blank" href="https://www.npmjs.com/package/@lit-protocol/pkp-ethers">npm</a><br/><a href="https://cdn.jsdelivr.net/npm/@lit-protocol/pkp-ethers-vanilla/pkp-ethers.min.js">Vanilla JS (UMD)</a>
| [@lit-protocol/pkp-walletconnect](https://github.com/LIT-Protocol/js-sdk/tree/master/packages/pkp-walletconnect) | ![pkp-walletconnect](https://img.shields.io/badge/-universal-8A6496 "pkp-walletconnect") | 2.2.24 | <a target="_blank" href="https://www.npmjs.com/package/@lit-protocol/pkp-walletconnect">npm</a><br/><a href="https://cdn.jsdelivr.net/npm/@lit-protocol/pkp-walletconnect-vanilla/pkp-walletconnect.min.js">Vanilla JS (UMD)</a>
| [@lit-protocol/types](https://github.com/LIT-Protocol/js-sdk/tree/master/packages/types) | ![types](https://img.shields.io/badge/-universal-8A6496 "types") | 2.2.24 | <a target="_blank" href="https://www.npmjs.com/package/@lit-protocol/types">npm</a><br/><a href="https://cdn.jsdelivr.net/npm/@lit-protocol/types-vanilla/types.min.js">Vanilla JS (UMD)</a>
| [@lit-protocol/uint8arrays](https://github.com/LIT-Protocol/js-sdk/tree/master/packages/uint8arrays) | ![uint8arrays](https://img.shields.io/badge/-universal-8A6496 "uint8arrays") | 2.2.24 | <a target="_blank" href="https://www.npmjs.com/package/@lit-protocol/uint8arrays">npm</a><br/><a href="https://cdn.jsdelivr.net/npm/@lit-protocol/uint8arrays-vanilla/uint8arrays.min.js">Vanilla JS (UMD)</a>
| [@lit-protocol/auth-browser](https://github.com/LIT-Protocol/js-sdk/tree/master/packages/auth-browser) | ![auth-browser](https://img.shields.io/badge/-browser-E98869 "auth-browser") | 2.2.24 | <a target="_blank" href="https://www.npmjs.com/package/@lit-protocol/auth-browser">npm</a><br/><a href="https://cdn.jsdelivr.net/npm/@lit-protocol/auth-browser-vanilla/auth-browser.min.js">Vanilla JS (UMD)</a>
| [@lit-protocol/misc-browser](https://github.com/LIT-Protocol/js-sdk/tree/master/packages/misc-browser) | ![misc-browser](https://img.shields.io/badge/-browser-E98869 "misc-browser") | 2.2.24 | <a target="_blank" href="https://www.npmjs.com/package/@lit-protocol/misc-browser">npm</a><br/><a href="https://cdn.jsdelivr.net/npm/@lit-protocol/misc-browser-vanilla/misc-browser.min.js">Vanilla JS (UMD)</a>

<!-- autogen:package:end -->

## API Doc

http://docs.lit-js-sdk-v2.litprotocol.com/ <br/>

</div>

## Demo

| App                    | Link                                                |
| ---------------------- | --------------------------------------------------- |
| Simple Encrypt Decrypt | https://demo.encrypt-decrypt.react.litprotocol.com/ |
| Contracts SDK          | https://demo.contracts-sdk.react.litprotocol.com/   |
| (Test) Html            | http://test.lit-js-sdk-v2.html.litprotocol.com/     |
| (Test) React           | http://test.lit-js-sdk-v2.react.litprotocol.com/    |

> NOTE: For (Test) apps, all packages and functions can be called inside the browser console. eg. `window.LitJsSdk_[package_name].[function_name]`

# Contributing and developing to this SDK

## Recommended VSCode Extensions

<details>
<summary>Nx Console</summary>
Download: <a href="https://nx.dev/core-features/integrate-with-editors">https://nx.dev/core-features/integrate-with-editors</a>
</details>
<details>
<summary>Restore Terminal</summary>

Download: <a href="https://marketplace.visualstudio.com/items?itemName=EthanSK.restore-terminals">https://marketplace.visualstudio.com/items?itemName=EthanSK.restore-terminals</a>
See [Video](https://streamable.com/e/5g52m4)

```js
  "restoreTerminals.terminals": [
    {See [Video](https://streamable.com/e/5g52m4)
      "splitTerminals": [
        // {
        //   "name": "nx graph",
        //   "commands": ["yarn graph"]
        // },
        {
          "name": "nodejs",
          "commands": ["yarn nx run nodejs:serve"]
        },
        {
          "name": "html",
          "commands": ["yarn nx run html:serve"]
        },
        {
          "name": "react",
          "commands": ["yarn nx run react:serve"]
        },
        {
          "name": "custom",
          "commands": ["clear"]
        }
      ]
    }
  ]
```

</details>

# Workflow

## CLI (WIP)

```
yarn tools
```

## Dev

```jsx
// this will open
// html: http://localhost:4002
// react: http://localhost:4003
// nodejs: in this terminal
yarn tools --dev --apps

// usually i will open another temrinal to watch the package
// i'm developing
yarn tools --watch --target <package-name>
```

## Creating a new library

By default, NX provides a command to generate a library
`nx generate @nrwl/js:library`. However, it doesn't have an esbuild built-in so that we've created a custom tool that modify the build commands.

```js
yarn gen:lib <package-name> <tag>
```

## Create a new react demo app using the Lit JS SDK

```js
yarn tools --create --react contracts-sdk --demo
```

## Deleting a library

```
yarn tool:delete (--package OR --app) <project-name>
```

## Building

```jsx
yarn build

// or
yarn tools --build
```

### Building target package

```jsx
yarn nx run <project-name>:build

// or
yarn tools --build --target <project-name>

// or targeted env
yarn nx run <project-name>:_buildTsc
yarn nx run <project-name>:_buildWeb
```

## Watching

```jsx
// watch all packages change
yarn tools --watch

// watch a target package
yarn tools --watch <package-name>

// watch a target package with all its monorepo dependencies
yarn tools --watch <package-name>--deps
```

## Building Local Changes

During development you may wish to build your code changes in `packages/` in a client application to test the correctness of the functionality.

If you would like to establish a dependency between packages within this monorepo and an external client application that consumes these packages,

1. Run `npm link` at the root of the specific package you are making code changes in.
2. Run `yarn build:target <package>` to build that specific package.
3. In the client application, run `npm link <package> --force` to ensure that the `package.json` of the client application is updated with a `file:` link to the dependency. This effectively creates a symlink in the `node_modules` of the client application to the local dependency in this repository.

Having done this setup, this is what the development cycle looks like moving forward:

1. Make code change
2. Rebuild specific package
3. Rebuild client application.

## Publishing

Run `yarn bump` to bump the version. You must have at least nodejs v18 to do this. Next, run `yarn buildAndPublish` to build and then publish.

### to npm

```
yarn publish:packages
```

### clone & publish to npm

```jsx
yarn tools --clone <project-name> <clone-project-name> <(?) --publish> <(?) --remove-after>

// eg
yarn tools --clone lit-node-client @litprotocol/dev --publish --remove-after
```

### HTML Test app to Vercel

```
yarn tool:buildHtml
```

## Testing

### Quick Start on E2E Testing

The following will serve the react testing app and launch the cypress e2e testing after

```
yarn test:e2e
```

### Environments

There are currently three environments can be tested on, each of which can be generated from a custom command, which would automatically import all the libraries in `./packages/*`. The UI of HTML & React are visually identical but they are using different libraries.

| Environment | Generate Command  | Test Location              |
| ----------- | ----------------- | -------------------------- |
| HTML        | `yarn gen:html`   | http://localhost:4002      |
| React       | `yarn gen:react`  | http://localhost:4003      |
| NodeJs      | `yarn gen:nodejs` | `yarn nx run nodejs:serve` |

### Unit Tests (for Node)

```jsx
yarn test:unit
```

### E2E Testing with Metamask using Cypress (for Browser)

Since both HTML & React UIs are identical, we can run the same test suite against two different environments of libraries. This is done by setting the `PORT` number before Cypress launch.

<b>HTML</b>

```jsx
// E2E HTML
yarn tools --test --e2e html
```

<b>React</b>

```jsx
// E2E React
yarn tools --test --e2e react
```

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

Make sure your node version is above v16.16.0

</details>
