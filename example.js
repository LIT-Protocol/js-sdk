/**
 * Example usage of @lit-protocol/e2e package
 */

const { runLitE2eTests } = require('@lit-protocol/e2e');

async function main() {
  try {
    console.log('🚀 Starting Lit Protocol E2E tests...\n');

    // Example 1: Basic usage
    const basicResults = await runLitE2eTests({
      network: 'naga-dev',
      logLevel: 'info'
    });

    console.log('\n📊 Basic Results Summary:');
    console.log(`Total tests: ${basicResults.totalTests}`);
    console.log(`Passed: ${basicResults.passed}`);
    console.log(`Failed: ${basicResults.failed}`);
    console.log(`Duration: ${basicResults.duration}ms`);

    // Example 2: Running specific tests with callback
    console.log('\n\n🎯 Running specific tests with callback...\n');
    
    const testResults = [];
    
    const specificResults = await runLitE2eTests({
      network: 'naga-dev',
      logLevel: 'info',
      selectedTests: ['pkpSign', 'executeJs', 'viemSignMessage'],
      callback: ({testName, testResult}) => {
        console.log(`📝 Callback: Test "${testName}" completed with status: ${testResult.status}`);
        if (testResult.status === 'failed') {
          console.log(`   Error: ${testResult.error}`);
        }
        console.log(`   Duration: ${testResult.duration}ms`);
        console.log(`   Auth Context: ${testResult.authContext}`);
        console.log(`   Category: ${testResult.category}\n`);
        
        // Store results for further processing
        testResults.push({
          name: testName,
          ...testResult
        });
      }
    });

    console.log('\n📊 Specific Tests Results Summary:');
    console.log(`Total tests: ${specificResults.totalTests}`);
    console.log(`Passed: ${specificResults.passed}`);
    console.log(`Failed: ${specificResults.failed}`);
    console.log(`Duration: ${specificResults.duration}ms`);

    // Example 3: Custom processing with callback
    console.log('\n\n🔧 Processing results for further analysis...');
    
    const failedTests = testResults.filter(test => test.status === 'failed');
    const passedTests = testResults.filter(test => test.status === 'passed');
    
    console.log(`\n✅ Passed tests: ${passedTests.map(t => t.name).join(', ')}`);
    if (failedTests.length > 0) {
      console.log(`❌ Failed tests: ${failedTests.map(t => t.name).join(', ')}`);
    }
    
    // Group by auth context
    const byAuthContext = testResults.reduce((acc, test) => {
      if (!acc[test.authContext]) {
        acc[test.authContext] = { passed: 0, failed: 0, tests: [] };
      }
      acc[test.authContext][test.status]++;
      acc[test.authContext].tests.push(test.name);
      return acc;
    }, {});
    
    console.log('\n📋 Results by Auth Context:');
    Object.entries(byAuthContext).forEach(([context, stats]) => {
      console.log(`  ${context}: ${stats.passed} passed, ${stats.failed} failed`);
      console.log(`    Tests: ${stats.tests.join(', ')}`);
    });

  } catch (error) {
    console.error('❌ Error running tests:', error.message);
    process.exit(1);
  }
}

// Environment setup guidance
console.log('📋 Environment Setup:');
console.log('Make sure you have the following environment variables set:');
console.log('- LIVE_MASTER_ACCOUNT (for live networks like naga-dev/naga-staging)');
console.log('- LOCAL_MASTER_ACCOUNT (for local network)');
console.log('');

main(); 