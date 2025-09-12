# 🚀 Run Artillery tests

- LOG_LEVEL= `debug` | `info` | `silent` | `debug2` (raw console.log)
- NETWORK= `naga-dev` | `naga-staging`

### Basic functionality verification

**⭐️ Purpose**: Basic sanity check

- **Users**: 3 people max, 1 new user every minute
- **Duration**: 30 seconds
- **Tests**: All main functions once
- **When to use**: Before releasing code, quick health check, "did I break anything?"

```jsx
LOG_LEVEL=silent NETWORK=naga-dev bun run artillery:smoke
```

### Normal traffic simulation

**⭐️ Purpose**: Simulates typical everyday usage

- **Users**: 30 people max, 10 new users per second during peak
- **Duration**: 5 minutes total (1min ramp up, 3min steady, 1min ramp down)
- **Tests**: All functions with realistic ratios (40% signing, 30% encryption, 20% JS execution, 10% viewing)
- **When to use**: "Will this handle our normal traffic?"

```jsx
LOG_LEVEL=silent NETWORK=naga-dev bun run artillery:load
```

### Find breaking points

**⭐️ Purpose**: Pushes system beyond normal limits to find where it breaks

- **Users**: 200 people max, up to 50 new users per second
- **Duration**: 11 minutes of gradually increasing pressure
- **Tests**: Same mix as load test but much more intense
- **When to use**: "How much traffic can we handle before things go wrong?"

```jsx
LOG_LEVEL=silent NETWORK=naga-dev bun run artillery:stress
```

### Test traffic spikes

**⭐️ Purpose**: Sudden traffic bursts (like when your app goes viral)

- **Users**: 400 people max during spikes, jumps from 2 to 150 users/second instantly
- **Duration**: 6 minutes with two sudden traffic spikes
- **Tests**: Focuses on signing and encryption (most critical functions)
- **When to use**: "What happens if we suddenly get 100x more traffic?"

```jsx
LOG_LEVEL=silent NETWORK=naga-dev bun run artillery:spike
```

### PKP Sign Focused

**⭐️ Purpose**: Hammers the PKP signing functionality specifically

- **Users**: 50 people max, 15 new users per second during peak
- **Duration**: 7 minutes with sustained high signing load
- **Tests**: ONLY PKP signing with different authentication methods
- **When to use**: "Is our signing service robust enough for heavy use?"

```jsx
LOG_LEVEL=silent NETWORK=naga-dev bun run artillery:pkp-sign
```

### Encrypt-Decrypt Focused

**⭐️ Purpose**: Hammers encryption/decryption functionality specifically

- **Users**: 30 people max, 8 new users per second during peak
- **Duration**: 6 minutes of sustained encryption/decryption
- **Tests**: ONLY encryption and decryption functions
- **When to use**: "Can our encryption handle lots of data processing?"

```jsx
LOG_LEVEL=silent NETWORK=naga-dev bun run artillery:encrypt-decrypt
```

## (Optional) Generating a report

Generating a report required an API key, you can add that to the root `.env` file. You can find your key at [https://app.artillery.io/](https://app.artillery.io/oivpr8dw4i00f)

```jsx
ARTILLERY_KEY = xxx;
```
