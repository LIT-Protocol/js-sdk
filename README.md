<div align="center">
<h1> Lit Protocol Javascript/Typescript SDK</h1>
<img src="https://i.ibb.co/p2xfzK1/Screenshot-2022-11-15-at-09-56-57.png">
<br /><br />
<!-- package:start -->

Package | Vanilla JS | Category | Version
--- | --- | --- | ---
| [@litprotocol-dev/lit-node-client](packages/lit-node-client) | [![](https://data.jsdelivr.com/v1/package/npm/@litprotocol-dev/lit-node-client-vanilla/badge)](https://www.jsdelivr.com/package/npm/@litprotocol-dev/lit-node-client-vanilla)| ![lit-node-client](https://img.shields.io/badge/-bundled-17224B "lit-node-client") | 0.1.61 |
| [@litprotocol-dev/access-control-conditions](packages/access-control-conditions) | [![](https://data.jsdelivr.com/v1/package/npm/@litprotocol-dev/access-control-conditions-vanilla/badge)](https://www.jsdelivr.com/package/npm/@litprotocol-dev/access-control-conditions-vanilla)| ![access-control-conditions](https://img.shields.io/badge/-universal-8A6496 "access-control-conditions") | 0.1.61 |
| [@litprotocol-dev/bls-sdk](packages/bls-sdk) | [![](https://data.jsdelivr.com/v1/package/npm/@litprotocol-dev/bls-sdk-vanilla/badge)](https://www.jsdelivr.com/package/npm/@litprotocol-dev/bls-sdk-vanilla)| ![bls-sdk](https://img.shields.io/badge/-universal-8A6496 "bls-sdk") | 0.1.61 |
| [@litprotocol-dev/constants](packages/constants) | [![](https://data.jsdelivr.com/v1/package/npm/@litprotocol-dev/constants-vanilla/badge)](https://www.jsdelivr.com/package/npm/@litprotocol-dev/constants-vanilla)| ![constants](https://img.shields.io/badge/-universal-8A6496 "constants") | 0.1.61 |
| [@litprotocol-dev/crypto](packages/crypto) | [![](https://data.jsdelivr.com/v1/package/npm/@litprotocol-dev/crypto-vanilla/badge)](https://www.jsdelivr.com/package/npm/@litprotocol-dev/crypto-vanilla)| ![crypto](https://img.shields.io/badge/-universal-8A6496 "crypto") | 0.1.61 |
| [@litprotocol-dev/ecdsa-sdk](packages/ecdsa-sdk) | [![](https://data.jsdelivr.com/v1/package/npm/@litprotocol-dev/ecdsa-sdk-vanilla/badge)](https://www.jsdelivr.com/package/npm/@litprotocol-dev/ecdsa-sdk-vanilla)| ![ecdsa-sdk](https://img.shields.io/badge/-universal-8A6496 "ecdsa-sdk") | 0.1.61 |
| [@litprotocol-dev/encryption](packages/encryption) | [![](https://data.jsdelivr.com/v1/package/npm/@litprotocol-dev/encryption-vanilla/badge)](https://www.jsdelivr.com/package/npm/@litprotocol-dev/encryption-vanilla)| ![encryption](https://img.shields.io/badge/-universal-8A6496 "encryption") | 0.1.61 |
| [@litprotocol-dev/misc](packages/misc) | [![](https://data.jsdelivr.com/v1/package/npm/@litprotocol-dev/misc-vanilla/badge)](https://www.jsdelivr.com/package/npm/@litprotocol-dev/misc-vanilla)| ![misc](https://img.shields.io/badge/-universal-8A6496 "misc") | 0.1.61 |
| [@litprotocol-dev/uint8arrays](packages/uint8arrays) | [![](https://data.jsdelivr.com/v1/package/npm/@litprotocol-dev/uint8arrays-vanilla/badge)](https://www.jsdelivr.com/package/npm/@litprotocol-dev/uint8arrays-vanilla)| ![uint8arrays](https://img.shields.io/badge/-universal-8A6496 "uint8arrays") | 0.1.61 |
| [@litprotocol-dev/auth-browser](packages/auth-browser) | [![](https://data.jsdelivr.com/v1/package/npm/@litprotocol-dev/auth-browser-vanilla/badge)](https://www.jsdelivr.com/package/npm/@litprotocol-dev/auth-browser-vanilla)| ![auth-browser](https://img.shields.io/badge/-browser-E98869 "auth-browser") | 0.1.61 |
| [@litprotocol-dev/misc-browser](packages/misc-browser) | [![](https://data.jsdelivr.com/v1/package/npm/@litprotocol-dev/misc-browser-vanilla/badge)](https://www.jsdelivr.com/package/npm/@litprotocol-dev/misc-browser-vanilla)| ![misc-browser](https://img.shields.io/badge/-browser-E98869 "misc-browser") | 0.1.61 |

<!-- package:end -->
</div>

# Idea

## Notes

### Testing on node apps

- The `node` app loads the packages from `./dist`, so make sure you build the dependencies first

## Recommended

- Install [NX Console](https://marketplace.visualstudio.com/items?itemName=nrwl.angular-console) for Visual Studio Code
- Setting up workflow
  - Open the VS Command Palette (Ctrl+Shift+P), type and open `Nx Console: Focus on Common NX Commands View`
  <summary><h3>You should have a view like this</h3></summary>
  <details>
  ![](https://i.ibb.co/HtpRN6b/image.png)
  </details>

## Adding Test Cases

- Run `example-nextjs-js` app in the `apps/example-nextjs-js` folder

  - Option 1: Use the NX Console and click `serve` under `example-nextjs-js`
  - Option 2: Run `yarn nx run example-nextjs-js:serve`

- In the `./pages/cases/` folder is where you add new the test cases
- Then you import and export it in `./pages/test-cases.ts`
- Then you should see the new cases on the page

## Publising

```js

// 1. Force dependencies on each package.json to "*" instead of a specific version, then build the packages
yarn build:packages

// 2. Git add, commit, and push
- yarn gitAdd OR git add *
- yarn gitCommit OR git commit -m "message"
- yarn gitPush OR git push

// 3. Publish using lerna and a custom script that creates a separated vanilla version of the SDK (Make sure you run `yarn npm login`)
yarn publish:packages

```

<details>
  <summary>More</summary>
  
  Packages inside the `packages` folder will be published automatically providing each `package.json` in each package has provide a `publichConfig` path, eg:

```json
{
  "name": "...",
  ...
  "publishConfig": {
    "access": "public",
    "directory": "../../dist/packages/core-browser"
  },
  ...
}
```

</details>

# Default NX README.md

<details>
<summary>Default NX README.md</summary>

Download [Nx](https://nx.dev) and open this project

This project was generated using [Nx](https://nx.dev).

<p style="text-align: center;"><img src="https://raw.githubusercontent.com/nrwl/nx/master/images/nx-logo.png" width="450"></p>

🔎 **Smart, Fast and Extensible Build System**

## Adding capabilities to your workspace

Nx supports many plugins which add capabilities for developing different types of applications and different tools.

These capabilities include generating applications, libraries, etc as well as the devtools to test, and build projects as well.

Below are our core plugins:

- [React](https://reactjs.org)
  - `npm install --save-dev @nrwl/react`
- Web (no framework frontends)
  - `npm install --save-dev @nrwl/web`
- [Angular](https://angular.io)
  - `npm install --save-dev @nrwl/angular`
- [Nest](https://nestjs.com)
  - `npm install --save-dev @nrwl/nest`
- [Express](https://expressjs.com)
  - `npm install --save-dev @nrwl/express`
- [Node](https://nodejs.org)
  - `npm install --save-dev @nrwl/node`

There are also many [community plugins](https://nx.dev/community) you could add.

## Generate an application

Run `nx g @nrwl/react:app my-app` to generate an application.

> You can use any of the plugins above to generate applications as well.

When using Nx, you can create multiple applications and libraries in the same workspace.

## Generate a library

Run `nx g @nrwl/react:lib my-lib` to generate a library.

> You can also use any of the plugins above to generate libraries as well.

Libraries are shareable across libraries and applications. They can be imported from `@litprotocol-dev/mylib`.

## Development server

Run `nx serve my-app` for a dev server. Navigate to http://localhost:4200/. The app will automatically reload if you change any of the source files.

## Code scaffolding

Run `nx g @nrwl/react:component my-component --project=my-app` to generate a new component.

## Build

Run `nx build my-app` to build the project. The build artifacts will be stored in the `dist/` directory. Use the `--prod` flag for a production build.

## Running unit tests

Run `nx test my-app` to execute the unit tests via [Jest](https://jestjs.io).

Run `nx affected:test` to execute the unit tests affected by a change.

## Running end-to-end tests

Run `nx e2e my-app` to execute the end-to-end tests via [Cypress](https://www.cypress.io).

Run `nx affected:e2e` to execute the end-to-end tests affected by a change.

## Understand your workspace

Run `nx graph` to see a diagram of the dependencies of your projects.

## Further help

Visit the [Nx Documentation](https://nx.dev) to learn more.

## ☁ Nx Cloud

### Distributed Computation Caching & Distributed Task Execution

<p style="text-align: center;"><img src="https://raw.githubusercontent.com/nrwl/nx/master/images/nx-cloud-card.png"></p>

Nx Cloud pairs with Nx in order to enable you to build and test code more rapidly, by up to 10 times. Even teams that are new to Nx can connect to Nx Cloud and start saving time instantly.

Teams using Nx gain the advantage of building full-stack applications with their preferred framework alongside Nx’s advanced code generation and project dependency graph, plus a unified experience for both frontend and backend developers.

Visit [Nx Cloud](https://nx.app/) to learn more.

</details>
