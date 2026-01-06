# @lit-protocol/networks

## 8.4.0

### Minor Changes

- 0a80342: Introduce wrapped-keys support to v8 so applications can generate, import, export, and sign with encrypted keys across EVM and Solana without exposing private key material. New `auth` package APIs include `validateDelegationAuthSig`, `generatePkpDelegationAuthSig`, `generateEoaDelegationAuthSig`, `createPkpAuthContextFromPreGenerated`, and `createPkpSessionSigs`. New `wrapped-keys` APIs include `generatePrivateKey`, `importPrivateKey`, `exportPrivateKey`, `listEncryptedKeyMetadata`, `getEncryptedKey`, `storeEncryptedKey`, `storeEncryptedKeyBatch`, `batchGeneratePrivateKeys`, `signMessageWithEncryptedKey`, and `signTransactionWithEncryptedKey`. See the updated docs (guides/server-sessions, sdk-reference/wrapped-keys, and the new auth references) for end-to-end examples. [PR](https://github.com/LIT-Protocol/js-sdk/pull/972)
- edf1099: Add `naga` and `naga-proto` networks. Create per-network entrypoints and subpath exports (naga, naga-production, naga-proto, naga-staging, naga-test, naga-dev, naga-local) for better tree-shaking
- b5258b7: Expose and aggregate payment details returned by Lit nodes from Lit Action execution requests.

### Patch Changes

- d2ff969: PKP signing now auto-hashes Cosmos payloads, exposes a documented bypassAutoHashing option, and ships with a new e2e suite plus docs so builders can rely on every listed curve working out of the box.
- fd9544d: SDK exposes typed Shiva env helpers (`createShivaEnvVars`, `waitForTestnetInfo`, `SUPPORTED_NETWORKS`) so QA suites can spin up testnets without bespoke env plumbing, and the new `executeWithHandshake` runner automatically retry failures for more stable Lit action execution.
- Updated dependencies [0a80342]
- Updated dependencies [edf1099]
  - @lit-protocol/contracts@0.9.0

## 8.3.2

### Patch Changes

- Updated dependencies [1dac723]
  - @lit-protocol/contracts@0.8.2

## 8.3.1

### Patch Changes

- f109877: update naga-test contract addresses. Users are expected to update and reinstall the SDK to continue using naga-test.
- Updated dependencies [f109877]
  - @lit-protocol/contracts@0.8.1

## 8.3.0

### Minor Changes

- 761174a: Naga-local consumers can now point at a local networkContext.json with a lightweight withLocalContext call (or by setting NAGA_LOCAL_CONTEXT_PATH) while the default bundled signatures keep working as before.

### Patch Changes

- Updated dependencies [761174a]
  - @lit-protocol/contracts@0.8.0

## 8.2.2

### Patch Changes

- 0d20cbf: Node operations (pkpSign, decrypt, executeJs, session key signing) now emit request-aware errors, letting users share a requestID for log correlation.

## 8.2.1

### Patch Changes

- 6bd3394: Update the naga-dev staking address. users are expected to reinstall the SDK to apply this patch to continue using the naga-dev network.
- Updated dependencies [6bd3394]
  - @lit-protocol/contracts@0.7.1

## 8.2.0

### Minor Changes

- 4d339d1: introduce `litClient.utils.getDerivedKeyId` - a little helper to resolve the Lit Action public key outside of the Action runtime

### Patch Changes

- Updated dependencies [4d339d1]
  - @lit-protocol/contracts@0.7.0

## 8.1.0

### Minor Changes

- 9d60bfa: Converted viem from a bundled dependency to a peer dependency to avoid build errors from version conflicts (e.g., missing exports like sendCallsSync) and improve compatibility by reducing dependency lock-in. Consumers must now install compatible versions manually.

### Patch Changes

- Updated dependencies [9d60bfa]
  - @lit-protocol/contracts@0.6.0

## 8.0.2

### Patch Changes

- Updated dependencies [9ec9ea9]
  - @lit-protocol/contracts@0.5.3

## 8.0.1

### Patch Changes

- 867516f: fix package metadata so bundlers load the CommonJS builds again
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

- 7af81b3: fix browser compatability
- d6e7137: feat: add naga-test support
- 49d8f68: feat(payment): add Ledge contract ABIs
- f4c5151: fix import paths
- 16fc970: added payment manager apis, added maxPrice for signSessionKey endpoint, and updated auth service url for naga-test
- bf201e8: add missing `withdraw` ledge abi method
- b8ae37b: fix build pipeline -> dependencies order is important
- 851eb4c: adding "@lit-protocol/contracts": "^0.1.23",
- ff75c6b: merged lit-login-server & relayer as auth-services
- cb6b698: Initial alpha publish.
- c044935: fix dependencies
- 4c5541d: add payment delegation manager
- 3e43087: add payment delegation apis
- fbfa1eb: attempt to make vite polyfill minimum
- 857e330: add a pipeline to check for missing dependencies
- 47993d1: Update the project.json to point to the correct index.ts file:
- d31c69f: add contracts pkg
- 42e92f6: feat(networks): add naga-test support
- c044935: fix http://naga-auth-service.getlit.dev
- c664381: fix build

### Patch Changes

- 138437b: add required dependencies
