# @litprotocol/e2e

A comprehensive end-to-end testing package for Lit Protocol integrations. This package allows you to programmatically run the full suite of Lit Protocol tests across different authentication methods and network configurations.

## Installation

```bash
pnpm add @litprotocol/e2e
```

## Environment Variables

**Required** - Set these environment variables before running tests:

```bash
# For live networks (naga-dev, naga-staging)
LIVE_MASTER_ACCOUNT=0x...

# For local network (naga-local)
LOCAL_MASTER_ACCOUNT=0x...

# Optional - can also be passed as parameters
NETWORK=naga-dev
LOG_LEVEL=info
```

## Quick Start

```typescript
import { runLitE2eTests } from '@litprotocol/e2e';

// Run all tests on naga-dev network
const results = await runLitE2eTests({
  network: 'naga-dev',
});

console.log(`Tests completed: ${results.passed}/${results.totalTests} passed`);
```

## Configuration Options

```typescript
const results = await runLitE2eTests({
  network: 'naga-dev', // Required: 'naga-dev' | 'naga-local' | 'naga-staging'
  logLevel: 'info', // Optional: 'silent' | 'info' | 'debug'
  testTimeout: 30000, // Optional: timeout per test in milliseconds
  selectedTests: [
    // Optional: run specific tests only
    'pkpSign',
    'executeJs',
    'viemSignMessage',
  ],
});
```

## Available Tests

### Endpoint Tests

- `pkpSign` - PKP signing functionality
- `executeJs` - Lit Actions execution
- `viewPKPsByAddress` - PKP lookup by address
- `viewPKPsByAuthData` - PKP lookup by auth data
- `pkpEncryptDecrypt` - PKP-based encryption/decryption
- `encryptDecryptFlow` - Full encryption/decryption workflow
- `pkpPermissionsManagerFlow` - PKP permissions management
- `eoaNativeAuthFlow` - EOA native authentication and PKP minting

### Integration Tests

- `viemSignMessage` - Viem integration for message signing
- `viemSignTransaction` - Viem integration for transaction signing
- `viemSignTypedData` - Viem integration for typed data signing

## Test Results

```typescript
const results = await runLitE2eTests({ network: 'naga-dev' });

console.log(`Total: ${results.totalTests}`);
console.log(`Passed: ${results.passed}`);
console.log(`Failed: ${results.failed}`);
console.log(`Duration: ${results.duration}ms`);

// Check for failures
if (results.failed > 0) {
  const failedTests = results.results.filter((r) => r.status === 'failed');
  failedTests.forEach((test) => {
    console.log(`Failed: ${test.name} - ${test.error}`);
  });
}
```

## Examples

See `example.js` for detailed usage examples.

## Networks

- **naga-dev** - Development network (requires LIVE_MASTER_ACCOUNT)
- **naga-local** - Local development network (requires LOCAL_MASTER_ACCOUNT)
- **naga-staging** - Staging network (requires LIVE_MASTER_ACCOUNT)

## License
