import {
  createAuthManager,
  storagePlugins,
  ViemAccountAuthenticator,
} from '@lit-protocol/auth';
import { createLitClient } from '@lit-protocol/lit-client';
import { generatePrivateKey, privateKeyToAccount } from 'viem/accounts';
import { z } from 'zod';
import { fundAccount } from './helper/fundAccount';

const SupportedNetworkSchema = z.enum(['naga-dev', 'naga-local']);
type SupportedNetwork = z.infer<typeof SupportedNetworkSchema>;

const LogLevelSchema = z.enum(['silent', 'info', 'debug']);
type LogLevel = z.infer<typeof LogLevelSchema>;

export const init = async (network?: SupportedNetwork, logLevel?: LogLevel) => {
  /**
   * ====================================
   * Prepare accounts for testing
   * ====================================
   */
  const localMasterAccount = privateKeyToAccount(
    process.env['LOCAL_MASTER_ACCOUNT'] as `0x${string}`
  );
  const liveMasterAccount = privateKeyToAccount(
    process.env['LIVE_MASTER_ACCOUNT'] as `0x${string}`
  );
  const aliceViemAccount = privateKeyToAccount(generatePrivateKey());
  const aliceViemAccountAuthData = await ViemAccountAuthenticator.authenticate(
    aliceViemAccount
  );

  /**
   * ====================================
   * Environment settings
   * ====================================
   */
  const _network = network || process.env['NETWORK'];
  const _logLevel = logLevel || process.env['LOG_LEVEL'];
  process.env['LOG_LEVEL'] = _logLevel;

  if (!_network) {
    throw new Error(
      `❌ Network not specified. Please set the NETWORK environment variable or pass a network parameter. Available networks: ${SupportedNetworkSchema.options.join(
        ', '
      )}`
    );
  }

  console.log('✅ Using network:', _network);
  console.log('✅ Using log level:', _logLevel);

  /**
   * ====================================
   * Selecting a network module
   * ❗️ If it's on local chain, we will fund it with the first Anvil account.
   * ❗️ If it's on live chain, we will fund it with the master account. (set in the .env file)
   * ====================================
   */
  let _networkModule;

  if (_network === 'naga-dev') {
    const { nagaDev } = await import('@lit-protocol/networks');
    _networkModule = nagaDev;
    await fundAccount(aliceViemAccount, liveMasterAccount, _networkModule, {
      ifLessThan: '0.0001',
      thenFundWith: '0.0001',
    });
  } else if (_network === 'naga-local') {
    const { nagaLocal } = await import('@lit-protocol/networks');
    _networkModule = nagaLocal;
    await fundAccount(aliceViemAccount, localMasterAccount, _networkModule, {
      ifLessThan: '1',
      thenFundWith: '1',
    });
  } else if (_network === 'naga-staging') {
    const { nagaStaging } = await import('@lit-protocol/networks');
    _networkModule = nagaStaging;
    await fundAccount(aliceViemAccount, liveMasterAccount, _networkModule, {
      ifLessThan: '0.0001',
      thenFundWith: '0.0001',
    });
  } else {
    throw new Error(`❌ Invalid network: ${_network}`);
  }

  /**
   * ====================================
   * Initialise the LitClient
   * ====================================
   */

  // @ts-ignore
  const litClient = await createLitClient({ network: _networkModule });

  /**
   * ====================================
   * Initialise the AuthManager
   * ====================================
   */
  const authManager = createAuthManager({
    storage: storagePlugins.localStorageNode({
      appName: 'my-local-testing-app',
      networkName: _network,
      storagePath: './lit-auth-local',
    }),
  });

  /**
   * ====================================
   * Select a PKP
   * ====================================
   */
  const { pkps: aliceViemAccountPkps } = await litClient.viewPKPsByAuthData({
    authData: aliceViemAccountAuthData,
    pagination: {
      limit: 5,
    },
    storageProvider: storagePlugins.localStorageNode({
      appName: 'my-app',
      networkName: 'naga-dev',
      storagePath: './pkp-tokens',
    }),
  });
  const aliceViemAccountPkp = aliceViemAccountPkps[0];

  /**
   * ====================================
   * (Local only) Mint a PKP
   * ====================================
   */
  if (!aliceViemAccountPkp) {
    await litClient.mintWithAuth({
      authData: aliceViemAccountAuthData,
      account: aliceViemAccount,
      scopes: ['sign-anything'],
    });
  }

  /**
   * ====================================
   * Select a PKP
   * ====================================
   */
  const { pkps: aliceViemAccountPkps2 } = await litClient.viewPKPsByAuthData({
    authData: aliceViemAccountAuthData,
    pagination: {
      limit: 5,
    },
    storageProvider: storagePlugins.localStorageNode({
      appName: 'my-app',
      networkName: 'naga-dev',
      storagePath: './pkp-tokens',
    }),
  });
  const aliceViemAccountPkp2 = aliceViemAccountPkps2[0];

  /**
   * ====================================
   * Create the auth context
   * ====================================
   */
  const aliceEoaAuthContext = await authManager.createEoaAuthContext({
    config: {
      account: aliceViemAccount,
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

  console.log('✅ Initialised components');
  /**
   * ====================================
   * Return the initialised components
   * ====================================
   */
  return {
    litClient,
    authManager,
    localMasterAccount,
    aliceViemAccount,
    aliceViemAccountAuthData,
    aliceViemAccountPkp: aliceViemAccountPkp2,
    aliceEoaAuthContext,
  };
};
