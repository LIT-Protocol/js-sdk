# @lit-protocol/auth-services

## 2.0.0-test.23

### Patch Changes

- fix authData type struct
- Updated dependencies
  - @lit-protocol/logger@8.0.0-test.25

## 2.0.0-test.22

### Patch Changes

- test split CI workflows
- Updated dependencies
  - @lit-protocol/logger@8.0.0-test.24

## 2.0.0-test.21

### Patch Changes

- bump versions
- Updated dependencies
  - @lit-protocol/logger@8.0.0-test.23

## 2.0.0-test.20

### Patch Changes

- fix CI `auth:build` and fix different viem instances have incompatible types even if they're similar versions
- Updated dependencies
  - @lit-protocol/logger@8.0.0-test.17

## 2.0.0-test.19

### Patch Changes

- fix SyntaxError: The requested module '@lit-protocol/constants' does not provide an export named 'DEV_PRIVATE_KEY'
- Updated dependencies
  - @lit-protocol/logger@8.0.0-test.16

## 2.0.0-beta.18

### Patch Changes

- withOverrides no longer monkey-patches methods nor wraps every chain API. It now builds an overridden networkConfig with the resolved RPC URL and a cloned chainConfig whose rpcUrls.default.http and rpcUrls['public'].http use the override. So all downstream consumers (state manager, chain APIs, contracts) automatically use the overridden RPC via the standard construction path. No per-method wrapping needed.

## 2.0.0-beta.17

### Patch Changes

- fix "any" return types due to the return/param types are not imported/re-exported from the public entry points. Here are the Affected methods mintWithEoa mintWithAuth mintWithCustomAuth getPKPPermissionsManager getPaymentManager viewPKPPermissions

## 2.0.0-beta.16

### Patch Changes

- fix auth server to override default RPC URL

## 2.0.0-beta.15

### Patch Changes

- added .withOverrides method to override the RPC URL in the network module.

## 2.0.0-beta.14

### Patch Changes

- Second attempt to fix webauthn. The error seems to be WebAuthnAuthenticator is missing a scope.

## 2.0.0-beta.13

### Patch Changes

- first attempt to fix webauthn

## 2.0.0-beta.12

### Patch Changes

- fix applied to pkp custom auth for the sign session key endpoint.

## 2.0.0-beta.11

### Patch Changes

- naga dev beta release with keyset
- test
- test
- test
- test
- naga-test and naga-staging is now available
- fix the way that the network modules are imported
- test
- adding missing naga-staging NETWORK env enum
- released naga-dev keyset support. contract addresses and ABIs have been updated

## 2.0.0-beta.1

### Patch Changes

- a48fbfb: Initial version after networks unification
- Initial release for networks unification

## 2.0.0-beta.0

### Major Changes

- first naga beta release

## 1.0.0

### Major Changes

- cac8964: add "zod-validation-error": "^3.4.0"
- 3ac49c5: fixing cors
- b8ae37b: fix build pipeline -> dependencies order is important
- 53973d3: add "cbor-web": "^9.0.2",
- 6c3938a: fix build
- 4ad5cec: test publish
- 3a0a30d: fix imports
- c664381: test
- e56fa39: fix import path
- ff75c6b: merged lit-login-server & relayer as auth-services
- 67cc0bf: fix(config): auth-services
- ca72c25: wip
- c044935: fix dependencies
- 9d38582: wip
- da8bf7c: add "@openagenda/verror": "^3.1.4"
- 20f98e5: add "@lit-protocol/contracts": "^0.1.23",
- d08eed4: fix exports and paths
- fbfa1eb: attempt to make vite polyfill minimum
- c044935: wip
- 857e330: add a pipeline to check for missing dependencies
- f2818e1: The core issue was that the auth-services package was trying to be a modern ES module package with modern dependencies, but was configured with older CommonJS/Node.js settings. Once we aligned everything to be consistently modern ES2022 with bundler resolution, TypeScript could properly:
- c664381: wip
- 12e304c: fix and publish
- 8523cb7: wip
- cb0bbed: wip
- c6bddb8: make workspace packages
- c044935: fix http://naga-auth-service.getlit.dev
- c664381: fix build

### Minor Changes

- f482a99: fix build
- a0919a9: add imports

### Patch Changes

- 138437b: add required dependencies

## 1.0.0-alpha.23

### Major Changes

- attempt to make vite polyfill minimum

## 1.0.0-alpha.22

### Major Changes

- wip
- fix http://naga-auth-service.getlit.dev

## 1.0.0-alpha.21

### Major Changes

- fix dependencies

## 1.0.0-alpha.20

### Major Changes

- fixing cors

## 1.0.0-alpha.19

### Major Changes

- wip

## 1.0.0-alpha.18

### Major Changes

- wip

## 1.0.0-alpha.17

### Major Changes

- test
- fix build

## 1.0.0-alpha.16

### Major Changes

- fix build pipeline -> dependencies order is important

### Patch Changes

- Updated dependencies
  - @lit-protocol/auth@8.0.0-alpha.8
  - @lit-protocol/lit-client@8.0.0-alpha.9
  - @lit-protocol/logger@8.0.0-alpha.8
  - @lit-protocol/networks@8.0.0-alpha.13
  - @lit-protocol/schemas@8.0.0-alpha.8
  - @lit-protocol/types@8.0.0-alpha.8

## 1.0.0-alpha.15

### Major Changes

- add a pipeline to check for missing dependencies

### Patch Changes

- Updated dependencies
  - @lit-protocol/auth@8.0.0-alpha.7
  - @lit-protocol/lit-client@8.0.0-alpha.8
  - @lit-protocol/logger@8.0.0-alpha.7
  - @lit-protocol/networks@8.0.0-alpha.12
  - @lit-protocol/schemas@8.0.0-alpha.7
  - @lit-protocol/types@8.0.0-alpha.7

## 1.0.0-alpha.14

### Patch Changes

- add required dependencies

## 1.0.0-alpha.13

### Major Changes

- wip

## 1.0.0-alpha.12

### Major Changes

- wip

## 1.0.0-alpha.12

### Major Changes

- 4ad5cec: test publish
- da8bf7c: add "@openagenda/verror": "^3.1.4"
- wip

## 1.0.0-alpha.11

### Major Changes

- fix import path

## 1.0.0-alpha.10

### Major Changes

- fix imports

## 1.0.0-alpha.9

### Major Changes

- fix(config): auth-services

## 1.0.0-alpha.8

### Major Changes

- The core issue was that the auth-services package was trying to be a modern ES module package with modern dependencies, but was configured with older CommonJS/Node.js settings. Once we aligned everything to be consistently modern ES2022 with bundler resolution, TypeScript could properly:

## 1.0.0-alpha.8

### Major Changes

- 20f98e5: add "@lit-protocol/contracts": "^0.1.23",
- make workspace packages

## 1.0.0-alpha.7

### Major Changes

- add "cbor-web": "^9.0.2",

## 1.0.0-alpha.6

### Major Changes

- add "zod-validation-error": "^3.4.0"

## 1.0.0-alpha.5

### Minor Changes

- add imports

## 1.0.0-alpha.4

### Major Changes

- fix exports and paths

## 1.0.0-alpha.3

### Major Changes

- fix and publish

## 1.0.0-alpha.2

### Major Changes

- fix build

## 1.0.0-alpha.1

### Minor Changes

- f482a99: fix build

## 1.0.0-alpha.0

### Major Changes

- merged lit-login-server & relayer as auth-services

### Patch Changes

- Updated dependencies
  - @lit-protocol/constants@8.0.0-alpha.5

## 0.1.0

- Initial package setup for PKP Auth Service.
