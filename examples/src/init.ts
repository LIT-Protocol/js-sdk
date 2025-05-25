import { createAuthManager, storagePlugins } from '@lit-protocol/auth';
import { createLitClient } from '@lit-protocol/lit-client';
import { privateKeyToAccount } from 'viem/accounts';

export const init = async () => {
  // Step 1: Convert your EOA private key to a viem account object
  const myAccount = privateKeyToAccount(
    process.env.PRIVATE_KEY as `0x${string}`
  );

  const accountAddress = myAccount.address;
  console.log('🔥 accountAddress:', accountAddress);

  // Step 2: Import and choose the Lit network to connect to
  // const { nagaDev } = await import('@lit-protocol/networks');
  const { nagaDev } = await import('@lit-protocol/networks');

  // Step 3: Instantiate the LitClient using the selected network
  const litClient = await createLitClient({ network: nagaDev });

  const authManager = createAuthManager({
    storage: storagePlugins.localStorageNode({
      appName: 'my-app',
      networkName: 'naga-dev',
      storagePath: './lit-auth-storage',
    }),
  });

  return { myAccount, litClient, authManager };
};
