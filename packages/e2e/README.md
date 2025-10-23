# @lit-protocol/e2e

Utilities and ready-made specs for Lit Protocol end-to-end testing. This package now ships the canonical Jest suite we run in-repo, plus helpers (state initialisers, Shiva client, etc.) so QA teams can execute the same coverage or layer on additional `.spec.ts` files without cloning this repository.

## Installation

```bash
pnpm add -D jest @lit-protocol/e2e @lit-protocol/lit-client @lit-protocol/networks viem
```

> The package depends on `jest` being available in the consumer workspace. Install any additional peer dependencies (for example `ts-node` if you prefer to author specs in TypeScript directly).

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
NAGA_LOCAL_CONTEXT_NAME=naga-develop
LIT_YELLOWSTONE_PRIVATE_RPC_URL=http://127.0.0.1:8545
```

Make sure the referenced network (local Naga cluster, Shiva-managed testnet, or live subnet) is running and reachable from your test machine.

## Run the Bundled Suite

The published package contains the compiled `e2e.spec.ts`. You can execute it either through the provided CLI or by calling Jest directly:

```bash
# Preferred: CLI wrapper injects the packaged config automatically
npx lit-e2e

# Equivalent manual invocation
npx jest \
  --config node_modules/@lit-protocol/e2e/dist/jest.e2e.package.config.cjs \
  node_modules/@lit-protocol/e2e/dist/specs/e2e.spec.js
```

Both commands honour additional Jest flags (e.g. `--runInBand`, `--verbose`), so you can tailor runs to your infrastructure.

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
    const after = await shiva.waitForEpochChange({ baselineEpoch: before.epoch });

    expect(after.epoch).not.toEqual(before.epoch);
  });
});
```

Execute custom specs with the same packaged config:

```bash
npx jest --config node_modules/@lit-protocol/e2e/dist/jest.e2e.package.config.cjs qa-epoch.spec.ts
```

## Bundled APIs

Key exports now available from the package:

- `init(network?, logLevel?)` – prepares Lit Client, Auth Manager, PKPs, and funded accounts across local or live environments.
- `createShivaClient(litClient, { baseUrl, testnetId?, createRequest? })` – talks to the Shiva testnet manager (epoch transitions, node control, epoch inspection helpers).
- Auth context helpers (EOA, PKP, Custom auth) under `@lit-protocol/e2e/helper/auth-contexts`.
- Payment funding utilities, PKP helpers, and assorted testing primitives.

Refer to the source under `packages/e2e/src/helper` for additional exported functions.

## Troubleshooting

- **Jest not found** – install it locally (`pnpm add -D jest`). The CLI wrapper will exit with a helpful message if the dependency is missing.
- **Missing signatures on naga-local** – provide `NAGA_LOCAL_CONTEXT_PATH` and optional `NAGA_LOCAL_CONTEXT_NAME` so the init routine calls `nagaLocal.withLocalContext`.
- **RPC connectivity** – when pointing at a private RPC, set `LIT_YELLOWSTONE_PRIVATE_RPC_URL` so the Lit Client bypasses defaults.

With these additions, QA can stay in sync with the canonical Lit Protocol E2E coverage while extending it with custom assertions tailored to fast-epoch or failure scenarios.
