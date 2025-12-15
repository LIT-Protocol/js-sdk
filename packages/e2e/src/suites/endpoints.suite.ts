import { createAccBuilder } from '@lit-protocol/access-control-conditions';
import { ViemAccountAuthenticator } from '@lit-protocol/auth';
import type { AuthData } from '@lit-protocol/schemas';
import type { AuthContext } from '../types';
import type { TestEnv } from '../helper/createTestEnv';
import type { CreateTestAccountResult } from '../helper/createTestAccount';
import {
  PKP_SIGN_TRANSIENT_FRAGMENTS,
  SIGN_ECDSA_LIT_ACTION_CODE,
  withRetry,
} from './suite-utils';

export type EndpointSuiteOptions = {
  getPkpPublicKey: () => string;
  getPkpEthAddress: () => `0x${string}`;
  getAliceAccount: () => CreateTestAccountResult;
  getBobAccount: () => CreateTestAccountResult;
  includePaymentFlows?: boolean;
  includeEncryptDecryptFlow?: boolean;
  includePermissionsFlow?: boolean;
  includeViewPkpsByAuthData?: boolean;
  authDataOverride?: AuthData;
  getAccsAddress?: (authContext: AuthContext) => string;
};

export function registerEndpointSuite(
  getTestEnv: () => TestEnv,
  getAuthContext: () => AuthContext,
  opts: EndpointSuiteOptions
) {
  describe('endpoints', () => {
    it('pkpSign', async () => {
      const testEnv = getTestEnv();
      const res = await withRetry(
        () =>
          testEnv.litClient.chain.ethereum.pkpSign({
            authContext: getAuthContext(),
            pubKey: opts.getPkpPublicKey(),
            toSign: 'Hello, world!',
          }),
        { transientMessageFragments: PKP_SIGN_TRANSIENT_FRAGMENTS }
      );

      expect(res.signature).toBeDefined();
    });

    it('executeJs', async () => {
      const testEnv = getTestEnv();
      const result = await testEnv.litClient.executeJs({
        code: SIGN_ECDSA_LIT_ACTION_CODE,
        authContext: getAuthContext(),
        jsParams: {
          message: 'Test message from revamp e2e executeJs',
          sigName: 'revamp-e2e-sig',
          toSign: 'Test message from revamp e2e executeJs',
          publicKey: opts.getPkpPublicKey(),
        },
      });

      expect(result).toBeDefined();
      expect(result.signatures).toBeDefined();
    });

    it('viewPKPsByAddress', async () => {
      const testEnv = getTestEnv();
      const pkps = await testEnv.litClient.viewPKPsByAddress({
        ownerAddress: opts.getPkpEthAddress(),
        pagination: { limit: 10, offset: 0 },
      });

      expect(pkps).toBeDefined();
      expect(Array.isArray(pkps.pkps)).toBe(true);
      expect(typeof pkps.pagination.total).toBe('number');
      expect(typeof pkps.pagination.hasMore).toBe('boolean');
    });

    if (opts.includeViewPkpsByAuthData ?? true) {
      it('viewPKPsByAuthData', async () => {
        const testEnv = getTestEnv();
        const aliceAccount = opts.getAliceAccount();
        const pkps = await withRetry(
          async () => {
            const authData =
              opts.authDataOverride ??
              (await ViemAccountAuthenticator.authenticate(
                aliceAccount.account
              ));

            const res = await testEnv.litClient.viewPKPsByAuthData({
              authData: {
                authMethodType: authData.authMethodType,
                authMethodId: authData.authMethodId,
                accessToken: authData.accessToken || 'mock-token',
              },
              pagination: { limit: 10, offset: 0 },
            });

            if (!res.pkps?.length) {
              throw new Error('No PKPs found yet');
            }

            return res;
          },
          {
            transientMessageFragments: [
              'Verification failed',
              'Failed to verify signature',
              'authentication failed',
              'No PKPs found yet',
              ...PKP_SIGN_TRANSIENT_FRAGMENTS,
            ],
          }
        );

        expect(pkps).toBeDefined();
        expect(Array.isArray(pkps.pkps)).toBe(true);

        const firstPkp = pkps.pkps[0];
        expect(firstPkp.tokenId).toBeDefined();
        expect(firstPkp.pubkey).toBeDefined();
        expect(firstPkp.ethAddress).toBeDefined();
      });
    }

    it('pkpEncryptDecrypt', async () => {
      const testEnv = getTestEnv();
      const authContext = getAuthContext();
      const addressForAccs =
        opts.getAccsAddress?.(authContext) ?? opts.getPkpEthAddress();

      const builder = createAccBuilder();
      const accs = builder
        .requireWalletOwnership(addressForAccs)
        .on('ethereum')
        .build();

      const dataToEncrypt = 'Hello from PKP encrypt-decrypt revamp test!';
      const encryptedData = await testEnv.litClient.encrypt({
        dataToEncrypt,
        unifiedAccessControlConditions: accs,
        chain: 'ethereum',
      });

      expect(encryptedData.ciphertext).toBeDefined();
      expect(encryptedData.dataToEncryptHash).toBeDefined();

      const decryptedData = await testEnv.litClient.decrypt({
        data: encryptedData,
        unifiedAccessControlConditions: accs,
        chain: 'ethereum',
        authContext,
      });

      expect(decryptedData.convertedData).toBe(dataToEncrypt);
    });

    if (opts.includeEncryptDecryptFlow ?? true) {
      it('encryptDecryptFlow', async () => {
        const testEnv = getTestEnv();
        const aliceAccount = opts.getAliceAccount();
        const bobAccount = opts.getBobAccount();
        const authContext = getAuthContext();
        const senderAddress =
          opts.getAccsAddress?.(authContext) ?? opts.getPkpEthAddress();
        const builder = createAccBuilder();
        const accs = builder
          .requireWalletOwnership(bobAccount.account.address)
          .on('ethereum')
          .build();

        const stringData = 'Hello from encrypt-decrypt flow revamp test!';
        const encryptedStringData = await testEnv.litClient.encrypt({
          dataToEncrypt: stringData,
          unifiedAccessControlConditions: accs,
          chain: 'ethereum',
        });

        expect(encryptedStringData.metadata?.dataType).toBe('string');

        const jsonData = {
          message: 'Test JSON data',
          sender: senderAddress,
          recipient: bobAccount.account.address,
          timestamp: Date.now(),
        };

        const encryptedJsonData = await testEnv.litClient.encrypt({
          dataToEncrypt: jsonData,
          unifiedAccessControlConditions: accs,
          chain: 'ethereum',
        });

        expect(encryptedJsonData.metadata?.dataType).toBe('json');

        const uint8Data = new Uint8Array([72, 101, 108, 108, 111]);
        const encryptedUint8Data = await testEnv.litClient.encrypt({
          dataToEncrypt: uint8Data,
          unifiedAccessControlConditions: accs,
          chain: 'ethereum',
        });

        expect(encryptedUint8Data.ciphertext).toBeDefined();

        const documentData = new TextEncoder().encode(
          'This is a PDF document content...'
        );
        const encryptedFileData = await testEnv.litClient.encrypt({
          dataToEncrypt: documentData,
          unifiedAccessControlConditions: accs,
          chain: 'ethereum',
          metadata: {
            dataType: 'file',
            mimeType: 'application/pdf',
            filename: 'secret-document.pdf',
            size: documentData.length,
            custom: {
              author: 'Alice',
              createdDate: new Date().toISOString(),
              confidential: true,
            },
          },
        });

        expect(encryptedFileData.metadata?.dataType).toBe('file');

        const bobAuthContext =
          bobAccount.eoaAuthContext ??
          (await testEnv.authManager.createEoaAuthContext({
            config: { account: bobAccount.account },
            authConfig: {
              domain: 'localhost',
              statement: 'Decrypt test data',
              expiration: new Date(
                Date.now() + 1000 * 60 * 60 * 24
              ).toISOString(),
              resources: [['access-control-condition-decryption', '*']],
            },
            litClient: testEnv.litClient,
          }));

        const decryptedStringResponse = await testEnv.litClient.decrypt({
          data: encryptedStringData,
          unifiedAccessControlConditions: accs,
          chain: 'ethereum',
          authContext: bobAuthContext,
        });

        expect(decryptedStringResponse.convertedData).toBe(stringData);

        const decryptedJsonResponse = await testEnv.litClient.decrypt({
          ciphertext: encryptedJsonData.ciphertext,
          dataToEncryptHash: encryptedJsonData.dataToEncryptHash,
          metadata: encryptedJsonData.metadata,
          unifiedAccessControlConditions: accs,
          chain: 'ethereum',
          authContext: bobAuthContext,
        });

        expect(decryptedJsonResponse.convertedData).toEqual(jsonData);

        const decryptedUint8Response = await testEnv.litClient.decrypt({
          data: encryptedUint8Data,
          unifiedAccessControlConditions: accs,
          chain: 'ethereum',
          authContext: bobAuthContext,
        });

        if (decryptedUint8Response.convertedData) {
          expect(decryptedUint8Response.convertedData).toEqual(uint8Data);
        } else {
          expect(decryptedUint8Response.decryptedData).toEqual(uint8Data);
        }

        const decryptedFileResponse = await testEnv.litClient.decrypt({
          data: encryptedFileData,
          unifiedAccessControlConditions: accs,
          chain: 'ethereum',
          authContext: bobAuthContext,
        });

        expect(decryptedFileResponse.metadata?.dataType).toBe('file');
        expect(decryptedFileResponse.metadata?.filename).toBe(
          'secret-document.pdf'
        );
        expect(decryptedFileResponse.metadata?.custom?.author).toBe('Alice');

        if (
          typeof File !== 'undefined' &&
          decryptedFileResponse.convertedData instanceof File
        ) {
          const fileArrayBuffer =
            await decryptedFileResponse.convertedData.arrayBuffer();
          const fileUint8Array = new Uint8Array(fileArrayBuffer);
          expect(fileUint8Array).toEqual(documentData);
        } else {
          expect(decryptedFileResponse.convertedData).toEqual(documentData);
        }
      });
    }

    if (opts.includePermissionsFlow ?? true) {
      it('pkpPermissionsManagerFlow', async () => {
        const testEnv = getTestEnv();
        const aliceAccount = opts.getAliceAccount();
        const authContext = getAuthContext();
        const pkpPublicKey = opts.getPkpPublicKey();

        const pkpViemAccount = await testEnv.litClient.getPkpViemAccount({
          pkpPublicKey,
          authContext,
          chainConfig: testEnv.litClient.getChainConfig().viemConfig,
        });

        const pkpPermissionsManager =
          await testEnv.litClient.getPKPPermissionsManager({
            pkpIdentifier: { tokenId: aliceAccount.pkp?.tokenId },
            account: pkpViemAccount,
          });

        const initialContext =
          await pkpPermissionsManager.getPermissionsContext();
        const initialAuthMethodsCount = initialContext.authMethods.length;

        const testAuthMethodParams = {
          authMethodType: 1,
          authMethodId: '0x1234567890abcdef1234567890abcdef12345678',
          userPubkey:
            '0x04abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
          scopes: ['sign-anything'] as (
            | 'sign-anything'
            | 'no-permissions'
            | 'personal-sign'
          )[],
        };

        const addAuthMethodTx =
          await pkpPermissionsManager.addPermittedAuthMethod(
            testAuthMethodParams
          );
        expect(addAuthMethodTx.receipt.status).toBe('success');

        const authMethodsAfterAdd =
          await pkpPermissionsManager.getPermittedAuthMethods();
        expect(authMethodsAfterAdd.length).toBe(initialAuthMethodsCount + 1);

        const removeScopeTx =
          await pkpPermissionsManager.removePermittedAuthMethodScope({
            authMethodType: testAuthMethodParams.authMethodType,
            authMethodId: testAuthMethodParams.authMethodId,
            scopeId: 1,
          });
        expect(removeScopeTx.receipt.status).toBe('success');

        const removeAuthMethodTx =
          await pkpPermissionsManager.removePermittedAuthMethod({
            authMethodType: testAuthMethodParams.authMethodType,
            authMethodId: testAuthMethodParams.authMethodId,
          });
        expect(removeAuthMethodTx.receipt.status).toBe('success');

        const finalAuthMethods =
          await pkpPermissionsManager.getPermittedAuthMethods();
        expect(finalAuthMethods.length).toBe(initialAuthMethodsCount);
      });
    }

    if (opts.includePaymentFlows) {
      it('paymentManagerFlow', async () => {
        const testEnv = getTestEnv();
        const aliceAccount = opts.getAliceAccount();
        const authContext = getAuthContext();
        const paymentManager = await testEnv.litClient.getPaymentManager({
          account: aliceAccount.account,
        });

        const userAddress =
          authContext.wallet?.account?.address ||
          authContext.account?.address ||
          aliceAccount.account.address;

        const depositAmount = '0.00001';
        const depositResult = await paymentManager.deposit({
          amountInEth: depositAmount,
        });
        expect(depositResult.receipt).toBeDefined();

        const balanceInfo = await paymentManager.getBalance({ userAddress });
        expect(Number(balanceInfo.raw.totalBalance)).toBeGreaterThan(0);

        const withdrawAmount = '0.000005';
        const withdrawRequestResult = await paymentManager.requestWithdraw({
          amountInEth: withdrawAmount,
        });
        expect(withdrawRequestResult.receipt).toBeDefined();
      });

      it('paymentDelegationFlow', async () => {
        const testEnv = getTestEnv();
        const aliceAccount = opts.getAliceAccount();
        const bobAccount = opts.getBobAccount();
        const alicePaymentManager = await testEnv.litClient.getPaymentManager({
          account: aliceAccount.account,
        });
        const bobPaymentManager = await testEnv.litClient.getPaymentManager({
          account: bobAccount.account,
        });

        const aliceAddress = aliceAccount.account.address;
        const bobAddress = bobAccount.account.address;

        const initialPayers = await bobPaymentManager.getPayers({
          userAddress: bobAddress,
        });
        const initialUsers = await alicePaymentManager.getUsers({
          payerAddress: aliceAddress,
        });

        const delegateTx = await alicePaymentManager.delegatePayments({
          userAddress: bobAddress,
        });
        expect(delegateTx.receipt.status).toBe('success');

        const payersAfterDelegate = await bobPaymentManager.getPayers({
          userAddress: bobAddress,
        });
        expect(payersAfterDelegate.length).toBe(initialPayers.length + 1);

        const usersAfterDelegate = await alicePaymentManager.getUsers({
          payerAddress: aliceAddress,
        });
        expect(usersAfterDelegate.length).toBe(initialUsers.length + 1);

        const undelegateTx = await alicePaymentManager.undelegatePayments({
          userAddress: bobAddress,
        });
        expect(undelegateTx.receipt.status).toBe('success');
      });
    }
  });
}
