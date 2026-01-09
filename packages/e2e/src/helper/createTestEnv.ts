import {
  createAuthManager,
  generateSessionKeyPair,
} from '@lit-protocol/auth';
import { storagePlugins } from '@lit-protocol/auth/storage-node';
import { createLitClient } from '@lit-protocol/lit-client';
import {
  LitNetworkModule,
  naga,
  nagaDev,
  nagaLocal,
  nagaProto,
  nagaStaging,
  nagaTest,
  PaymentManager,
} from '@lit-protocol/networks';
import { privateKeyToAccount } from 'viem/accounts';
import { EnvVars } from './createEnvVars';

export const CONFIG = {
  LOCAL: {
    nativeFundingAmount: '1',
    ledgerDepositAmount: '2',
    sponsorshipLimits: {
      totalMaxPriceInWei: '50000000000000000',
      userMaxPrice: 50000000000000000n,
    },
  },
  LIVE: {
    nativeFundingAmount: '0.01',
    ledgerDepositAmount: '0.01',
    sponsorshipLimits: {
      totalMaxPriceInWei: '50000000000000000',
      userMaxPrice: 50000000000000000n,
    },
  },
  MAINNET: {
    nativeFundingAmount: '0.01',
    ledgerDepositAmount: '0.01',
    sponsorshipLimits: {
      // The mainnet payment delegation flow uses this as the per-request budget and
      // must be large enough to cover the minimum estimated price for a PKP sign.
      totalMaxPriceInWei: '60000000000000000000',
      userMaxPrice: 60000000000000000000n,
    },
  },
};

const NAGA_MAINNET_NETWORK_FUNDING_AMOUNT =
  process.env['NAGA_MAINNET_NETWORK_FUNDING_AMOUNT'] ?? '20';
const NAGA_PROTO_NETWORK_FUNDING_AMOUNT =
  process.env['NAGA_PROTO_NETWORK_FUNDING_AMOUNT'] ?? '0.01';
const NAGA_MAINNET_LEDGER_DEPOSIT_AMOUNT =
  process.env['NAGA_MAINNET_LEDGER_DEPOSIT_AMOUNT'] ?? '60';
const NAGA_PROTO_LEDGER_DEPOSIT_AMOUNT =
  process.env['NAGA_PROTO_LEDGER_DEPOSIT_AMOUNT'] ?? '0.01';

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
    sponsorshipLimits: {
      totalMaxPriceInWei: string;
      userMaxPrice: bigint;
    };
  };

  // --- Wrapped Keys related ---
  sessionKeyPair: ReturnType<typeof generateSessionKeyPair>;
};

export const createTestEnv = async (envVars: EnvVars): Promise<TestEnv> => {
  // -- 1. Create network module
  const applyRpcOverride = (networkModule: LitNetworkModule) => {
    if (!envVars.rpcUrl) {
      return networkModule;
    }

    console.log(
      `🔧 Overriding RPC URL for ${envVars.network} to ${envVars.rpcUrl}`
    );

    return networkModule.withOverrides({
      rpcUrl: envVars.rpcUrl,
    });
  };

  let networkModule: LitNetworkModule;
  let config: TestEnv['config'];

  switch (envVars.network) {
    case 'naga-local': {
      if (!envVars.localContextPath) {
        throw new Error(
          'naga-local requires a valid local context path to be configured'
        );
      }

      networkModule = applyRpcOverride(
        nagaLocal.withLocalContext({
          networkContextPath: envVars.localContextPath,
          networkName: 'naga-local',
        })
      );

      config = CONFIG.LOCAL;
      break;
    }
    case 'naga-dev':
    case 'naga-test':
    case 'naga-staging': {
      if (envVars.network === 'naga-dev') {
        networkModule = nagaDev;
      } else if (envVars.network === 'naga-test') {
        networkModule = nagaTest;
      } else {
        networkModule = nagaStaging;
      }

      networkModule = applyRpcOverride(networkModule);
      config = CONFIG.LIVE;
      break;
    }
    case 'naga-proto':
    case 'naga': {
      networkModule = applyRpcOverride(
        envVars.network === 'naga-proto' ? nagaProto : naga
      );
      config =
        envVars.network === 'naga'
          ? {
              ...CONFIG.MAINNET,
              nativeFundingAmount: NAGA_MAINNET_NETWORK_FUNDING_AMOUNT,
              ledgerDepositAmount: NAGA_MAINNET_LEDGER_DEPOSIT_AMOUNT,
            }
          : {
              ...CONFIG.MAINNET,
              nativeFundingAmount: NAGA_PROTO_NETWORK_FUNDING_AMOUNT,
              ledgerDepositAmount: NAGA_PROTO_LEDGER_DEPOSIT_AMOUNT,
            };
      break;
    }
    default: {
      const exhaustiveCheck: never = envVars.network;
      throw new Error(`Unsupported network: ${exhaustiveCheck}`);
    }
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

  // --- This info are used by wrapped keys tests ---
  const sessionKeyPair = generateSessionKeyPair();

  return {
    masterAccount,
    masterPaymentManager,
    networkModule,
    litClient,
    authManager,
    config,
    sessionKeyPair,
  };
};
