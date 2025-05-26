import { createAuthManager, storagePlugins } from '@lit-protocol/auth';
import { createLitClient } from '@lit-protocol/lit-client';
import { privateKeyToAccount } from 'viem/accounts';

export const init = async () => {
  // Step 1: Convert your EOA private key to a viem account object
  // Use test private key if PRIVATE_KEY env var is not set
  const privateKey = process.env.PRIVATE_KEY || '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80';
  
  const myAccount = privateKeyToAccount(
    privateKey as `0x${string}`
  );

  const accountAddress = myAccount.address;
  // console.log('🔥 accountAddress:', accountAddress); // Commented out to reduce log noise

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
