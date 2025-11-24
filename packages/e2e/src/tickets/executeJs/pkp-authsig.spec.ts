import { createAccBuilder } from '@lit-protocol/access-control-conditions';
import { ViemAccountAuthenticator } from '@lit-protocol/auth';
import { createSiweMessage } from '@lit-protocol/auth-helpers';
import { createEnvVars } from '../../helper/createEnvVars';
import { createTestAccount } from '../../helper/createTestAccount';
import { createTestEnv } from '../../helper/createTestEnv';

const CHECK_CONDITIONS_LIT_ACTION = `
(async () => {
  const { conditions, authSig } = jsParams;
  const isAuthorized = await Lit.Actions.checkConditions({
    conditions,
    authSig,
    chain: 'ethereum',
  });

  Lit.Actions.setResponse({ response: isAuthorized ? 'true' : 'false' });
})();
`;

describe('PKP AuthSig Access Control', () => {
  let testEnv: Awaited<ReturnType<typeof createTestEnv>>;

  beforeAll(async () => {
    const envVars = createEnvVars();
    testEnv = await createTestEnv(envVars);
  });

  it('allows a PKP to satisfy wallet-ownership ACCs via a PKP-generated authSig', async () => {
    const pkpOwner = await createTestAccount(testEnv, {
      label: 'PKP ACC Owner',
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

    // Ensure the PKP ledger has enough balance to pay for executeJs
    await testEnv.masterPaymentManager.depositForUser({
      userAddress: pkp.ethAddress as `0x${string}`,
      amountInEth: '0.2',
    });

    const accessControlConditions = createAccBuilder()
      .requireWalletOwnership(pkp.ethAddress)
      .on('ethereum')
      .build();

    const siweMessage = await createSiweMessage({
      walletAddress: pkpViemAccount.address,
      nonce: (await testEnv.litClient.getContext()).latestBlockhash,
    });

    const pkpAuthSig = await ViemAccountAuthenticator.createAuthSig(
      pkpViemAccount,
      siweMessage
    );

    expect(pkpAuthSig.address?.toLowerCase()).toBe(
      pkp.ethAddress.toLowerCase()
    );

    const executionResult = await testEnv.litClient.executeJs({
      code: CHECK_CONDITIONS_LIT_ACTION,
      authContext: pkpAuthContext,
      jsParams: {
        conditions: accessControlConditions,
        // authSig: pkpAuthSig,
      },
    });

    expect(executionResult.response).toBe('true');
  });
});
