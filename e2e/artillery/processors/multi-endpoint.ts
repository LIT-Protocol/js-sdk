/**
 * ====================================
 * Artillery Multi-Endpoint Processor
 * ====================================
 *
 * This processor leverages the existing e2e test infrastructure to run
 * performance tests across multiple endpoints and authentication methods.
 *
 * Usage: Set NETWORK and LOG_LEVEL environment variables before running:
 * LOG_LEVEL=silent NETWORK=naga-dev bun run artillery:load
 */

// Load environment variables from .env file using dotenvx
import { config } from '@dotenvx/dotenvx';

// Load .env file from project root
config({ path: '.env' });

import { init } from '../../../e2e/src/init';
import {
  createCustomAuthContext,
  createPkpAuthContext,
} from '../../../e2e/src/helper/auth-contexts';
import {
  createExecuteJsTest,
  createPkpSignTest,
  createPkpEncryptDecryptTest,
  createEncryptDecryptFlowTest,
  createPkpPermissionsManagerFlowTest,
  createViemSignMessageTest,
  createViemSignTransactionTest,
  createViemSignTypedDataTest,
  createViewPKPsByAddressTest,
  createViewPKPsByAuthDataTest,
} from '../../../e2e/src/helper/tests/index';

// Shared context - singleton pattern following the e2e tests
let sharedContext: any = null;
let alicePkpAuthContext: any = null;
let aliceCustomAuthContext: any = null;

/**
 * Initialize the shared context once per Artillery run
 */
async function initializeSharedContext() {
  if (sharedContext) return sharedContext;

  try {
    console.log('🚀 Initializing Artillery shared context...');

    // Use the same init function as e2e tests
    sharedContext = await init();

    // Create auth contexts using helper functions
    alicePkpAuthContext = await createPkpAuthContext(sharedContext);
    aliceCustomAuthContext = await createCustomAuthContext(sharedContext);

    console.log('✅ Artillery shared context initialized');
    return sharedContext;
  } catch (error) {
    console.error('❌ Failed to initialize Artillery context:', error);
    throw error;
  }
}

/**
 * Get authentication context based on type
 */
function getAuthContext(authType = 'eoa') {
  switch (authType) {
    case 'eoa':
      return () => sharedContext.aliceEoaAuthContext;
    case 'pkp':
      return () => alicePkpAuthContext;
    case 'custom':
      return () => aliceCustomAuthContext;
    default:
      return () => sharedContext.aliceEoaAuthContext;
  }
}

/**
 * Run test with metrics collection
 */
async function runTestWithMetrics(
  testName: string,
  testFunction: () => Promise<any>,
  context: any,
  events: any,
  parallelism = 1
) {
  const testPromises = Array.from({ length: parallelism }).map(
    async (_, index) => {
      const startTime = Date.now();

      try {
        await testFunction();
        const duration = Date.now() - startTime;

        events.emit('counter', `${testName}_success`, 1);
        events.emit('histogram', `${testName}_duration`, duration);

        return { success: true, duration };
      } catch (error: unknown) {
        const duration = Date.now() - startTime;

        const errorMessage =
          error instanceof Error ? error.message : String(error);
        console.error(
          `❌ ${testName} failed (attempt ${index + 1}):`,
          errorMessage
        );
        events.emit('counter', `${testName}_failure`, 1);
        events.emit('histogram', `${testName}_error_duration`, duration);

        return { success: false, duration, error: errorMessage };
      }
    }
  );

  const results = await Promise.all(testPromises);
  const successCount = results.filter((r) => r.success).length;
  const totalDuration = results.reduce((sum, r) => sum + r.duration, 0);
  const avgDuration = totalDuration / results.length;

  console.log(
    `📊 ${testName}: ${successCount}/${parallelism} success, avg: ${avgDuration.toFixed(
      2
    )}ms`
  );

  return results;
}

/**
 * Multi-endpoint test function for smoke tests
 */
export async function runMultiEndpointTest(context: any, events: any) {
  await initializeSharedContext();

  const parallelism = context.vars.parallelism || 1;
  const authContext = getAuthContext('eoa');

  // Run a subset of tests for smoke testing
  const tests = [
    {
      name: 'pkp_sign',
      fn: createPkpSignTest(sharedContext, authContext),
    },
    {
      name: 'encrypt_decrypt',
      fn: createPkpEncryptDecryptTest(sharedContext, authContext),
    },
    {
      name: 'view_pkps_by_address',
      fn: createViewPKPsByAddressTest(sharedContext, authContext),
    },
  ];

  // Run tests sequentially to avoid overwhelming the system during smoke tests
  for (const test of tests) {
    await runTestWithMetrics(test.name, test.fn, context, events, 1);
  }
}

/**
 * PKP Sign test functions
 */
export async function runPkpSignTest(context, events) {
  await initializeSharedContext();

  const parallelism = context.vars.parallelism || 5;
  const authContext = getAuthContext('eoa');
  const testFn = createPkpSignTest(sharedContext, authContext);

  await runTestWithMetrics('pkp_sign', testFn, context, events, parallelism);
}

export async function runPkpSignTestWithEoa(context, events) {
  await initializeSharedContext();

  const parallelism = context.vars.parallelism || 5;
  const authContext = getAuthContext('eoa');
  const testFn = createPkpSignTest(sharedContext, authContext);

  await runTestWithMetrics(
    'pkp_sign_eoa',
    testFn,
    context,
    events,
    parallelism
  );
}

export async function runPkpSignTestWithPkp(context, events) {
  await initializeSharedContext();

  const parallelism = context.vars.parallelism || 5;
  const authContext = getAuthContext('pkp');
  const testFn = createPkpSignTest(sharedContext, authContext);

  await runTestWithMetrics(
    'pkp_sign_pkp',
    testFn,
    context,
    events,
    parallelism
  );
}

export async function runPkpSignTestWithCustom(context, events) {
  await initializeSharedContext();

  const parallelism = context.vars.parallelism || 5;
  const authContext = getAuthContext('custom');
  const testFn = createPkpSignTest(sharedContext, authContext);

  await runTestWithMetrics(
    'pkp_sign_custom',
    testFn,
    context,
    events,
    parallelism
  );
}

/**
 * Encrypt/Decrypt test functions
 */
export async function runEncryptDecryptTest(context, events) {
  await initializeSharedContext();

  const parallelism = context.vars.parallelism || 3;
  const authContext = getAuthContext('eoa');
  const testFn = createPkpEncryptDecryptTest(sharedContext, authContext);

  await runTestWithMetrics(
    'encrypt_decrypt',
    testFn,
    context,
    events,
    parallelism
  );
}

export async function runPkpEncryptDecryptTest(context, events) {
  await initializeSharedContext();

  const parallelism = context.vars.parallelism || 3;
  const authContext = getAuthContext('eoa');
  const testFn = createPkpEncryptDecryptTest(sharedContext, authContext);

  await runTestWithMetrics(
    'pkp_encrypt_decrypt',
    testFn,
    context,
    events,
    parallelism
  );
}

export async function runEncryptDecryptFlowTest(context, events) {
  await initializeSharedContext();

  const parallelism = context.vars.parallelism || 3;
  const authContext = getAuthContext('eoa');
  const testFn = createEncryptDecryptFlowTest(sharedContext, authContext);

  await runTestWithMetrics(
    'encrypt_decrypt_flow',
    testFn,
    context,
    events,
    parallelism
  );
}

/**
 * Execute JS test function
 */
export async function runExecuteJsTest(context, events) {
  await initializeSharedContext();

  const parallelism = context.vars.parallelism || 4;
  const authContext = getAuthContext('eoa');
  const testFn = createExecuteJsTest(sharedContext, authContext);

  await runTestWithMetrics('execute_js', testFn, context, events, parallelism);
}

/**
 * View PKPs test functions
 */
export async function runViewPkpsTest(context, events) {
  await initializeSharedContext();

  const parallelism = context.vars.parallelism || 5;
  const authContext = getAuthContext('eoa');

  // Alternate between different view methods
  const viewByAddress = createViewPKPsByAddressTest(sharedContext, authContext);
  const viewByAuthData = createViewPKPsByAuthDataTest(
    sharedContext,
    authContext
  );

  await Promise.all([
    runTestWithMetrics(
      'view_pkps_by_address',
      viewByAddress,
      context,
      events,
      Math.ceil(parallelism / 2)
    ),
    runTestWithMetrics(
      'view_pkps_by_auth_data',
      viewByAuthData,
      context,
      events,
      Math.floor(parallelism / 2)
    ),
  ]);
}

/**
 * Viem integration test functions
 */
export async function runViemSignTest(context, events) {
  await initializeSharedContext();

  const parallelism = context.vars.parallelism || 3;
  const authContext = getAuthContext('eoa');

  const signMessage = createViemSignMessageTest(sharedContext, authContext);
  const signTransaction = createViemSignTransactionTest(
    sharedContext,
    authContext
  );
  const signTypedData = createViemSignTypedDataTest(sharedContext, authContext);

  await Promise.all([
    runTestWithMetrics(
      'viem_sign_message',
      signMessage,
      context,
      events,
      Math.ceil(parallelism / 3)
    ),
    runTestWithMetrics(
      'viem_sign_transaction',
      signTransaction,
      context,
      events,
      Math.ceil(parallelism / 3)
    ),
    runTestWithMetrics(
      'viem_sign_typed_data',
      signTypedData,
      context,
      events,
      Math.floor(parallelism / 3)
    ),
  ]);
}
