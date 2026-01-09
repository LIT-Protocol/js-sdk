import { AuthSig } from '@lit-protocol/types';
import { ViemAccountAuthenticator } from '@lit-protocol/auth';

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
  const datilPkpPublicKey = process.env['DATIL_PKP_PUBLIC_KEY'];
  let datilPkpAuthContext: CreateTestAccountResult['pkpAuthContext'];
  let datilDelegationAuthSig: AuthSig | undefined;
  let datilSessionSigs: Record<string, any> | undefined;

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

    if (datilPkpPublicKey && envVars.network !== 'naga-local') {
      const masterAuthData = await ViemAccountAuthenticator.authenticate(
        testEnv.masterAccount
      );

      datilPkpAuthContext = await testEnv.authManager.createPkpAuthContext({
        authData: masterAuthData,
        pkpPublicKey: datilPkpPublicKey,
        authConfig: {
          resources: [
            ['pkp-signing', '*'],
            ['lit-action-execution', '*'],
            ['access-control-condition-decryption', '*'],
          ],
          expiration: new Date(Date.now() + 1000 * 60 * 15).toISOString(),
          keySetIdentifier: 'datil',
        },
        litClient: testEnv.litClient,
      });

      datilDelegationAuthSig =
        await testEnv.authManager.generatePkpDelegationAuthSig({
          pkpPublicKey: datilPkpPublicKey,
          authData: masterAuthData,
          sessionKeyPair: testEnv.sessionKeyPair,
          authConfig: {
            resources: [
              ['pkp-signing', '*'],
              ['lit-action-execution', '*'],
              ['access-control-condition-decryption', '*'],
            ],
            expiration: new Date(Date.now() + 1000 * 60 * 15).toISOString(),
            keySetIdentifier: 'datil',
          },
          litClient: testEnv.litClient,
        });

      datilSessionSigs = await testEnv.authManager.createPkpSessionSigs({
        sessionKeyPair: testEnv.sessionKeyPair,
        pkpPublicKey: datilPkpPublicKey,
        delegationAuthSig: datilDelegationAuthSig,
        litClient: testEnv.litClient,
      });
    }
  });

  describe('Keyset support', () => {
    const datilTest = datilPkpPublicKey ? test : test.skip;

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

    datilTest('pkpSign works with datil keySetIdentifier', async () => {
      if (envVars.network === 'naga-local') return;
      const signature = await testEnv.litClient.chain.raw.pkpSign({
        chain: 'ethereum',
        signingScheme: 'EcdsaK256Sha256',
        pubKey: datilPkpPublicKey!,
        toSign: new Uint8Array([9, 9, 9]),
        authContext: datilPkpAuthContext!,
        keySetIdentifier: 'datil',
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

    datilTest(
      'Lit Action signEcdsa works with datil keySetIdentifier',
      async () => {
        if (envVars.network === 'naga-local') return;
        const code = `
        const go = async () => {
          const resp = await Lit.Actions.signEcdsa({
            toSign: new Uint8Array([5,6,7]),
            publicKey: "${datilPkpPublicKey}",
            sigName: "sig",
            keySetIdentifier: "datil",
          });
          Lit.Actions.setResponse({ response: resp });
        };
        go();
      `;

        const result = await testEnv.litClient.executeJs({
          sessionSigs: datilSessionSigs!,
          useSingleNode: true,
          code,
        });

        expect(result.response).toBe('success');
      }
    );
  });
};
