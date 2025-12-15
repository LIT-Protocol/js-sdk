import { createAccBuilder } from '@lit-protocol/access-control-conditions';
import { generateSessionKeyPair } from '@lit-protocol/auth';
import type { AuthData } from '@lit-protocol/schemas';
import type { ResolvedNetwork } from '../helper/network';
import type { CreateTestAccountResult } from '../helper/createTestAccount';
import type { TestEnv } from '../helper/createTestEnv';
import type { AuthContext } from '../types';
import { createPregenDelegationServerReuseTest } from '../test-helpers/signSessionKey/pregen-delegation';
import {
  PKP_SIGN_TRANSIENT_FRAGMENTS,
  SIGN_ECDSA_LIT_ACTION_CODE,
  withRetry,
} from './suite-utils';

export function registerPkpPreGeneratedMaterialsSuite(
  getTestEnv: () => TestEnv,
  getAliceAccount: () => CreateTestAccountResult,
  getResolvedNetwork: () => ResolvedNetwork
) {
  describe('PKP auth with pre-generated materials', () => {
    let preGeneratedAuthContext: AuthContext;

    beforeAll(async () => {
      const testEnv = getTestEnv();
      const alice = getAliceAccount();

      if (!alice.pkp) {
        throw new Error('Alice is missing a PKP');
      }
      if (!alice.authData) {
        throw new Error('Alice is missing authData');
      }

      const sessionKeyPair = generateSessionKeyPair();
      const delegationAuthSig =
        await testEnv.authManager.generatePkpDelegationAuthSig({
          pkpPublicKey: alice.pkp.pubkey,
          authData: alice.authData,
          sessionKeyPair,
          authConfig: {
            resources: [
              ['pkp-signing', '*'],
              ['lit-action-execution', '*'],
              ['access-control-condition-decryption', '*'],
            ],
            expiration: new Date(Date.now() + 1000 * 60 * 15).toISOString(),
          },
          litClient: testEnv.litClient,
        });

      preGeneratedAuthContext =
        await testEnv.authManager.createPkpAuthContextFromPreGenerated({
          pkpPublicKey: alice.pkp.pubkey,
          sessionKeyPair,
          delegationAuthSig,
          authData: alice.authData,
        });
    });

    describe('endpoints', () => {
      it('pkpSign with pre-generated materials', async () => {
        const testEnv = getTestEnv();
        const alice = getAliceAccount();

        const res = await withRetry(
          () =>
            testEnv.litClient.chain.ethereum.pkpSign({
              authContext: preGeneratedAuthContext,
              pubKey: alice.pkp!.pubkey,
              toSign: 'Hello from pre-generated PKP auth',
            }),
          { transientMessageFragments: PKP_SIGN_TRANSIENT_FRAGMENTS }
        );

        expect(res.signature).toBeDefined();
      });

      it('executeJs with pre-generated materials', async () => {
        const testEnv = getTestEnv();
        const alice = getAliceAccount();

        const result = await testEnv.litClient.executeJs({
          code: SIGN_ECDSA_LIT_ACTION_CODE,
          authContext: preGeneratedAuthContext,
          jsParams: {
            message: 'Pre-generated materials executeJs test',
            sigName: 'pregen-e2e-sig',
            toSign: 'Pre-generated materials executeJs test',
            publicKey: alice.pkp!.pubkey,
          },
        });

        expect(result).toBeDefined();
        expect(result.signatures).toBeDefined();
      });

      it('pkpEncryptDecrypt with pre-generated materials', async () => {
        const testEnv = getTestEnv();
        const alice = getAliceAccount();

        const builder = createAccBuilder();
        const accs = builder
          .requireWalletOwnership(alice.pkp!.ethAddress)
          .on('ethereum')
          .build();

        const dataToEncrypt = 'Hello from pre-generated encrypt/decrypt test!';
        const encryptedData = await testEnv.litClient.encrypt({
          dataToEncrypt,
          unifiedAccessControlConditions: accs,
          chain: 'ethereum',
        });

        const decryptedData = await testEnv.litClient.decrypt({
          data: encryptedData,
          unifiedAccessControlConditions: accs,
          chain: 'ethereum',
          authContext: preGeneratedAuthContext,
        });

        expect(decryptedData.convertedData).toBe(dataToEncrypt);
      });
    });

    describe('error handling', () => {
      it('should reject when only sessionKeyPair is provided', async () => {
        const testEnv = getTestEnv();
        const alice = getAliceAccount();

        const tempAuthContext: any =
          await testEnv.authManager.createPkpAuthContext({
            authData: alice.authData as AuthData,
            pkpPublicKey: alice.pkp!.pubkey,
            authConfig: {
              resources: [['pkp-signing', '*']],
              expiration: new Date(Date.now() + 1000 * 60 * 15).toISOString(),
            },
            litClient: testEnv.litClient,
          });

        const sessionKeyPair = tempAuthContext.sessionKeyPair;

        await expect(
          testEnv.authManager.createPkpAuthContext({
            authData: alice.authData as AuthData,
            pkpPublicKey: alice.pkp!.pubkey,
            authConfig: {
              resources: [['pkp-signing', '*']],
              expiration: new Date(Date.now() + 1000 * 60 * 15).toISOString(),
            },
            litClient: testEnv.litClient,
            sessionKeyPair,
          })
        ).rejects.toThrow(
          'Both sessionKeyPair and delegationAuthSig must be provided together, or neither should be provided'
        );
      });

      it('should reject when only delegationAuthSig is provided', async () => {
        const testEnv = getTestEnv();
        const alice = getAliceAccount();

        const tempAuthContext: any =
          await testEnv.authManager.createPkpAuthContext({
            authData: alice.authData as AuthData,
            pkpPublicKey: alice.pkp!.pubkey,
            authConfig: {
              resources: [['pkp-signing', '*']],
              expiration: new Date(Date.now() + 1000 * 60 * 15).toISOString(),
            },
            litClient: testEnv.litClient,
          });

        const delegationAuthSig = await tempAuthContext.authNeededCallback();

        await expect(
          testEnv.authManager.createPkpAuthContext({
            authData: alice.authData as AuthData,
            pkpPublicKey: alice.pkp!.pubkey,
            authConfig: {
              resources: [['pkp-signing', '*']],
              expiration: new Date(Date.now() + 1000 * 60 * 15).toISOString(),
            },
            litClient: testEnv.litClient,
            delegationAuthSig,
          })
        ).rejects.toThrow(
          'Both sessionKeyPair and delegationAuthSig must be provided together, or neither should be provided'
        );
      });
    });

    describe('server reuse flow', () => {
      it('should sign using materials shipped over the wire', () =>
        createPregenDelegationServerReuseTest({
          authManager: getTestEnv().authManager,
          authData: getAliceAccount().authData as AuthData,
          pkpPublicKey: getAliceAccount().pkp!.pubkey,
          clientLitClient: getTestEnv().litClient,
          resolvedNetwork: getResolvedNetwork(),
        })());
    });
  });
}
