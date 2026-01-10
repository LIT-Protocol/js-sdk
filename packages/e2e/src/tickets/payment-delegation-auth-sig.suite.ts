import { createPaymentDelegationAuthSig } from '@lit-protocol/auth-helpers';

import { createEnvVars } from '../helper/createEnvVars';
import { createTestAccount } from '../helper/createTestAccount';
import { createTestEnv } from '../helper/createTestEnv';

export function registerPaymentDelegationAuthSigTicketSuite() {
  describe('payment delegation auth sig', () => {
    let envVars: ReturnType<typeof createEnvVars>;
    let testEnv: Awaited<ReturnType<typeof createTestEnv>>;

    beforeAll(async () => {
      envVars = createEnvVars();
      testEnv = await createTestEnv(envVars);
    });

    it('allows a user to pay via a delegation AuthSig without on-chain delegation', async () => {
      const bob = await createTestAccount(testEnv, {
        label: 'Bob',
        fundAccount: true,
        fundLedger: false,
        hasEoaAuthContext: false,
        hasPKP: true,
        fundPKP: false,
        fundPKPLedger: false,
      });

      if (!bob.pkp?.pubkey) {
        throw new Error("Bob's PKP is required for this test");
      }

      const alice = await createTestAccount(testEnv, {
        label: 'Alice',
        fundAccount: true,
        fundLedger: true,
        hasPKP: false,
        fundPKP: false,
        fundPKPLedger: false,
      });

      const aliceBalanceBefore = await testEnv.masterPaymentManager.getBalance({
        userAddress: alice.account.address,
      });

      const maxDelegationPrice = 2n ** 128n - 1n;
      const delegationExpiresAtMs = Date.now() + 10_000;
      const delegationExpiration = new Date(
        delegationExpiresAtMs
      ).toISOString();

      const paymentDelegationAuthSig = await createPaymentDelegationAuthSig({
        signer: alice.account,
        signerAddress: alice.account.address,
        delegateeAddresses: [bob.account.address],
        maxPrice: maxDelegationPrice,
        scopes: ['pkp_sign'],
        litClient: testEnv.litClient,
        expiration: delegationExpiration,
        domain: 'example.com',
        statement:
          'Authorize a single session to use my payment delegation balance.',
      });

      const bobAuthContext = await testEnv.authManager.createEoaAuthContext({
        config: {
          account: bob.account,
        },
        authConfig: {
          resources: [
            ['pkp-signing', '*'],
            ['lit-action-execution', '*'],
            ['access-control-condition-decryption', '*'],
          ],
          capabilityAuthSigs: [paymentDelegationAuthSig],
          expiration: new Date(Date.now() + 1000 * 60 * 10).toISOString(),
        },
        litClient: testEnv.litClient,
      });

      const pkpSignResult = await testEnv.litClient.chain.ethereum.pkpSign({
        authContext: bobAuthContext,
        pubKey: bob.pkp.pubkey,
        toSign: 'delegated payment via auth sig',
      });

      expect(pkpSignResult).toBeTruthy();

      if (envVars.network === 'naga-dev') {
        console.log(
          'ℹ️ Skipping ledger balance assertion on naga-dev (pricing not enforced).'
        );
      } else {
        await new Promise((resolve) => setTimeout(resolve, 5000));

        const aliceBalanceAfter = await testEnv.masterPaymentManager.getBalance(
          {
            userAddress: alice.account.address,
          }
        );

        expect(BigInt(aliceBalanceAfter.raw.availableBalance)).toBeLessThan(
          BigInt(aliceBalanceBefore.raw.availableBalance)
        );
      }

      const waitForExpirationMs = Math.max(
        0,
        delegationExpiresAtMs - Date.now() + 1000
      );
      if (waitForExpirationMs > 0) {
        await new Promise((resolve) =>
          setTimeout(resolve, waitForExpirationMs)
        );
      }

      await expect(
        testEnv.litClient.chain.ethereum.pkpSign({
          authContext: bobAuthContext,
          pubKey: bob.pkp.pubkey,
          toSign: 'delegated payment via auth sig (expired)',
        })
      ).rejects.toThrow();
    });
  });
}
