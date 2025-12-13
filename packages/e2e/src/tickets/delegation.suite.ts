import { createEnvVars } from '../helper/createEnvVars';
import {
  createTestAccount,
  CreateTestAccountResult,
} from '../helper/createTestAccount';
import { createTestEnv } from '../helper/createTestEnv';
import { createAccBuilder } from '@lit-protocol/access-control-conditions';

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
      // 1. First, create Bob (use fixed private key if provided in env)
      bobAccount = await createTestAccount(testEnv, {
        label: 'Bob',
        fundAccount: true,
        hasEoaAuthContext: true,
        fundLedger: false,
        hasPKP: true,
        fundPKP: false,
        hasPKPAuthContext: false,
        fundPKPLedger: false,
        privateKey: envVars.testAccountPrivateKeys?.bob,
      });

      console.log('bobAccount:', bobAccount);

      if (!bobAccount.pkp?.ethAddress) {
        throw new Error("Bob's PKP does not have an ethAddress");
      }

      // 2. Next, create Alice, who will sponsor Bob (use fixed private key if provided in env)
      alice = await createTestAccount(testEnv, {
        label: 'Alice',
        fundAccount: true,
        fundLedger: true,
        hasPKP: true,
        fundPKP: true,
        fundPKPLedger: true,
        sponsor: {
          restrictions: {
            totalMaxPriceInWei:
              testEnv.config.sponsorshipLimits.totalMaxPriceInWei,
            requestsPerPeriod: '100',
            periodSeconds: '600',
          },
          userAddresses: [bobAccount.account.address],
        },
        privateKey: envVars.testAccountPrivateKeys?.alice,
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

    it("should allow Bob to decrypt data using Alice's sponsorship", async () => {
      // 1. First, create Bob (use fixed private key if provided in env)
      bobAccount = await createTestAccount(testEnv, {
        label: 'Bob',
        fundAccount: true,
        hasEoaAuthContext: true,
        fundLedger: false,
        hasPKP: false,
        fundPKP: false,
        hasPKPAuthContext: false,
        fundPKPLedger: false,
        privateKey: envVars.testAccountPrivateKeys?.bob,
      });

      console.log('bobAccount:', bobAccount);

      // 2. Next, create Alice, who will sponsor Bob (use fixed private key if provided in env)
      alice = await createTestAccount(testEnv, {
        label: 'Alice',
        fundAccount: true,
        fundLedger: true,
        hasPKP: false,
        fundPKP: false,
        fundPKPLedger: false,
        sponsor: {
          restrictions: {
            totalMaxPriceInWei:
              testEnv.config.sponsorshipLimits.totalMaxPriceInWei,
            requestsPerPeriod: '100',
            periodSeconds: '600',
          },
          userAddresses: [bobAccount.account.address],
        },
        privateKey: envVars.testAccountPrivateKeys?.alice,
      });

      // 3. Build access control conditions for Bob
      const builder = createAccBuilder();
      const accs = builder
        .requireWalletOwnership(bobAccount.account.address)
        .on('ethereum')
        .build();

      // 4. Alice encrypts data (no AuthContext needed for encryption)
      const dataToEncrypt = 'Secret message for Bob! 🔐';
      const encryptedData = await testEnv.litClient.encrypt({
        dataToEncrypt,
        unifiedAccessControlConditions: accs,
        chain: 'ethereum',
      });

      console.log('Encrypted data:', {
        ciphertext: encryptedData.ciphertext.substring(0, 50) + '...',
        dataToEncryptHash: encryptedData.dataToEncryptHash,
      });

      expect(encryptedData).toBeDefined();
      expect(encryptedData.ciphertext).toBeDefined();
      expect(encryptedData.dataToEncryptHash).toBeDefined();

      // 5. Take a snapshot of Alice's Ledger balance before Bob's decryption
      const aliceBeforeBalance = await testEnv.masterPaymentManager.getBalance({
        userAddress: alice.account.address,
      });

      console.log(
        "[BEFORE] Alice's Ledger balance before Bob's decryption:",
        aliceBeforeBalance
      );

      // 6. Bob decrypts data using Alice's sponsorship
      const decryptedResponse = await testEnv.litClient.decrypt({
        data: encryptedData,
        unifiedAccessControlConditions: accs,
        authContext: bobAccount.eoaAuthContext!,
        chain: 'ethereum',
      });

      console.log('Decrypted response:', decryptedResponse);

      expect(decryptedResponse).toBeDefined();
      expect(decryptedResponse.convertedData).toBeDefined();
      expect(decryptedResponse.convertedData).toBe(dataToEncrypt);

      // 7. Wait for payment to be processed
      await new Promise((resolve) => setTimeout(resolve, 5000));

      // 8. Verify Alice's Ledger balance has decreased
      const aliceBalanceAfter = await testEnv.masterPaymentManager.getBalance({
        userAddress: alice.account.address,
      });

      console.log(
        "[AFTER] Alice's Ledger balance after Bob's decryption:",
        aliceBalanceAfter
      );

      expect(BigInt(aliceBalanceAfter.raw.availableBalance)).toBeLessThan(
        BigInt(aliceBeforeBalance.raw.availableBalance)
      );

      // 9. Now, Alice removes Bob from her sponsorship
      await alice.paymentManager!.undelegatePaymentsBatch({
        userAddresses: [bobAccount.account.address],
      });

      // 10. Bob should now fail to decrypt due to lack of sponsorship
      let didFail = false;
      try {
        await testEnv.litClient.decrypt({
          data: encryptedData,
          unifiedAccessControlConditions: accs,
          authContext: bobAccount.eoaAuthContext!,
          chain: 'ethereum',
        });
      } catch (e) {
        didFail = true;
        console.log(
          "As expected, Bob's decryption failed after Alice removed sponsorship:",
          e
        );
      }

      expect(didFail).toBe(true);
    });
  });
}
