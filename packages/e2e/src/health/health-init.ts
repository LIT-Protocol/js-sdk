/**
 * Health Check Initialization Module
 *
 * This module provides a lightweight initialization for health checks that minimizes
 * chain interactions. Unlike the full e2e init, this only creates a single test person
 * using EOA authentication and reuses it across all endpoint tests.
 *
 * Design Philosophy:
 * - Minimal chain interactions (only what's necessary for testing endpoints)
 * - Single person setup to reduce overhead
 * - Fast execution for frequent health monitoring
 * - Reusable auth context across all tests
 */

import {
  createAuthManager,
  storagePlugins,
  ViemAccountAuthenticator,
} from '@lit-protocol/auth';
import { createLitClient } from '@lit-protocol/lit-client';
import { generatePrivateKey, privateKeyToAccount } from 'viem/accounts';
import { z } from 'zod';
import { fundAccount } from '../helper/fundAccount';
import { getOrCreatePkp } from '../helper/pkp-utils';
import { PKPData, AuthData } from '@lit-protocol/schemas';
import {
  AuthContext,
  AuthManagerInstance,
  LitClientInstance,
  ViemAccount,
} from '../types';

const SupportedNetworkSchema = z.enum(['naga-dev', 'naga-test', 'naga']);

type SupportedNetwork = z.infer<typeof SupportedNetworkSchema>;

const LogLevelSchema = z.enum(['silent', 'info', 'debug']);
type LogLevel = z.infer<typeof LogLevelSchema>;

// Configuration constants
const LIVE_NETWORK_FUNDING_AMOUNT = '0.01';
const LIVE_NETWORK_LEDGER_DEPOSIT_AMOUNT = '2';
const NAGA_MAINNET_NETWORK_FUNDING_AMOUNT =
  process.env['NAGA_MAINNET_NETWORK_FUNDING_AMOUNT'] ?? '0.01';
const NAGA_MAINNET_LEDGER_DEPOSIT_AMOUNT =
  process.env['NAGA_MAINNET_LEDGER_DEPOSIT_AMOUNT'] ?? '0.01';

/**
 * Initialize the health check environment with minimal setup
 *
 * This function:
 * 1. Creates a single test account (Alice)
 * 2. Funds it minimally
 * 3. Creates one PKP for testing
 * 4. Sets up auth context for endpoint testing
 *
 * @param network - The network to run health checks on (naga-dev, naga-test, or naga)
 * @param logLevel - Logging level for the health check run
 * @returns Initialized components needed for health checks
 */
export const initHealthCheck = async (
  network?: SupportedNetwork,
  logLevel?: LogLevel
): Promise<{
  litClient: LitClientInstance;
  authManager: AuthManagerInstance;
  aliceViemAccount: ViemAccount;
  aliceViemAccountAuthData: AuthData;
  aliceViemAccountPkp: PKPData;
  aliceEoaAuthContext: AuthContext;
  networkName: string;
}> => {
  /**
   * ====================================
   * Environment Configuration
   * ====================================
   */
  const _network = network || process.env['NETWORK'];
  const _logLevel = logLevel || process.env['LOG_LEVEL'] || 'silent';
  process.env['LOG_LEVEL'] = _logLevel;

  if (!_network) {
    throw new Error(
      `❌ Network not specified. Please set the NETWORK environment variable or pass a network parameter. Available networks: ${SupportedNetworkSchema.options.join(
        ', '
      )}`
    );
  }

  // Validate network
  const parsedNetwork = SupportedNetworkSchema.safeParse(_network);
  if (!parsedNetwork.success) {
    throw new Error(
      `❌ Invalid network: ${_network}. Must be one of: ${SupportedNetworkSchema.options.join(
        ', '
      )}`
    );
  }
  const resolvedNetwork = parsedNetwork.data;
  const isNagaMainnet = resolvedNetwork === 'naga';

  console.log('🔍 Health Check Configuration:');
  console.log('  Network:', _network);
  console.log('  Log Level:', _logLevel);

  /**
   * ====================================
   * Account Setup (Minimal)
   * ====================================
   */
  const mainnetMasterAccount =
    process.env['LIVE_MASTER_ACCOUNT_NAGA'] || process.env['LIVE_MASTER_ACCOUNT'];
  const masterPrivateKey = isNagaMainnet
    ? mainnetMasterAccount
    : process.env['LIVE_MASTER_ACCOUNT'];

  if (!masterPrivateKey) {
    const requiredEnvVar = isNagaMainnet
      ? 'LIVE_MASTER_ACCOUNT_NAGA or LIVE_MASTER_ACCOUNT'
      : 'LIVE_MASTER_ACCOUNT';
    throw new Error(
      `❌ ${requiredEnvVar} is not set (required for NETWORK=${resolvedNetwork}).`
    );
  }

  const masterAccount = privateKeyToAccount(
    masterPrivateKey as `0x${string}`
  );

  // Create a single test account
  const aliceViemAccount = privateKeyToAccount(generatePrivateKey());
  const aliceViemAccountAuthData = await ViemAccountAuthenticator.authenticate(
    aliceViemAccount
  );

  /**
   * ====================================
   * Network Module Setup
   * ====================================
   */
  const networkConfig = {
    'naga-dev': { importName: 'nagaDev' },
    'naga-test': { importName: 'nagaTest' },
    naga: { importName: 'naga' },
  } as const;

  const config = networkConfig[resolvedNetwork];
  if (!config) {
    throw new Error(`❌ Invalid network configuration for: ${_network}`);
  }

  // Dynamic import of network module
  const networksModule = await import('@lit-protocol/networks');
  const _baseNetworkModule = networksModule[config.importName];

  // Optional RPC override
  const rpcOverrideEnvVar = isNagaMainnet
    ? 'LIT_MAINNET_RPC_URL'
    : 'LIT_YELLOWSTONE_PRIVATE_RPC_URL';
  const rpcOverride = process.env[rpcOverrideEnvVar];
  const _networkModule =
    rpcOverride && typeof _baseNetworkModule.withOverrides === 'function'
      ? _baseNetworkModule.withOverrides({ rpcUrl: rpcOverride })
      : _baseNetworkModule;

  if (rpcOverride) {
    console.log('  RPC Override:', rpcOverride);
  }

  /**
   * ====================================
   * Fund Account (Minimal)
   * ====================================
   */
  const fundingAmount = isNagaMainnet
    ? NAGA_MAINNET_NETWORK_FUNDING_AMOUNT
    : LIVE_NETWORK_FUNDING_AMOUNT;
  const ledgerDepositAmount = isNagaMainnet
    ? NAGA_MAINNET_LEDGER_DEPOSIT_AMOUNT
    : LIVE_NETWORK_LEDGER_DEPOSIT_AMOUNT;

  await fundAccount(aliceViemAccount, masterAccount, _networkModule, {
    ifLessThan: fundingAmount,
    thenFund: fundingAmount,
  });

  /**
   * ====================================
   * Initialize Lit Client
   * ====================================
   */
  const litClient = await createLitClient({ network: _networkModule });
  console.log('✅ Lit Client initialized');

  /**
   * ====================================
   * Payment Manager Setup
   * ====================================
   */
  const masterPaymentManager = await litClient.getPaymentManager({
    account: masterAccount,
  });

  const masterPaymentBalance = await masterPaymentManager.getBalance({
    userAddress: masterAccount.address,
  });
  console.log('✅ Master Payment Balance:', masterPaymentBalance);

  // Deposit for Alice
  await masterPaymentManager.depositForUser({
    userAddress: aliceViemAccount.address,
    amountInEth: ledgerDepositAmount,
  });

  /**
   * ====================================
   * Auth Manager Setup
   * ====================================
   */
  const authManager = createAuthManager({
    storage: storagePlugins.localStorageNode({
      appName: 'lit-health-check',
      networkName: resolvedNetwork,
      storagePath: './.health-check/lit-auth-local',
    }),
  });

  /**
   * ====================================
   * Create PKP for Alice (Minimal)
   * ====================================
   */
  const aliceViemAccountPkp = await getOrCreatePkp(
    litClient,
    aliceViemAccountAuthData,
    aliceViemAccount
  );

  // Deposit for Alice's PKP
  await masterPaymentManager.depositForUser({
    userAddress: aliceViemAccountPkp.ethAddress,
    amountInEth: ledgerDepositAmount,
  });

  console.log('✅ PKP created and funded');

  /**
   * ====================================
   * Create EOA Auth Context
   * ====================================
   */
  const aliceEoaAuthContext = await authManager.createEoaAuthContext({
    config: {
      account: aliceViemAccount,
    },
    authConfig: {
      statement: 'Health check authorization for Lit Protocol endpoints.',
      domain: 'health-check.lit',
      resources: [
        ['lit-action-execution', '*'],
        ['pkp-signing', '*'],
        ['access-control-condition-decryption', '*'],
      ],
      capabilityAuthSigs: [],
      expiration: new Date(Date.now() + 1000 * 60 * 30).toISOString(), // 30 minutes
    },
    litClient: litClient,
  });

  console.log('✅ Auth context created');
  console.log('✅ Health check initialization complete\n');

  return {
    litClient,
    authManager,
    aliceViemAccount,
    aliceViemAccountAuthData,
    aliceViemAccountPkp,
    aliceEoaAuthContext,
    networkName: resolvedNetwork,
  };
};
