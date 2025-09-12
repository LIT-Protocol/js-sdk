/**
 * Example usage of @litprotocol/e2e package
 *
 * This demonstrates how to use the package programmatically
 * to run Lit Protocol E2E tests.
 */

// After installing: bun install @litprotocol/e2e
// Import the main function (using require for Node.js compatibility)
const { runLitE2eTests } = require('./dist/index.js');

async function main() {
  try {
    console.log('🚀 Starting Lit Protocol E2E test example...');

    // Example 1: Run all tests on naga-dev
    console.log('\n📊 Example 1: Running all tests on naga-dev');
    const allTestsResults = await runLitE2eTests({
      network: 'naga-dev',
      logLevel: 'info',
    });

    console.log(`\n✅ All tests completed!`);
    console.log(
      `📈 Results: ${allTestsResults.passed}/${allTestsResults.totalTests} passed`
    );
    console.log(`⏱️  Duration: ${allTestsResults.duration}ms`);

    // Example 2: Run specific tests only
    console.log('\n📊 Example 2: Running only signing-related tests');
    const signingResults = await runLitE2eTests({
      network: 'naga-dev',
      logLevel: 'info',
      selectedTests: ['pkpSign', 'viemSignMessage', 'viemSignTransaction'],
      testTimeout: 60000, // 60 second timeout
    });

    console.log(`\n✅ Signing tests completed!`);
    console.log(
      `📈 Results: ${signingResults.passed}/${signingResults.totalTests} passed`
    );

    // Example 3: Process results in detail
    console.log('\n📊 Example 3: Detailed result processing');
    const detailedResults = await runLitE2eTests({
      network: 'naga-dev',
      selectedTests: ['executeJs', 'pkpEncryptDecrypt'],
    });

    // Check for failures
    if (detailedResults.failed > 0) {
      console.log(`\n❌ Found ${detailedResults.failed} failed tests:`);
      const failedTests = detailedResults.results.filter(
        (r) => r.status === 'failed'
      );
      failedTests.forEach((test) => {
        console.log(`  - ${test.name} (${test.authContext}): ${test.error}`);
      });
    }

    // Summary by auth context
    console.log('\n📋 Summary by Authentication Context:');
    console.log(
      `  EOA Auth: ${detailedResults.summary.eoaAuth.passed} passed, ${detailedResults.summary.eoaAuth.failed} failed`
    );
    console.log(
      `  PKP Auth: ${detailedResults.summary.pkpAuth.passed} passed, ${detailedResults.summary.pkpAuth.failed} failed`
    );
    console.log(
      `  Custom Auth: ${detailedResults.summary.customAuth.passed} passed, ${detailedResults.summary.customAuth.failed} failed`
    );
    console.log(
      `  EOA Native: ${detailedResults.summary.eoaNative.passed} passed, ${detailedResults.summary.eoaNative.failed} failed`
    );

    // Performance analysis
    console.log('\n⚡ Performance Analysis:');
    const avgDuration =
      detailedResults.results.reduce((sum, r) => sum + r.duration, 0) /
      detailedResults.results.length;
    console.log(`  Average test duration: ${avgDuration.toFixed(2)}ms`);

    const slowestTest = detailedResults.results.reduce((max, r) =>
      r.duration > max.duration ? r : max
    );
    console.log(
      `  Slowest test: ${slowestTest.name} (${slowestTest.duration}ms)`
    );
  } catch (error) {
    console.error('❌ Error running E2E tests:', error.message);
    process.exit(1);
  }
}

// Run the example
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { main };
