import { init } from '../../../init';
import { AuthContext } from '../../../types';

type ExecuteJsContext = Pick<
  Awaited<ReturnType<typeof init>>,
  'litClient' | 'aliceViemAccountPkp'
>;

export const createExecuteJsBasicTest = (
  ctx: ExecuteJsContext,
  getAuthContext: () => AuthContext,
  pubkey?: string
) => {
  return async () => {
    const litActionCode = `
(async () => {
  const { sigName, toSign, publicKey } = jsParams;
  const { keccak256, arrayify } = ethers.utils;
  
  const toSignBytes = new TextEncoder().encode(toSign);
  const toSignBytes32 = keccak256(toSignBytes);
  const toSignBytes32Array = arrayify(toSignBytes32);
  
  const sigShare = await Lit.Actions.signEcdsa({
    toSign: toSignBytes32Array,
    publicKey,
    sigName,
  });  
})();`;

    const defaultPubkey = ctx.aliceViemAccountPkp?.pubkey;
    const targetPubkey = pubkey ?? defaultPubkey;

    if (!targetPubkey) {
      throw new Error('Missing PKP public key for executeJs test');
    }

    const result = await ctx.litClient.executeJs({
      code: litActionCode,
      authContext: getAuthContext(),
      jsParams: {
        message: 'Test message from e2e executeJs',
        sigName: 'e2e-test-sig',
        toSign: 'Test message from e2e executeJs',
        publicKey: targetPubkey,
      },
    });

    expect(result).toBeDefined();
    expect(result.signatures).toBeDefined();
  };
};
