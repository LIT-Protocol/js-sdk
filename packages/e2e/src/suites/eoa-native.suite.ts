import { ViemAccountAuthenticator } from '@lit-protocol/auth';
import type { CreateTestAccountResult } from '../helper/createTestAccount';
import type { TestEnv } from '../helper/createTestEnv';

export function registerEoaNativeSuite(
  getTestEnv: () => TestEnv,
  getAliceAccount: () => CreateTestAccountResult
) {
  describe('EOA native authentication and PKP minting', () => {
    it('authenticates via ViemAccountAuthenticator', async () => {
      const alice = getAliceAccount();
      const authDataViemAccount = await ViemAccountAuthenticator.authenticate(
        alice.account
      );

      expect(authDataViemAccount.accessToken).toBeDefined();
      expect(authDataViemAccount.authMethodType).toBeDefined();
      expect(authDataViemAccount.authMethodId).toBeDefined();

      const authSig = JSON.parse(authDataViemAccount.accessToken);
      expect(authSig.sig).toBeDefined();
      expect(authSig.derivedVia).toBeDefined();
      expect(authSig.signedMessage).toBeDefined();
      expect(authSig.address).toBeDefined();

      const authData = await ViemAccountAuthenticator.authenticate(
        alice.account
      );
      expect(authData.authMethodType).toBe(authDataViemAccount.authMethodType);
      expect(authData.authMethodId).toBe(authDataViemAccount.authMethodId);
    });

    it('mints a PKP using EOA', async () => {
      const testEnv = getTestEnv();
      const alice = getAliceAccount();

      const mintedPkpWithEoa = await testEnv.litClient.mintWithEoa({
        account: alice.account,
      });

      expect(mintedPkpWithEoa.data).toBeDefined();
      expect(mintedPkpWithEoa.txHash).toBeDefined();

      const pkpData = mintedPkpWithEoa.data;
      expect(pkpData.tokenId).toBeDefined();
      expect(pkpData.pubkey).toBeDefined();
      expect(pkpData.ethAddress).toMatch(/^0x[a-fA-F0-9]{40}$/);
      expect(pkpData.pubkey).toMatch(/^0x04[a-fA-F0-9]{128}$/);
      expect(typeof pkpData.tokenId).toBe('bigint');
      expect(mintedPkpWithEoa.txHash).toMatch(/^0x[a-fA-F0-9]{64}$/);
    });
  });
}
