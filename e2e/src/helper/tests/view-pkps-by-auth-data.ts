import { init } from '../../init';
import { assert } from '../assertions';

export const createViewPKPsByAuthDataTest = (
  ctx: Awaited<ReturnType<typeof init>>,
  authData?: any
) => {
  return async () => {
    const { ViemAccountAuthenticator } = await import('@lit-protocol/auth');
    const _authData =
      authData ||
      (await ViemAccountAuthenticator.authenticate(ctx.aliceViemAccount));

    const pkps = await ctx.litClient.viewPKPsByAuthData({
      authData: {
        authMethodType: _authData.authMethodType,
        authMethodId: _authData.authMethodId,
      },
      pagination: {
        limit: 10,
        offset: 0,
      },
    });

    assert.toBeDefined(pkps);
    assert.toBeDefined(pkps.pkps);
    assert.toBe(Array.isArray(pkps.pkps), true);
    assert.toBeDefined(pkps.pagination);
    assert.toBe(typeof pkps.pagination.total, 'number');
    assert.toBe(typeof pkps.pagination.hasMore, 'boolean');

    // Should find at least the PKP we created in init
    assert.toBeGreaterThan(pkps.pkps.length, 0);

    // Verify the PKP structure
    const firstPkp = pkps.pkps[0];
    assert.toBeDefined(firstPkp.tokenId);
    assert.toBeDefined(firstPkp.publicKey);
    assert.toBeDefined(firstPkp.ethAddress);
  };
};
