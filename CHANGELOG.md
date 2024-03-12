# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

# [3.2.2] - 2024-02-27

- [staging/3.2.2](https://github.com/LIT-Protocol/js-sdk/pull/382)

# [3.2.0] - 2024-02-20

- [staging/3.2.0](https://github.com/LIT-Protocol/js-sdk/pull/370)

# [3.1.3] - 2024-02-13

- [staging/2024-02-13](https://github.com/LIT-Protocol/js-sdk/pull/344)

# [3.1.2] - 2024-02-06

- [staging/2024-02-06](https://github.com/LIT-Protocol/js-sdk/pull/340)

# [3.0.18] - 2023-11-10

- [feature/lit-1859-example-of-setting-permission-scopes](https://github.com/LIT-Protocol/js-sdk/pull/253)

# [3.0.0] - 2023-09-25

- [https://github.com/LIT-Protocol/js-sdk/pull/199](https://github.com/LIT-Protocol/js-sdk/pull/199)

# [2.2.39] - 2023-07-06

- [a0d88bc](https://github.com/LIT-Protocol/js-sdk/pull/167) Add [Backpack wallet 🎒](https://www.backpack.app/) support

# [2.2.33] - 2023-06-27

- [95c7258](https://github.com/LIT-Protocol/js-sdk/commit/95c725850de44e17f70a9365dc13e46f6bd841de) Removed wallet connect from lit-connect-modal temporarily

# [2.2.20] - 2023-05-31

- [#106](https://github.com/LIT-Protocol/js-sdk/pull/106) New `pkp-walletconnect` package to connect PKPs and dApps using WalletConnect V2

# [2.2.15] - 2023-05-30

- [#122](https://github.com/LIT-Protocol/js-sdk/pull/122) Added demo for email/sms
- [#123](https://github.com/LIT-Protocol/js-sdk/pull/123) Added Apple JWT Auth Provider

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

## [3.0.0] - 2023-09-26

- [[#199](https://github.com/LIT-Protocol/js-sdk/pull/199)] `Cayenne` network upgrade bumps `packages` to `3.0.0`

### Added

- [#145](https://github.com/LIT-Protocol/js-sdk/pull/145) ACC-based JWT Signing (V2)
- `computePubKey` to `lit-core` which wraps an implementation in `crypto` for interfacing with a new wasm module for deriving HD public keys
- Addition of `claimKeyId` method on `lit-node-client-nodejs` for deriving a key from an `authMethod`
  - Supports a new `MintCallBack` which is defined as `async (params: ClaimKeyResponse): Promise<ClaimKeyResponse>` which is called to route derived keys from a claim operation on chain.

### Updates

- Update `SIGTYPE` to include new ecdsa types
- [#107](https://github.com/LIT-Protocol/js-sdk/pull/107) Adds support for new ECDSA implementations for signature recombine
