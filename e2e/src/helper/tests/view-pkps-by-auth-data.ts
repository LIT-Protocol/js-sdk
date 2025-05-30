import { init } from '../../init';

export const createViewPKPsByAuthDataTest = (
  ctx: Awaited<ReturnType<typeof init>>,
  getAuthContext: () => any
) => {
  return async () => {
    const { ViemAccountAuthenticator } = await import('@lit-protocol/auth');
    const authData = await ViemAccountAuthenticator.authenticate(
      ctx.aliceViemAccount
    );

    const pkps = await ctx.litClient.viewPKPsByAuthData({
      authData: {
        authMethodType: authData.authMethodType,
        authMethodId: authData.authMethodId,
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
    expect(firstPkp.publicKey).toBeDefined();
    expect(firstPkp.ethAddress).toBeDefined();
  };
};
