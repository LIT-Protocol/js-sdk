# @lit-protocol/e2e

Utilities and ready-made specs for Lit Protocol end-to-end testing. This package now ships the canonical Jest suite we run in-repo, plus helpers (state initialisers, Shiva client, etc.) so QA teams can execute the same coverage or layer on additional `.spec.ts` files without cloning this repository.

## Installation

```bash
pnpm add -D @lit-protocol/e2e
```

The CLI bundles Jest, Babel presets, and all required helpers. Install any additional project-specific tooling (for example `ts-node` if you prefer to author specs in TypeScript directly).

## Required Environment

Set the same environment variables the in-repo test harness expects **before** running any specs:

```bash
# Accounts that sponsor users on live and local networks
LIVE_MASTER_ACCOUNT=0x...
LOCAL_MASTER_ACCOUNT=0x...

# General configuration (can also be passed to init())
NETWORK=naga-local          # or naga-dev / naga-staging / naga-test
LOG_LEVEL=info

# Optional local overrides
NAGA_LOCAL_CONTEXT_PATH=./lit-assets/blockchain/contracts/networkContext.json
LIT_YELLOWSTONE_PRIVATE_RPC_URL=http://127.0.0.1:8545
LIT_MAINNET_RPC_URL=https://mainnet-rpc.example
```

See env var selection activity diagram
![](https://www.plantuml.com/plantuml/png/ZPHlRzis4CRVwrFSzCe6ycSTLcombwoQ9sn1LJbGP7T3CGYiT8a9KwH0KagCeY_tBVRfzab6KH9hsN6N131iukwvttDtk3TA4wdhaddVw0sM21KZb7kUVVPc2P82uZ1zlqpU0l866YBd7hs7oV1OymBlASS2X3G_L5rLGceiVfw24UGmsQ6QUW0plP7Y4K8fJPn_80bK0HSQ5EfMneduSvEfjAWyP0fXmiNKGrxGUy-R_OeQPMagMn6LYye4C94J1eq2HXkSZabpmRNnfi2tKVuHuKeXT08QbGwDAd8jTot3h9Aq8HhVuWwk85ekWYXx5zobOP85YyLo5QTpXpXeMOR_bRfPXyTArgA5tmikgLAKFtoziVXKOQwnW98eZH98dekQQzZYxdGpHsswkWAVamTotdNfi9fzNGYkyKdV4hqn7kBWjo3hUh9OncduHvhT1kdlRRbM-2ZZX953AoTaXqMnTdf30FlDjwOSQrBbAydSr9BRHRPAeX5S7tAQYua7y4Vv0yKSpFgJcccJ25h0g-z-kFZM_B-Q_VZw-zUMqU78WMI_g923GjI_7cnI9CIsha0qA2Kj4BPkRonB6A-pTP3SVU2e7uNS_ZKuwty3vV39phF0vWpijtOdFn-xF2gHPd-6KRHyVvSkup2xJMxMGHgw3dP9FJoOLvEpqRfIiylB7J8c7fKM7C-DxGj6TIM55hbW5xaeB-Vzo9udjQ4TwyimtmKtiTdV5w4PbFDyGoZ_AjYpfTojUxQ06PW6KbMCvkGZm-cNsVSJ6QdX4rLQdTgrnGRpRRjIGuwxb3-Pv6ku5-PRtxThlyTfxutRTkCgHwKkJDw7GSHS4RiU7SvUk49zJ3BQM1ThyntdIXb8wz-1JYpXz5b4jzWZaLYC5HfAEfjpgAt-HxB5ufnow1jkQkor_dfgrSV0RbGmAKLHCuH7ofZHGnZdsjH-JWU03i-XZKtDePSsgkf5a7sTxjFypNwfAIj0ech3FlN2P_3bwfz1P-aC3i_evxatYmnVITGMdSR4__UVlo7a3Qo9LBwnPm_a6rEoBjb_)

Make sure the referenced network (local Naga cluster, Shiva-managed testnet, or live subnet) is running and reachable from your test machine.

> Heads up: when targeting `naga-proto` or `naga`, the helpers only fund generated accounts with `0.01` LIT and deposit `0.01` LIT into the Lit Ledger so we don't strand real mainnet balance.

## Run the Canonical Suite

The published suite now imports everything from the package entrypoint, so you can execute it directly through Jest without wiring up helper paths manually.

```bash
pnpm exec jest \
  --config node_modules/@lit-protocol/e2e/jest.e2e.package.config.cjs \
  --runTestsByPath node_modules/@lit-protocol/e2e/src/e2e.spec.ts \
  --runInBand
```

Prefer local config files? Run `pnpm lit-e2e init` once to scaffold `jest.e2e.local.cjs` and `babel.config.cjs`, then:

```bash
pnpm exec jest \
  --config jest.e2e.local.cjs \
  --runTestsByPath node_modules/@lit-protocol/e2e/src/e2e.spec.ts \
  --runInBand
```

That is the only CLI command most teams need; all other helpers are available via imports.

## Author Your Own Specs

All helper utilities are exported from `@lit-protocol/e2e`. This includes the environment `init` routine, auth-context builders, and the new Shiva client wrapper.

```ts
import { init, createShivaClient } from '@lit-protocol/e2e';

describe('Epoch rollover', () => {
  it('advances when Shiva triggers a transition', async () => {
    const ctx = await init('naga-local');
    const shiva = await createShivaClient(ctx.litClient, {
      baseUrl: 'http://localhost:8000',
    });

    const before = await shiva.inspectEpoch();
    await shiva.transitionEpochAndWait();
    const after = await shiva.waitForEpochChange({
      baselineEpoch: before.epoch,
    });

    expect(after.epoch).not.toEqual(before.epoch);
  });
});
```

Execute custom specs with the same packaged config:

```bash
pnpm exec jest --config node_modules/@lit-protocol/e2e/jest.e2e.package.config.cjs qa-epoch.spec.ts
```

## Bundled APIs

## Optional Local Scaffolding

Prefer to maintain project-local configs? Let the CLI create them for you:

```bash
pnpm exec lit-e2e init
```

This generates:

- `jest.e2e.local.cjs` – a wrapper that runs the packaged suite and your own specs
- `babel.config.cjs` – delegates to the package’s Babel presets

Update your Jest scripts to reference `jest.e2e.local.cjs` if you take this route.

Key exports now available from the package:

- `init(network?, logLevel?)` – prepares Lit Client, Auth Manager, PKPs, and funded accounts across local or live environments.
- `createShivaClient(litClient, { baseUrl, testnetId?, createRequest? })` – talks to the Shiva testnet manager (epoch transitions, node control, epoch inspection helpers).
- Auth context helpers (EOA, PKP, Custom auth) under `@lit-protocol/e2e/helper/auth-contexts`.
- Payment funding utilities, PKP helpers, and assorted testing primitives.

Refer to the source under `packages/e2e/src/helper` for additional exported functions.

## Troubleshooting

- **Jest not found** – install it locally (`pnpm add -D jest`). The CLI wrapper will exit with a helpful message if the dependency is missing.
- **Missing signatures on naga-local** – provide `NAGA_LOCAL_CONTEXT_PATH` so the init routine calls `nagaLocal.withLocalContext`.
- **RPC connectivity** – when pointing at a private RPC, set `LIT_YELLOWSTONE_PRIVATE_RPC_URL` (dev/test/staging) or `LIT_MAINNET_RPC_URL` (naga-proto/naga) so the Lit Client bypasses defaults.

With these additions, QA can stay in sync with the canonical Lit Protocol E2E coverage while extending it with custom assertions tailored to fast-epoch or failure scenarios.
