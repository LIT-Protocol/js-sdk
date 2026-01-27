# @lit-protocol/artillery

Standalone Artillery load-testing package for Lit Protocol. Moved from `packages/e2e/artillery`.

Usage via root scripts remains the same, now pointing to `packages/artillery`.

# 🚀 Run Artillery tests

- LOG_LEVEL= `debug` | `info` | `silent` | `debug2` (raw console.log)
- NETWORK= `naga-dev` | `naga-staging` | `naga-test`
- LIVE_MASTER_ACCOUNT= `0x...` (required; set to `LIVE_MASTER_ACCOUNT_NAGA` or `LIVE_MASTER_ACCOUNT_NAGA_TEST` as needed)
- LIT_ACTION_CHILD_IPFS_ID= `Qm...` (optional; used by the sign-child Lit Action scenario)

## Setup Commands

### Initialise Artillery

**⭐️ Purpose**: Sets up accounts, balances, and authentication for testing

```bash
nx run artillery:init
```

### Check Balance Status

**⭐️ Purpose**: Check account balances before running tests

```bash
nx run artillery:balance-status
```

## Load Testing Commands

### PKP Sign Focused

**⭐️ Purpose**: Tests PKP signing functionality specifically

```bash
nx run artillery:pkp-sign
```

### Encrypt-Decrypt Focused

**⭐️ Purpose**: Tests encryption/decryption functionality

```bash
nx run artillery:encrypt-decrypt
```

### Execute Actions

**⭐️ Purpose**: Tests Lit Action execution functionality

```bash
nx run artillery:execute
```

### Mixed Workload

**⭐️ Purpose**: Tests a combination of different Lit Protocol operations

```bash
nx run artillery:mix
```

### Sign Session Key

**⭐️ Purpose**: Tests session key signing functionality

```bash
nx run artillery:sign-session-key
```

## Gen3 Reference Configs

These mirror the run configs captured in `.tom/task-load-test/context/gen3-network-testing.pdf`.

### PKP Sign

```bash
nx run artillery:pkp-sign-gen3-60
nx run artillery:pkp-sign-gen3-80
nx run artillery:pkp-sign-gen3-120
```

### Encrypt-Decrypt

```bash
nx run artillery:encrypt-decrypt-gen3-70
nx run artillery:encrypt-decrypt-gen3-150
```

### Sign Session Key

```bash
nx run artillery:sign-session-key-gen3-50
nx run artillery:sign-session-key-gen3-60
```

### Execute JS

```bash
nx run artillery:execute-gen3-60
nx run artillery:execute-gen3-100
```

> ℹ️ Gen3 often ran multiple Artillery instances in parallel (x2/x3) to reach total vusers/s. Repeat the same config on multiple hosts to match those totals.

> ℹ️ Execute JS Gen3 configs default to the `sign` variant. Switch the `variant` in the YAML to run other Lit Action scenarios.

## Benchmark Template

Use `packages/artillery/benchmark-template.md` to capture consistent run metadata and results.

## (Optional) Generating a report

Generating a report required an API key, you can add that to the root `.env` file. You can find your key at [https://app.artillery.io/](https://app.artillery.io/oivpr8dw4i00f)

```bash
ARTILLERY_KEY=xxx
```

> ℹ️ The Nx run targets pass `ARTILLERY_KEY` to `artillery run` via `--key`, so no extra flags are needed when running the scripts.
