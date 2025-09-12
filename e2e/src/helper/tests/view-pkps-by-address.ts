import { init } from '../../init';
import { assert } from '../assertions';

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

    assert.toBeDefined(pkps);
    assert.toBeDefined(pkps.pkps);
    assert.toBe(Array.isArray(pkps.pkps), true);
    assert.toBeDefined(pkps.pagination);
    assert.toBe(typeof pkps.pagination.total, 'number');
    assert.toBe(typeof pkps.pagination.hasMore, 'boolean');
  };
};
