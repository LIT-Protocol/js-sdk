import { init } from '../../init';

export const createExecuteJsTest = (
  ctx: Awaited<ReturnType<typeof init>>,
  getAuthContext: () => any,
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

    const result = await ctx.litClient.executeJs({
      code: litActionCode,
      authContext: getAuthContext(),
      jsParams: {
        message: 'Test message from e2e executeJs',
        sigName: 'e2e-test-sig',
        toSign: 'Test message from e2e executeJs',
        publicKey: pubkey || ctx.aliceViemAccountPkp.publicKey,
      },
    });

    expect(result).toBeDefined();
    expect(result.signatures).toBeDefined();
  };
};
