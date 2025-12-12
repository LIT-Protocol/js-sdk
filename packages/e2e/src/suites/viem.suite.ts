import type { AuthContext } from '../types';
import type { TestEnv } from '../helper/createTestEnv';
import { withRetry } from './suite-utils';

export function registerViemSuite(
  getTestEnv: () => TestEnv,
  getAuthContext: () => AuthContext,
  getPkpPublicKey: () => string
) {
  describe('integrations', () => {
    describe('pkp viem account', () => {
      it('sign message', async () => {
        const testEnv = getTestEnv();
        const pkpViemAccount = await testEnv.litClient.getPkpViemAccount({
          pkpPublicKey: getPkpPublicKey(),
          authContext: getAuthContext(),
          chainConfig: testEnv.litClient.getChainConfig().viemConfig,
        });

        const signature = await withRetry(() =>
          pkpViemAccount.signMessage({
            message: 'Hello Viem + Lit',
          })
        );

        expect(signature).toMatch(/^0x[a-fA-F0-9]{130}$/);
      });

      it('sign transaction', async () => {
        const testEnv = getTestEnv();
        const pkpViemAccount = await testEnv.litClient.getPkpViemAccount({
          pkpPublicKey: getPkpPublicKey(),
          authContext: getAuthContext(),
          chainConfig: testEnv.litClient.getChainConfig().viemConfig,
        });

        const txRequest = {
          chainId: testEnv.litClient.getChainConfig().viemConfig.id,
          to: pkpViemAccount.address,
          value: BigInt('1000000000000000'),
        };

        const signedTx = await withRetry(() =>
          pkpViemAccount.signTransaction(txRequest)
        );
        expect(signedTx).toMatch(/^0x[a-fA-F0-9]+$/);
      });

      it('sign typed data', async () => {
        const testEnv = getTestEnv();
        const pkpViemAccount = await testEnv.litClient.getPkpViemAccount({
          pkpPublicKey: getPkpPublicKey(),
          authContext: getAuthContext(),
          chainConfig: testEnv.litClient.getChainConfig().viemConfig,
        });

        const { getAddress } = await import('viem');

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
              wallet: getAddress(
                '0x2111111111111111111111111111111111111111'
              ),
            },
            to: {
              name: 'Bob',
              wallet: getAddress(
                '0x3111111111111111111111111111111111111111'
              ),
            },
            contents: 'Hello from revamp e2e typed data test!',
          },
        } as const;

        const signature = await withRetry(() =>
          pkpViemAccount.signTypedData(typedData)
        );
        expect(signature).toMatch(/^0x[a-fA-F0-9]{130}$/);
      });
    });
  });
}
