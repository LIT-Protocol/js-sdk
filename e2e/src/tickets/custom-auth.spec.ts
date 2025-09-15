import { createAuthManager, storagePlugins } from '@lit-protocol/auth';
import { createLitClient, utils as litUtils } from '@lit-protocol/lit-client';
import { nagaDev } from '@lit-protocol/networks';
import { privateKeyToAccount } from 'viem/accounts';

// CONFIGURATION
const NETWORK = 'naga-dev';
const SITE_OWNER_ACCOUNT = privateKeyToAccount(
  process.env['LIVE_MASTER_ACCOUNT'] as `0x${string}`
);

const YOU_UNIQUE_DAPP_NAME = 'amazing-app-x35ju8';

class MockDatabase {
  users: Record<string, { pkpPublicKey: string }> = {
    alice: {
      pkpPublicKey: '',
    },
    bob: {
      pkpPublicKey: '',
    },
  };
}

describe('Custom Auth Frontend Logic', () => {
  test('should be able to create custom auth for alice', async () => {
    // =========================================================
    //                      SITE OWNER FLOW
    // =========================================================
    // Step 1: Configure dApp and Generate Auth Method Type
    const authMethodConfig = litUtils.generateUniqueAuthMethodType({
      uniqueDappName: YOU_UNIQUE_DAPP_NAME,
    });

    console.log('authMethodConfig:', authMethodConfig);

    // Step 2: Create and Pin Validation Lit Action
    // This is done manually in the browser at https://explorer.litprotocol.com/create-action
    // This is the code used
    // ============================================================
    // (async () => {
    //   const dAppUniqueAuthMethodType = "0x20b2c2163698c4ba8166450ff2378d96c009016deba048b9b125a696c74ea4b5";
    //   const { pkpPublicKey, username, password, authMethodId } = jsParams;

    //   // Custom validation logic for amazing-app-x35ju8
    //   const EXPECTED_USERNAME = 'alice';
    //   const EXPECTED_PASSWORD = 'lit';
    //   const userIsValid = username === EXPECTED_USERNAME && password === EXPECTED_PASSWORD;

    //   // Check PKP permissions
    //   const tokenId = await Lit.Actions.pubkeyToTokenId({ publicKey: pkpPublicKey });
    //   const permittedAuthMethods = await Lit.Actions.getPermittedAuthMethods({ tokenId });

    //   const isPermitted = permittedAuthMethods.some((permittedAuthMethod) => {
    //     return permittedAuthMethod["auth_method_type"] === dAppUniqueAuthMethodType &&
    //           permittedAuthMethod["id"] === authMethodId;
    //   });

    //   const isValid = isPermitted && userIsValid;
    //   LitActions.setResponse({ response: isValid ? "true" : "false" });
    // })();
    // ============================================================
    const validationIpfsCid = 'QmTdTemgWBYS76ACdZPttsve6edukyXjCdsNYNK1QDeXKY';

    // Step 3: Mint PKPs for Users - Mint PKPs for your users using the custom auth method
    // type and validation CID.
    // Each user gets their own unique PKP tied to your dApp's authentication system.
    const litClient = await createLitClient({ network: nagaDev });
    const mockDatabase = new MockDatabase();

    for (const userId of [
      'alice',
      // , 'bob'
    ]) {
      console.log(`🔄 Minting a PKP for ${userId}...`);

      const authData = litUtils.generateAuthData({
        uniqueDappName: YOU_UNIQUE_DAPP_NAME,
        uniqueAuthMethodType: authMethodConfig.bigint,
        userId: userId,
      });

      const { pkpData } = await litClient.mintWithCustomAuth({
        account: SITE_OWNER_ACCOUNT,
        authData: authData,
        scope: 'sign-anything',
        validationIpfsCid: validationIpfsCid,
      });

      // Store PKP info for user
      mockDatabase.users[userId].pkpPublicKey = pkpData.data.pubkey;
    }

    console.log('mockDatabase:', mockDatabase);

    // =========================================================
    //                      USER FLOW
    // =========================================================

    // -- perpare the auth manager client
    const authManager = createAuthManager({
      storage: storagePlugins.localStorageNode({
        storagePath: 'alice-auth-manager-data',
        appName: YOU_UNIQUE_DAPP_NAME,
        networkName: NETWORK,
      }),
    });

    // 1. Pretend that alice and bob are users of the dApp
    // Alice login to the dApp, and the dApp will display the PKPs that they have
    const alicePkpPublicKey = mockDatabase.users['alice'].pkpPublicKey;

    const aliceAuthMethodConfig = litUtils.generateUniqueAuthMethodType({
      uniqueDappName: YOU_UNIQUE_DAPP_NAME,
    });

    // 2. a util will prepare the following data for alice
    const aliceAuthData = litUtils.generateAuthData({
      uniqueDappName: YOU_UNIQUE_DAPP_NAME,
      uniqueAuthMethodType: aliceAuthMethodConfig.bigint,
      userId: 'alice',
    });

    // 3. Alice will pass some params to proof that she is the owner of the PKP
    // Create custom auth context for user
    const aliceAuthContext = await authManager.createCustomAuthContext({
      pkpPublicKey: alicePkpPublicKey,
      authConfig: {
        resources: [
          ['pkp-signing', '*'],
          ['lit-action-execution', '*'],
          ['access-control-condition-decryption', '*'],
        ],
        expiration: new Date(Date.now() + 1000 * 60 * 15).toISOString(),
      },
      litClient: litClient,
      customAuthParams: {
        litActionIpfsId: validationIpfsCid,
        jsParams: {
          pkpPublicKey: alicePkpPublicKey,
          username: 'alice',
          password: 'lit',
          authMethodId: aliceAuthData.authMethodId,
        },
      },
    });

    console.log('aliceAuthContext:', aliceAuthContext);

    // 4. Auth context consumption - user can pass in the auth context into different Lit public APIs, such
    // as pkpSign, executeJs, decrypt, etc.

    // The message string will be UTF-8 encoded before signing.
    // Hashing (e.g., Keccak256 for Ethereum, SHA256 for Bitcoin)
    // is handled automatically by the Lit Protocol based on the selected chain.
    const messageBytes = new TextEncoder().encode('Hello from Artillery!');

    const signatures = await litClient.chain.raw.pkpSign({
      chain: 'ethereum',
      signingScheme: 'EcdsaK256Sha256',
      pubKey: alicePkpPublicKey,
      authContext: aliceAuthContext,
      toSign: messageBytes,
    });

    console.log('signatures:', signatures);

    expect(signatures).toBeDefined();
  });
});
