import { init } from '../../init';

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
      pkpPublicKey: ctx.aliceViemAccountPkp.publicKey,
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

    expect(pkpPermissionsManager).toBeDefined();

    // Test 1: Get initial permissions context
    const initialContext = await pkpPermissionsManager.getPermissionsContext();
    expect(initialContext).toBeDefined();
    expect(initialContext.addresses).toBeDefined();
    expect(initialContext.actions).toBeDefined();
    expect(initialContext.authMethods).toBeDefined();
    expect(Array.isArray(initialContext.addresses)).toBe(true);
    expect(Array.isArray(initialContext.actions)).toBe(true);
    expect(Array.isArray(initialContext.authMethods)).toBe(true);

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
    expect(typeof initialAddressPermitted).toBe('boolean');
    expect(typeof initialActionPermitted).toBe('boolean');

    // Test 3: Get all permitted items
    const allAddresses = await pkpPermissionsManager.getPermittedAddresses();
    const allActions = await pkpPermissionsManager.getPermittedActions();
    const allAuthMethods =
      await pkpPermissionsManager.getPermittedAuthMethods();

    expect(Array.isArray(allAddresses)).toBe(true);
    expect(Array.isArray(allActions)).toBe(true);
    expect(Array.isArray(allAuthMethods)).toBe(true);
    expect(allAddresses.length).toBe(initialAddressesCount);
    expect(allActions.length).toBe(initialActionsCount);

    // Test 4: Test context helper functions
    if (allAddresses.length > 0) {
      const firstAddress = allAddresses[0];
      const isAddressInContext =
        initialContext.isAddressPermitted(firstAddress);
      expect(typeof isAddressInContext).toBe('boolean');
    }

    // Test 5: Working with auth methods
    if (allAuthMethods.length > 0) {
      const firstAuthMethod = allAuthMethods[0];
      expect(firstAuthMethod.authMethodType).toBeDefined();
      expect(firstAuthMethod.id).toBeDefined();

      const authMethodScopes =
        await pkpPermissionsManager.getPermittedAuthMethodScopes({
          authMethodType: Number(firstAuthMethod.authMethodType),
          authMethodId: firstAuthMethod.id,
        });
      expect(Array.isArray(authMethodScopes)).toBe(true);
    }

    // Note: We don't test add/remove operations as they require PKP ownership
    // and would modify the PKP state. In a real test environment, you'd want
    // to test with a PKP that your account owns specifically for testing.

    // Test 6: Verify all read operations work consistently
    const finalContext = await pkpPermissionsManager.getPermissionsContext();
    expect(finalContext.addresses.length).toBe(initialAddressesCount);
    expect(finalContext.actions.length).toBe(initialActionsCount);

    // Test 7: Verify permission checks are consistent
    const finalAddressPermitted =
      await pkpPermissionsManager.isPermittedAddress({
        address: TEST_ADDRESS,
      });
    const finalActionPermitted = await pkpPermissionsManager.isPermittedAction({
      ipfsId: TEST_ACTION_IPFS_ID,
    });

    expect(finalAddressPermitted).toBe(initialAddressPermitted);
    expect(finalActionPermitted).toBe(initialActionPermitted);

    // Test 8: Verify new addPermittedAuthMethod method exists and is callable
    expect(pkpPermissionsManager.addPermittedAuthMethod).toBeDefined();
    expect(typeof pkpPermissionsManager.addPermittedAuthMethod).toBe(
      'function'
    );

    // Test 9: Verify new removePermittedAuthMethodScope method exists and is callable
    expect(pkpPermissionsManager.removePermittedAuthMethodScope).toBeDefined();
    expect(typeof pkpPermissionsManager.removePermittedAuthMethodScope).toBe(
      'function'
    );

    // Test 10: Actually test addPermittedAuthMethod functionality
    const testAuthMethodParams = {
      authMethodType: 1, // EthWallet
      authMethodId: '0x1234567890abcdef1234567890abcdef12345678',
      userPubkey:
        '0x04abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
      scopes: ['sign-anything'] as ('sign-anything' | 'no-permissions' | 'personal-sign')[],
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
    expect(addAuthMethodTx.hash).toBeDefined();
    expect(addAuthMethodTx.receipt).toBeDefined();
    expect(addAuthMethodTx.receipt.status).toBe('success');

    // Verify the auth method was added
    const authMethodsAfterAdd =
      await pkpPermissionsManager.getPermittedAuthMethods();
    expect(authMethodsAfterAdd.length).toBe(initialAuthMethodsCount + 1);

    // Find our added auth method
    const addedAuthMethod = authMethodsAfterAdd.find(
      (am) =>
        am.id === testAuthMethodParams.authMethodId &&
        Number(am.authMethodType) === testAuthMethodParams.authMethodType
    );
    expect(addedAuthMethod).toBeDefined();
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
    expect(removeScopeTx.hash).toBeDefined();
    expect(removeScopeTx.receipt).toBeDefined();
    expect(removeScopeTx.receipt.status).toBe('success');

    // Verify the scope was removed by checking auth method scopes
    const authMethodScopes =
      await pkpPermissionsManager.getPermittedAuthMethodScopes({
        authMethodType: testAuthMethodParams.authMethodType,
        authMethodId: testAuthMethodParams.authMethodId,
        scopeId: 1,
      });
    // After removing scope 1, it should return false for that specific scope
    expect(authMethodScopes[0]).toBe(false);
    console.log('✅ Scope successfully removed from test auth method');

    // Test 12: Cleanup - Remove the test auth method entirely
    console.log('🧹 Cleaning up test auth method...');
    const removeAuthMethodTx =
      await pkpPermissionsManager.removePermittedAuthMethod({
        authMethodType: testAuthMethodParams.authMethodType,
        authMethodId: testAuthMethodParams.authMethodId,
      });
    expect(removeAuthMethodTx.hash).toBeDefined();
    expect(removeAuthMethodTx.receipt).toBeDefined();
    expect(removeAuthMethodTx.receipt.status).toBe('success');

    // Verify the auth method was removed
    const finalAuthMethods =
      await pkpPermissionsManager.getPermittedAuthMethods();
    expect(finalAuthMethods.length).toBe(initialAuthMethodsCount);

    // Ensure our test auth method is no longer in the list
    const removedAuthMethod = finalAuthMethods.find(
      (am) =>
        am.id === testAuthMethodParams.authMethodId &&
        Number(am.authMethodType) === testAuthMethodParams.authMethodType
    );
    expect(removedAuthMethod).toBe(undefined);
    console.log('✅ Test auth method successfully cleaned up');
  };
};
