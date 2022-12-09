<div align="center">
<h1>Lit Protocol Javascript/Typescript SDK</h1>
<img src="https://i.ibb.co/p2xfzK1/Screenshot-2022-11-15-at-09-56-57.png">
<br/>
<a href="https://twitter.com/LitProtocol"><img src="https://img.shields.io/twitter/follow/litprotocol?label=Follow&style=social"/></a>
<br/>
<br/>
The Lit JavaScript SDK provides developers with a framework for implementing Lit functionality into their own applications. Find installation instructions in the docs to get started with the Lit SDK based on your use case: <a href="https://developer.litprotocol.com/SDK/Explanation/installation">https://developer.litprotocol.com/SDK/Explanation/installation</a>

<br /><br />
This new SDK is written in Typescript and is a complete rewrite of the old SDK. It is much more modular and easier to use, and has a much smaller bundle size.
</div>

<div align="left">

# Quick Start

### node.js / browser

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

Individual packages are below so that you can import the minimum required packages for your use case.

<!-- autogen:package:start -->

Package | Category | Version | Download
--- | --- | --- | ---
| [@lit-protocol/lit-node-client](https://github.com/LIT-Protocol/js-sdk/tree/master/packages/lit-node-client) | ![lit-node-client](https://img.shields.io/badge/-bundled-17224B "lit-node-client") | 2.0.13 | <a target="_blank" href="https://www.npmjs.com/package/@lit-protocol/lit-node-client">npm</a><br/><a href="https://cdn.jsdelivr.net/npm/@lit-protocol/lit-node-client-vanilla/lit-node-client.min.js">Vanilla JS (UMD)</a>
| [@lit-protocol/access-control-conditions](https://github.com/LIT-Protocol/js-sdk/tree/master/packages/access-control-conditions) | ![access-control-conditions](https://img.shields.io/badge/-universal-8A6496 "access-control-conditions") | 2.0.13 | <a target="_blank" href="https://www.npmjs.com/package/@lit-protocol/access-control-conditions">npm</a><br/><a href="https://cdn.jsdelivr.net/npm/@lit-protocol/access-control-conditions-vanilla/access-control-conditions.min.js">Vanilla JS (UMD)</a>
| [@lit-protocol/bls-sdk](https://github.com/LIT-Protocol/js-sdk/tree/master/packages/bls-sdk) | ![bls-sdk](https://img.shields.io/badge/-universal-8A6496 "bls-sdk") | 2.0.13 | <a target="_blank" href="https://www.npmjs.com/package/@lit-protocol/bls-sdk">npm</a><br/><a href="https://cdn.jsdelivr.net/npm/@lit-protocol/bls-sdk-vanilla/bls-sdk.min.js">Vanilla JS (UMD)</a>
| [@lit-protocol/constants](https://github.com/LIT-Protocol/js-sdk/tree/master/packages/constants) | ![constants](https://img.shields.io/badge/-universal-8A6496 "constants") | 2.0.13 | <a target="_blank" href="https://www.npmjs.com/package/@lit-protocol/constants">npm</a><br/><a href="https://cdn.jsdelivr.net/npm/@lit-protocol/constants-vanilla/constants.min.js">Vanilla JS (UMD)</a>
| [@lit-protocol/contracts-sdk](https://github.com/LIT-Protocol/js-sdk/tree/master/packages/contracts-sdk) | ![contracts-sdk](https://img.shields.io/badge/-universal-8A6496 "contracts-sdk") | 2.0.13 | <a target="_blank" href="https://www.npmjs.com/package/@lit-protocol/contracts-sdk">npm</a><br/><a href="https://cdn.jsdelivr.net/npm/@lit-protocol/contracts-sdk-vanilla/contracts-sdk.min.js">Vanilla JS (UMD)</a>
| [@lit-protocol/crypto](https://github.com/LIT-Protocol/js-sdk/tree/master/packages/crypto) | ![crypto](https://img.shields.io/badge/-universal-8A6496 "crypto") | 2.0.13 | <a target="_blank" href="https://www.npmjs.com/package/@lit-protocol/crypto">npm</a><br/><a href="https://cdn.jsdelivr.net/npm/@lit-protocol/crypto-vanilla/crypto.min.js">Vanilla JS (UMD)</a>
| [@lit-protocol/ecdsa-sdk](https://github.com/LIT-Protocol/js-sdk/tree/master/packages/ecdsa-sdk) | ![ecdsa-sdk](https://img.shields.io/badge/-universal-8A6496 "ecdsa-sdk") | 2.0.13 | <a target="_blank" href="https://www.npmjs.com/package/@lit-protocol/ecdsa-sdk">npm</a><br/><a href="https://cdn.jsdelivr.net/npm/@lit-protocol/ecdsa-sdk-vanilla/ecdsa-sdk.min.js">Vanilla JS (UMD)</a>
| [@lit-protocol/encryption](https://github.com/LIT-Protocol/js-sdk/tree/master/packages/encryption) | ![encryption](https://img.shields.io/badge/-universal-8A6496 "encryption") | 2.0.13 | <a target="_blank" href="https://www.npmjs.com/package/@lit-protocol/encryption">npm</a><br/><a href="https://cdn.jsdelivr.net/npm/@lit-protocol/encryption-vanilla/encryption.min.js">Vanilla JS (UMD)</a>
| [@lit-protocol/misc](https://github.com/LIT-Protocol/js-sdk/tree/master/packages/misc) | ![misc](https://img.shields.io/badge/-universal-8A6496 "misc") | 2.0.13 | <a target="_blank" href="https://www.npmjs.com/package/@lit-protocol/misc">npm</a><br/><a href="https://cdn.jsdelivr.net/npm/@lit-protocol/misc-vanilla/misc.min.js">Vanilla JS (UMD)</a>
| [@lit-protocol/nacl](https://github.com/LIT-Protocol/js-sdk/tree/master/packages/nacl) | ![nacl](https://img.shields.io/badge/-universal-8A6496 "nacl") | 2.0.13 | <a target="_blank" href="https://www.npmjs.com/package/@lit-protocol/nacl">npm</a><br/><a href="https://cdn.jsdelivr.net/npm/@lit-protocol/nacl-vanilla/nacl.min.js">Vanilla JS (UMD)</a>
| [@lit-protocol/uint8arrays](https://github.com/LIT-Protocol/js-sdk/tree/master/packages/uint8arrays) | ![uint8arrays](https://img.shields.io/badge/-universal-8A6496 "uint8arrays") | 2.0.13 | <a target="_blank" href="https://www.npmjs.com/package/@lit-protocol/uint8arrays">npm</a><br/><a href="https://cdn.jsdelivr.net/npm/@lit-protocol/uint8arrays-vanilla/uint8arrays.min.js">Vanilla JS (UMD)</a>
| [@lit-protocol/auth-browser](https://github.com/LIT-Protocol/js-sdk/tree/master/packages/auth-browser) | ![auth-browser](https://img.shields.io/badge/-browser-E98869 "auth-browser") | 2.0.13 | <a target="_blank" href="https://www.npmjs.com/package/@lit-protocol/auth-browser">npm</a><br/><a href="https://cdn.jsdelivr.net/npm/@lit-protocol/auth-browser-vanilla/auth-browser.min.js">Vanilla JS (UMD)</a>
| [@lit-protocol/misc-browser](https://github.com/LIT-Protocol/js-sdk/tree/master/packages/misc-browser) | ![misc-browser](https://img.shields.io/badge/-browser-E98869 "misc-browser") | 2.0.13 | <a target="_blank" href="https://www.npmjs.com/package/@lit-protocol/misc-browser">npm</a><br/><a href="https://cdn.jsdelivr.net/npm/@lit-protocol/misc-browser-vanilla/misc-browser.min.js">Vanilla JS (UMD)</a>

<!-- autogen:package:end -->

API Docs: http://docs.lit-js-sdk-v2.litprotocol.com/ <br/>
Test App(HTML): http://test.lit-js-sdk-v2.html.litprotocol.com/
Test App(REACT): http://test.lit-js-sdk-v2.react.litprotocol.com/

</div>

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

## Creating a new library

By default, NX provides a command to generate a library
`nx generate @nrwl/js:library`. However, it doesn't have an esbuild built-in so that we've created a custom tool that modify the build commands.

```js
yarn tool:genLib <package-name>
```

## Create a new react demo app using the Lit JS SDK

```js
yarn tools --create-react-app contracts-sdk --demo
```

## Deleting a library

```
yarn tool:delete (--package OR --app) <project-name>
```

## Building

```jsx
yarn tools --build
```

### Building target package

```jsx
// OPTION 1: (Build both ESM & UMD)
// 1. build tsc & web bundle
// 2. map each dist folder name to package.json name (for publishing)
// 3. generate html, react, and nodejs test apps
yarn nx run <project-name>:build

// OPTION 2: (Building tsc)
// output: dist/packages/<project-name>
yarn nx run <project-name>:_buildTsc

// OPTION 3: (esBuilding vanilla web bundle)
// output: dist/package/<project-name>-vanilla
yarn nx run <project-name>:_buildWeb
```

## Publishing

### to npm

```
yarn tools --publish
```

### to yalc

```
yalc tools --yalc
```

### HTML Test app to Vercel

```
yarn tool:buildHtml
```

## Testing

### Environments

There are currently three environments can be tested on, each of which can be generated from a custom command, which would automatically import all the libraries in `./packages/*`. The UI of HTML & React are visually identical but they are using different libraries.

| Environment | Generate Command      | Test Location              |
| ----------- | --------------------- | -------------------------- |
| HTML        | `yarn tool:genHtml`   | http://localhost:4002      |
| React       | `yarn tool:genReact`  | http://localhost:4003      |
| NodeJs      | `yarn tool:genNodejs` | `yarn nx run nodejs:serve` |

> Note: Personally I like to use the "Restore Terminal" VSCode plugin to automatically open all these environments. See [Video](https://streamable.com/e/5g52m4)

### Unit Tests (for Node)

```jsx
yarn test:packages

// watch mode
yarn test:watch
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
