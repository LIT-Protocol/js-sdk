import { getAuthManager, storagePlugins } from '@lit-protocol/auth';
import { createResourceBuilder } from '@lit-protocol/auth-helpers';
import { getLitClient } from '@lit-protocol/lit-client';
import { Hex } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';

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
    storage: storagePlugins.localStorageNode({
      appName: 'my-app',
      networkName: 'naga-dev',
      storagePath: './lit-auth-storage',
    }),
  });

  // 4. Create an auth config
  const authContext = await authManager.getEoaAuthContext({
    config: {
      account: myAccount,
    },
    authConfig: {
      expiration: new Date(Date.now() + 1000 * 60 * 15).toISOString(), // 15 miniutes
      statement: '🔥THIS IS A TEST STATEMENT🔥',
      domain: 'localhost:3000',
      capabilityAuthSigs: [],
      resources: createResourceBuilder()
        .addPKPSigningRequest('*')
        .addLitActionExecutionRequest('*')
        .getResources(),
    },
    litClient: litClient,
  });

  // mint pkp
  const mintPkp = await litClient.mintPkp({
    authContext,
    scopes: ['sign-anything'],
  });

  // 5. Use the litClient APIs
  await litClient.pkpSign({
    signingScheme: 'EcdsaK256Sha256',
    pubKey: mintPkp.data.pubkey,
    toSign: 'hello',
    authContext: authContext,
    userMaxPrice: 1000000000000000000n,
  });

  // (optiional) If you ever want to disconnect from the network (stopping the event listener)
  // litClient.disconnect();
})();
