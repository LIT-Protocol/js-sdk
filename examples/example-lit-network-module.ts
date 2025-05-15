import { getAuthManager, storagePlugins } from '@lit-protocol/auth';
// import { createResourceBuilder } from '@lit-protocol/auth-helpers';
import { getLitClient } from '@lit-protocol/lit-client';
import { Hex } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { createAuthConfigBuilder } from '@lit-protocol/auth-helpers';
(async () => {
  console.log('💨 Running lit network module example');
  console.log('------------------------------------');

  const myAccount = privateKeyToAccount(process.env.PRIVATE_KEY as Hex);

  // 1. Pick the network you want to connect to:
  const { nagaDev } = await import('@lit-protocol/networks');

  // 2. Get the LitClient instance
  const litClient = await getLitClient({ network: nagaDev });

  // 3. Get an instance of the auth manager
  // const authManager = await import('@lit-protocol/auth');
  const authManager = getAuthManager({
    // Web user will default to localStorage if no storage is provided
    storage: storagePlugins.localStorageNode({
      appName: 'my-app',
      networkName: 'naga-dev',
      storagePath: './lit-auth-storage',
    }),
  });

  // 4. Create an auth config, you can store that somewhere
  // for future use.
  const authConfig = createAuthConfigBuilder()
    .addExpiration(new Date(Date.now() + 1000 * 60 * 15).toISOString())
    .addStatement('🔥THIS IS A TEST STATEMENT🔥')
    .addCapabilityAuthSigs([])
    .addDomain('localhost:3000')
    .addPKPSigningRequest('*')
    .addLitActionExecutionRequest('*')
    .build();

  const authContext = await authManager.getEoaAuthContext({
    config: {
      account: myAccount,
    },
    authConfig: authConfig,
    litClient: litClient,
  });

  console.log('authContext:', authContext);

  // mint pkp
  const { data: mintedPkpInfo } = await litClient.mintPkp({
    authContext,
    scopes: ['sign-anything'],
  });

  console.log('mintedPkpInfo:', mintedPkpInfo);
  // 5. Use the litClient APIs

  await litClient.pkpSign({
    pubKey: mintedPkpInfo.pubkey,
    toSign: 'hello',
    signingScheme: 'EcdsaK256Sha256',
    authContext: authContext,
    // -- optional
    // userMaxPrice: 1000000000000000000n,
  });
  process.exit();

  // (optiional) If you ever want to disconnect from the network (stopping the event listener)
  // litClient.disconnect();
})();
