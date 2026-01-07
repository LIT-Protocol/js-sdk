// Lite mainnet e2e run profile (approx per run)
// +----------------------+-------+------------+-----------------------------------------+
// | Item                 | Count | LITKEY     | Notes                                   |
// +----------------------+-------+------------+-----------------------------------------+
// | EOAs                 | 3     | -          | MASTER + Alice + Bob                    |
// | PKP mints            | 2-3   | 28-42      | +1 if MASTER has no PKP                 |
// | Paid endpoints       | -     | -          | all rows below                          |
// | pkpSign              | 3     | 8.37       | paid endpoint                           |
// | signSessionKey       | 1     | 13.95      | paid endpoint                           |
// | litAction            | 3     | 1.67       | executeJs + wrapped keys import/export  |
// | encrypt/decrypt      | 1     | 2.79       | paid endpoint                           |
// | Paid endpoints total | 1     | ~26.78     | sum of paid endpoint rows above         |
// | Rough run total      | 1     | ~54.8-68.8 | excludes gas for on-chain txs           |
// +----------------------+-------+------------+-----------------------------------------+
// +--------------------------------------+---------+----------+---------------------------------------+
// | Env var                              | Value   | Unit     | Rationale                              |
// +--------------------------------------+---------+----------+---------------------------------------+
// | NAGA_MAINNET_NETWORK_FUNDING_AMOUNT  | >=18-20 | LITKEY   | 14 mint + gas buffer + delegation txs; |
// |                                      |         | per acct | tops up Alice/Bob/PKP (worst-case x3)  |
// | NAGA_MAINNET_LEDGER_DEPOSIT_AMOUNT   | >=60    | LITKEY   | covers mainnet min price checks; tops up |
// |                                      |         | per addr | MASTER+PKP+Alice+PKP (worst-case x4)   |
// +--------------------------------------+---------+----------+---------------------------------------+
import { createEnvVars } from '../helper/createEnvVars';
import { createTestEnv } from '../helper/createTestEnv';
import {
  ensureMasterLedgerBalances,
  initLiteMainnetContext,
  runEncryptDecryptTest,
  runExecuteJsTest,
  runHandshakeTest,
  runPaymentDelegationTest,
  runPkpSignTest,
  runSignSessionKeyTest,
  runWrappedKeysTest,
  type LiteContext,
} from './mainnet-lite.runner';

const RUN_LITE_MAINNET_E2E = process.env['RUN_LITE_MAINNET_E2E'] === '1';
const IS_MAINNET = process.env['NETWORK'] === 'naga';
const UPTIME_BOT = process.env['UPTIME_BOT'] === 'true';
const describeIfMainnet =
  RUN_LITE_MAINNET_E2E && IS_MAINNET && !UPTIME_BOT ? describe : describe.skip;

describeIfMainnet('lite mainnet e2e', () => {
  describe('core endpoints', () => {
    let ctx: LiteContext;

    beforeAll(async () => {
      ctx = await initLiteMainnetContext();
    });

    beforeEach(async () => {
      await ensureMasterLedgerBalances(ctx);
    });

    it('handshake', async () => {
      await runHandshakeTest(ctx);
    });

    it('pkpSign', async () => {
      await runPkpSignTest(ctx);
    });

    it('signSessionKey', async () => {
      await runSignSessionKeyTest(ctx);
    });

    it('executeJs', async () => {
      await runExecuteJsTest(ctx);
    });

    it('encryptDecrypt', async () => {
      await runEncryptDecryptTest(ctx);
    });

    it('wrappedKeys', async () => {
      await runWrappedKeysTest(ctx);
    });
  });

  describe('payment delegation test', () => {
    let envVars: ReturnType<typeof createEnvVars>;
    let testEnv: Awaited<ReturnType<typeof createTestEnv>>;

    beforeAll(async () => {
      envVars = createEnvVars();
      testEnv = await createTestEnv(envVars);
    });

    it("should allow Bob to use Alice's sponsorship to pay for PKP execution", async () => {
      await runPaymentDelegationTest(testEnv);
    });
  });
});
