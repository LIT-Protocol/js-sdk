import { init } from '../../init';
import { ViemAccountAuthenticator } from '@lit-protocol/auth';
import { AuthContext } from '../../types';
import { AuthData } from '@lit-protocol/schemas';

type InitialisedInstance = Awaited<ReturnType<typeof init>>;

export const createViewPKPsByAuthDataTest = (
  ctx: InitialisedInstance,
  getAuthContext: () => AuthContext,
  authData?: AuthData
) => {
  return async () => {
    const _authData =
      authData ||
      (await ViemAccountAuthenticator.authenticate(ctx.aliceViemAccount));

    const pkps = await ctx.litClient.viewPKPsByAuthData({
      authData: {
        authMethodType: _authData.authMethodType,
        authMethodId: _authData.authMethodId,
        accessToken: _authData.accessToken || 'mock-token',
      },
      pagination: {
        limit: 10,
        offset: 0,
      },
    });

    expect(pkps).toBeDefined();
    expect(pkps.pkps).toBeDefined();
    expect(Array.isArray(pkps.pkps)).toBe(true);
    expect(pkps.pagination).toBeDefined();
    expect(typeof pkps.pagination.total).toBe('number');
    expect(typeof pkps.pagination.hasMore).toBe('boolean');

    // Should find at least the PKP we created in init
    expect(pkps.pkps.length).toBeGreaterThan(0);

    // Verify the PKP structure
    const firstPkp = pkps.pkps[0];
    expect(firstPkp.tokenId).toBeDefined();
    expect(firstPkp.pubkey).toBeDefined();
    expect(firstPkp.ethAddress).toBeDefined();
  };
};
