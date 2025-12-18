import { createEnvVars } from '../../../helper/createEnvVars';
import {
  createTestAccount,
  CreateTestAccountResult,
} from '../../../helper/createTestAccount';
import { createTestEnv } from '../../../helper/createTestEnv';
import { DECRYPT_WITHIN_LIT_ACTION } from './litActions/decryptWithinLitAction';
import { ENCRYPT_DECRYPT_WITHIN_LIT_ACTION } from './litActions/encryptDecryptWithinLitAction';
import { VERIFIABLE_DATA_JOB_LIT_ACTION } from './litActions/verifiableDataJob';
import { ORACLE_OPERATION_LIT_ACTION } from './litActions/oracleOperation';

const stringifyWithBigInt = (value: unknown) =>
  JSON.stringify(
    value,
    (_key, val) => (typeof val === 'bigint' ? val.toString() : val),
    2
  );

export const registerPaymentBenchmarkTests = () => {
  let testEnv: Awaited<ReturnType<typeof createTestEnv>>;
  let benchmarkUser: CreateTestAccountResult;

  beforeAll(async () => {
    const envVars = createEnvVars();
    testEnv = await createTestEnv(envVars);

    // Use TEST_ALICE_PRIVATE_KEY if available to reuse the same account across test runs
    const privateKey = process.env['TEST_ALICE_PRIVATE_KEY'] as `0x${string}` | undefined;

    benchmarkUser = await createTestAccount(testEnv, {
      label: 'Payment Benchmark User',
      privateKey, // Reuse account if env var is set
      fundAccount: true,
      fundLedger: true,
      hasEoaAuthContext: true,
      hasPKP: true,
      fundPKP: false,
      hasPKPAuthContext: false,
      fundPKPLedger: false,
    });
  }, 120000); // Increased timeout for setup

  describe('Payment Benchmark Tests', () => {
    describe.skip('Secure API Key Usage', () => {
      test('should encrypt outside the Lit Action, and decrypt and make a fetch request inside the Lit Action', async () => {
        // Encrypt the API key outside the Lit Action (simulating a pre-encrypted stored API key)
        const apiKeyData = JSON.stringify({ key: "example-api-key-12345" });

        // Create always-true access control conditions for the benchmark
        const accessControlConditions = [
          {
            contractAddress: "",
            standardContractType: "" as const,
            chain: "ethereum" as const,
            method: "",
            parameters: ["1"],
            returnValueTest: {
              comparator: "=" as const,
              value: "1",
            },
          },
        ];

        const encryptedData = await testEnv.litClient.encrypt({
          dataToEncrypt: apiKeyData,
          accessControlConditions,
          chain: 'ethereum',
        });

        const executionResult = await testEnv.litClient.executeJs({
          code: DECRYPT_WITHIN_LIT_ACTION,
          authContext: benchmarkUser.eoaAuthContext!,
          jsParams: {
            accessControlConditions,
            ciphertext: encryptedData.ciphertext,
            dataToEncryptHash: encryptedData.dataToEncryptHash,
          },
        });
        console.log('executionResult', executionResult);

        // Verify successful execution
        expect(executionResult.response).toBeDefined();
        const response = JSON.parse(executionResult.response as string);
        expect(response.success).toBe(true);
        expect(response.data).toBeDefined();

        // Verify payment details are returned
        expect(executionResult.paymentDetail).toBeDefined();
        expect(Array.isArray(executionResult.paymentDetail)).toBe(true);
        expect(executionResult.paymentDetail!.length).toBeGreaterThan(0);

        const paymentDetail = executionResult.paymentDetail!;
        console.log(executionResult);
        console.log('\nPayment Details:');
        console.log(stringifyWithBigInt(paymentDetail));

        // Calculate total cost
        const totalCost = paymentDetail.reduce((sum, entry) => {
          return sum + entry.price;
        }, 0n);
        console.log(`\nTotal Cost: ${totalCost.toString()}`);
      }, 120000); // 2 minute timeout

      test('should encrypt, decrypt and make a fetch request within the Lit Action', async () => {
        const executionResult = await testEnv.litClient.executeJs({
          code: ENCRYPT_DECRYPT_WITHIN_LIT_ACTION,
          authContext: benchmarkUser.eoaAuthContext!,
          jsParams: {},
        });
        console.log('executionResult', executionResult);

        // Verify successful execution
        expect(executionResult.response).toBeDefined();
        const response = JSON.parse(executionResult.response as string);
        expect(response.success).toBe(true);
        expect(response.data).toBeDefined();

        // Verify payment details are returned
        expect(executionResult.paymentDetail).toBeDefined();
        expect(Array.isArray(executionResult.paymentDetail)).toBe(true);
        expect(executionResult.paymentDetail!.length).toBeGreaterThan(0);

        const paymentDetail = executionResult.paymentDetail!;
        console.log('\nPayment Details:');
        console.log(stringifyWithBigInt(paymentDetail));

        // Calculate total cost
        const totalCost = paymentDetail.reduce((sum, entry) => {
          return sum + entry.price;
        }, 0n);
        console.log(`\nTotal Cost: ${totalCost.toString()}`);
      }, 120000); // 2 minute timeout
    });

    describe.skip('Verifiable Data Job', () => {
      test('should process data and sign the result', async () => {
        console.log('benchmarkUser', benchmarkUser);

        const executionResult = await testEnv.litClient.executeJs({
          code: VERIFIABLE_DATA_JOB_LIT_ACTION,
          authContext: benchmarkUser.eoaAuthContext!,
          jsParams: {
            pkpPublicKey: benchmarkUser.pkp!.pubkey,
          },
        });

        console.log('executionResult', executionResult);

        // Verify successful execution
        expect(executionResult.response).toBeDefined();
        const { response } = executionResult as any;
        expect(response.aggregatedData).toBeDefined();
        expect(response.aggregatedData.totalPoints).toBe(1000);
        expect(response.aggregatedData.averageValue).toBeGreaterThan(0);
        expect(response.aggregatedData.dataHash).toBeDefined();
        expect(response.aggregatedData.timestamp).toBeGreaterThan(0);

        expect(executionResult.signatures).toBeDefined();
        expect(executionResult.signatures['verifiable-data-signature']).toBeDefined();

        // Verify payment details are returned
        expect(executionResult.paymentDetail).toBeDefined();
        expect(Array.isArray(executionResult.paymentDetail)).toBe(true);
        expect(executionResult.paymentDetail!.length).toBeGreaterThan(0);

        const paymentDetail = executionResult.paymentDetail!;
        console.log('\nPayment Details:');
        console.log(stringifyWithBigInt(paymentDetail));

        // Calculate total cost
        const totalCost = paymentDetail.reduce((sum, entry) => {
          return sum + entry.price;
        }, 0n);
        console.log(`\nTotal Cost: ${totalCost.toString()}`);
      }, 120000); // 2 minute timeout
    });

    describe('Oracle Operation', () => {
      test('should fetch external data, medianize prices, and sign the result', async () => {
        const executionResult = await testEnv.litClient.executeJs({
          code: ORACLE_OPERATION_LIT_ACTION,
          authContext: benchmarkUser.eoaAuthContext!,
          jsParams: {},
        });

        console.log('executionResult', executionResult);

        // Verify successful execution
        expect(executionResult.response).toBeDefined();
        const { response } = executionResult as any;
        expect(response.medianPrice).toBeDefined();
        expect(parseFloat(response.medianPrice)).toBeGreaterThan(0);
        expect(response.data).toBe('payment benchmark success');

        // Verify signature was created
        expect(executionResult.signatures).toBeDefined();
        expect(executionResult.signatures['oracle-signature']).toBeDefined();

        // Verify payment details are returned
        expect(executionResult.paymentDetail).toBeDefined();
        expect(Array.isArray(executionResult.paymentDetail)).toBe(true);
        expect(executionResult.paymentDetail!.length).toBeGreaterThan(0);

        const paymentDetail = executionResult.paymentDetail!;
        console.log('\nPayment Details:');
        console.log(stringifyWithBigInt(paymentDetail));

        // Calculate total cost
        const totalCost = paymentDetail.reduce((sum, entry) => {
          return sum + entry.price;
        }, 0n);
        console.log(`\nTotal Cost: ${totalCost.toString()}`);
      }, 120000); // 2 minute timeout
    });
  });
};
