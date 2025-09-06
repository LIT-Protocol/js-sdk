<div align="center">
  <h1 align="center">Lit Protocol SDK</h1>

  <p align="center">
    A comprehensive suite of tools for blockchain integration, authentication, and NFT functionality
    <br />
    <br />
    <a href="https://litprotocol.mintlify.app/"><strong>Explore the docs »</strong></a> | 
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
npm install && npm run build
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
NETWORK=<network-name> npm run test:e2e all
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
NETWORK=naga-local npm run test:e2e all
```

# Publishing

```bash
# Generate a changeset
npx changeset

# Version the changeset
npx changeset version

# Build the packages
npm run build

# Commit the changes
git add .
git commit -m "chore: release v0.0.1"

# Publish the packages
npx changeset publish
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

You can reach the Lit Protocol team through [Telegram](https://t.me/+aa73FAF9Vp82ZjJh), [Discord](https://litgateway.com/discord), or [X](https://twitter.com/litprotocol).
