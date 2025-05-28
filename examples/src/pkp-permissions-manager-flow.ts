/**
 * PKP Permissions Manager Full Lifecycle Demo
 *
 * This example demonstrates the complete lifecycle of managing PKP permissions
 * including adding, checking, batching, and revoking permissions for actions and addresses.
 *
 * Usage: Run this script to see how PKPPermissionsManager works end-to-end
 *
 * Note: You must own the PKP to modify its permissions!
 */

import { init } from './init';

// Configuration constants - place configurable variables at the top
const TEST_ADDRESS = '0xef3eE1bD838aF5B36482FAe8a6Fc394C68d5Fa9F';
const TEST_ACTION_IPFS_ID = 'QmSQDKRWEXZ9CGoucSTR11Mv6fhGqaytZ1MqrfHdkuS1Vg';
const TEST_SCOPES = ['sign-anything'] as const;

/**
 * Helper function to handle permission operations with proper error handling
 */
const tryPermissionOperation = async (
  operation: () => Promise<any>,
  operationName: string,
  isRequired: boolean = false
): Promise<boolean> => {
  try {
    await operation();
    console.log(`✅ ${operationName} completed successfully`);
    return true;
  } catch (error: any) {
    if (error.message?.includes('Not PKP NFT owner')) {
      console.log(`⚠️ ${operationName} failed: You don't own this PKP`);
      console.log('ℹ️ Only PKP owners can modify permissions');
      if (isRequired) {
        console.log('🛑 This operation is required for the demo to continue');
        throw error;
      }
      return false;
    } else {
      console.log(`❌ ${operationName} failed:`, error.message);
      if (isRequired) {
        throw error;
      }
      return false;
    }
  }
};

/**
 * Demonstrates the complete PKP permissions management lifecycle
 */
export const pkpPermissionsManagerFlow = async () => {
  console.log('🚀 Starting PKP Permissions Manager Full Lifecycle Demo...\n');
  console.log('⚠️ Note: You must own the PKP to modify permissions!\n');

  const { litClient, myAccount, viemAccountPkp, viemAuthContext } =
    await init();

  const pkpViemAccount = await litClient.getPkpViemAccount({
    pkpPublicKey: viemAccountPkp.publicKey,
    authContext: viemAuthContext,
    chainConfig: litClient.getChainConfig().viemConfig,
  });

  const pkpPermissionsManager = await litClient.getPKPPermissionsManager({
    pkpIdentifier: {
      tokenId: viemAccountPkp.tokenId,
    },
    account: pkpViemAccount,
  });

  console.log('📋 PKP Token ID:', viemAccountPkp.tokenId);
  console.log('📋 Account Address:', myAccount.address);
  console.log('📋 Test Address:', TEST_ADDRESS);
  console.log('📋 Test Action IPFS ID:', TEST_ACTION_IPFS_ID);
  console.log('📋 Test Scopes:', TEST_SCOPES);
  console.log('─'.repeat(50));

  // 1. Initial State Check
  console.log('\n1️⃣ Getting initial permissions context...');
  const initialContext = await pkpPermissionsManager.getPermissionsContext();
  console.log('✅ Initial context:', initialContext);

  process.exit(0);
  console.log('✅ Initial addresses count:', initialContext.addresses.length);
  console.log('✅ Initial actions count:', initialContext.actions.length);
  console.log(
    '✅ Initial auth methods count:',
    initialContext.authMethods.length
  );

  // 2. Check Initial Permission Status
  console.log('\n2️⃣ Checking initial permission status...');
  const initialAddressPermitted =
    await pkpPermissionsManager.isPermittedAddress({
      address: TEST_ADDRESS,
    });
  const initialActionPermitted = await pkpPermissionsManager.isPermittedAction({
    ipfsId: TEST_ACTION_IPFS_ID,
  });
  console.log(
    `✅ Test address initially permitted: ${initialAddressPermitted}`
  );
  console.log(`✅ Test action initially permitted: ${initialActionPermitted}`);

  // Check if we already have permissions
  const hasInitialPermissions =
    initialAddressPermitted || initialActionPermitted;
  let canModifyPermissions = true;

  // 3. Add Permitted Address (with error handling)
  console.log('\n3️⃣ Adding permitted address...');
  const addressAdded = await tryPermissionOperation(
    () =>
      pkpPermissionsManager.addPermittedAddress({
        address: TEST_ADDRESS,
        scopes: TEST_SCOPES as any,
      }),
    'Add permitted address'
  );
  canModifyPermissions = canModifyPermissions && addressAdded;

  // 4. Add Permitted Action (with error handling)
  console.log('\n4️⃣ Adding permitted action...');
  const actionAdded = await tryPermissionOperation(
    () =>
      pkpPermissionsManager.addPermittedAction({
        ipfsId: TEST_ACTION_IPFS_ID,
        scopes: TEST_SCOPES as any,
      }),
    'Add permitted action'
  );
  canModifyPermissions = canModifyPermissions && actionAdded;

  // 5. Verify Permissions (works regardless of ownership)
  console.log('\n5️⃣ Verifying current permissions...');
  const addressPermittedAfterAdd =
    await pkpPermissionsManager.isPermittedAddress({
      address: TEST_ADDRESS,
    });
  const actionPermittedAfterAdd = await pkpPermissionsManager.isPermittedAction(
    {
      ipfsId: TEST_ACTION_IPFS_ID,
    }
  );
  console.log(`✅ Test address now permitted: ${addressPermittedAfterAdd}`);
  console.log(`✅ Test action now permitted: ${actionPermittedAfterAdd}`);

  // 6. Get All Permitted Items (always works)
  console.log('\n6️⃣ Getting all permitted items...');
  const allAddresses = await pkpPermissionsManager.getPermittedAddresses();
  const allActions = await pkpPermissionsManager.getPermittedActions();
  const allAuthMethods = await pkpPermissionsManager.getPermittedAuthMethods();

  console.log('✅ All permitted addresses:', allAddresses.length);
  if (allAddresses.length > 0) {
    console.log(
      '   Addresses:',
      allAddresses.map((addr) => addr.slice(0, 10) + '...')
    );
  }
  console.log('✅ All permitted actions:', allActions.length);
  if (allActions.length > 0) {
    console.log(
      '   Actions:',
      allActions.map((action) => action.slice(0, 20) + '...')
    );
  }
  console.log('✅ All auth methods:', allAuthMethods.length);

  // 7. Demonstrate Batch Operations (only if we can modify)
  if (canModifyPermissions) {
    console.log('\n7️⃣ Demonstrating batch operations...');
    const secondTestAddress = '0x1234567890123456789012345678901234567890';
    const secondTestAction = 'QmZK5s3pNYLi9ERiq3BDxKa4XosgWwFRQUydHUtz4YgpqC';

    await tryPermissionOperation(
      () =>
        pkpPermissionsManager.batchUpdatePermissions([
          {
            type: 'addAddress',
            address: secondTestAddress,
            scopes: TEST_SCOPES as any,
          },
          {
            type: 'addAction',
            ipfsId: secondTestAction,
            scopes: TEST_SCOPES as any,
          },
        ]),
      'Batch update permissions'
    );
  } else {
    console.log('\n7️⃣ Skipping batch operations (requires PKP ownership)...');
  }

  // 8. Get Updated Context (always works)
  console.log('\n8️⃣ Getting updated permissions context...');
  const updatedContext = await pkpPermissionsManager.getPermissionsContext();
  console.log('✅ Updated addresses count:', updatedContext.addresses.length);
  console.log('✅ Updated actions count:', updatedContext.actions.length);

  // Test context helper functions
  const isTestAddressInContext =
    updatedContext.isAddressPermitted(TEST_ADDRESS);
  console.log(`✅ Test address found in context: ${isTestAddressInContext}`);

  // 9. Remove Specific Permissions (only if we can modify)
  if (canModifyPermissions) {
    console.log('\n9️⃣ Removing specific permissions...');
    const secondTestAddress = '0x1234567890123456789012345678901234567890';
    const secondTestAction = 'QmZK5s3pNYLi9ERiq3BDxKa4XosgWwFRQUydHUtz4YgpqC';

    await tryPermissionOperation(
      () =>
        pkpPermissionsManager.removePermittedAddress({
          address: secondTestAddress,
        }),
      'Remove second test address'
    );

    await tryPermissionOperation(
      () =>
        pkpPermissionsManager.removePermittedAction({
          ipfsId: secondTestAction,
        }),
      'Remove second test action'
    );
  } else {
    console.log('\n9️⃣ Skipping permission removal (requires PKP ownership)...');
  }

  // 10. Working with Auth Methods (always works)
  console.log('\n🔟 Working with authentication methods...');
  if (allAuthMethods.length > 0) {
    const firstAuthMethod = allAuthMethods[0];
    console.log('✅ Found auth method:', {
      type: firstAuthMethod.authMethodType.toString(),
      id: firstAuthMethod.id.slice(0, 20) + '...',
    });

    const authMethodScopes =
      await pkpPermissionsManager.getPermittedAuthMethodScopes({
        authMethodType: Number(firstAuthMethod.authMethodType),
        authMethodId: firstAuthMethod.id,
      });
    console.log('✅ Auth method scopes:', authMethodScopes);
  } else {
    console.log('ℹ️ No authentication methods found');
  }

  // 11. Demonstrate Static Methods (information only)
  console.log('\n1️⃣1️⃣ Information about static methods...');
  console.log('ℹ️ Static method getPKPsByAddress would be called like:');
  console.log(
    'ℹ️ PKPPermissionsManager.getPKPsByAddress(address, networkContext, account)'
  );

  // 12. Final State Check (always works)
  console.log('\n1️⃣2️⃣ Final state check...');
  const finalContext = await pkpPermissionsManager.getPermissionsContext();
  console.log('✅ Final addresses count:', finalContext.addresses.length);
  console.log('✅ Final actions count:', finalContext.actions.length);

  // 13. Cleanup - Only if we can modify and added permissions
  if (canModifyPermissions && (addressAdded || actionAdded)) {
    console.log('\n1️⃣3️⃣ Cleaning up test permissions...');

    // Remove individual test permissions instead of revoking all
    if (addressAdded) {
      await tryPermissionOperation(
        () =>
          pkpPermissionsManager.removePermittedAddress({
            address: TEST_ADDRESS,
          }),
        'Remove test address'
      );
    }

    if (actionAdded) {
      await tryPermissionOperation(
        () =>
          pkpPermissionsManager.removePermittedAction({
            ipfsId: TEST_ACTION_IPFS_ID,
          }),
        'Remove test action'
      );
    }
  } else {
    console.log(
      '\n1️⃣3️⃣ Skipping cleanup (no permissions were added or no ownership)...'
    );
  }

  // 14. Final Verification
  console.log('\n1️⃣4️⃣ Final verification...');
  const cleanupContext = await pkpPermissionsManager.getPermissionsContext();
  const testAddressStillPermitted =
    await pkpPermissionsManager.isPermittedAddress({
      address: TEST_ADDRESS,
    });
  const testActionStillPermitted =
    await pkpPermissionsManager.isPermittedAction({
      ipfsId: TEST_ACTION_IPFS_ID,
    });

  console.log('✅ Final addresses count:', cleanupContext.addresses.length);
  console.log('✅ Final actions count:', cleanupContext.actions.length);
  console.log(`✅ Test address still permitted: ${testAddressStillPermitted}`);
  console.log(`✅ Test action still permitted: ${testActionStillPermitted}`);

  console.log('\n🎉 PKP Permissions Manager Demo Complete!');
  console.log('─'.repeat(50));

  // Summary
  console.log('\n📊 DEMO SUMMARY:');
  console.log(
    `• Started with ${initialContext.addresses.length} addresses, ${initialContext.actions.length} actions`
  );
  if (canModifyPermissions) {
    console.log(`• Successfully demonstrated permission management operations`);
  } else {
    console.log(
      `• Demonstrated read-only operations (ownership required for modifications)`
    );
  }
  console.log(
    `• Ended with ${cleanupContext.addresses.length} addresses, ${cleanupContext.actions.length} actions`
  );
  console.log(`• All available operations completed successfully! ✨`);

  if (!canModifyPermissions) {
    console.log(
      '\n💡 TIP: To test modification operations, use a PKP that you own!'
    );
    console.log(
      '   You can create a new PKP or use one where your account is the owner.'
    );
  }
};

pkpPermissionsManagerFlow().catch(console.error);
