import { getAuthManager, storagePlugins } from '@lit-protocol/auth';
import { createResourceBuilder } from '@lit-protocol/auth-helpers';
import { getLitClient } from '@lit-protocol/lit-client';
import { ethers } from 'ethers';
import { Account, Hex } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';

(async () => {
  console.log('💨 Running lit network module example');
  console.log('------------------------------------');

  const account = privateKeyToAccount(process.env.PRIVATE_KEY as Hex);

  const getSigner = (account: Account) => {
    return {
      signMessage: async (message: string) => account.signMessage({ message }),
      getAddress: async () => account.address,
    };
  };

  const mySigner = getSigner(account);

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
      // We need to change this to using Viem
      signer: mySigner,
    },
    authConfig: {
      expiration: new Date(Date.now() + 1000 * 60 * 15).toISOString(), // 15 miniutes
      // statement: 'test',
      domain: 'localhost',
      capabilityAuthSigs: [],
      resources: createResourceBuilder()
        .addPKPSigningRequest('*')
        .addLitActionExecutionRequest('*')
        .getResources(),
    },
    litClient: litClient,
  });

  // mint pkp
  const mintPkp = await litClient.mintPkp(account, authContext);

  console.log('mintPkp:', mintPkp.data.pubkey);
  // process.exit();

  // process.exit();

  // 5. Use the litClient APIs
  await litClient.pkpSign({
    pubKey: mintPkp.data.pubkey,
    // toSign: 'hello',
    toSign: new Uint8Array([
      116, 248, 31, 225, 103, 217, 155, 76, 180, 29, 109, 12, 205, 168, 34, 120,
      202, 238, 159, 62, 47, 37, 213, 229, 163, 147, 111, 243, 220, 236, 96,
      208,
    ]),
    authContext: authContext,
    // userMaxPrice: 1000000000000000000n,
  });

  // (optiional) If you ever want to disconnect from the network (stopping the event listener)
  // litClient.disconnect();
})();
