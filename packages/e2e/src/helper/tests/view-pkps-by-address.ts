import { init } from '../../init';

export const createViewPKPsByAddressTest = (
  ctx: Awaited<ReturnType<typeof init>>
) => {
  return async () => {
    const pkps = await ctx.litClient.viewPKPsByAddress({
      ownerAddress: ctx.aliceViemAccountPkp.ethAddress,
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
  };
};
