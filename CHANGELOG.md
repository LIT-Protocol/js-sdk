# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.1.63] - 2023-03-13

- [[#44](<https://github.com/LIT-Protocol/js-sdk/pull/44>)] Separated Node Code into its own repository `@lit-protocol/lit-node-client-nodejs`, from which `@lit-protocol/lit-node-client` will extend, so there are no breaking changes for existing customers.

### Added

- `yarn v` to check the current npm version
- `yarn bump` to update `patch` version in `lerna.json` and `version.ts`
- `yarn bump:minor` to update `minor` version in `lerna.json` and `version.ts`
- `yarn bump:major` to update `major` version in `lerna.json` and `version.ts`
- Logs will now include version number eg. `[LitJsSdk v2.1.63]`
- `yarn tool:e2e` will now serve the react app and launch Cypress E2E testing automatically