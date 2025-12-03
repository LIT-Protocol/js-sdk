// WIP! Use e2e.spec.ts instead
import { createEnvVars } from './helper/createEnvVars';
import { createTestEnv } from './helper/createTestEnv';
import {
  createTestAccount,
  CreateTestAccountResult,
} from './helper/createTestAccount';

const registerEoaExecuteJsSuite = () => {
  describe('EOA auth (revamp)', () => {
    let testEnv: Awaited<ReturnType<typeof createTestEnv>>;
    let alice: CreateTestAccountResult;

    beforeAll(async () => {
      const envVars = createEnvVars();
      testEnv = await createTestEnv(envVars);

      alice = await createTestAccount(testEnv, {
        label: 'Alice',
        fundAccount: true,
        hasEoaAuthContext: true,
        fundLedger: true,
        hasPKP: true,
        fundPKP: true,
        hasPKPAuthContext: true,
        fundPKPLedger: true,
      });
    });

    test('executeJs signs with Alice PKP', async () => {
      if (!alice.eoaAuthContext) {
        throw new Error('Alice is missing an EOA auth context');
      }
      if (!alice.pkp) {
        throw new Error('Alice is missing a PKP');
      }

      const litActionCode = `
(async () => {
  const { sigName, toSign, publicKey } = jsParams;
  const { keccak256, arrayify } = ethers.utils;

  const toSignBytes = new TextEncoder().encode(toSign);
  const toSignBytes32 = keccak256(toSignBytes);
  const toSignBytes32Array = arrayify(toSignBytes32);

  const sigShare = await Lit.Actions.signEcdsa({
    toSign: toSignBytes32Array,
    publicKey,
    sigName,
  });
})();`;

      const toSign = 'Revamp executeJs test';
      const result = await testEnv.litClient.executeJs({
        code: litActionCode,
        authContext: alice.eoaAuthContext,
        jsParams: {
          message: toSign,
          sigName: 'revamp-e2e-sig',
          toSign,
          publicKey: alice.pkp.pubkey,
        },
      });

      expect(result).toBeDefined();
      expect(result.signatures).toBeDefined();
    });
  });
};

describe('revamped e2e suite', () => {
  registerEoaExecuteJsSuite();
});
