# @lit-protocol/lit-client

## 8.2.0

### Minor Changes

- aedfa59: LitClient now offers `getIpfsId` via `@lit-protocol/lit-client/ipfs`, letting apps compute CIDv0 hashes (e.g., `await getIpfsId('hello')`) while keeping bundles lean.

  ```ts
  import { getIpfsId } from '@lit-protocol/lit-client/ipfs';
  const cid = await getIpfsId('hello');
  ```

- 4d339d1: introduce `litClient.utils.getDerivedKeyId` - a little helper to resolve the Lit Action public key outside of the Action runtime

## 8.1.0

### Minor Changes

- 9d60bfa: Converted viem from a bundled dependency to a peer dependency to avoid build errors from version conflicts (e.g., missing exports like sendCallsSync) and improve compatibility by reducing dependency lock-in. Consumers must now install compatible versions manually.

## 8.0.2

### Patch Changes

## 8.0.1

### Patch Changes

- 867516f: fix package metadata so bundlers load the CommonJS builds again

## 8.0.0

### Major Changes

- ceac462: first naga beta release

### Patch Changes

- 935c218: reset naga-dev contract addresses and add naga-staging network
- a48fbfb: Initial version after networks unification
- a59f48f: Initial release for networks unification

## 8.0.0

### Major Changes

- 49d8f68: feat(payment): add Ledge contract ABIs
- 16fc970: added payment manager apis, added maxPrice for signSessionKey endpoint, and updated auth service url for naga-test
- b8ae37b: fix build pipeline -> dependencies order is important
- 0d12992: add export to index.ts
- ff75c6b: merged lit-login-server & relayer as auth-services
- cb6b698: Initial alpha publish.
- c044935: fix dependencies
- fbfa1eb: attempt to make vite polyfill minimum
- 857e330: add a pipeline to check for missing dependencies
- c044935: fix http://naga-auth-service.getlit.dev
- c664381: fix build

### Patch Changes

- 138437b: add required dependencies
