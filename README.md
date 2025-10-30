<div align="center">
  <h1 align="center">Lit Protocol SDK</h1>

  <img src="https://litprotocol.mypinata.cloud/ipfs/bafybeie2xhocabmq2nq7v5d35i6owix476bobttc6gcgi6bay74ux6td6e">
  <br/>
  <a href="https://x.com/LitProtocol"><img src="https://img.shields.io/twitter/follow/litprotocol?label=Follow&style=social"/></a> <a href="https://t.me/+aa73FAF9Vp82ZjJh"><img src="https://img.shields.io/badge/Telegram-blue?logo=telegram&style=social"/></a> <a href="https://litgateway.com/discord"><img src="https://img.shields.io/badge/Discord-blue?logo=discord&style=social"/></a>
  
  <p align="center">
    <br />
    <a href="https://litprotocol.mintlify.app/sdk/introduction"><strong>Explore the docs »</strong></a> | 
    <br />
    <br />
    <a href="https://naga-explorer.getlit.dev/">Explorer</a>
    ·
    <a href="https://naga-e2e.getlit.dev/">E2E Test Dapp</a>
    ·
    <a href="https://github.com/LIT-Protocol/js-sdk/issues">Report Bug</a>
    ·
    <a href="https://github.com/LIT-Protocol/js-sdk/pulls">Request Feature</a>
  </p>
</div>

# Prerequisite

- node (v20.x or above)
- rust (v1.70.00 or above)
- [wasm-pack](https://github.com/rustwasm/wasm-pack)

# Getting started

```
pnpm install && pnpm build
```

# Running E2E Tests

## Required Environment Variables

```bash
# (Optional) Request a private rpc url from
# https://hub.conduit.xyz/chronicle-yellowstone-testnet-9qgmzfcohk
LIT_YELLOWSTONE_PRIVATE_RPC_URL=<private-rpc-url>

# For live networks (naga-dev, naga-staging)
LIVE_MASTER_ACCOUNT=<master-account-private-key>

# For local network (naga-local) (default Anvil account)
LOCAL_MASTER_ACCOUNT=0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
```

## Command

```bash
// eg. naga-dev
NETWORK=<network-name> pnpm run test:e2e all
```

### Run a custom ticket spec

Run a single test file by pointing `--runTestsByPath` at the spec you are iterating on:

```bash
pnpm test:custom -- --runTestsByPath packages/e2e/src/tickets/drel1157-la-decryptandcombine.spec.ts
```

# Running it against a local network

## Required Environment Variables

```bash
# path to the networkContext.json file
NETWORK_CONFIG=/<path-to-lit-assets>/lit-assets/blockchain/contracts/networkContext.json

# name of the output file
NETWORK_NAME=naga-develop

# target directory
DIRECTORY_NAME=naga-local
```

## Command

```bash
NETWORK=naga-local pnpm run test:e2e all
```

# Manual Publishing

```bash
# Generate a changeset
pnpm changeset

# Version the changeset
pnpm changeset version

# Build the packages
pnpm build

# Commit the changes
git add .
git commit -m "chore: release v0.0.1"

# Publish the packages
pnpm changeset publish
```

# Apps

This monorepo contains two apps: [Lit Auth Server](./apps/lit-auth-server/README.md) and [Lit Login Server](./apps/lit-login-server/README.md).Both apps support Docker builds.

## Releasing Docker Images

- Trigger the `Release Docker Images` GitHub Action (`.github/workflows/release-docker-images.yml`) from the Actions tab once the desired changes are on the branch you want to release from.
- When starting the workflow, select the branch ref, set `auth-server-released` to true, and optionally provide a `custom-tag` to add an extra image tag alongside the branch/commit/`latest` tags.
- The job installs the Rust toolchain and `wasm-pack`, builds both `lit-auth-server` and `lit-login-server` via their Nx `docker-build` targets, and pushes images to `ghcr.io/lit-protocol/<app>` using the repo's `GITHUB_TOKEN` (or the `GHCR_USERNAME`/`GHCR_TOKEN` secrets if you supply them).
- Published images live under:
  - `lit-auth-server`: https://github.com/LIT-Protocol/js-sdk/pkgs/container/lit-auth-server
  - `lit-login-server`: https://github.com/LIT-Protocol/js-sdk/pkgs/container/lit-login-server
- Leave `auth-server-released` unchecked to perform a no-op dry run and confirm the workflow is available without publishing images.

## One Click Deployable Images

### Lit Auth Server

[![Deploy on Railway](https://railway.com/button.svg)](https://railway.com/deploy/OYOevk?referralCode=RP1REI&utm_medium=integration&utm_source=template&utm_campaign=generic)

### Lit Login Server

[![Deploy on Railway](https://railway.com/button.svg)](https://railway.com/deploy/RO0wsZ?referralCode=RP1REI&utm_medium=integration&utm_source=template&utm_campaign=generic)

#### Environment configuration

- `ORIGIN`: required for OAuth callbacks. Railway asks for a value during deploy—drop in a placeholder like `http://localhost:3000`, let the app spin up, then replace it with the generated public HTTPS domain (or your custom domain) so Google and Discord redirect URIs match. Leaving it empty keeps the local-only default and will break production flows.

## Keeping the contract address and ABIs in sync with the latest changes

This command must be run manually and is NOT part of the build process, as it requires a GitHub API key.

```shell
DEV_BRANCH=develop GH_API_KEY=github_pat_xxx pnpm run sync:contracts
```

---

# Legacy Documentation for V7 and Earlier

| Version | Link                                                     |
| ------- | -------------------------------------------------------- |
| V7      | [7.x.x docs](https://v7-api-doc-lit-js-sdk.vercel.app/)  |
| V6      | [6.x.x docs](https://v6-api-doc-lit-js-sdk.vercel.app/)  |
| V5      | [5.x.x docs](https://v3.api-docs.getlit.dev/)            |
| V2      | [2.x.x docs](http://docs.lit-js-sdk-v2.litprotocol.com/) |

</div>

# Contact

You can reach the Lit Protocol team through [Telegram](https://t.me/+aa73FAF9Vp82ZjJh), [Discord](https://litgateway.com/discord), or [X](https://x.com/litprotocol).
