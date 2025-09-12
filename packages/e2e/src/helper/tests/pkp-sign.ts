import { init } from '../../init';

export const createPkpSignTest = (
  ctx: Awaited<ReturnType<typeof init>>,
  getAuthContext: () => any,
  pubkey?: string
) => {
  return async () => {
    const res = await ctx.litClient.chain.ethereum.pkpSign({
      // chain: 'ethereum',
      // signingScheme: 'EcdsaK256Sha256',
      authContext: getAuthContext(),
      pubKey: pubkey || ctx.aliceViemAccountPkp.publicKey,
      toSign: 'Hello, world!',
    });

    expect(res.signature).toBeDefined();
  };
};
