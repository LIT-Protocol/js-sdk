import { createAuthManager, storagePlugins } from '@lit-protocol/auth';
import { createAuthConfigBuilder } from '@lit-protocol/auth-helpers';
import { createLitClient } from '@lit-protocol/lit-client';
import { privateKeyToAccount } from 'viem/accounts';
(async () => {
  console.log('💨 Running lit network module example');
  console.log('------------------------------------');

  const myAccount = privateKeyToAccount(
    process.env.PRIVATE_KEY as `0x${string}`
  );

  // 1. Pick the network you want to connect to:
  const { nagaDev } = await import('@lit-protocol/networks');

  // 2. Get the LitClient instance
  const litClient = await createLitClient({ network: nagaDev });

  // 3. Get an instance of the auth manager
  // const authManager = await import('@lit-protocol/auth');
  const authManager = createAuthManager({
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

  const eoaAuthContext = await authManager.createEoaAuthContext({
    config: {
      account: myAccount,
    },
    authConfig: authConfig,
    litClient: litClient,
  });

  // mint pkp
  const { data: mintedPkpInfo } = await litClient.mintPkp({
    authContext: eoaAuthContext,
    scopes: ['sign-anything'],
  });

  console.log('mintedPkpInfo:', mintedPkpInfo);

  // 5. Use the litClient APIs
  const signature = await litClient.pkpSign({
    pubKey: mintedPkpInfo.pubkey,
    toSign: 'hello',
    signingScheme: 'EcdsaP384Sha384',
    authContext: eoaAuthContext,
    // -- optional
    // userMaxPrice: 1000000000000000000n,
  });

  signature.recoveryId;

  // test values are being updated
  // setInterval(async () => {
  //   const accessCounter = litClient.getAccessCounter();
  //   console.log('accessCounter:', accessCounter);
  // }, 3000);
  // (optiional) If you ever want to disconnect from the network (stopping the event listener)
  litClient.disconnect();
})();
