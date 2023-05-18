# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.2.0] - 2023-05-12

- [#88](https://github.com/LIT-Protocol/js-sdk/pull/88) Breaking change introduced to `lit-node-client-nodejs` regarding session signature generation and usage. Introduced `auth-helpers` package, which contains objects for working with session capability objects for session signatures.

## [2.1.160] - 2023-05-05

- [#90](https://github.com/LIT-Protocol/js-sdk/issues/90) Fixed the issue where it was unable to regenerate the authSig when it had expired.

## [2.1.156] - 2023-05-04

- [#67](https://github.com/LIT-Protocol/js-sdk/pull/67) Introduced the `lit-auth-client` package, enabling social logins, Ethereum wallet signing, WebAuthn registration and authentication, and management of PKPs tied to auth methods

- [#57](https://github.com/LIT-Protocol/js-sdk/pull/57) Introducing the pkp-client package, which serves as an abstraction of the pkp-ether, pkp-cosmos, and pkp-base packages. This enables the creation of Ether and Cosmos signers through PKPClient.

- [#97](https://github.com/LIT-Protocol/js-sdk/pull/97) Fixed `warn  - ./node_modules/@lit-protocol/ecdsa-sdk/src/lib/ecdsa-sdk.js Critical dependency: the request of a dependency is an expression`

## [2.1.114] - 2023-04-08

- [#77](https://github.com/LIT-Protocol/js-sdk/pull/77) Added support for Leap Cosmos wallet

## [2.1.100] - 2023-03-29

- [#40](https://github.com/LIT-Protocol/js-sdk/pull/54) Added sessionSigs support to the remaining SDK functions. Now users have the option to use sessionSigs in place of authSigs.

## [2.1.94] - 2023-03-21

- [#40](https://github.com/LIT-Protocol/js-sdk/pull/40) Simplified the multi-step process of encrypting & decrypting static content and storing all its metadata on IPFS in a single function `encryptToIPFS` & `decryptFromIpfs`.

## [2.1.84] - 2023-03-16

- [#47](https://github.com/LIT-Protocol/js-sdk/pull/47) Upgraded `@walletconnect/ethereum-provider` to version `2.5.1` and added `@web3modal/standalone` as a depdency to the `auth-browser` repo

## [2.1.63] - 2023-03-13

- [[#44](https://github.com/LIT-Protocol/js-sdk/pull/44)] Separated Node Code into its own repository `@lit-protocol/lit-node-client-nodejs`, from which `@lit-protocol/lit-node-client` will extend, so there are no breaking changes for existing customers.

### Added

- `yarn v` to check the current npm version
- `yarn bump` to update `patch` version in `lerna.json` and `version.ts`
- `yarn bump:minor` to update `minor` version in `lerna.json` and `version.ts`
- `yarn bump:major` to update `major` version in `lerna.json` and `version.ts`
- Logs will now include version number eg. `[LitJsSdk v2.1.63]`
- `yarn tool:e2e` will now serve the react app and launch Cypress E2E testing automatically
