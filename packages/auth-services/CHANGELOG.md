# @lit-protocol/auth-services

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
