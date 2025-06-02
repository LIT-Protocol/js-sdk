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
  };
};
