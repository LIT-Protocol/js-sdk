/**
 * @file Lit Protocol E2E Testing Package
 * @description Provides programmatic access to run comprehensive E2E tests for Lit Protocol
 * @author Lit Protocol
 * @version 1.0.0
 *
 * Usage:
 * ```typescript
 * import { runLitE2eTests } from '@litprotocol/e2e';
 *
 * const results = await runLitE2eTests({
 *   network: 'naga-dev',
 *   logLevel: 'info',
 *   selectedTests: ['pkpSign', 'executeJs'], // optional: run specific tests
 *   callback: (result) => {
 *     if ('network' in result) {
 *       // Final results
 *       console.log('Final results:', result);
 *     } else {
 *       // Individual test result
 *       console.log(`Test ${result.name} ${result.status}:`, result);
 *     }
 *   }
 * });
 * ```
 */

import { z } from 'zod';
import { init } from './init';
import {
  createCustomAuthContext,
  createPkpAuthContext,
} from './helper/auth-contexts';
import {
  createExecuteJsTest,
  createPkpSignTest,
  createPkpEncryptDecryptTest,
  createEncryptDecryptFlowTest,
  createPkpPermissionsManagerFlowTest,
  createEoaNativeAuthFlowTest,
  createViemSignMessageTest,
  createViemSignTransactionTest,
  createViemSignTypedDataTest,
  createViewPKPsByAddressTest,
  createViewPKPsByAuthDataTest,
} from './helper/tests';

// Configuration constants
const SUPPORTED_NETWORKS = ['naga-dev', 'naga-local', 'naga-staging'] as const;
const LOG_LEVELS = ['silent', 'info', 'debug'] as const;
const AVAILABLE_TESTS = [
  'pkpSign',
  'executeJs',
  'viewPKPsByAddress',
  'viewPKPsByAuthData',
  'pkpEncryptDecrypt',
  'encryptDecryptFlow',
  'pkpPermissionsManagerFlow',
  'viemSignMessage',
  'viemSignTransaction',
  'viemSignTypedData',
  'eoaNativeAuthFlow',
] as const;

// Schemas and Types
const LogLevelSchema = z.enum(LOG_LEVELS);
const TestNameSchema = z.enum(AVAILABLE_TESTS);

export type SupportedNetwork = (typeof SUPPORTED_NETWORKS)[number];
export type LogLevel = z.infer<typeof LogLevelSchema>;
export type TestName = z.infer<typeof TestNameSchema>;

export interface E2ETestConfig {
  /** The network to run tests against */
  network: SupportedNetwork;
  /** Logging level for test output */
  logLevel?: LogLevel;
  /** Specific tests to run (if not provided, runs all tests) */
  selectedTests?: TestName[];
  /** Timeout for individual tests in milliseconds */
  testTimeout?: number;
  /** Callback function called after each test completes and at the end */
  callback?: (result: TestResult | E2ETestResults) => void;
}

export interface TestResult {
  name: string;
  authContext: string;
  category: 'endpoints' | 'integrations';
  status: 'passed' | 'failed' | 'skipped';
  duration: number;
  error?: string;
  details?: Record<string, any>;
}

export interface E2ETestResults {
  network: SupportedNetwork;
  totalTests: number;
  passed: number;
  failed: number;
  skipped: number;
  duration: number;
  results: TestResult[];
  summary: {
    eoaAuth: { passed: number; failed: number; skipped: number };
    pkpAuth: { passed: number; failed: number; skipped: number };
    customAuth: { passed: number; failed: number; skipped: number };
    eoaNative: { passed: number; failed: number; skipped: number };
  };
}

/**
 * Main function to run Lit Protocol E2E tests programmatically
 * @param config Configuration object for the test run
 * @param config.network The network to run tests against
 * @param config.logLevel Logging level for test output
 * @param config.selectedTests Specific tests to run (optional)
 * @param config.testTimeout Timeout for individual tests in milliseconds (optional)
 * @param config.callback Callback function called after each test and at the end (optional)
 * @returns Promise resolving to test results
 */
export async function runLitE2eTests(
  config: E2ETestConfig
): Promise<E2ETestResults> {
  const startTime = Date.now();
  const results: TestResult[] = [];

  // Validate configuration
  const validatedConfig = {
    network: config.network,
    logLevel: config.logLevel
      ? LogLevelSchema.parse(config.logLevel)
      : ('info' as LogLevel),
    selectedTests: config.selectedTests?.map((t) => TestNameSchema.parse(t)),
    testTimeout: config.testTimeout || 30000,
    callback: config.callback,
  };

  console.log(
    `🚀 Starting Lit Protocol E2E tests on network: ${validatedConfig.network}`
  );
  console.log(`📝 Log level: ${validatedConfig.logLevel}`);

  if (validatedConfig.selectedTests) {
    console.log(
      `🎯 Running selected tests: ${validatedConfig.selectedTests.join(', ')}`
    );
  } else {
    console.log(`🔄 Running all available tests`);
  }

  try {
    // Initialize the test context
    const ctx = await init(validatedConfig.network, validatedConfig.logLevel);

    // Create auth contexts
    const alicePkpAuthContext = await createPkpAuthContext(ctx);
    const aliceCustomAuthContext = await createCustomAuthContext(ctx);

    // Define test suites
    const testSuites = [
      {
        name: 'EOA Auth',
        authContext: () => ctx.aliceEoaAuthContext,
        authContextName: 'eoaAuth',
        tests: [
          {
            name: 'pkpSign',
            fn: createPkpSignTest,
            category: 'endpoints' as const,
          },
          {
            name: 'executeJs',
            fn: createExecuteJsTest,
            category: 'endpoints' as const,
          },
          {
            name: 'viewPKPsByAddress',
            fn: createViewPKPsByAddressTest,
            category: 'endpoints' as const,
          },
          {
            name: 'viewPKPsByAuthData',
            fn: createViewPKPsByAuthDataTest,
            category: 'endpoints' as const,
          },
          {
            name: 'pkpEncryptDecrypt',
            fn: createPkpEncryptDecryptTest,
            category: 'endpoints' as const,
          },
          {
            name: 'encryptDecryptFlow',
            fn: createEncryptDecryptFlowTest,
            category: 'endpoints' as const,
          },
          {
            name: 'pkpPermissionsManagerFlow',
            fn: createPkpPermissionsManagerFlowTest,
            category: 'endpoints' as const,
          },
          {
            name: 'viemSignMessage',
            fn: createViemSignMessageTest,
            category: 'integrations' as const,
          },
          {
            name: 'viemSignTransaction',
            fn: createViemSignTransactionTest,
            category: 'integrations' as const,
          },
          {
            name: 'viemSignTypedData',
            fn: createViemSignTypedDataTest,
            category: 'integrations' as const,
          },
        ],
      },
      {
        name: 'PKP Auth',
        authContext: () => alicePkpAuthContext,
        authContextName: 'pkpAuth',
        tests: [
          {
            name: 'pkpSign',
            fn: createPkpSignTest,
            category: 'endpoints' as const,
          },
          {
            name: 'executeJs',
            fn: createExecuteJsTest,
            category: 'endpoints' as const,
          },
          {
            name: 'viewPKPsByAddress',
            fn: createViewPKPsByAddressTest,
            category: 'endpoints' as const,
          },
          {
            name: 'viewPKPsByAuthData',
            fn: createViewPKPsByAuthDataTest,
            category: 'endpoints' as const,
          },
          {
            name: 'pkpEncryptDecrypt',
            fn: createPkpEncryptDecryptTest,
            category: 'endpoints' as const,
          },
          {
            name: 'encryptDecryptFlow',
            fn: createEncryptDecryptFlowTest,
            category: 'endpoints' as const,
          },
          {
            name: 'pkpPermissionsManagerFlow',
            fn: createPkpPermissionsManagerFlowTest,
            category: 'endpoints' as const,
          },
          {
            name: 'viemSignMessage',
            fn: createViemSignMessageTest,
            category: 'integrations' as const,
          },
          {
            name: 'viemSignTransaction',
            fn: createViemSignTransactionTest,
            category: 'integrations' as const,
          },
          {
            name: 'viemSignTypedData',
            fn: createViemSignTypedDataTest,
            category: 'integrations' as const,
          },
        ],
      },
      {
        name: 'Custom Auth',
        authContext: () => aliceCustomAuthContext,
        authContextName: 'customAuth',
        tests: [
          {
            name: 'pkpSign',
            fn: createPkpSignTest,
            category: 'endpoints' as const,
          },
          {
            name: 'executeJs',
            fn: createExecuteJsTest,
            category: 'endpoints' as const,
          },
          {
            name: 'viewPKPsByAddress',
            fn: createViewPKPsByAddressTest,
            category: 'endpoints' as const,
          },
          {
            name: 'viewPKPsByAuthData',
            fn: createViewPKPsByAuthDataTest,
            category: 'endpoints' as const,
          },
          {
            name: 'pkpEncryptDecrypt',
            fn: createPkpEncryptDecryptTest,
            category: 'endpoints' as const,
          },
          {
            name: 'encryptDecryptFlow',
            fn: createEncryptDecryptFlowTest,
            category: 'endpoints' as const,
          },
          {
            name: 'pkpPermissionsManagerFlow',
            fn: createPkpPermissionsManagerFlowTest,
            category: 'endpoints' as const,
          },
          {
            name: 'viemSignMessage',
            fn: createViemSignMessageTest,
            category: 'integrations' as const,
          },
          {
            name: 'viemSignTransaction',
            fn: createViemSignTransactionTest,
            category: 'integrations' as const,
          },
          {
            name: 'viemSignTypedData',
            fn: createViemSignTypedDataTest,
            category: 'integrations' as const,
          },
        ],
      },
    ];

    // Special EOA Native test
    const eoaNativeTest = {
      name: 'eoaNativeAuthFlow',
      fn: createEoaNativeAuthFlowTest,
      category: 'endpoints' as const,
    };

    // Run tests
    for (const suite of testSuites) {
      console.log(`\n🔐 Testing using ${suite.name} authentication`);

      for (const test of suite.tests) {
        if (
          validatedConfig.selectedTests &&
          !validatedConfig.selectedTests.includes(test.name as TestName)
        ) {
          const testResult: TestResult = {
            name: test.name,
            authContext: suite.authContextName,
            category: test.category,
            status: 'skipped',
            duration: 0,
          };

          results.push(testResult);

          // Call callback with individual test result
          if (validatedConfig.callback) {
            validatedConfig.callback(testResult);
          }
          continue;
        }

        const testStartTime = Date.now();
        try {
          console.log(`  ⏳ Running ${test.name}...`);

          // Run the test with timeout
          const testFn = test.fn(ctx, suite.authContext);
          await Promise.race([
            testFn(),
            new Promise((_, reject) =>
              setTimeout(
                () => reject(new Error('Test timeout')),
                validatedConfig.testTimeout
              )
            ),
          ]);

          const duration = Date.now() - testStartTime;
          console.log(`  ✅ ${test.name} passed (${duration}ms)`);

          const testResult: TestResult = {
            name: test.name,
            authContext: suite.authContextName,
            category: test.category,
            status: 'passed',
            duration,
          };

          results.push(testResult);

          // Call callback with individual test result
          if (validatedConfig.callback) {
            validatedConfig.callback(testResult);
          }
        } catch (error) {
          const duration = Date.now() - testStartTime;
          const errorMessage =
            error instanceof Error ? error.message : String(error);
          console.log(
            `  ❌ ${test.name} failed (${duration}ms): ${errorMessage}`
          );

          const testResult: TestResult = {
            name: test.name,
            authContext: suite.authContextName,
            category: test.category,
            status: 'failed',
            duration,
            error: errorMessage,
          };

          results.push(testResult);

          // Call callback with individual test result
          if (validatedConfig.callback) {
            validatedConfig.callback(testResult);
          }
        }
      }
    }

    // Run EOA Native test
    if (
      !validatedConfig.selectedTests ||
      validatedConfig.selectedTests.includes('eoaNativeAuthFlow')
    ) {
      console.log(`\n🔐 Testing EOA native authentication and PKP minting`);
      const testStartTime = Date.now();

      try {
        console.log(`  ⏳ Running eoaNativeAuthFlow...`);

        const testFn = eoaNativeTest.fn(ctx);
        await Promise.race([
          testFn(),
          new Promise((_, reject) =>
            setTimeout(
              () => reject(new Error('Test timeout')),
              validatedConfig.testTimeout
            )
          ),
        ]);

        const duration = Date.now() - testStartTime;
        console.log(`  ✅ eoaNativeAuthFlow passed (${duration}ms)`);

        const testResult: TestResult = {
          name: eoaNativeTest.name,
          authContext: 'eoaNative',
          category: eoaNativeTest.category,
          status: 'passed',
          duration,
        };

        results.push(testResult);

        // Call callback with individual test result
        if (validatedConfig.callback) {
          validatedConfig.callback(testResult);
        }
      } catch (error) {
        const duration = Date.now() - testStartTime;
        const errorMessage =
          error instanceof Error ? error.message : String(error);
        console.log(
          `  ❌ eoaNativeAuthFlow failed (${duration}ms): ${errorMessage}`
        );

        const testResult: TestResult = {
          name: eoaNativeTest.name,
          authContext: 'eoaNative',
          category: eoaNativeTest.category,
          status: 'failed',
          duration,
          error: errorMessage,
        };

        results.push(testResult);

        // Call callback with individual test result
        if (validatedConfig.callback) {
          validatedConfig.callback(testResult);
        }
      }
    } else {
      // EOA Native test was skipped
      const testResult: TestResult = {
        name: eoaNativeTest.name,
        authContext: 'eoaNative',
        category: eoaNativeTest.category,
        status: 'skipped',
        duration: 0,
      };

      results.push(testResult);

      // Call callback with individual test result
      if (validatedConfig.callback) {
        validatedConfig.callback(testResult);
      }
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(`❌ Failed to initialize test context: ${errorMessage}`);
    throw error;
  }

  // Calculate summary
  const totalDuration = Date.now() - startTime;
  const passed = results.filter((r) => r.status === 'passed').length;
  const failed = results.filter((r) => r.status === 'failed').length;
  const skipped = results.filter((r) => r.status === 'skipped').length;

  const summary = {
    eoaAuth: {
      passed: results.filter(
        (r) => r.authContext === 'eoaAuth' && r.status === 'passed'
      ).length,
      failed: results.filter(
        (r) => r.authContext === 'eoaAuth' && r.status === 'failed'
      ).length,
      skipped: results.filter(
        (r) => r.authContext === 'eoaAuth' && r.status === 'skipped'
      ).length,
    },
    pkpAuth: {
      passed: results.filter(
        (r) => r.authContext === 'pkpAuth' && r.status === 'passed'
      ).length,
      failed: results.filter(
        (r) => r.authContext === 'pkpAuth' && r.status === 'failed'
      ).length,
      skipped: results.filter(
        (r) => r.authContext === 'pkpAuth' && r.status === 'skipped'
      ).length,
    },
    customAuth: {
      passed: results.filter(
        (r) => r.authContext === 'customAuth' && r.status === 'passed'
      ).length,
      failed: results.filter(
        (r) => r.authContext === 'customAuth' && r.status === 'failed'
      ).length,
      skipped: results.filter(
        (r) => r.authContext === 'customAuth' && r.status === 'skipped'
      ).length,
    },
    eoaNative: {
      passed: results.filter(
        (r) => r.authContext === 'eoaNative' && r.status === 'passed'
      ).length,
      failed: results.filter(
        (r) => r.authContext === 'eoaNative' && r.status === 'failed'
      ).length,
      skipped: results.filter(
        (r) => r.authContext === 'eoaNative' && r.status === 'skipped'
      ).length,
    },
  };

  console.log(`\n📊 Test Results Summary:`);
  console.log(`  Total: ${results.length} tests`);
  console.log(`  ✅ Passed: ${passed}`);
  console.log(`  ❌ Failed: ${failed}`);
  console.log(`  ⏭️  Skipped: ${skipped}`);
  console.log(`  ⏱️  Duration: ${totalDuration}ms`);

  const finalResults: E2ETestResults = {
    network: validatedConfig.network,
    totalTests: results.length,
    passed,
    failed,
    skipped,
    duration: totalDuration,
    results,
    summary,
  };

  // Call callback with final results
  if (validatedConfig.callback) {
    validatedConfig.callback(finalResults);
  }

  return finalResults;
}

// Export additional utility functions and types
export { init } from './init';
export {
  createCustomAuthContext,
  createPkpAuthContext,
} from './helper/auth-contexts';
export * from './helper/tests';

// Export constants for external use
export { SUPPORTED_NETWORKS, LOG_LEVELS, AVAILABLE_TESTS };

// CommonJS compatibility
if (
  typeof module !== 'undefined' &&
  module.exports &&
  typeof exports === 'undefined'
) {
  module.exports = {
    runLitE2eTests,
    init,
    createViewPKPsByAuthDataTest,
    createViewPKPsByAddressTest,
    createViemSignTypedDataTest,
    createViemSignTransactionTest,
    createViemSignMessageTest,
    createPkpSignTest,
    createPkpPermissionsManagerFlowTest,
    createPkpEncryptDecryptTest,
    createPkpAuthContext,
    createExecuteJsTest,
    createEoaNativeAuthFlowTest,
    createEncryptDecryptFlowTest,
    createCustomAuthContext,
    SUPPORTED_NETWORKS,
    LOG_LEVELS,
    AVAILABLE_TESTS,
  };
}

export { printAligned } from './helper/utils';
export { getLitNetworkModule } from './helper/NetworkManager';
export { getViemPublicClient } from './helper/NetworkManager';