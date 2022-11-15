<div align="center">
<h1> Lit Protocol Javascript/Typescript SDK</h1>
<img src="https://i.ibb.co/p2xfzK1/Screenshot-2022-11-15-at-09-56-57.png">
<br/>
<a href="https://twitter.com/LitProtocol"><img src="https://img.shields.io/twitter/follow/litprotocol?label=Follow&style=social"/></a>
<br/>
<br/>
The Lit JavaScript SDK provides developers with a framework for implementing Lit functionality into their own applications. Get started with the Lit SDK based on your use case.
<br /><br />


# Packages
<!-- autogen:package:start -->

Package | Category | Version | Download
--- | --- | --- | ---
| [@lit-protocol/lit-node-client](packages/lit-node-client) | ![lit-node-client](https://img.shields.io/badge/-bundled-17224B "lit-node-client") | 0.1.73 | <a target="_blank" href="https://www.npmjs.com/package/@lit-protocol/lit-node-client">npm</a><br/><a href="https://cdn.jsdelivr.net/npm/@lit-protocol/lit-node-client-vanilla/lit-node-client.js">Vanilla JS</a>
| [@lit-protocol/access-control-conditions](packages/access-control-conditions) | ![access-control-conditions](https://img.shields.io/badge/-universal-8A6496 "access-control-conditions") | 0.1.73 | <a target="_blank" href="https://www.npmjs.com/package/@lit-protocol/access-control-conditions">npm</a><br/><a href="https://cdn.jsdelivr.net/npm/@lit-protocol/access-control-conditions-vanilla/access-control-conditions.js">Vanilla JS</a>
| [@lit-protocol/bls-sdk](packages/bls-sdk) | ![bls-sdk](https://img.shields.io/badge/-universal-8A6496 "bls-sdk") | 0.1.73 | <a target="_blank" href="https://www.npmjs.com/package/@lit-protocol/bls-sdk">npm</a><br/><a href="https://cdn.jsdelivr.net/npm/@lit-protocol/bls-sdk-vanilla/bls-sdk.js">Vanilla JS</a>
| [@lit-protocol/constants](packages/constants) | ![constants](https://img.shields.io/badge/-universal-8A6496 "constants") | 0.1.73 | <a target="_blank" href="https://www.npmjs.com/package/@lit-protocol/constants">npm</a><br/><a href="https://cdn.jsdelivr.net/npm/@lit-protocol/constants-vanilla/constants.js">Vanilla JS</a>
| [@lit-protocol/crypto](packages/crypto) | ![crypto](https://img.shields.io/badge/-universal-8A6496 "crypto") | 0.1.73 | <a target="_blank" href="https://www.npmjs.com/package/@lit-protocol/crypto">npm</a><br/><a href="https://cdn.jsdelivr.net/npm/@lit-protocol/crypto-vanilla/crypto.js">Vanilla JS</a>
| [@lit-protocol/ecdsa-sdk](packages/ecdsa-sdk) | ![ecdsa-sdk](https://img.shields.io/badge/-universal-8A6496 "ecdsa-sdk") | 0.1.73 | <a target="_blank" href="https://www.npmjs.com/package/@lit-protocol/ecdsa-sdk">npm</a><br/><a href="https://cdn.jsdelivr.net/npm/@lit-protocol/ecdsa-sdk-vanilla/ecdsa-sdk.js">Vanilla JS</a>
| [@lit-protocol/encryption](packages/encryption) | ![encryption](https://img.shields.io/badge/-universal-8A6496 "encryption") | 0.1.73 | <a target="_blank" href="https://www.npmjs.com/package/@lit-protocol/encryption">npm</a><br/><a href="https://cdn.jsdelivr.net/npm/@lit-protocol/encryption-vanilla/encryption.js">Vanilla JS</a>
| [@lit-protocol/misc](packages/misc) | ![misc](https://img.shields.io/badge/-universal-8A6496 "misc") | 0.1.73 | <a target="_blank" href="https://www.npmjs.com/package/@lit-protocol/misc">npm</a><br/><a href="https://cdn.jsdelivr.net/npm/@lit-protocol/misc-vanilla/misc.js">Vanilla JS</a>
| [@lit-protocol/uint8arrays](packages/uint8arrays) | ![uint8arrays](https://img.shields.io/badge/-universal-8A6496 "uint8arrays") | 0.1.73 | <a target="_blank" href="https://www.npmjs.com/package/@lit-protocol/uint8arrays">npm</a><br/><a href="https://cdn.jsdelivr.net/npm/@lit-protocol/uint8arrays-vanilla/uint8arrays.js">Vanilla JS</a>
| [@lit-protocol/auth-browser](packages/auth-browser) | ![auth-browser](https://img.shields.io/badge/-browser-E98869 "auth-browser") | 0.1.73 | <a target="_blank" href="https://www.npmjs.com/package/@lit-protocol/auth-browser">npm</a><br/><a href="https://cdn.jsdelivr.net/npm/@lit-protocol/auth-browser-vanilla/auth-browser.js">Vanilla JS</a>
| [@lit-protocol/misc-browser](packages/misc-browser) | ![misc-browser](https://img.shields.io/badge/-browser-E98869 "misc-browser") | 0.1.73 | <a target="_blank" href="https://www.npmjs.com/package/@lit-protocol/misc-browser">npm</a><br/><a href="https://cdn.jsdelivr.net/npm/@lit-protocol/misc-browser-vanilla/misc-browser.js">Vanilla JS</a>

<!-- autogen:package:end -->
</div>

# Recommended VSCode Extensions
<details>
<summary>Nx Console</summary>
Download: <a href="https://nx.dev/core-features/integrate-with-editors">https://nx.dev/core-features/integrate-with-editors</a>
</details>
<details>
<summary>Restore Terminal</summary>

Download: <a href="https://marketplace.visualstudio.com/items?itemName=EthanSK.restore-terminals">https://marketplace.visualstudio.com/items?itemName=EthanSK.restore-terminals</a>

```js
  "restoreTerminals.terminals": [
    {
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

## Building

### Building all packages

```jsx
// 1. run the 'build' command in all projects specified in `project.json`
// 2. map the 'peerDependencies' to 'dependencies' in the dist folders, so that dependencies will be installed when a user 'yarn add'
// 3. generate a package summary inside README.md between the <!-- autogen:package --> tags
// src: tools/scripts/build.mjs
yarn build:packages
```

### Building a specific package

```jsx
// OPTION 1: (MAIN)
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

### Publishing everything

```jsx
// This will publish everything inside the `dist` folder
yarn publish:packages
```

### Publishing vanilla packages only

```jsx
// It will scans through the dist folder and filter out the folders that contains the word `vanilla` 
// cd in there && npm publish --acces public
// src: tools/scripts/pub.mjs
yarn publish:vanilla
```

# Testing

There are currently three environments can be tested on, each of which can be generated from a custom command, which would automatically import all the libraries in `./packages/*`. The UI of HTML & React are visually identical but they are using different libraries.

| Environment | Generate Command | Test Location |
--- | --- | --- |
| HTML | `yarn tool:genHtml` | http://localhost:4002
| React | `yarn tool:genReact` | http://localhost:4003
| NodeJs | `yarn tool:genNodejs` | `yarn nx run nodejs:serve`

> Note: Personally I like to use the "Restore Terminal" VSCode plugin to automatically open all these environments.
<div style="width:100%;height:0px;position:relative;padding-bottom:58.158%;"><iframe src="https://streamable.com/e/5g52m4" frameborder="0" width="100%" height="100%" allowfullscreen style="width:100%;height:100%;position:absolute;left:0px;top:0px;overflow:hidden;"></iframe></div>
## Opening test apps


## E2E with Metamask