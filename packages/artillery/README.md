# @lit-protocol/artillery

Standalone Artillery load-testing package for Lit Protocol. Moved from `packages/e2e/artillery`.

Usage via root scripts remains the same, now pointing to `packages/artillery`.

# 🚀 Run Artillery tests

- LOG_LEVEL= `debug` | `info` | `silent` | `debug2` (raw console.log)
- NETWORK= `naga-dev` | `naga-staging`

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

## (Optional) Generating a report

Generating a report required an API key, you can add that to the root `.env` file. You can find your key at [https://app.artillery.io/](https://app.artillery.io/oivpr8dw4i00f)

```jsx
ARTILLERY_KEY = xxx;
```
