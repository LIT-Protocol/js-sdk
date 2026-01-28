# @lit-protocol/artillery

## 0.1.5

### Patch Changes

- @lit-protocol/e2e@5.1.2

## 0.1.4

### Patch Changes

- Updated dependencies [1dd24b8]
  - @lit-protocol/e2e@5.1.1

## 0.1.3

### Patch Changes

- cdc4f78: add support for naga-test
- 401e864: Renames the amountInEth parameter to amountInLitkey to prevent future confusion on deposits. Deprecates the amountInEth parameter.
- Updated dependencies [cdc4f78]
- Updated dependencies [401e864]
- Updated dependencies [3a644ec]
  - @lit-protocol/e2e@5.1.0

## 0.1.2

### Patch Changes

- @lit-protocol/e2e@5.0.2

## 0.1.1

### Patch Changes

- @lit-protocol/e2e@5.0.1

## 0.1.0

### Minor Changes

- 0a80342: Introduce wrapped-keys support to v8 so applications can generate, import, export, and sign with encrypted keys across EVM and Solana without exposing private key material. New `auth` package APIs include `validateDelegationAuthSig`, `generatePkpDelegationAuthSig`, `generateEoaDelegationAuthSig`, `createPkpAuthContextFromPreGenerated`, and `createPkpSessionSigs`. New `wrapped-keys` APIs include `generatePrivateKey`, `importPrivateKey`, `exportPrivateKey`, `listEncryptedKeyMetadata`, `getEncryptedKey`, `storeEncryptedKey`, `storeEncryptedKeyBatch`, `batchGeneratePrivateKeys`, `signMessageWithEncryptedKey`, and `signTransactionWithEncryptedKey`. See the updated docs (guides/server-sessions, sdk-reference/wrapped-keys, and the new auth references) for end-to-end examples. [PR](https://github.com/LIT-Protocol/js-sdk/pull/972)

### Patch Changes

- Updated dependencies [0a80342]
- Updated dependencies [d2ff969]
- Updated dependencies [fd9544d]
  - @lit-protocol/e2e@5.0.0

## 0.0.10

### Patch Changes

- @lit-protocol/e2e@4.0.2

## 0.0.9

### Patch Changes

- Updated dependencies [f109877]
  - @lit-protocol/e2e@4.0.1

## 0.0.8

### Patch Changes

- Updated dependencies [761174a]
  - @lit-protocol/e2e@4.0.0

## 0.0.7

### Patch Changes

- @lit-protocol/e2e@3.0.2

## 0.0.6

### Patch Changes

- Updated dependencies [6bd3394]
  - @lit-protocol/e2e@3.0.1

## 0.0.5

### Patch Changes

- Updated dependencies [4d339d1]
  - @lit-protocol/e2e@3.0.0

## 0.0.4

### Patch Changes

- @lit-protocol/e2e@2.0.0
