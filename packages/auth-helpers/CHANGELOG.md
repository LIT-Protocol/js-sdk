# @lit-protocol/auth-helpers

## 8.1.1

### Patch Changes

- 6bd3394: Update the naga-dev staking address. users are expected to reinstall the SDK to apply this patch to continue using the naga-dev network.

## 8.1.0

### Minor Changes

- 9d60bfa: Converted viem from a bundled dependency to a peer dependency to avoid build errors from version conflicts (e.g., missing exports like sendCallsSync) and improve compatibility by reducing dependency lock-in. Consumers must now install compatible versions manually.

## 8.0.2

### Patch Changes

## 8.0.1

### Patch Changes

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
- 3ed0a77: this should fix the browser pino logger issue
- 857e330: add a pipeline to check for missing dependencies
- c044935: fix http://naga-auth-service.getlit.dev
- c664381: fix build

### Patch Changes

- 138437b: add required dependencies
