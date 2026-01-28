# @lit-protocol/wrapped-keys

## 8.2.1

### Patch Changes

- Updated dependencies [1dd24b8]
  - @lit-protocol/types@8.0.4

## 8.2.0

### Minor Changes

- 3a644ec: Wrapped-keys now supports updating ciphertext/ACCs via a new PUT endpoint, returns version history when requested.

### Patch Changes

- Updated dependencies [e58998d]
- Updated dependencies [cdc4f78]
- Updated dependencies [401e864]
  - @lit-protocol/constants@9.0.1
  - @lit-protocol/lit-client@8.3.1
  - @lit-protocol/networks@8.4.1
  - @lit-protocol/schemas@8.0.3
  - @lit-protocol/types@8.0.3
  - @lit-protocol/auth@8.2.3

## 8.1.2

### Patch Changes

- Updated dependencies [0c1fb51]
  - @lit-protocol/auth@8.2.2

## 8.1.1

### Patch Changes

- Updated dependencies [191bbee]
  - @lit-protocol/auth@8.2.1

## 8.1.0

### Minor Changes

- 0a80342: Introduce wrapped-keys support to v8 so applications can generate, import, export, and sign with encrypted keys across EVM and Solana without exposing private key material. New `auth` package APIs include `validateDelegationAuthSig`, `generatePkpDelegationAuthSig`, `generateEoaDelegationAuthSig`, `createPkpAuthContextFromPreGenerated`, and `createPkpSessionSigs`. New `wrapped-keys` APIs include `generatePrivateKey`, `importPrivateKey`, `exportPrivateKey`, `listEncryptedKeyMetadata`, `getEncryptedKey`, `storeEncryptedKey`, `storeEncryptedKeyBatch`, `batchGeneratePrivateKeys`, `signMessageWithEncryptedKey`, and `signTransactionWithEncryptedKey`. See the updated docs (guides/server-sessions, sdk-reference/wrapped-keys, and the new auth references) for end-to-end examples. [PR](https://github.com/LIT-Protocol/js-sdk/pull/972)

### Patch Changes

- Updated dependencies [42e5151]
- Updated dependencies [0a80342]
- Updated dependencies [edf1099]
- Updated dependencies [d2ff969]
- Updated dependencies [b5258b7]
- Updated dependencies [fd9544d]
  - @lit-protocol/constants@9.0.0
  - @lit-protocol/lit-client@8.3.0
  - @lit-protocol/networks@8.4.0
  - @lit-protocol/auth@8.2.0

## 8.0.1

### Patch Changes

- 867516f: fix package metadata so bundlers load the CommonJS builds again

## 8.0.0

### Patch Changes

- 935c218: reset naga-dev contract addresses and add naga-staging network

## 8.0.0

### Major Changes

- b8ae37b: fix build pipeline -> dependencies order is important
- cb6b698: Initial alpha publish.
- c044935: fix dependencies
- fbfa1eb: attempt to make vite polyfill minimum
- 857e330: add a pipeline to check for missing dependencies
- c044935: fix http://naga-auth-service.getlit.dev
- c664381: fix build
