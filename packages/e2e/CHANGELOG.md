# @lit-protocol/e2e

## 5.1.2

### Patch Changes

- Updated dependencies [467c4d4]
  - @lit-protocol/wasm@8.1.1

## 5.1.1

### Patch Changes

- 1dd24b8: add payment delegation auth sig
- Updated dependencies [1dd24b8]
  - @lit-protocol/auth-helpers@8.2.1
  - @lit-protocol/types@8.0.4

## 5.1.0

### Minor Changes

- 3a644ec: Wrapped-keys now supports updating ciphertext/ACCs via a new PUT endpoint, returns version history when requested.

### Patch Changes

- cdc4f78: add support for naga-test
- 401e864: Renames the amountInEth parameter to amountInLitkey to prevent future confusion on deposits. Deprecates the amountInEth parameter.
- Updated dependencies [e58998d]
- Updated dependencies [cdc4f78]
- Updated dependencies [401e864]
  - @lit-protocol/constants@9.0.1
  - @lit-protocol/lit-client@8.3.1
  - @lit-protocol/contracts@0.9.1
  - @lit-protocol/networks@8.4.1
  - @lit-protocol/schemas@8.0.3
  - @lit-protocol/types@8.0.3
  - @lit-protocol/auth@8.2.3

## 5.0.2

### Patch Changes

- Updated dependencies [0c1fb51]
  - @lit-protocol/auth@8.2.2

## 5.0.1

### Patch Changes

- Updated dependencies [191bbee]
  - @lit-protocol/auth@8.2.1

## 5.0.0

### Minor Changes

- 0a80342: Introduce wrapped-keys support to v8 so applications can generate, import, export, and sign with encrypted keys across EVM and Solana without exposing private key material. New `auth` package APIs include `validateDelegationAuthSig`, `generatePkpDelegationAuthSig`, `generateEoaDelegationAuthSig`, `createPkpAuthContextFromPreGenerated`, and `createPkpSessionSigs`. New `wrapped-keys` APIs include `generatePrivateKey`, `importPrivateKey`, `exportPrivateKey`, `listEncryptedKeyMetadata`, `getEncryptedKey`, `storeEncryptedKey`, `storeEncryptedKeyBatch`, `batchGeneratePrivateKeys`, `signMessageWithEncryptedKey`, and `signTransactionWithEncryptedKey`. See the updated docs (guides/server-sessions, sdk-reference/wrapped-keys, and the new auth references) for end-to-end examples. [PR](https://github.com/LIT-Protocol/js-sdk/pull/972)

### Patch Changes

- d2ff969: PKP signing now auto-hashes Cosmos payloads, exposes a documented bypassAutoHashing option, and ships with a new e2e suite plus docs so builders can rely on every listed curve working out of the box.
- fd9544d: SDK exposes typed Shiva env helpers (`createShivaEnvVars`, `waitForTestnetInfo`, `SUPPORTED_NETWORKS`) so QA suites can spin up testnets without bespoke env plumbing, and the new `executeWithHandshake` runner automatically retry failures for more stable Lit action execution.
- Updated dependencies [42e5151]
- Updated dependencies [0a80342]
- Updated dependencies [edf1099]
- Updated dependencies [d2ff969]
- Updated dependencies [b5258b7]
- Updated dependencies [fd9544d]
  - @lit-protocol/constants@9.0.0
  - @lit-protocol/auth-helpers@8.2.0
  - @lit-protocol/lit-client@8.3.0
  - @lit-protocol/contracts@0.9.0
  - @lit-protocol/networks@8.4.0
  - @lit-protocol/crypto@8.1.0
  - @lit-protocol/auth@8.2.0

## 4.0.2

### Patch Changes

- Updated dependencies [1dac723]
  - @lit-protocol/contracts@0.8.2
  - @lit-protocol/constants@8.0.8
  - @lit-protocol/networks@8.3.2

## 4.0.1

### Patch Changes

- f109877: update naga-test contract addresses. Users are expected to update and reinstall the SDK to continue using naga-test.
- Updated dependencies [f109877]
  - @lit-protocol/contracts@0.8.1
  - @lit-protocol/auth@8.1.2
  - @lit-protocol/lit-client@8.2.3
  - @lit-protocol/networks@8.3.1
  - @lit-protocol/constants@8.0.7

## 4.0.0

### Minor Changes

- 761174a: Naga-local consumers can now point at a local networkContext.json with a lightweight withLocalContext call (or by setting NAGA_LOCAL_CONTEXT_PATH) while the default bundled signatures keep working as before.

### Patch Changes

- Updated dependencies [761174a]
  - @lit-protocol/contracts@0.8.0
  - @lit-protocol/networks@8.3.0
  - @lit-protocol/wasm@8.1.0
  - @lit-protocol/constants@8.0.6

## 3.0.2

### Patch Changes

- Updated dependencies [0d20cbf]
  - @lit-protocol/lit-client@8.2.2
  - @lit-protocol/networks@8.2.2

## 3.0.1

### Patch Changes

- 6bd3394: Update the naga-dev staking address. users are expected to reinstall the SDK to apply this patch to continue using the naga-dev network.
- Updated dependencies [6bd3394]
  - @lit-protocol/auth@8.1.1
  - @lit-protocol/lit-client@8.2.1
  - @lit-protocol/networks@8.2.1

## 3.0.0

### Minor Changes
