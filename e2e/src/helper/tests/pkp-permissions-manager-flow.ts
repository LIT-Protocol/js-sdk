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
  };
};
