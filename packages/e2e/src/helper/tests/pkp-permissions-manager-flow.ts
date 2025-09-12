import { init } from '../../init';
import { assert } from '../assertions';
export const createPkpPermissionsManagerFlowTest = (
  ctx: Awaited<ReturnType<typeof init>>,
  getAuthContext: () => any
) => {
  return async () => {
    const authContext = getAuthContext();

    // Configuration constants
    const TEST_ADDRESS = '0xef3eE1bD838aF5B36482FAe8a6Fc394C68d5Fa9F';
    const TEST_ACTION_IPFS_ID =
      'QmSQDKRWEXZ9CGoucSTR11Mv6fhGqaytZ1MqrfHdkuS1Vg';
    const TEST_SCOPES = ['sign-anything'] as const;

    // Get PKP Viem account for permissions management
    const pkpViemAccount = await ctx.litClient.getPkpViemAccount({
      pkpPublicKey: ctx.aliceViemAccountPkp.pubkey,
      authContext: authContext,
      chainConfig: ctx.litClient.getChainConfig().viemConfig,
    });

    // Get PKP Permissions Manager
    const pkpPermissionsManager = await ctx.litClient.getPKPPermissionsManager({
      pkpIdentifier: {
        tokenId: ctx.aliceViemAccountPkp.tokenId,
      },
      account: pkpViemAccount,
    });

    assert.toBeDefined(pkpPermissionsManager);

    // Test 1: Get initial permissions context
    const initialContext = await pkpPermissionsManager.getPermissionsContext();
    assert.toBeDefined(initialContext);
    assert.toBeDefined(initialContext.addresses);
    assert.toBeDefined(initialContext.actions);
    assert.toBeDefined(initialContext.authMethods);
    assert.toBe(Array.isArray(initialContext.addresses), true);
    assert.toBe(Array.isArray(initialContext.actions), true);
    assert.toBe(Array.isArray(initialContext.authMethods), true);

    const initialAddressesCount = initialContext.addresses.length;
    const initialActionsCount = initialContext.actions.length;

    // Test 2: Check initial permission status
    const initialAddressPermitted =
      await pkpPermissionsManager.isPermittedAddress({
        address: TEST_ADDRESS,
      });
    const initialActionPermitted =
      await pkpPermissionsManager.isPermittedAction({
        ipfsId: TEST_ACTION_IPFS_ID,
      });
    assert.toBe(typeof initialAddressPermitted, 'boolean');
    assert.toBe(typeof initialActionPermitted, 'boolean');

    // Test 3: Get all permitted items
    const allAddresses = await pkpPermissionsManager.getPermittedAddresses();
    const allActions = await pkpPermissionsManager.getPermittedActions();
    const allAuthMethods =
      await pkpPermissionsManager.getPermittedAuthMethods();

    assert.toBe(Array.isArray(allAddresses), true);
    assert.toBe(Array.isArray(allActions), true);
    assert.toBe(Array.isArray(allAuthMethods), true);
    assert.toBe(allAddresses.length, initialAddressesCount);
    assert.toBe(allActions.length, initialActionsCount);

    // Test 4: Test context helper functions
    if (allAddresses.length > 0) {
      const firstAddress = allAddresses[0];
      const isAddressInContext =
        initialContext.isAddressPermitted(firstAddress);
      assert.toBe(typeof isAddressInContext, 'boolean');
    }

    // Test 5: Working with auth methods
    if (allAuthMethods.length > 0) {
      const firstAuthMethod = allAuthMethods[0];
      assert.toBeDefined(firstAuthMethod.authMethodType);
      assert.toBeDefined(firstAuthMethod.id);

      const authMethodScopes =
        await pkpPermissionsManager.getPermittedAuthMethodScopes({
          authMethodType: Number(firstAuthMethod.authMethodType),
          authMethodId: firstAuthMethod.id,
        });
      assert.toBe(Array.isArray(authMethodScopes), true);
    }

    // Note: We don't test add/remove operations as they require PKP ownership
    // and would modify the PKP state. In a real test environment, you'd want
    // to test with a PKP that your account owns specifically for testing.

    // Test 6: Verify all read operations work consistently
    const finalContext = await pkpPermissionsManager.getPermissionsContext();
    assert.toBe(finalContext.addresses.length, initialAddressesCount);
    assert.toBe(finalContext.actions.length, initialActionsCount);

    // Test 7: Verify permission checks are consistent
    const finalAddressPermitted =
      await pkpPermissionsManager.isPermittedAddress({
        address: TEST_ADDRESS,
      });
    const finalActionPermitted = await pkpPermissionsManager.isPermittedAction({
      ipfsId: TEST_ACTION_IPFS_ID,
    });

    assert.toBe(finalAddressPermitted, initialAddressPermitted);
    assert.toBe(finalActionPermitted, initialActionPermitted);

    // Test 8: Verify new addPermittedAuthMethod method exists and is callable
    assert.toBeDefined(pkpPermissionsManager.addPermittedAuthMethod);
    assert.toBe(
      typeof pkpPermissionsManager.addPermittedAuthMethod,
      'function'
    );

    // Test 9: Verify new removePermittedAuthMethodScope method exists and is callable
    assert.toBeDefined(pkpPermissionsManager.removePermittedAuthMethodScope);
    assert.toBe(
      typeof pkpPermissionsManager.removePermittedAuthMethodScope,
      'function'
    );

    // Test 10: Actually test addPermittedAuthMethod functionality
    const testAuthMethodParams = {
      authMethodType: 1, // EthWallet
      authMethodId: '0x1234567890abcdef1234567890abcdef12345678',
      userPubkey:
        '0x04abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
      scopes: ['sign-anything'] as const,
    };

    // Get initial auth methods count
    const initialAuthMethods =
      await pkpPermissionsManager.getPermittedAuthMethods();
    const initialAuthMethodsCount = initialAuthMethods.length;

    console.log('🧪 Adding test auth method...');
    // Add the test auth method
    const addAuthMethodTx = await pkpPermissionsManager.addPermittedAuthMethod(
      testAuthMethodParams
    );
    assert.toBeDefined(addAuthMethodTx.hash);
    assert.toBeDefined(addAuthMethodTx.receipt);
    assert.toBe(addAuthMethodTx.receipt.status, 'success');

    // Verify the auth method was added
    const authMethodsAfterAdd =
      await pkpPermissionsManager.getPermittedAuthMethods();
    assert.toBe(authMethodsAfterAdd.length, initialAuthMethodsCount + 1);

    // Find our added auth method
    const addedAuthMethod = authMethodsAfterAdd.find(
      (am) =>
        am.id === testAuthMethodParams.authMethodId &&
        Number(am.authMethodType) === testAuthMethodParams.authMethodType
    );
    assert.toBeDefined(addedAuthMethod);
    console.log('✅ Test auth method successfully added');

    // Test 11: Test removePermittedAuthMethodScope functionality
    const testScopeParams = {
      authMethodType: testAuthMethodParams.authMethodType,
      authMethodId: testAuthMethodParams.authMethodId,
      scopeId: 1, // SignAnything scope
    };

    console.log('🧪 Removing scope from test auth method...');
    // Remove a scope from the auth method
    const removeScopeTx =
      await pkpPermissionsManager.removePermittedAuthMethodScope(
        testScopeParams
      );
    assert.toBeDefined(removeScopeTx.hash);
    assert.toBeDefined(removeScopeTx.receipt);
    assert.toBe(removeScopeTx.receipt.status, 'success');

    // Verify the scope was removed by checking auth method scopes
    const authMethodScopes =
      await pkpPermissionsManager.getPermittedAuthMethodScopes({
        authMethodType: testAuthMethodParams.authMethodType,
        authMethodId: testAuthMethodParams.authMethodId,
        scopeId: 1,
      });
    // After removing scope 1, it should return false for that specific scope
    assert.toBe(authMethodScopes[0], false);
    console.log('✅ Scope successfully removed from test auth method');

    // Test 12: Cleanup - Remove the test auth method entirely
    console.log('🧹 Cleaning up test auth method...');
    const removeAuthMethodTx =
      await pkpPermissionsManager.removePermittedAuthMethod({
        authMethodType: testAuthMethodParams.authMethodType,
        authMethodId: testAuthMethodParams.authMethodId,
      });
    assert.toBeDefined(removeAuthMethodTx.hash);
    assert.toBeDefined(removeAuthMethodTx.receipt);
    assert.toBe(removeAuthMethodTx.receipt.status, 'success');

    // Verify the auth method was removed
    const finalAuthMethods =
      await pkpPermissionsManager.getPermittedAuthMethods();
    assert.toBe(finalAuthMethods.length, initialAuthMethodsCount);

    // Ensure our test auth method is no longer in the list
    const removedAuthMethod = finalAuthMethods.find(
      (am) =>
        am.id === testAuthMethodParams.authMethodId &&
        Number(am.authMethodType) === testAuthMethodParams.authMethodType
    );
    assert.toBe(removedAuthMethod, undefined);
    console.log('✅ Test auth method successfully cleaned up');
  };
};
