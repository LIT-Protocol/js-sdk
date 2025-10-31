import {
  LitNetworkModule,
  nagaDev,
  nagaLocal,
  nagaTest,
  PaymentManager,
} from '@lit-protocol/networks';
import { EnvVars } from './createEnvVars';
import { createLitClient } from '@lit-protocol/lit-client';
import { createAuthManager, storagePlugins } from '@lit-protocol/auth';
import { privateKeyToAccount } from 'viem/accounts';

export const CONFIG = {
  LOCAL: {
    nativeFundingAmount: '1',
    ledgerDepositAmount: '2',
  },
  LIVE: {
    nativeFundingAmount: '0.1',
    ledgerDepositAmount: '0.1',
  },
};

export type TestEnvs = {
  address: `0x${string}`;
  networkModule: LitNetworkModule;
};

export type TestEnv = {
  masterAccount: ReturnType<typeof privateKeyToAccount>;
  masterPaymentManager: PaymentManager;
  networkModule: LitNetworkModule;
  litClient: Awaited<ReturnType<typeof createLitClient>>;
  authManager: ReturnType<typeof createAuthManager>;
  config: {
    nativeFundingAmount: string;
    ledgerDepositAmount: string;
  };
};

export const createTestEnv = async (envVars: EnvVars): Promise<TestEnv> => {
  // -- 1. Create network module
  let networkModule: LitNetworkModule;
  let config = {
    nativeFundingAmount: '',
    ledgerDepositAmount: '',
  };

  if (envVars.network === 'naga-local') {
    networkModule = nagaLocal
      .withLocalContext({
        networkContextPath: envVars.localContextPath,
        networkName: 'naga-local',
      })
      .withOverrides({
        rpcUrl: envVars.rpcUrl,
      });
    config = CONFIG.LOCAL;
  } else if (
    envVars.network === 'naga-dev' ||
    envVars.network === 'naga-test'
  ) {
    if (envVars.network === 'naga-dev') {
      networkModule = nagaDev;
    } else if (envVars.network === 'naga-test') {
      networkModule = nagaTest;
    }

    if (envVars.rpcUrl) {
      console.log(
        `🔧 Overriding RPC URL for ${envVars.network} to ${envVars.rpcUrl}`
      );
      networkModule = networkModule.withOverrides({
        rpcUrl: envVars.rpcUrl,
      });
    }

    config = CONFIG.LIVE;
  }

  // 2. Create Lit Client
  const litClient = await createLitClient({
    network: networkModule,
  });

  // 3. Create auth manager
  const authManager = createAuthManager({
    storage: storagePlugins.localStorageNode({
      appName: `my-${envVars.network}-e2e-test-app`,
      networkName: `${envVars.network}-e2e-tests`,
      storagePath: './.e2e/e2e-tests-storage',
    }),
  });

  // 4. Create master account
  const masterAccount = privateKeyToAccount(envVars.privateKey);

  // 5. Create master payer account
  const masterPaymentManager = await litClient.getPaymentManager({
    account: masterAccount,
  });

  return {
    masterAccount: privateKeyToAccount(envVars.privateKey),
    masterPaymentManager,
    networkModule,
    litClient,
    authManager,
    config,
  };
};
