# @lit-protocol/auth-services

## 2.1.0

### Minor Changes

- 0a80342: Introduce wrapped-keys support to v8 so applications can generate, import, export, and sign with encrypted keys across EVM and Solana without exposing private key material. New `auth` package APIs include `validateDelegationAuthSig`, `generatePkpDelegationAuthSig`, `generateEoaDelegationAuthSig`, `createPkpAuthContextFromPreGenerated`, and `createPkpSessionSigs`. New `wrapped-keys` APIs include `generatePrivateKey`, `importPrivateKey`, `exportPrivateKey`, `listEncryptedKeyMetadata`, `getEncryptedKey`, `storeEncryptedKey`, `storeEncryptedKeyBatch`, `batchGeneratePrivateKeys`, `signMessageWithEncryptedKey`, and `signTransactionWithEncryptedKey`. See the updated docs (guides/server-sessions, sdk-reference/wrapped-keys, and the new auth references) for end-to-end examples. [PR](https://github.com/LIT-Protocol/js-sdk/pull/972)

### Patch Changes

- Updated dependencies [0a80342]
- Updated dependencies [edf1099]
  - @lit-protocol/contracts@0.9.0

## 2.0.8

### Patch Changes

- Updated dependencies [1dac723]
  - @lit-protocol/contracts@0.8.2

## 2.0.7

### Patch Changes

- f109877: update naga-test contract addresses. Users are expected to update and reinstall the SDK to continue using naga-test.
- Updated dependencies [f109877]
  - @lit-protocol/contracts@0.8.1

## 2.0.6

### Patch Changes

- Updated dependencies [761174a]
  - @lit-protocol/contracts@0.8.0

## 2.0.5

### Patch Changes

- 6bd3394: Update the naga-dev staking address. users are expected to reinstall the SDK to apply this patch to continue using the naga-dev network.
- Updated dependencies [6bd3394]
  - @lit-protocol/contracts@0.7.1

## 2.0.4

### Patch Changes

- Updated dependencies [4d339d1]
  - @lit-protocol/contracts@0.7.0

## 2.0.3

### Patch Changes

- Updated dependencies [9d60bfa]
  - @lit-protocol/contracts@0.6.0
