import { init } from '../../init';
import { assert } from '../assertions';

export const createPkpSignTest = (
  ctx: Awaited<ReturnType<typeof init>>,
  getAuthContext: () => any
) => {
  return async () => {
    const res = await ctx.litClient.chain.ethereum.pkpSign({
      authContext: getAuthContext(),
      pubKey: ctx.aliceViemAccountPkp.publicKey,
      toSign: 'Hello, world!',
    });

    assert.toBeDefined(res.signature, 'toBeDefined');
  };
};
