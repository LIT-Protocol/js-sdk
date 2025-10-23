---
'@lit-protocol/wrapped-keys-lit-actions': minor
'@lit-protocol/auth-services': minor
'@lit-protocol/auth-helpers': minor
'@lit-protocol/wrapped-keys': minor
'@lit-protocol/lit-client': minor
'@lit-protocol/artillery': minor
'@lit-protocol/constants': minor
'@lit-protocol/contracts': minor
'@lit-protocol/networks': minor
'@lit-protocol/crypto': minor
'@lit-protocol/auth': minor
'@lit-protocol/e2e': minor
---

Introduce wrapped-keys support to v8 so applications can generate, import, export, and sign with encrypted keys across EVM and Solana without exposing private key material. New `auth` package APIs include `validateDelegationAuthSig`, `generatePkpDelegationAuthSig`, `generateEoaDelegationAuthSig`, `createPkpAuthContextFromPreGenerated`, and `createPkpSessionSigs`. New `wrapped-keys` APIs include `generatePrivateKey`, `importPrivateKey`, `exportPrivateKey`, `listEncryptedKeyMetadata`, `getEncryptedKey`, `storeEncryptedKey`, `storeEncryptedKeyBatch`, `batchGeneratePrivateKeys`, `signMessageWithEncryptedKey`, and `signTransactionWithEncryptedKey`. See the updated docs (guides/server-sessions, sdk-reference/wrapped-keys, and the new auth references) for end-to-end examples. [PR](https://github.com/LIT-Protocol/js-sdk/pull/972)
