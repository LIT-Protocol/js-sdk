import { init } from '../../init';
import { getAddress } from 'viem';
export const createViemSignTypedDataTest = (
  ctx: Awaited<ReturnType<typeof init>>,
  getAuthContext: () => any
) => {
  return async () => {
    const pkpViemAccount = await ctx.litClient.getPkpViemAccount({
      pkpPublicKey: ctx.aliceViemAccountPkp.pubkey,
      authContext: getAuthContext(),
      chainConfig: ctx.litClient.getChainConfig().viemConfig,
    });

    const typedData = {
      domain: {
        name: 'E2E Test Service',
        version: '1',
        chainId: BigInt(1),
        verifyingContract: getAddress(
          '0x1e0Ae8205e9726E6F296ab8869930607a853204C'
        ),
      },
      types: {
        EIP712Domain: [
          { name: 'name', type: 'string' },
          { name: 'version', type: 'string' },
          { name: 'chainId', type: 'uint256' },
          { name: 'verifyingContract', type: 'address' },
        ],
        Person: [
          { name: 'name', type: 'string' },
          { name: 'wallet', type: 'address' },
        ],
        Mail: [
          { name: 'from', type: 'Person' },
          { name: 'to', type: 'Person' },
          { name: 'contents', type: 'string' },
        ],
      },
      primaryType: 'Mail' as const,
      message: {
        from: {
          name: 'Alice',
          wallet: getAddress('0x2111111111111111111111111111111111111111'),
        },
        to: {
          name: 'Bob',
          wallet: getAddress('0x3111111111111111111111111111111111111111'),
        },
        contents: 'Hello from e2e typed data test!',
      },
    } as const;

    const signature = await pkpViemAccount.signTypedData(typedData);

    expect(signature).toBeDefined();
    expect(signature).toMatch(/^0x[a-fA-F0-9]{130}$/);
  };
};
