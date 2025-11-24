import { createAccBuilder } from '@lit-protocol/access-control-conditions';
import { ViemAccountAuthenticator } from '@lit-protocol/auth';
import { createSiweMessage } from '@lit-protocol/auth-helpers';
import { createEnvVars } from '../../helper/createEnvVars';
import { createTestAccount } from '../../helper/createTestAccount';
import { createTestEnv } from '../../helper/createTestEnv';

const DECRYPT_LIT_ACTION = `
(async () => {
  const { accessControlConditions, authSig, ciphertext, dataToEncryptHash } = jsParams;
  const resp = await Lit.Actions.decryptAndCombine({
    accessControlConditions,
    ciphertext,
    dataToEncryptHash,
    authSig,
    chain: 'ethereum',
  });

  Lit.Actions.setResponse({ response: resp });
})();`;

describe('PKP decrypt with null authSig', () => {
  let testEnv: Awaited<ReturnType<typeof createTestEnv>>;

  beforeAll(async () => {
    const envVars = createEnvVars();
    testEnv = await createTestEnv(envVars);
  });

  it('decrypts successfully when authSig is null and PKP authContext matches ACC', async () => {
    const pkpOwner = await createTestAccount(testEnv, {
      label: 'PKP Decrypt Owner',
      fundAccount: true,
      fundLedger: true,
      hasEoaAuthContext: true,
      hasPKP: true,
      fundPKP: true,
      hasPKPAuthContext: true,
      fundPKPLedger: true,
    });

    const { pkp, pkpAuthContext } = pkpOwner;

    if (!pkp || !pkp.ethAddress) {
      throw new Error(
        'PKP data with ethereum address is required for this test'
      );
    }

    if (!pkpAuthContext) {
      throw new Error('PKP auth context was not created');
    }

    await testEnv.masterPaymentManager.depositForUser({
      userAddress: pkp.ethAddress as `0x${string}`,
      amountInEth: '0.2',
    });

    const accessControlConditions = createAccBuilder()
      .requireWalletOwnership(pkp.ethAddress)
      .on('ethereum')
      .build();

    const secret = 'Hello from PKP decrypt test!';
    const encryptedData = await testEnv.litClient.encrypt({
      dataToEncrypt: secret,
      unifiedAccessControlConditions: accessControlConditions,
      chain: 'ethereum',
    });

    const executionResult = await testEnv.litClient.executeJs({
      code: DECRYPT_LIT_ACTION,
      authContext: pkpAuthContext,
      jsParams: {
        accessControlConditions,
        authSig: null,
        ciphertext: encryptedData.ciphertext,
        dataToEncryptHash: encryptedData.dataToEncryptHash,
      },
    });

    expect(executionResult.response).toBe(secret);
  });

  it('decrypts successfully when authSig is a PKP-generated SIWE signature', async () => {
    const pkpOwner = await createTestAccount(testEnv, {
      label: 'PKP Decrypt Owner (authSig)',
      fundAccount: true,
      fundLedger: true,
      hasEoaAuthContext: true,
      hasPKP: true,
      fundPKP: true,
      hasPKPAuthContext: true,
      fundPKPLedger: true,
    });

    const { pkp, pkpAuthContext, pkpViemAccount } = pkpOwner;

    if (!pkp || !pkp.ethAddress) {
      throw new Error(
        'PKP data with ethereum address is required for this test'
      );
    }

    if (!pkpAuthContext) {
      throw new Error('PKP auth context was not created');
    }

    if (!pkpViemAccount) {
      throw new Error('PKP viem account was not initialized');
    }

    await testEnv.masterPaymentManager.depositForUser({
      userAddress: pkp.ethAddress as `0x${string}`,
      amountInEth: '0.2',
    });

    const accessControlConditions = createAccBuilder()
      .requireWalletOwnership(pkp.ethAddress)
      .on('ethereum')
      .build();

    const secret = 'Hello from PKP decrypt test with authSig!';
    const encryptedData = await testEnv.litClient.encrypt({
      dataToEncrypt: secret,
      unifiedAccessControlConditions: accessControlConditions,
      chain: 'ethereum',
    });

    const siweMessage = await createSiweMessage({
      walletAddress: pkpViemAccount.address,
      nonce: (await testEnv.litClient.getContext()).latestBlockhash,
    });

    const pkpAuthSig = await ViemAccountAuthenticator.createAuthSig(
      pkpViemAccount,
      siweMessage
    );

    const executionResult = await testEnv.litClient.executeJs({
      code: DECRYPT_LIT_ACTION,
      authContext: pkpAuthContext,
      jsParams: {
        accessControlConditions,
        authSig: pkpAuthSig,
        ciphertext: encryptedData.ciphertext,
        dataToEncryptHash: encryptedData.dataToEncryptHash,
      },
    });

    expect(executionResult.response).toBe(secret);
  });
});
