# @lit-protocol/constants

## 9.0.1

### Patch Changes

- e58998d: remove deprecated alchemy rpc url and replace with a new one
- cdc4f78: add support for naga-test
- Updated dependencies [cdc4f78]
  - @lit-protocol/contracts@0.9.1

## 9.0.0

### Major Changes

- 42e5151: Remove deprecated campNetwork config from EVM network constants, update RPC and block explorer URLs for campTestnet, and add campMainnet network config.

### Minor Changes

- 0a80342: Introduce wrapped-keys support to v8 so applications can generate, import, export, and sign with encrypted keys across EVM and Solana without exposing private key material. New `auth` package APIs include `validateDelegationAuthSig`, `generatePkpDelegationAuthSig`, `generateEoaDelegationAuthSig`, `createPkpAuthContextFromPreGenerated`, and `createPkpSessionSigs`. New `wrapped-keys` APIs include `generatePrivateKey`, `importPrivateKey`, `exportPrivateKey`, `listEncryptedKeyMetadata`, `getEncryptedKey`, `storeEncryptedKey`, `storeEncryptedKeyBatch`, `batchGeneratePrivateKeys`, `signMessageWithEncryptedKey`, and `signTransactionWithEncryptedKey`. See the updated docs (guides/server-sessions, sdk-reference/wrapped-keys, and the new auth references) for end-to-end examples. [PR](https://github.com/LIT-Protocol/js-sdk/pull/972)

### Patch Changes

- Updated dependencies [0a80342]
- Updated dependencies [edf1099]
  - @lit-protocol/contracts@0.9.0

## 8.0.8

### Patch Changes

- Updated dependencies [1dac723]
  - @lit-protocol/contracts@0.8.2

## 8.0.7

### Patch Changes

- Updated dependencies [f109877]
  - @lit-protocol/contracts@0.8.1

## 8.0.6

### Patch Changes

- Updated dependencies [761174a]
  - @lit-protocol/contracts@0.8.0

## 8.0.5

### Patch Changes

- 6bd3394: Update the naga-dev staking address. users are expected to reinstall the SDK to apply this patch to continue using the naga-dev network.
- Updated dependencies [6bd3394]
  - @lit-protocol/contracts@0.7.1

## 8.0.4

### Patch Changes

- Updated dependencies [4d339d1]
  - @lit-protocol/contracts@0.7.0

## 8.0.3

### Patch Changes

- Updated dependencies [9d60bfa]
  - @lit-protocol/contracts@0.6.0

## 8.0.2

### Patch Changes

- Updated dependencies [9ec9ea9]
  - @lit-protocol/contracts@0.5.3

## 8.0.1

### Patch Changes

- Updated dependencies [a833c7a]
- Updated dependencies [a833c7a]
- Updated dependencies [9752854]
- Updated dependencies
- Updated dependencies [4616e56]
- Updated dependencies [a833c7a]
- Updated dependencies [4d353dd]
- Updated dependencies [4616e56]
- Updated dependencies [a833c7a]
- Updated dependencies [642cd0b]
- Updated dependencies [a833c7a]
- Updated dependencies [867516f]
  - @lit-protocol/contracts@0.5.2

## 8.0.0

### Major Changes

- ceac462: first naga beta release

### Patch Changes

- 935c218: reset naga-dev contract addresses and add naga-staging network
- a48fbfb: Initial version after networks unification
- a59f48f: Initial release for networks unification

## 8.0.0

### Major Changes

- b8ae37b: fix build pipeline -> dependencies order is important
- ff75c6b: merged lit-login-server & relayer as auth-services
- cb6b698: Initial alpha publish.
- c044935: fix dependencies
- fbfa1eb: attempt to make vite polyfill minimum
- 857e330: add a pipeline to check for missing dependencies
- c044935: fix http://naga-auth-service.getlit.dev
- c664381: fix build

### Patch Changes

- 138437b: add required dependencies
