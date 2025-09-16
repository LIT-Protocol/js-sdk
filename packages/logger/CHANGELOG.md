# @lit-protocol/logger

## 8.0.0-test.22

### Patch Changes

- fix Uncaught ReferenceError: exports is not defined

## 8.0.0-test.21

### Patch Changes

- ff54600: fix Uncaught ReferenceError: exports is not defined

## 8.0.0-test.20

### Patch Changes

- fece28d: test changeset
- fd7bc9e: test changeset 4

## 8.0.0-test.19

### Patch Changes

- da538ab: test changeset 3

## 8.0.0-test.18

### Patch Changes

- test changeset

## 8.0.0-test.17

### Patch Changes

- test changeset publish

## 8.0.0-test.16

### Patch Changes

- test changeset

## 8.0.0-beta.15

### Patch Changes

- withOverrides no longer monkey-patches methods nor wraps every chain API. It now builds an overridden networkConfig with the resolved RPC URL and a cloned chainConfig whose rpcUrls.default.http and rpcUrls['public'].http use the override. So all downstream consumers (state manager, chain APIs, contracts) automatically use the overridden RPC via the standard construction path. No per-method wrapping needed.

## 8.0.0-beta.14

### Patch Changes

- fix "any" return types due to the return/param types are not imported/re-exported from the public entry points. Here are the Affected methods mintWithEoa mintWithAuth mintWithCustomAuth getPKPPermissionsManager getPaymentManager viewPKPPermissions

## 8.0.0-beta.13

### Patch Changes

- fix auth server to override default RPC URL

## 8.0.0-beta.12

### Patch Changes

- added .withOverrides method to override the RPC URL in the network module.

## 8.0.0-beta.11

### Patch Changes

- Second attempt to fix webauthn. The error seems to be WebAuthnAuthenticator is missing a scope.

## 8.0.0-beta.10

### Patch Changes

- first attempt to fix webauthn

## 8.0.0-beta.9

### Patch Changes

- fix applied to pkp custom auth for the sign session key endpoint.

## 8.0.0-beta.8

### Patch Changes

- naga dev beta release with keyset
- test
- test
- test
- test
- test
- released naga-dev keyset support. contract addresses and ABIs have been updated

## 8.0.0-beta.1

### Patch Changes

- a48fbfb: Initial version after networks unification
- Initial release for networks unification

## 8.0.0-beta.0

### Major Changes

- first naga beta release

## 8.0.0

### Major Changes

- 0d12992: third attempt.
- 0d12992: version 4
- b8ae37b: fix build pipeline -> dependencies order is important
- 0d12992: test
- c664381: test
- ff75c6b: merged lit-login-server & relayer as auth-services
- 0d12992: test
- cb6b698: Initial alpha publish.
- ca72c25: wip
- c044935: fix dependencies
- fbfa1eb: attempt to make vite polyfill minimum
- c044935: wip
- 857e330: add a pipeline to check for missing dependencies
- c664381: wip
- c044935: fix http://naga-auth-service.getlit.dev
- c664381: fix build
- 2164678: second attempt.

### Patch Changes

- 138437b: add required dependencies

## 8.0.0-alpha.14

### Major Changes

- attempt to make vite polyfill minimum

## 8.0.0-alpha.13

### Major Changes

- wip
- fix http://naga-auth-service.getlit.dev

## 8.0.0-alpha.12

### Major Changes

- fix dependencies

## 8.0.0-alpha.11

### Major Changes

- wip

## 8.0.0-alpha.10

### Major Changes

- wip

## 8.0.0-alpha.9

### Major Changes

- test
- fix build

## 8.0.0-alpha.8

### Major Changes

- fix build pipeline -> dependencies order is important

## 8.0.0-alpha.7

### Major Changes

- add a pipeline to check for missing dependencies

## 8.0.0-alpha.6

### Patch Changes

- add required dependencies

## 8.0.0-alpha.5

### Major Changes

- merged lit-login-server & relayer as auth-services

## 8.0.0-alpha.4

### Major Changes

- version 4

## 8.0.0-alpha.3

### Major Changes

- test

## 8.0.0-alpha.2

### Major Changes

- test

## 8.0.0-alpha.1

### Major Changes

- third attempt.

## 8.0.0-alpha.2

### Major Changes

- second attempt.

## 8.0.0-alpha.1

### Major Changes

- Initial alpha publish.
