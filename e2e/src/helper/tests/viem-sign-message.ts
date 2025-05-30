import { init } from '../../init';

export const createViemSignMessageTest = (
  ctx: Awaited<ReturnType<typeof init>>,
  getAuthContext: () => any
) => {
  return async () => {
    const pkpViemAccount = await ctx.litClient.getPkpViemAccount({
      pkpPublicKey: ctx.aliceViemAccountPkp.publicKey,
      authContext: getAuthContext(),
      chainConfig: ctx.litClient.getChainConfig().viemConfig,
    });

    const signature = await pkpViemAccount.signMessage({
      message: 'Hello from e2e test!',
    });

    expect(signature).toBeDefined();
    expect(signature).toMatch(/^0x[a-fA-F0-9]{130}$/);
  };
};
