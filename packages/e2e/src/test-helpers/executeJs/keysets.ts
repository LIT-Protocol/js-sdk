import { AuthSig } from '@lit-protocol/types';

import { createEnvVars } from '../../helper/createEnvVars';
import {
  createTestAccount,
  CreateTestAccountResult,
} from '../../helper/createTestAccount';
import { createTestEnv } from '../../helper/createTestEnv';

export const registerKeysetTests = () => {
  let envVars: ReturnType<typeof createEnvVars>;
  let testEnv: Awaited<ReturnType<typeof createTestEnv>>;
  let alice: CreateTestAccountResult;
  let aliceDelegationAuthSig: AuthSig;

  beforeAll(async () => {
    envVars = createEnvVars();
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

    aliceDelegationAuthSig =
      await testEnv.authManager.generatePkpDelegationAuthSig({
        pkpPublicKey: alice.pkp.pubkey,
        authData: alice.authData,
        sessionKeyPair: testEnv.sessionKeyPair,
        authConfig: {
          resources: [
            ['pkp-signing', '*'],
            ['lit-action-execution', '*'],
            ['access-control-condition-decryption', '*'],
          ],
          expiration: new Date(Date.now() + 1000 * 60 * 15).toISOString(),
          keySetIdentifier: 'naga-keyset1',
        },
        litClient: testEnv.litClient,
      });
  });

  describe('Keyset support', () => {
    test('pkpSign accepts keySetIdentifier', async () => {
      const signature = await testEnv.litClient.chain.raw.pkpSign({
        chain: 'ethereum',
        signingScheme: 'EcdsaK256Sha256',
        pubKey: alice.pkp.pubkey,
        toSign: new Uint8Array([1, 2, 3, 4]),
        authContext: alice.pkpAuthContext!,
        keySetIdentifier: 'naga-keyset1',
      });

      expect(signature.signature).toBeDefined();
    });

    test('Lit Action signEcdsa accepts keySetIdentifier', async () => {
      const pkpSessionSigs = await testEnv.authManager.createPkpSessionSigs({
        sessionKeyPair: testEnv.sessionKeyPair,
        pkpPublicKey: alice.pkp.pubkey,
        delegationAuthSig: aliceDelegationAuthSig,
        litClient: testEnv.litClient,
      });

      const code = `
        const go = async () => {
          const resp = await Lit.Actions.signEcdsa({
            toSign: new Uint8Array([1,2,3,4]),
            publicKey: "${alice.pkp.pubkey}",
            sigName: "sig",
            keySetIdentifier: "naga-keyset1",
          });
          Lit.Actions.setResponse({ response: resp });
        };
        go();
      `;

      const result = await testEnv.litClient.executeJs({
        sessionSigs: pkpSessionSigs,
        useSingleNode: true,
        code,
      });

      expect(result.response).toBe('success');
    });
  });
};
