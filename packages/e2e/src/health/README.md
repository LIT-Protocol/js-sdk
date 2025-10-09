# Naga Health Checks

This directory contains the health check system for Naga networks. Health checks run automatically every 5 minutes to monitor the status of critical Lit Protocol endpoints.

## 🎯 Purpose

The health check system verifies that core Lit Protocol functionality is operational by testing key endpoints:

1. **Handshake** - Basic node connectivity
2. **PKP Sign** - PKP signing functionality
3. **Sign Session Key** - Session key signing for PKP authentication
4. **Execute JS** - Lit Actions execution
5. **Decrypt** - Encryption and decryption flow

Results are automatically logged to the Lit Status backend for monitoring and alerting.

## 📁 File Structure

```
health/
├── README.md              # This file
├── health-init.ts         # Lightweight initialization with minimal chain interactions
├── NagaHealthManager.ts   # Health check test implementations
└── index.ts              # Main runner with lit-status-sdk integration
```

## 🏗️ Architecture

### Design Philosophy

The health check system is designed to be:

- **Lightweight**: Minimal chain interactions to reduce overhead
- **Fast**: Quick execution for frequent monitoring (every 5 minutes)
- **Reliable**: Single person setup reduces points of failure
- **Standalone**: Separate from e2e tests to avoid interference

### How It Works

1. **Initialization** (`health-init.ts`):
   - Creates a single test account (Alice)
   - Funds it with minimal amount
   - Creates one PKP
   - Sets up EOA auth context
   - No Bob, Eve, or complex multi-account setup

2. **Test Execution** (`NagaHealthManager.ts`):
   - Reuses the same Alice account and auth context
   - Tests each endpoint sequentially
   - Throws errors on failures for proper error tracking

3. **Logging** (`index.ts`):
   - Integrates with `@lit-protocol/lit-status-sdk`
   - Logs test results to status backend
   - Provides detailed console output

## 🚀 Usage

### Local Testing

Test health checks locally before deploying:

```bash
# Set up environment variables in .env
NETWORK=naga-dev
LIVE_MASTER_ACCOUNT=0x...
LIT_STATUS_BACKEND_URL=https://status.litprotocol.com
LIT_STATUS_WRITE_KEY=your-api-key

# Run health check
pnpm run test:health
```

### CI/CD Testing

Health checks run automatically via GitHub Actions:

```bash
# Runs without .env file (uses GitHub secrets)
pnpm run ci:health
```

### Manual GitHub Workflow Trigger

You can manually trigger health checks from GitHub:

1. Go to Actions → Naga Health Checks
2. Click "Run workflow"
3. Select branch (default: `naga`)
4. (Optional) Select specific network or leave empty for all
5. Click "Run workflow"

## 🔧 Configuration

### Environment Variables

**Required:**

- `NETWORK` - Network to test (`naga-dev` or `naga-test`)
- `LIVE_MASTER_ACCOUNT` - Private key for funding test accounts
- `LIT_STATUS_BACKEND_URL` - URL of the status monitoring backend
- `LIT_STATUS_WRITE_KEY` - API key for writing status updates

**Optional:**

- `LOG_LEVEL` - Logging verbosity (`silent`, `info`, `debug`) - default: `silent`
- `LIT_YELLOWSTONE_PRIVATE_RPC_URL` - Override RPC URL if needed

### GitHub Secrets

Configure these in your repository settings under `Settings → Secrets and variables → Actions`:

**Secrets:**
- `LIT_STATUS_WRITE_KEY` - API key for status backend
- `LIVE_MASTER_ACCOUNT_NAGA_DEV` - Funding account for naga-dev
- `LIVE_MASTER_ACCOUNT_NAGA_TEST` - Funding account for naga-test

**Variables:**
- `LIT_STATUS_BACKEND_URL` - Status backend URL
- `LIT_YELLOWSTONE_PRIVATE_RPC_URL` - (Optional) Custom RPC URL

Environment: `Health Check` (create this environment in repository settings)

## 📊 Monitoring

### Status Dashboard

View health check results at the Lit Status dashboard:
- URL: Configured via `LIT_STATUS_BACKEND_URL`
- Shows success/failure rates
- Tracks response times
- Provides historical data

### GitHub Actions

Monitor workflow runs:
- Go to `Actions → Naga Health Checks`
- View recent runs and their status
- Check logs for detailed error messages

## 🔍 Troubleshooting

### Health Check Failures

If health checks fail:

1. **Check the logs** - GitHub Actions logs show which test failed
2. **Verify network status** - Is the network operational?
3. **Check balances** - Does the master account have sufficient funds?
4. **Validate secrets** - Are GitHub secrets configured correctly?

### Common Issues

**Error: "NETWORK environment variable is not set"**
- Solution: Ensure `NETWORK` is set in the workflow or .env file

**Error: "LIVE_MASTER_ACCOUNT is not set"**
- Solution: Check that the appropriate secret is configured in GitHub

**Error: "Failed to get network information"**
- Solution: Network may be down or unreachable. Check node status.

**Error: "Insufficient funds"**
- Solution: Fund the master account with more tokens

## 🧪 Testing Locally

To test the health check system locally:

```bash
# 1. Build the project
pnpm build

# 2. Set up .env file with required variables
cat > .env << EOF
NETWORK=naga-dev
LIVE_MASTER_ACCOUNT=0x...your-key...
LIT_STATUS_BACKEND_URL=https://status.litprotocol.com
LIT_STATUS_WRITE_KEY=your-api-key
LOG_LEVEL=info
EOF

# 3. Run health check
pnpm run test:health

# 4. Check output for success/failure
```

## 📝 Adding New Tests

To add a new health check test:

1. **Add test method to `NagaHealthManager.ts`**:
```typescript
myNewTest = async (): Promise<void> => {
  try {
    // Your test logic here
    console.log('✅ My new test passed');
  } catch (e) {
    console.error('❌ My new test failed:', e);
    throw e;
  }
};
```

2. **Register function in `index.ts`**:
```typescript
const txs = await statusClient.getOrRegisterFunctions({
  network: NETWORK!,
  product: PRODUCT,
  functions: [
    'handshake',
    'pkpSign',
    'signSessionKey',
    'executeJs',
    'decrypt',
    'myNewTest', // Add here
  ] as const,
});
```

3. **Execute test in `index.ts`**:
```typescript
console.log('6️⃣  Testing: My New Test');
await statusClient.executeAndLog(
  txs.myNewTest.id,
  healthManager.myNewTest
);
```

## 🔐 Security Considerations

- **Private Keys**: Never commit private keys. Use GitHub secrets.
- **API Keys**: Status write keys should be kept secret.
- **Funding Accounts**: Monitor balance and limit exposure.
- **RPC URLs**: Private RPC URLs should not be logged or exposed.

## 📚 Related Documentation

- [E2E Testing Guide](../README.md)
- [Lit Status SDK](https://www.npmjs.com/package/@lit-protocol/lit-status-sdk)
- [GitHub Actions Workflows](../../../../.github/workflows/)

## 🤝 Contributing

When modifying health checks:

1. Test locally first
2. Ensure all tests pass
3. Update this README if adding features
4. Document any new environment variables
5. Update GitHub secrets/variables if needed

## 📧 Support

For issues or questions:
- Create an issue in the repository
- Contact the Lit Protocol team
- Check the status dashboard for network-wide issues

