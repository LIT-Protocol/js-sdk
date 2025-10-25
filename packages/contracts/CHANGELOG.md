# @lit-protocol/contracts

## 0.7.0

### Minor Changes

- 4d339d1: introduce `litClient.utils.getDerivedKeyId` - a little helper to resolve the Lit Action public key outside of the Action runtime

## 0.6.0

### Minor Changes

- 9d60bfa: Converted viem from a bundled dependency to a peer dependency to avoid build errors from version conflicts (e.g., missing exports like sendCallsSync) and improve compatibility by reducing dependency lock-in. Consumers must now install compatible versions manually.

## 0.5.3

### Patch Changes

- release `naga-test` network support

## 0.5.2

### Patch Changes

- initial release
