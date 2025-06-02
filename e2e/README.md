# @litprotocol/e2e

A comprehensive end-to-end testing package for Lit Protocol integrations. This package allows you to programmatically run the full suite of Lit Protocol tests across different authentication methods and network configurations.

## Installation

```bash
bun install @litprotocol/e2e
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
  network: 'naga-dev'
});

console.log(`Tests completed: ${results.passed}/${results.totalTests} passed`);
```

## Configuration Options

```typescript
const results = await runLitE2eTests({
  network: 'naga-dev',           // Required: 'naga-dev' | 'naga-local' | 'naga-staging'
  logLevel: 'info',              // Optional: 'silent' | 'info' | 'debug'
  testTimeout: 30000,            // Optional: timeout per test in milliseconds
  selectedTests: [               // Optional: run specific tests only
    'pkpSign',
    'executeJs',
    'viemSignMessage'
  ],
  callback: ({testName, testResult}) => {  // Optional: callback for each test completion
    console.log(`Test ${testName} completed with status: ${testResult.status}`);
  }
});
```

## Callback Functionality

You can provide a callback function to receive real-time updates as each test completes:

```typescript
const testResults = [];

const results = await runLitE2eTests({
  network: 'naga-dev',
  logLevel: 'info',
  selectedTests: ['pkpSign', 'executeJs', 'viemSignMessage'],
  callback: ({testName, testResult}) => {
    console.log(`📝 Test "${testName}" completed`);
    console.log(`   Status: ${testResult.status}`);
    console.log(`   Duration: ${testResult.duration}ms`);
    console.log(`   Auth Context: ${testResult.authContext}`);
    console.log(`   Category: ${testResult.category}`);
    
    if (testResult.status === 'failed') {
      console.log(`   Error: ${testResult.error}`);
    }
    
    // Store for further processing
    testResults.push({
      name: testName,
      ...testResult
    });
  }
});

// Process collected results
const failedTests = testResults.filter(test => test.status === 'failed');
console.log(`Failed tests: ${failedTests.map(t => t.name).join(', ')}`);
```

### Callback Parameters

The callback function receives an object with:
- `testName` (string) - Name of the completed test
- `testResult` (TestResult) - Complete test result object

### TestResult Object

```typescript
interface TestResult {
  name: string;                    // Test name
  authContext: string;             // Authentication context used
  category: 'endpoints' | 'integrations';  // Test category
  status: 'passed' | 'failed' | 'skipped';  // Test status
  duration: number;                // Test duration in milliseconds
  error?: string;                  // Error message if failed
  details?: Record<string, any>;   // Additional test details
}
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
  const failedTests = results.results.filter(r => r.status === 'failed');
  failedTests.forEach(test => {
    console.log(`Failed: ${test.name} - ${test.error}`);
  });
}
```

## Examples

See `example.js` for detailed usage examples including callback functionality.

## Networks

- **naga-dev** - Development network (requires LIVE_MASTER_ACCOUNT)
- **naga-local** - Local development network (requires LOCAL_MASTER_ACCOUNT)
- **naga-staging** - Staging network (requires LIVE_MASTER_ACCOUNT)

## License

MIT 