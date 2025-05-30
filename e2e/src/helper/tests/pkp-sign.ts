import { init } from '../../init';

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

    expect(res.signature).toBeDefined();
  };
};
