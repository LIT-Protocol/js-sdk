import {
  createAuthManager,
  storagePlugins,
  ViemAccountAuthenticator,
} from '@lit-protocol/auth';
import { createLitClient } from '@lit-protocol/lit-client';
import { privateKeyToAccount } from 'viem/accounts';

export const init = async () => {
  // Step 1: Convert your EOA private key to a viem account object
  // Use test private key if PRIVATE_KEY env var is not set
  const privateKey =
    process.env.PRIVATE_KEY ||
    '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80';

  const myAccount = privateKeyToAccount(privateKey as `0x${string}`);

  // Step 2: Import and choose the Lit network to connect to
  const { nagaDev } = await import('@lit-protocol/networks');

  // Step 3: Instantiate the LitClient using the selected network
  const litClient = await createLitClient({ network: nagaDev });

  // Step 4: Create the AuthManager
  const authManager = createAuthManager({
    storage: storagePlugins.localStorageNode({
      appName: 'my-app',
      networkName: 'naga-dev',
      storagePath: './lit-auth-storage',
    }),
  });

  // Step 5: Authenticate the account
  const viemAccountAuthData = await ViemAccountAuthenticator.authenticate(
    myAccount
  );

  const { pkps: viemAccountPkps } = await litClient.viewPKPsByAuthData({
    authData: viemAccountAuthData,
    pagination: {
      limit: 5,
    },
    storageProvider: storagePlugins.localStorageNode({
      appName: 'my-app',
      networkName: 'naga-dev',
      storagePath: './pkp-tokens',
    }),
  });

  const viemAuthContext = await authManager.createEoaAuthContext({
    config: {
      account: myAccount,
    },
    authConfig: {
      statement: 'I authorize the Lit Protocol to execute this Lit Action.',
      domain: 'example.com',
      resources: [
        ['lit-action-execution', '*'],
        ['pkp-signing', '*'],
        ['access-control-condition-decryption', '*'],
      ],
      capabilityAuthSigs: [],
      expiration: new Date(Date.now() + 1000 * 60 * 15).toISOString(),
    },
    litClient: litClient,
  });

  console.log('✅ viemAccountPkps:', viemAccountPkps);

  // select a PKP, choose the first one
  const viemAccountPkp = viemAccountPkps[0];

  return {
    myAccount,
    litClient,
    authManager,
    viemAccountAuthData,
    viemAccountPkp,
    viemAuthContext,
  };
};
