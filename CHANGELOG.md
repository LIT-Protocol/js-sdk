# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [x.x.x] - 2023-x-x
- [#67](https://github.com/LIT-Protocol/js-sdk/pull/67) Introduced the `lit-auth-client` package, enabling social logins, Ethereum wallet signing, WebAuthn registration and authentication, and management of PKPs tied to auth methods

## [2.1.114] - 2023-04-08
- [#77](https://github.com/LIT-Protocol/js-sdk/pull/77) Added support for Leap Cosmos wallet

## [2.1.100] - 2023-03-29

- [#40](https://github.com/LIT-Protocol/js-sdk/pull/54) Added sessionSigs support to the remaining SDK functions. Now users have the option to use sessionSigs in place of authSigs.

## [2.1.94] - 2023-03-21

- [#40](https://github.com/LIT-Protocol/js-sdk/pull/40) Simplified the multi-step process of encrypting & decrypting static content and storing all its metadata on IPFS in a single function `encryptToIPFS` & `decryptFromIpfs`.

## [2.1.84] - 2023-03-16

- [#47](https://github.com/LIT-Protocol/js-sdk/pull/47) Upgraded `@walletconnect/ethereum-provider` to version `2.5.1` and added `@web3modal/standalone` as a depdency to the `auth-browser` repo

## [2.1.63] - 2023-03-13

- [[#44](<https://github.com/LIT-Protocol/js-sdk/pull/44>)] Separated Node Code into its own repository `@lit-protocol/lit-node-client-nodejs`, from which `@lit-protocol/lit-node-client` will extend, so there are no breaking changes for existing customers.

### Added

- `yarn v` to check the current npm version
- `yarn bump` to update `patch` version in `lerna.json` and `version.ts`
- `yarn bump:minor` to update `minor` version in `lerna.json` and `version.ts`
- `yarn bump:major` to update `major` version in `lerna.json` and `version.ts`
- Logs will now include version number eg. `[LitJsSdk v2.1.63]`
- `yarn tool:e2e` will now serve the react app and launch Cypress E2E testing automatically
