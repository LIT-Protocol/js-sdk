import { createEnvVars } from '../../helper/createEnvVars';
import {
  createTestAccount,
  CreateTestAccountResult,
} from '../../helper/createTestAccount';
import { createTestEnv } from '../../helper/createTestEnv';

const PAYMENT_DETAILS_LIT_ACTION = `
(async () => {
  const { message } = jsParams;

  Lit.Actions.setResponse({ response: message ?? 'payment detail' });
})();
`;

export const registerPaymentDetailsResponseTests = () => {
  let testEnv: Awaited<ReturnType<typeof createTestEnv>>;
  let payer: CreateTestAccountResult;

  beforeAll(async () => {
    const envVars = createEnvVars();
    testEnv = await createTestEnv(envVars);

    payer = await createTestAccount(testEnv, {
      label: 'Payment Detail Lit Action User',
      fundAccount: true,
      fundLedger: true,
      hasEoaAuthContext: true,
      hasPKP: true,
      fundPKP: true,
      hasPKPAuthContext: true,
      fundPKPLedger: true,
    });

    if (!payer.pkpAuthContext) {
      throw new Error(
        'PKP auth context was not created for payment detail test'
      );
    }
  });

  describe('executeJs payment detail response', () => {
    test('returns payment detail in executeJs response', async () => {
      const echoMessage = 'payment detail response ok';

      const executionResult = await testEnv.litClient.executeJs({
        code: PAYMENT_DETAILS_LIT_ACTION,
        authContext: payer.pkpAuthContext!,
        jsParams: {
          message: echoMessage,
        },
      });

      expect(executionResult.response).toBe(echoMessage);
      expect(executionResult.paymentDetail).toBeDefined();

      const paymentDetail = executionResult.paymentDetail!;
      console.log(
        '[payment detail] executeJs response paymentDetail:',
        paymentDetail
      );

      expect(Array.isArray(paymentDetail)).toBe(true);
      expect(paymentDetail.length).toBeGreaterThan(0);

      paymentDetail.forEach((entry) => {
        expect(typeof entry.component).toBe('string');
        expect(entry.component.length).toBeGreaterThan(0);
        expect(typeof entry.quantity).toBe('number');
        expect(entry.quantity).toBeGreaterThan(0);
        expect(typeof entry.price).toBe('number');
        expect(entry.price).toBeGreaterThanOrEqual(0);
      });
    });
  });
};
