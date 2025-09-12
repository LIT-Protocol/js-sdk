import { init } from '../../init';
import { assert } from '../assertions';

export const createViemSignTransactionTest = (
  ctx: Awaited<ReturnType<typeof init>>,
  getAuthContext: () => any
) => {
  return async () => {
    const pkpViemAccount = await ctx.litClient.getPkpViemAccount({
      pkpPublicKey: ctx.aliceViemAccountPkp.publicKey,
      authContext: getAuthContext(),
      chainConfig: ctx.litClient.getChainConfig().viemConfig,
    });

    const txRequest = {
      chainId: ctx.litClient.getChainConfig().viemConfig.id,
      to: pkpViemAccount.address,
      value: BigInt('1000000000000000'),
    };

    const signedTx = await pkpViemAccount.signTransaction(txRequest);

    assert.toBeDefined(signedTx);
    assert.toMatch(signedTx, /^0x[a-fA-F0-9]+$/);
  };
};
