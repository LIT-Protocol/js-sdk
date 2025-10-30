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
            totalMaxPriceInWei: '1000000000000000000',
            requestsPerPeriod: '100',
            periodSeconds: '10',
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

      // 3. Now, Bob tries to sign with his PKP using Alice's sponsorship
      await testEnv.litClient.chain.ethereum.pkpSign({
        authContext: bobAccount.eoaAuthContext!,
        pubKey: bobAccount.pkp?.pubkey!,
        toSign: 'Hello, world!',
        userMaxPrice: 1000000000000000000n, // 0.05 ETH in Wei
      });

      // 4. Finally, check that Alice's Ledger balance has decreased
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
          userMaxPrice: 1000000000000000000n, // 0.05 ETH in Wei
        });
      } catch (e) {
        didFail = true;
        console.log(
          "As expected, Bob's PKP sign failed after Alice removed sponsorship:",
          e
        );
      }

      expect(didFail).toBe(true);
    });
  });
}
