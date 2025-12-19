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
import { CROSS_CHAIN_SWAP_LIT_ACTION } from './litActions/crossChainSwap';

const stringifyWithBigInt = (value: unknown) =>
  JSON.stringify(
    value,
    (_key, val) => (typeof val === 'bigint' ? val.toString() : val),
    2
  );

type PaymentSummary = {
  testName: string;
  components: Array<{
    component: string;
    quantity: number;
    price: bigint;
  }>;
  totalCost: bigint;
};

export const registerPaymentBenchmarkTests = () => {
  let testEnv: Awaited<ReturnType<typeof createTestEnv>>;
  let benchmarkUser: CreateTestAccountResult;
  const paymentSummaries: PaymentSummary[] = [];

  // Helper function to process and log payment details
  const logAndSavePaymentDetails = (
    testName: string,
    paymentDetail: Array<{ component: string; quantity: number; price: bigint }>
  ) => {
    console.log('\nPayment Details:');
    console.log(stringifyWithBigInt(paymentDetail));

    // Calculate total cost
    const totalCost = paymentDetail.reduce((sum, entry) => {
      return sum + entry.price;
    }, 0n);
    console.log(`\nTotal Cost: ${totalCost.toString()}`);

    // Add to summary
    paymentSummaries.push({
      testName,
      components: paymentDetail.map((entry) => ({
        component: entry.component,
        quantity: entry.quantity,
        price: entry.price,
      })),
      totalCost,
    });
  };

  beforeAll(async () => {
    const envVars = createEnvVars();
    testEnv = await createTestEnv(envVars);

    // Use TEST_ALICE_PRIVATE_KEY if available to reuse the same account across test runs
    const privateKey = process.env['TEST_ALICE_PRIVATE_KEY'] as
      | `0x${string}`
      | undefined;

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

  afterAll(() => {
    if (paymentSummaries.length > 0) {
      paymentSummaries.forEach((summary, index) => {
        // Use a single console.log with console.table to title the table
        const tableTitle = `${summary.testName}`;

        // Create table data
        const tableData = summary.components.map((comp) => ({
          Component: comp.component,
          Quantity: comp.quantity,
          'Price (wei)': comp.price.toString(),
          'Price (tstLPX)': (Number(comp.price) / 1e18).toFixed(10),
        }));

        // Add total row
        const totalInTstLPX = (Number(summary.totalCost) / 1e18).toFixed(10);
        tableData.push({
          Component: '**TOTAL**',
          Quantity: 0,
          'Price (wei)': summary.totalCost.toString(),
          'Price (tstLPX)': totalInTstLPX,
        });

        // Title above table and table itself in one group for readability
        console.group(tableTitle);
        console.table(tableData);
        console.groupEnd();
      });

      // Grand total
      const grandTotal = paymentSummaries.reduce(
        (sum, s) => sum + s.totalCost,
        0n
      );
      const grandTotalInTstLPX = (Number(grandTotal) / 1e18).toFixed(10);
      console.log(
        `GRAND TOTAL (ALL TESTS): ${grandTotal.toString()} wei (${grandTotalInTstLPX} tstLPX)`
      );
    }
  });

  describe('Payment Benchmark Tests', () => {
    describe('Secure API Key Usage', () => {
      test('should encrypt outside the Lit Action, and decrypt and make a fetch request inside the Lit Action', async () => {
        // Encrypt the API key outside the Lit Action (simulating a pre-encrypted stored API key)
        const apiKeyData = JSON.stringify({ key: 'example-api-key-12345' });

        // Create always-true access control conditions for the benchmark
        const accessControlConditions = [
          {
            contractAddress: '',
            standardContractType: '' as const,
            chain: 'ethereum' as const,
            method: '',
            parameters: ['1'],
            returnValueTest: {
              comparator: '=' as const,
              value: '1',
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
        logAndSavePaymentDetails('Decrypt within Lit Action', paymentDetail);
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
        logAndSavePaymentDetails(
          'Encrypt & Decrypt within Lit Action',
          paymentDetail
        );
      }, 120000); // 2 minute timeout
    });

    describe('Verifiable Data Job', () => {
      test('should process data and sign the result', async () => {
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
        expect(
          executionResult.signatures['verifiable-data-signature']
        ).toBeDefined();

        // Verify payment details are returned
        expect(executionResult.paymentDetail).toBeDefined();
        expect(Array.isArray(executionResult.paymentDetail)).toBe(true);
        expect(executionResult.paymentDetail!.length).toBeGreaterThan(0);

        const paymentDetail = executionResult.paymentDetail!;
        logAndSavePaymentDetails('Verifiable Data Job', paymentDetail);
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
        logAndSavePaymentDetails('Oracle Operation', paymentDetail);
      }, 120000); // 2 minute timeout
    });

    describe('Cross-Chain Swap', () => {
      test('should perform realistic cross-chain swap with price discovery and multi-step signing', async () => {
        const executionResult = await testEnv.litClient.executeJs({
          code: CROSS_CHAIN_SWAP_LIT_ACTION,
          authContext: benchmarkUser.eoaAuthContext!,
          jsParams: {
            pkpPublicKey: benchmarkUser.pkp!.pubkey,
          },
        });

        console.log('executionResult', executionResult);

        // Verify successful execution
        expect(executionResult.response).toBeDefined();
        const { response } = executionResult as any;

        // Verify swap intent structure
        expect(response.swapIntent).toBeDefined();
        expect(response.swapIntent.params).toBeDefined();
        expect(response.swapIntent.params.sourceChain).toBe('ethereum');
        expect(response.swapIntent.params.destChain).toBe('bitcoin');
        expect(response.swapIntent.params.amountIn).toBe('1.0');

        // Verify pricing calculations
        expect(response.swapIntent.pricing).toBeDefined();
        expect(response.swapIntent.pricing.ethPrice).toBeGreaterThan(0);
        expect(response.swapIntent.pricing.bitcoinPrice).toBeGreaterThan(0);
        expect(response.swapIntent.pricing.expectedAmountOut).toBeGreaterThan(
          0
        );
        expect(response.swapIntent.pricing.amountOutAfterFees).toBeGreaterThan(
          0
        );
        expect(response.swapIntent.pricing.amountOutAfterFees).toBeLessThan(
          response.swapIntent.pricing.expectedAmountOut
        ); // Fees should reduce output

        // Verify execution proof
        expect(response.executionProof).toBeDefined();
        expect(response.executionProof.status).toBe('completed');
        expect(response.executionProof.sourceTxHash).toBeDefined();
        expect(response.executionProof.destTxHash).toBeDefined();
        expect(response.executionProof.sourceBlockNumber).toBeGreaterThan(0);
        expect(response.executionProof.destBlockNumber).toBeGreaterThan(0);

        expect(response.data).toBe('payment benchmark success');

        // Verify both signatures were created (approval + execution)
        expect(executionResult.signatures).toBeDefined();
        expect(
          executionResult.signatures['swap-approval-signature']
        ).toBeDefined();
        expect(
          executionResult.signatures['swap-execution-signature']
        ).toBeDefined();

        // Verify payment details are returned
        expect(executionResult.paymentDetail).toBeDefined();
        expect(Array.isArray(executionResult.paymentDetail)).toBe(true);
        expect(executionResult.paymentDetail!.length).toBeGreaterThan(0);

        const paymentDetail = executionResult.paymentDetail!;
        logAndSavePaymentDetails('Cross-Chain Swap', paymentDetail);
      }, 240000); // 4 minute timeout
    });
  });
};
