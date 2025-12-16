/**
 * Naga Health Check Runner
 *
 * This is the main entry point for running health checks on Naga networks.
 * It initializes the environment, runs all endpoint tests, and logs results
 * to the Lit Status backend for monitoring.
 *
 * Environment Variables Required:
 * - NETWORK: The network to test (naga-dev or naga-test)
 * - LIVE_MASTER_ACCOUNT: Private key of the master funding account
 * - LIT_STATUS_BACKEND_URL: URL of the status backend
 * - LIT_STATUS_WRITE_KEY: API key for writing to status backend
 *
 * Optional:
 * - LOG_LEVEL: Logging verbosity (silent, info, debug)
 * - LIT_YELLOWSTONE_PRIVATE_RPC_URL: Override RPC URL
 *
 * Usage:
 *   NETWORK=naga-dev pnpm run ci:health
 *   NETWORK=naga-test pnpm run test:health
 */

import { initHealthCheck } from './health-init';
import { NagaHealthManager } from './NagaHealthManager';

// Configuration from environment
const NETWORK = process.env['NETWORK'];
const PRODUCT = 'js-sdk/naga';

/**
 * Validate required environment variables
 */
function validateEnvironment(): void {
  console.log('🔍 Environment Variables:');
  console.log('  NETWORK:', process.env['NETWORK']);
  console.log(
    '  LIT_STATUS_BACKEND_URL:',
    process.env['LIT_STATUS_BACKEND_URL']
  );
  console.log(
    '  LIT_STATUS_WRITE_KEY:',
    process.env['LIT_STATUS_WRITE_KEY'] ? '[SET]' : '[NOT SET]'
  );
  console.log(
    '  LIVE_MASTER_ACCOUNT:',
    process.env['LIVE_MASTER_ACCOUNT'] ? '[SET]' : '[NOT SET]'
  );

  if (!NETWORK) {
    throw new Error('❌ NETWORK environment variable is not set');
  }

  if (!process.env['LIT_STATUS_BACKEND_URL']) {
    throw new Error(
      '❌ LIT_STATUS_BACKEND_URL environment variable is not set'
    );
  }

  if (!process.env['LIT_STATUS_WRITE_KEY']) {
    throw new Error('❌ LIT_STATUS_WRITE_KEY environment variable is not set');
  }

  if (!process.env['LIVE_MASTER_ACCOUNT']) {
    throw new Error('❌ LIVE_MASTER_ACCOUNT environment variable is not set');
  }

  console.log('✅ All required environment variables are set\n');
}

/**
 * Main health check execution
 */
async function runHealthCheck(): Promise<void> {
  // Validate environment
  validateEnvironment();

  console.log('═══════════════════════════════════════');
  console.log('🏥 Naga Health Check Starting');
  console.log('═══════════════════════════════════════');
  console.log(`Network: ${NETWORK}`);
  console.log(`Product: ${PRODUCT}`);
  console.log(`Time: ${new Date().toISOString()}\n`);

  // Initialize Lit Status Client (dynamic import for ESM compatibility)
  const { createLitStatusClient } = await import(
    '@lit-protocol/lit-status-sdk'
  );
  const statusClient = createLitStatusClient({
    url: process.env['LIT_STATUS_BACKEND_URL']!,
    apiKey: process.env['LIT_STATUS_WRITE_KEY']!,
  });

  console.log('✅ Lit Status Client initialized\n');

  // Register or get function IDs for tracking
  console.log('📝 Registering health check functions...');
  const txs = await statusClient.getOrRegisterFunctions({
    network: NETWORK!,
    product: PRODUCT,
    functions: [
      'handshake',
      'pkpSign',
      'signSessionKey',
      'executeJs',
      'decrypt',
      'wrappedKeys',
    ] as const,
  });

  console.log('✅ Functions registered\n');

  // Initialize health check environment
  console.log('🚀 Initializing health check environment...');
  console.log('───────────────────────────────────────');
  const ctx = await initHealthCheck();
  console.log('───────────────────────────────────────\n');

  // Create health manager
  const healthManager = new NagaHealthManager(ctx);

  // Run tests and log results
  console.log('🧪 Running Health Check Tests');
  console.log('═══════════════════════════════════════\n');

  // Test 1: Handshake
  console.log('1️⃣  Testing: Handshake');
  await statusClient.executeAndLog(
    txs.handshake.id,
    healthManager.handshakeTest
  );
  console.log('');

  // Test 2: PKP Sign
  console.log('2️⃣  Testing: PKP Sign');
  await statusClient.executeAndLog(txs.pkpSign.id, healthManager.pkpSignTest);
  console.log('');

  // Test 3: Sign Session Key
  console.log('3️⃣  Testing: Sign Session Key');
  await statusClient.executeAndLog(
    txs.signSessionKey.id,
    healthManager.signSessionKeyTest
  );
  console.log('');

  // Test 4: Execute JS
  console.log('4️⃣  Testing: Execute JS (Lit Actions)');
  await statusClient.executeAndLog(
    txs.executeJs.id,
    healthManager.executeJsTest
  );
  console.log('');

  // Test 5: Decrypt
  console.log('5️⃣  Testing: Encrypt/Decrypt');
  await statusClient.executeAndLog(txs.decrypt.id, healthManager.decryptTest);
  console.log('');

  // Test 6: Wrapped Keys
  console.log('6️⃣  Testing: Wrapped Keys Service');
  await statusClient.executeAndLog(
    txs.wrappedKeys.id,
    healthManager.wrappedKeysTest
  );
  console.log('');

  console.log('═══════════════════════════════════════');
  console.log('✅ Health Check Completed Successfully');
  console.log('═══════════════════════════════════════');
  console.log(`Network: ${NETWORK}`);
  console.log(`Time: ${new Date().toISOString()}`);
  console.log('All 6 endpoint tests passed ✨\n');
}

/**
 * Entry point with error handling
 */
(async () => {
  try {
    await runHealthCheck();
    process.exit(0);
  } catch (error) {
    console.error('\n═══════════════════════════════════════');
    console.error('❌ Health Check Failed');
    console.error('═══════════════════════════════════════');
    console.error('Error:', error);
    console.error('Network:', NETWORK);
    console.error('Time:', new Date().toISOString());
    console.error('═══════════════════════════════════════\n');
    process.exit(1);
  }
})();
