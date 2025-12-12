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

      const stringifyWithBigInt = (value: unknown) =>
        JSON.stringify(
          value,
          (_key, val) => (typeof val === 'bigint' ? val.toString() : val),
          2
        );

      const paymentDetail = executionResult.paymentDetail!;
      console.log(
        '[payment detail] executeJs response paymentDetail:',
        stringifyWithBigInt(paymentDetail)
      );

      expect(Array.isArray(paymentDetail)).toBe(true);
      expect(paymentDetail.length).toBeGreaterThan(0);

      paymentDetail.forEach((entry) => {
        expect(typeof entry.component).toBe('string');
        expect(entry.component.length).toBeGreaterThan(0);
        expect(typeof entry.quantity).toBe('number');
        expect(entry.quantity).toBeGreaterThan(0);
        expect(typeof entry.price).toBe('bigint');
        expect(entry.price).toBeGreaterThanOrEqual(0n);
      });

      expect(executionResult.debug?.paymentDetailByNode).toBeDefined();
      const paymentDetailByNode =
        executionResult.debug!.paymentDetailByNode!;
      console.log(
        '[payment detail] executeJs response paymentDetailByNode:',
        stringifyWithBigInt(paymentDetailByNode)
      );

      console.log(stringifyWithBigInt(executionResult.debug));

      expect(Array.isArray(paymentDetailByNode)).toBe(true);
      expect(paymentDetailByNode.length).toBeGreaterThan(0);

      const totalsFromDebug = new Map<
        string,
        { quantity: number; price: bigint }
      >();

      paymentDetailByNode.forEach((nodeEntry) => {
        expect(typeof nodeEntry.nodeUrl).toBe('string');
        expect(nodeEntry.nodeUrl.length).toBeGreaterThan(0);
        expect(Array.isArray(nodeEntry.paymentDetail)).toBe(true);
        expect(nodeEntry.paymentDetail.length).toBeGreaterThan(0);

        nodeEntry.paymentDetail.forEach((detail) => {
          expect(typeof detail.component).toBe('string');
          expect(detail.component.length).toBeGreaterThan(0);
          expect(typeof detail.quantity).toBe('number');
          expect(detail.quantity).toBeGreaterThan(0);
          expect(typeof detail.price).toBe('bigint');
          expect(detail.price).toBeGreaterThanOrEqual(0n);

          const current =
            totalsFromDebug.get(detail.component) ?? {
              quantity: 0,
              price: 0n,
            };
          current.quantity += detail.quantity;
          current.price += detail.price;
          totalsFromDebug.set(detail.component, current);
        });
      });

      paymentDetail.forEach((totalEntry) => {
        const fromDebug = totalsFromDebug.get(totalEntry.component);
        expect(fromDebug).toBeDefined();
        expect(fromDebug!.quantity).toBeCloseTo(totalEntry.quantity);
        expect(fromDebug!.price).toBe(totalEntry.price);
      });
    });
  });
};
