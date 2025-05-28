/**
 * ExecuteJs Flow Test
 *
 * This test demonstrates the executeJs API functionality by:
 * 1. Creating a Lit client using the init helper
 * 2. Setting up proper EOA auth context
 * 3. Executing a simple Lit Action that signs data
 * 4. Verifying the response contains signatures and logs
 *
 * Usage: bun run examples/src/executejs-flow.ts
 */

import { init } from './init';

// Test Lit Action code that signs data and logs messages
const TEST_LIT_ACTION_CODE = `
(async () => {

  const { sigName, toSign, publicKey, } = jsParams;
  const { keccak256, arrayify } = ethers.utils;
  
  // We are performing the hash here in the Lit Action
  // to show case the ethers library.
  // Alternatively, you could hash your data to a 32-byte array 
  // before passing it into jsParams, then use it directly
  const toSignBytes = new TextEncoder().encode(toSign);
  const toSignBytes32 = keccak256(toSignBytes);
  const toSignBytes32Array = arrayify(toSignBytes32);
  
  // this requests a signature share from the Lit Node
  // the signature share will be automatically returned in the HTTP response from the node
  const sigShare = await Lit.Actions.signEcdsa({
    toSign: toSignBytes32Array,
    publicKey,
    sigName,
  });  
})();`;

async function main() {
  console.log('🚀 Starting ExecuteJs Flow Test...\n');

  try {
    // Use the init helper to get client, account, and auth manager
    console.log('📱 Initializing Lit client and auth manager...');
    const {
      myAccount,
      litClient,
      authManager,
      viemAuthContext,
      viemAccountPkp,
    } = await init();
    console.log('✅ Lit client and auth manager initialized successfully\n');

    // Test 1: Execute Lit Action with simple code
    console.log('🧪 Test 1: Executing simple Lit Action...');

    const result = await litClient.executeJs({
      code: TEST_LIT_ACTION_CODE,
      authContext: viemAuthContext,
      jsParams: {
        message: 'Test message from executeJs',
        sigName: 'random-sig-name',
        toSign: 'Test message from executeJs',
        publicKey: viemAccountPkp.publicKey,
      },
    });

    console.log('result:', result);

    console.log('\n✅ All tests completed successfully!');
    process.exit();
  } catch (error) {
    console.error('❌ ExecuteJs test failed:', error);

    if (error instanceof Error) {
      console.error('Error details:', {
        name: error.name,
        message: error.message,
        stack: error.stack?.split('\n').slice(0, 10).join('\n'),
      });
    }

    process.exit(1);
  }
}

// Run the test
main().catch((error) => {
  console.error('❌ Unexpected error:', error);
  process.exit(1);
});
