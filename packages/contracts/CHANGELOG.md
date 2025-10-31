# @lit-protocol/contracts

## 0.8.2

### Patch Changes

- 1dac723: Provide a browser-only stub for `custom-network-signatures` so web builds skip the Node-specific implementation

## 0.8.1

### Patch Changes

- f109877: update naga-test contract addresses. Users are expected to update and reinstall the SDK to continue using naga-test.

## 0.8.0

### Minor Changes

- 761174a: Naga-local consumers can now point at a local networkContext.json with a lightweight withLocalContext call (or by setting NAGA_LOCAL_CONTEXT_PATH) while the default bundled signatures keep working as before.

## 0.7.1

### Patch Changes

- 6bd3394: Update the naga-dev staking address. users are expected to reinstall the SDK to apply this patch to continue using the naga-dev network.

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
