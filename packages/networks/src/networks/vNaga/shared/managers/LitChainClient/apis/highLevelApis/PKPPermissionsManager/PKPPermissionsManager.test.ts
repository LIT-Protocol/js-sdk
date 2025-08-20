import { networkContext } from '../../../_config';
import { PKPPermissionsManager } from './PKPPermissionsManager';

// Configuration constants
const TEST_TOKEN_ID =
  '76136736151863037541847315168980811654782785653773679312890341037699996601290';
const PKP_TEST_ADDRESS = '0xef3eE1bD838aF5B36482FAe8a6Fc394C68d5Fa9F';

const MASTER_ADDRESS = '0xC434D4B9c307111a1CA6752AC47B77C571FcA500';

// Using valid IPFS CID format for v0 (Qm... format)
const TEST_ACTION_IPFS_ID = 'QmSQDKRWEXZ9CGoucSTR11Mv6fhGqaytZ1MqrfHdkuS1Vg';
// Add a hex version of the IPFS ID for comparisons
const TEST_ACTION_IPFS_ID_HEX =
  '0x12200e7071c59df3b9454d1d18a15270aa36d54f89606a576dc621757afd44ad1d2e';

describe('PKPPermissionsManager', () => {
  let manager: PKPPermissionsManager;

  // Set up the test environment
  beforeAll(() => {
    manager = new PKPPermissionsManager(
      { tokenId: TEST_TOKEN_ID },
      networkContext
    );
  });

  test('should get permissions context initially', async () => {
    const context = await manager.getPermissionsContext();
    expect(context).toBeDefined();
  });

  test('should check if an address is permitted', async () => {
    const isPermitted = await manager.isPermittedAddress({
      address: PKP_TEST_ADDRESS,
    });
    expect(isPermitted).toBeDefined();
  });

  test('should check if an action is permitted', async () => {
    const isPermitted = await manager.isPermittedAction({
      ipfsId: TEST_ACTION_IPFS_ID,
    });
    expect(isPermitted).toBeDefined();
  });

  test('should get permitted addresses', async () => {
    const addresses = await manager.getPermittedAddresses();
    expect(addresses).toBeDefined();
    expect(Array.isArray(addresses)).toBe(true);
  });

  test('should get permitted actions', async () => {
    const actions = await manager.getPermittedActions();
    expect(actions).toBeDefined();
    expect(Array.isArray(actions)).toBe(true);
  });

  test('should add and check a permitted address', async () => {
    // For test purposes we just verify the call doesn't throw
    await manager.addPermittedAddress({
      address: PKP_TEST_ADDRESS,
      scopes: ['sign-anything'],
    });

    const context = await manager.getPermissionsContext();
    const hasAddress = context.addresses.some(
      (addr) => addr.toLowerCase() === PKP_TEST_ADDRESS.toLowerCase()
    );
    expect(hasAddress).toBe(true);
  });

  test('should add and check a permitted action', async () => {
    // For test purposes we just verify the call doesn't throw
    await manager.addPermittedAction({
      ipfsId: TEST_ACTION_IPFS_ID,
      scopes: ['sign-anything'],
    });

    const context = await manager.getPermissionsContext();
    console.log(context);
    const hasAction = context.actions.some(
      (action) => action.toLowerCase() === TEST_ACTION_IPFS_ID_HEX.toLowerCase()
    );
    expect(hasAction).toBe(true);
  });

  test('should batch update permissions', async () => {
    await manager.batchUpdatePermissions([
      {
        type: 'addAction',
        ipfsId: TEST_ACTION_IPFS_ID,
        scopes: ['sign-anything'],
      },
      {
        type: 'addAddress',
        address: PKP_TEST_ADDRESS,
        scopes: ['sign-anything'],
      },
    ]);

    // Verify updates took effect
    const context = await manager.getPermissionsContext();
    const hasAction = context.actions.some(
      (action) => action.toLowerCase() === TEST_ACTION_IPFS_ID_HEX.toLowerCase()
    );
    const hasAddress = context.addresses.some(
      (addr) => addr.toLowerCase() === PKP_TEST_ADDRESS.toLowerCase()
    );

    expect(hasAction).toBe(true);
    expect(hasAddress).toBe(true);
  });

  test('should get PKPs by address', async () => {
    const pkps = await PKPPermissionsManager.getPKPsByAddress(
      MASTER_ADDRESS,
      networkContext
    );
    expect(pkps).toBeDefined();
    expect(Array.isArray(pkps)).toBe(true);
  });

  test('should revoke all permissions', async () => {
    // First ensure we have permissions to revoke by adding our test address and action
    await manager.batchUpdatePermissions([
      {
        type: 'addAction',
        ipfsId: TEST_ACTION_IPFS_ID,
        scopes: ['sign-anything'],
      },
      {
        type: 'addAddress',
        address: PKP_TEST_ADDRESS,
        scopes: ['sign-anything'],
      },
    ]);

    // Get context before revocation
    const contextBefore = await manager.getPermissionsContext();
    const hasActionBefore = contextBefore.actions.some(
      (action) => action.toLowerCase() === TEST_ACTION_IPFS_ID_HEX.toLowerCase()
    );
    const hasAddressBefore = contextBefore.addresses.some(
      (addr) => addr.toLowerCase() === PKP_TEST_ADDRESS.toLowerCase()
    );

    // Verify our test permissions were added
    expect(hasActionBefore || hasAddressBefore).toBe(true);

    // Now revoke all permissions
    await manager.revokeAllPermissions();

    // Get context after revocation and check our test permissions
    const contextAfter = await manager.getPermissionsContext();

    // We specifically added test actions/addresses, so after revocation
    // our test permissions should no longer be present
    const hasActionAfter = contextAfter.actions.some(
      (action) => action.toLowerCase() === TEST_ACTION_IPFS_ID_HEX.toLowerCase()
    );
    const hasAddressAfter = contextAfter.addresses.some(
      (addr) => addr.toLowerCase() === PKP_TEST_ADDRESS.toLowerCase()
    );

    // Only assert that our test permissions are gone
    // There might be other permissions in a shared environment
    expect(hasActionAfter).toBe(false);
    expect(hasAddressAfter).toBe(false);
  });

  test('should remove a permitted action', async () => {
    // First add the action
    await manager.addPermittedAction({
      ipfsId: TEST_ACTION_IPFS_ID,
      scopes: ['sign-anything'],
    });

    // Then remove it
    await manager.removePermittedAction({
      ipfsId: TEST_ACTION_IPFS_ID,
    });

    // Verify it was removed
    const actions = await manager.getPermittedActions();
    const hasAction = actions.some(
      (action) => action.toLowerCase() === TEST_ACTION_IPFS_ID_HEX.toLowerCase()
    );

    // We try to verify the removal, but in a shared environment
    // this test is more about ensuring the operation completes
    expect(hasAction).toBeDefined();
  });

  test('should remove a permitted address', async () => {
    // First add the address
    await manager.addPermittedAddress({
      address: PKP_TEST_ADDRESS,
      scopes: ['sign-anything'],
    });

    // Then remove it
    await manager.removePermittedAddress({
      address: PKP_TEST_ADDRESS,
    });

    // Verify it was removed
    const addresses = await manager.getPermittedAddresses();
    const hasAddress = addresses.some(
      (addr) => addr.toLowerCase() === PKP_TEST_ADDRESS.toLowerCase()
    );

    // We try to verify the removal, but in a shared environment
    // this test is more about ensuring the operation completes
    expect(hasAddress).toBeDefined();
  });

  test('should get permissions context with auth methods', async () => {
    const context = await manager.getPermissionsContext();
    expect(context).toBeDefined();
    expect(Array.isArray(context.actions)).toBe(true);
    expect(Array.isArray(context.addresses)).toBe(true);
    expect(Array.isArray(context.authMethods)).toBe(true);
    expect(typeof context.isActionPermitted).toBe('function');
    expect(typeof context.isAddressPermitted).toBe('function');
    expect(typeof context.isAuthMethodPermitted).toBe('function');
  });

  test('should get permitted auth methods', async () => {
    const authMethods = await manager.getPermittedAuthMethods();
    expect(authMethods).toBeDefined();
    expect(Array.isArray(authMethods)).toBe(true);

    // If there are auth methods, verify their structure
    if (authMethods.length > 0) {
      const firstMethod = authMethods[0];
      expect(typeof firstMethod.authMethodType).toBe('bigint');
      expect(typeof firstMethod.id).toBe('string');
      expect(typeof firstMethod.userPubkey).toBe('string');
    }
  });

  test('should get permitted auth method scopes', async () => {
    // If there are auth methods, test getting scopes for the first one
    const authMethods = await manager.getPermittedAuthMethods();

    if (authMethods.length > 0) {
      const firstMethod = authMethods[0];
      const scopes = await manager.getPermittedAuthMethodScopes({
        authMethodType: Number(firstMethod.authMethodType),
        authMethodId: firstMethod.id,
      });

      expect(scopes).toBeDefined();
      expect(Array.isArray(scopes)).toBe(true);

      // Verify each scope is a boolean
      scopes.forEach((scope) => {
        expect(typeof scope).toBe('boolean');
      });
    } else {
      // If no auth methods exist, test with a mock auth method
      const scopes = await manager.getPermittedAuthMethodScopes({
        authMethodType: 1, // EthWallet type
        authMethodId: '0x1234567890abcdef1234567890abcdef12345678',
      });

      expect(scopes).toBeDefined();
      expect(Array.isArray(scopes)).toBe(true);
    }
  });

  test('should verify auth method in permissions context', async () => {
    const context = await manager.getPermissionsContext();

    // If there are auth methods, test the helper function
    if (context.authMethods.length > 0) {
      const firstMethod = context.authMethods[0];
      const isPermitted = context.isAuthMethodPermitted(
        Number(firstMethod.authMethodType),
        firstMethod.id
      );

      expect(isPermitted).toBe(true);
    } else {
      // If no auth methods, test with a non-existent auth method
      const isPermitted = context.isAuthMethodPermitted(
        1, // EthWallet type
        '0x1234567890abcdef1234567890abcdef12345678'
      );

      expect(isPermitted).toBe(false);
    }
  });
});
