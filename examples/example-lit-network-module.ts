import { getAuthManager, storagePlugins } from '@lit-protocol/auth';
import { createResourceBuilder } from '@lit-protocol/auth-helpers';
import { getLitClient } from '@lit-protocol/lit-client';
import { ethers } from 'ethers';
(async () => {
  console.log('💨 Running lit network module example');
  console.log('------------------------------------');

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
  const authContext = await authManager.createEoaAuthContext({
    config: {
      signer: new ethers.Wallet(
        '0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d'
      ),
      pkpPublicKey:
        '0x04e5603fe1cc5ce207c12950939738583b599f22a152c3672a4c0eee887d75dd405246ac3ed2430283935a99733eac9520581af9923c0fc04fad1d67d60908ce18',
    },
    authConfig: {
      expiration: new Date(Date.now() + 1000 * 60 * 15).toISOString(), // 15 miniutes
      statement: 'test',
      domain: 'example.com',
      capabilityAuthSigs: [],
      resources: createResourceBuilder()
        .addPKPSigningRequest('*')
        .getResources(),
    },
    litClient: litClient,
  });

  // 5. Use the litClient APIs
  await litClient.pkpSign({
    pubKey: authContext.pkpPublicKey,
    toSign: Uint8Array.from(Buffer.from('hello')),
    authContext: authContext,
    // userMaxPrice: 1000000000000000000n,
  });

  // (optiional) If you ever want to disconnect from the network (stopping the event listener)
  // litClient.disconnect();
})();
