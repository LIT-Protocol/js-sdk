import { createEnvVars } from '../helper/createEnvVars';
import {
  createTestAccount,
  CreateTestAccountResult,
} from '../helper/createTestAccount';
import { createTestEnv } from '../helper/createTestEnv';

export function registerPaymentDelegationTicketSuite() {
  describe('payment delegation test', () => {
    let envVars: ReturnType<typeof createEnvVars>;
    let testEnv: Awaited<ReturnType<typeof createTestEnv>>;
    let alice: CreateTestAccountResult;
    let bobAccount: CreateTestAccountResult;

    beforeAll(async () => {
      envVars = createEnvVars();
      testEnv = await createTestEnv(envVars);
    });

    it("should allow Bob to use Alice's sponsorship to pay for PKP execution", async () => {
      // 1. First, create Bob
      bobAccount = await createTestAccount(testEnv, {
        label: 'Bob',
        fundAccount: true,
        hasEoaAuthContext: true,
        fundLedger: false,
        hasPKP: true,
        fundPKP: false,
        hasPKPAuthContext: false,
        fundPKPLedger: false,
      });

      console.log('bobAccount:', bobAccount);

      if (!bobAccount.pkp?.ethAddress) {
        throw new Error("Bob's PKP does not have an ethAddress");
      }

      // 2. Next, create Alice, who will sponsor Bob
      alice = await createTestAccount(testEnv, {
        label: 'Alice',
        fundAccount: true,
        fundLedger: true,
        hasPKP: true,
        fundPKP: true,
        fundPKPLedger: true,
        sponsor: {
          restrictions: {
            totalMaxPriceInWei: testEnv.config.sponsorshipLimits.totalMaxPriceInWei,
            requestsPerPeriod: '100',
            periodSeconds: '600',
          },
          userAddresses: [bobAccount.account.address],
        },
      });

      // 3. Take a snapshot of Alice's Ledger balance before Bob's request
      const aliceBeforeBalance = await testEnv.masterPaymentManager.getBalance({
        userAddress: alice.account.address,
      });

      console.log(
        "[BEFORE] Alice's Ledger balance before Bob's request:",
        aliceBeforeBalance
      );

      // 4. Now, Bob tries to sign with his PKP using Alice's sponsorship
      await testEnv.litClient.chain.ethereum.pkpSign({
        authContext: bobAccount.eoaAuthContext!,
        pubKey: bobAccount.pkp?.pubkey!,
        toSign: 'Hello, world!',
        userMaxPrice: testEnv.config.sponsorshipLimits.userMaxPrice,
      });

      // 5. Now, Alice removes Bob from her sponsorship
      await alice.paymentManager!.undelegatePaymentsBatch({
        userAddresses: [bobAccount.account.address],
      });

      // 6. Bob should now fail to sign with his PKP due to lack of sponsorship
      let didFail = false;
      try {
        await testEnv.litClient.chain.ethereum.pkpSign({
          authContext: bobAccount.eoaAuthContext!,
          pubKey: bobAccount.pkp?.pubkey!,
          toSign: 'Hello again, world!',
          userMaxPrice: testEnv.config.sponsorshipLimits.userMaxPrice,
        });
      } catch (e) {
        didFail = true;
        console.log(
          "As expected, Bob's PKP sign failed after Alice removed sponsorship:",
          e
        );
      }

      expect(didFail).toBe(true);

      // 7. Finally, check that Alice's Ledger balance has decreased
      // let's wait a big longer for the payment to be processed
      await new Promise((resolve) => setTimeout(resolve, 5000));
      const aliceBalanceAfter = await testEnv.masterPaymentManager.getBalance({
        userAddress: alice.account.address,
      });

      console.log(
        "[AFTER] Alice's Ledger balance after Bob's request:",
        aliceBalanceAfter
      );

      expect(BigInt(aliceBalanceAfter.raw.availableBalance)).toBeLessThan(
        BigInt(aliceBeforeBalance.raw.availableBalance)
      );
    });
  });
}
