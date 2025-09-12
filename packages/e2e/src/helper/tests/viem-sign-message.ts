import { init } from '../../init';
import { assert } from '../assertions';

export const createViemSignMessageTest = (
  ctx: Awaited<ReturnType<typeof init>>,
  getAuthContext: () => any
) => {
  return async () => {
    const pkpViemAccount = await ctx.litClient.getPkpViemAccount({
      pkpPublicKey: ctx.aliceViemAccountPkp.pubkey,
      authContext: getAuthContext(),
      chainConfig: ctx.litClient.getChainConfig().viemConfig,
    });

    const signature = await pkpViemAccount.signMessage({
      message: 'Hello Viem + Lit',
    });

    assert.toBeDefined(signature);
    assert.toMatch(signature, /^0x[a-fA-F0-9]{130}$/);
  };
};
