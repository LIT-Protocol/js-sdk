# Rust E2E (Lit Naga)

The parity signal for the Rust SDK is the `lit-e2e` crate.

## Run

- Local / devnet: ensure `.env` is populated (see repo root `.env`), then run:
  - `cargo test -p lit-e2e -- --nocapture`
- Override network at runtime:
  - `NETWORK_NAME=naga-dev cargo test -p lit-e2e -- --nocapture`

## Required env vars

At minimum you need:

- `NETWORK_NAME` (or `NETWORK`)
- An RPC URL:
  - `LOCAL_RPC_URL` for `naga-local`/`custom`, or
  - `LIT_YELLOWSTONE_PRIVATE_RPC_URL` / `LIT_TXSENDER_RPC_URL` for live networks
- A funded master private key for minting/funding accounts:
  - `LIVE_MASTER_ACCOUNT_*` (e.g. `LIVE_MASTER_ACCOUNT_NAGA_DEV`), or `LIVE_MASTER_ACCOUNT`, or `LOCAL_MASTER_ACCOUNT`
