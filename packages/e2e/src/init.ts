import {
  createAuthManager,
  storagePlugins,
  ViemAccountAuthenticator,
} from '@lit-protocol/auth';
import { createLitClient, utils as litUtils } from '@lit-protocol/lit-client';
import type { NagaLocalModule } from '@lit-protocol/networks';
import { generatePrivateKey, privateKeyToAccount } from 'viem/accounts';
import { persistGeneratedAccount } from './helper/generated-accounts';
import {
  NetworkName,
  NetworkNameSchema,
  ResolvedNetwork,
  resolveNetwork,
} from './helper/network';
import { z } from 'zod';
import { fundAccount } from './helper/fundAccount';
import { getOrCreatePkp } from './helper/pkp-utils';
import { PKPData, AuthData, CustomAuthData } from '@lit-protocol/schemas';
import {
  AuthContext,
  AuthManagerInstance,
  LitClientInstance,
  ViemAccount,
} from './types';

// import { createPkpAuthContext } from './helper/auth-contexts';

const SupportedNetworkSchema = z.enum([
  'naga-dev',
  'naga-test',
  'naga-local',
  'naga-staging',
  'naga-proto',
  'naga',
]);

type SupportedNetwork = z.infer<typeof SupportedNetworkSchema>;

const LogLevelSchema = z.enum(['silent', 'info', 'debug']);
type LogLevel = z.infer<typeof LogLevelSchema>;

// Configurations
const LOCAL_NETWORK_FUNDING_AMOUNT = '1';
const LIVE_NETWORK_LEDGER_DEPOSIT_AMOUNT =
  process.env['LIVE_NETWORK_LEDGER_DEPOSIT_AMOUNT'] ?? '5';
// Mainnet-style networks have separate knobs so `naga-proto` can remain cheap while
// `naga` can be configured independently.
const NAGA_MAINNET_NETWORK_FUNDING_AMOUNT =
  process.env['NAGA_MAINNET_NETWORK_FUNDING_AMOUNT'] ?? '0.01';
const NAGA_PROTO_NETWORK_FUNDING_AMOUNT =
  process.env['NAGA_PROTO_NETWORK_FUNDING_AMOUNT'] ?? '0.01';
const NAGA_MAINNET_LEDGER_DEPOSIT_AMOUNT =
  // Default stays low to avoid stranding real mainnet funds; override as needed.
  process.env['NAGA_MAINNET_LEDGER_DEPOSIT_AMOUNT'] ?? '0.01';
const NAGA_PROTO_LEDGER_DEPOSIT_AMOUNT =
  process.env['NAGA_PROTO_LEDGER_DEPOSIT_AMOUNT'] ?? '0.01';

const LIVE_NETWORK_FUNDING_AMOUNT =
  process.env['LIVE_NETWORK_FUNDING_AMOUNT'] ?? '5';

const EVE_VALIDATION_IPFS_CID =
  'QmcxWmo3jefFsPUnskJXYBwsJYtiFuMAH1nDQEs99AwzDe';

type BaseInitResult = {
  litClient: LitClientInstance;
  authManager: AuthManagerInstance;
  localMasterAccount: ViemAccount;
  aliceViemAccount: ViemAccount;
  aliceViemAccountAuthData: AuthData;
  aliceViemAccountPkp: PKPData;
  aliceEoaAuthContext: AuthContext;
  masterDepositForUser: (userAddress: string) => Promise<void>;
  resolvedNetwork: ResolvedNetwork;
};

type FullInitResult = BaseInitResult & {
  bobViemAccount: ViemAccount;
  bobViemAccountAuthData: AuthData;
  bobViemAccountPkp: PKPData;
  alicePkpAuthContext: AuthContext;
  eveViemAccount: ViemAccount;
  eveCustomAuthData: CustomAuthData;
  eveViemAccountPkp: PKPData;
  eveValidationIpfsCid: `Qm${string}`;
};

async function initInternal(
  mode: 'fast',
  network?: NetworkName,
  logLevel?: LogLevel
): Promise<BaseInitResult>;
async function initInternal(
  mode: 'full',
  network?: NetworkName,
  logLevel?: LogLevel
): Promise<FullInitResult>;
async function initInternal(
  mode: 'fast' | 'full',
  network?: NetworkName,
  logLevel?: LogLevel
): Promise<BaseInitResult | FullInitResult> {
  /**
   * ====================================
   * Prepare accounts for testing
   * ====================================
   */
  const networkForPersistence = (network ?? process.env['NETWORK']) as
    | string
    | undefined;

  const alicePrivateKeyEnv = process.env['E2E_ALICE_PRIVATE_KEY'] as
    | `0x${string}`
    | undefined;
  const alicePrivateKey = alicePrivateKeyEnv ?? generatePrivateKey();
  if (!alicePrivateKeyEnv) {
    persistGeneratedAccount({
      label: 'init:alice',
      privateKey: alicePrivateKey,
      network: networkForPersistence,
    });
  }
  const aliceViemAccount = privateKeyToAccount(alicePrivateKey);
  const aliceViemAccountAuthData = await ViemAccountAuthenticator.authenticate(
    aliceViemAccount
  );

  /**
   * ====================================
   * Environment settings
   * ====================================
   */
  const networkInput = network ?? process.env['NETWORK'];
  const _logLevel = logLevel ?? process.env['LOG_LEVEL'];
  if (_logLevel) {
    process.env['LOG_LEVEL'] = _logLevel;
  }

  if (!networkInput) {
    throw new Error(
      `❌ Network not specified. Please set the NETWORK environment variable or pass a network parameter. Available networks: ${NetworkNameSchema.options.join(
        ', '
      )}`
    );
  }

  /**
   * ====================================
   * Network configuration and setup
   * ❗️ If it's on local chain, we will fund it with the first Anvil account.
   * ❗️ If it's on live chain, we will fund it with the master account. (set in the .env file)
   * ====================================
   */
  const parsedNetwork = NetworkNameSchema.parse(networkInput);
  const rpcOverrideEnvVar =
    parsedNetwork === 'naga' || parsedNetwork === 'naga-proto'
      ? 'LIT_MAINNET_RPC_URL'
      : 'LIT_YELLOWSTONE_PRIVATE_RPC_URL';
  const rpcOverride = process.env[rpcOverrideEnvVar];

  const resolvedNetworkBase = await resolveNetwork({
    network: parsedNetwork,
    rpcUrlOverride: rpcOverride,
  });

  let { name: resolvedNetworkName, type: networkType } = resolvedNetworkBase;
  let networkModule = resolvedNetworkBase.networkModule;

  if (resolvedNetworkName === 'naga-local') {
    const localContextPath = process.env['NAGA_LOCAL_CONTEXT_PATH'];
    if (localContextPath) {
      const supportsLocalContext = (
        module: unknown
      ): module is NagaLocalModule =>
        !!module &&
        typeof (module as { withLocalContext?: unknown }).withLocalContext ===
          'function';

      if (supportsLocalContext(networkModule)) {
        const localContextName = process.env['NETWORK'];

        console.log(
          '✅ Loading naga-local signatures from NAGA_LOCAL_CONTEXT_PATH:',
          localContextPath
        );

        networkModule = await networkModule.withLocalContext({
          networkContextPath: localContextPath,
          networkName: localContextName,
        });
      } else {
        console.warn(
          '⚠️ NAGA_LOCAL_CONTEXT_PATH is set but nagaLocal.withLocalContext is unavailable in the current networks build.'
        );
      }
    }
  }

  const resolvedNetwork: ResolvedNetwork = {
    ...resolvedNetworkBase,
    networkModule,
  };

  console.log('✅ Using network:', resolvedNetworkName);
  console.log('✅ Using log level:', _logLevel);

  if (rpcOverride) {
    console.log(`✅ Using RPC override (${rpcOverrideEnvVar}):`, rpcOverride);
  }

  const isLocal = networkType === 'local';
  const isNagaMainnet = resolvedNetworkName === 'naga';
  const isNagaProto = resolvedNetworkName === 'naga-proto';
  const liveMasterKeyOverrides: Partial<Record<NetworkName, string>> = {
    naga: 'LIVE_MASTER_ACCOUNT_NAGA',
    'naga-dev': 'LIVE_MASTER_ACCOUNT_NAGA_DEV',
    'naga-test': 'LIVE_MASTER_ACCOUNT_NAGA_TEST',
    'naga-staging': 'LIVE_MASTER_ACCOUNT_NAGA_STAGING',
  };
  const overrideEnvVar = liveMasterKeyOverrides[resolvedNetworkName];
  const masterAccountEnvVar = isLocal
    ? 'LOCAL_MASTER_ACCOUNT'
    : overrideEnvVar && process.env[overrideEnvVar]
    ? overrideEnvVar
    : 'LIVE_MASTER_ACCOUNT';
  const masterPrivateKey = process.env[masterAccountEnvVar] as
    | `0x${string}`
    | undefined;

  if (!masterPrivateKey) {
    throw new Error(
      `❌ ${masterAccountEnvVar} is not set (expected a 0x-prefixed private key; required for NETWORK=${resolvedNetworkName}).`
    );
  }

  const masterAccount = privateKeyToAccount(masterPrivateKey);
  // Keep existing API shape: `localMasterAccount` is the sponsor account used by this run
  // (LOCAL on local networks, LIVE on live networks).
  const localMasterAccount = masterAccount;
  const fundingAmount = isLocal
    ? LOCAL_NETWORK_FUNDING_AMOUNT
    : isNagaMainnet
    ? NAGA_MAINNET_NETWORK_FUNDING_AMOUNT
    : isNagaProto
    ? NAGA_PROTO_NETWORK_FUNDING_AMOUNT
    : LIVE_NETWORK_FUNDING_AMOUNT;
  const ledgerDepositAmount = isNagaMainnet
    ? NAGA_MAINNET_LEDGER_DEPOSIT_AMOUNT
    : isNagaProto
    ? NAGA_PROTO_LEDGER_DEPOSIT_AMOUNT
    : LIVE_NETWORK_LEDGER_DEPOSIT_AMOUNT;

  // Fund accounts sequentially to avoid nonce conflicts with same sponsor
  await fundAccount(aliceViemAccount, masterAccount, networkModule, {
    ifLessThan: fundingAmount,
    thenFund: fundingAmount,
  });

  let bobViemAccount: ViemAccount | undefined;
  let bobViemAccountAuthData: AuthData | undefined;
  let eveViemAccount: ViemAccount | undefined;

  if (mode === 'full') {
    const bobPrivateKeyEnv = process.env['E2E_BOB_PRIVATE_KEY'] as
      | `0x${string}`
      | undefined;
    const bobPrivateKey = bobPrivateKeyEnv ?? generatePrivateKey();
    if (!bobPrivateKeyEnv) {
      persistGeneratedAccount({
        label: 'init:bob',
        privateKey: bobPrivateKey,
        network: networkForPersistence,
      });
    }
    bobViemAccount = privateKeyToAccount(bobPrivateKey);
    bobViemAccountAuthData = await ViemAccountAuthenticator.authenticate(
      bobViemAccount
    );

    const evePrivateKeyEnv = process.env['E2E_EVE_PRIVATE_KEY'] as
      | `0x${string}`
      | undefined;
    const evePrivateKey = evePrivateKeyEnv ?? generatePrivateKey();
    if (!evePrivateKeyEnv) {
      persistGeneratedAccount({
        label: 'init:eve',
        privateKey: evePrivateKey,
        network: networkForPersistence,
      });
    }
    eveViemAccount = privateKeyToAccount(evePrivateKey);

    await fundAccount(bobViemAccount, masterAccount, networkModule, {
      ifLessThan: fundingAmount,
      thenFund: fundingAmount,
    });

    await fundAccount(eveViemAccount, masterAccount, networkModule, {
      ifLessThan: fundingAmount,
      thenFund: fundingAmount,
    });
  }

  /**
   * ====================================
   * Initialise the LitClient
   * ====================================
   */
  const litClient = await createLitClient({ network: networkModule });

  /**
   * ====================================
   * (Master) Initialise Payment Manager
   * ====================================
   */
  const masterPaymentManager = await litClient.getPaymentManager({
    account: masterAccount,
  });

  const masterPaymentBalance = await masterPaymentManager.getBalance({
    userAddress: masterAccount.address,
  });
  console.log('✅ Master Payment Balance:', masterPaymentBalance);

  async function masterDepositForUser(userAddress: string) {
    await masterPaymentManager.depositForUser({
      userAddress: userAddress,
      amountInLitkey: ledgerDepositAmount,
    });
    console.log(
      `✅ New ${userAddress} Ledger Balance:`,
      await masterPaymentManager.getBalance({ userAddress: userAddress })
    );
  }

  /**
   * ====================================
   * Initialise the AuthManager
   * ====================================
   */
  const authManager = createAuthManager({
    storage: storagePlugins.localStorageNode({
      appName: 'my-local-testing-app',
      networkName: resolvedNetworkName,
      storagePath: './.e2e/lit-auth-local',
    }),
  });

  const createAliceEoaAuthContext = () =>
    authManager.createEoaAuthContext({
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

  const aliceViemAccountPkp = await getOrCreatePkp(
    litClient,
    aliceViemAccountAuthData,
    aliceViemAccount
  );

  if (mode === 'fast') {
    await masterDepositForUser(aliceViemAccount.address);
    await masterDepositForUser(aliceViemAccountPkp.ethAddress);

    const aliceEoaAuthContext = await createAliceEoaAuthContext();

    console.log('✅ Initialised components (fast)');

    const baseResult: BaseInitResult = {
      litClient,
      authManager,
      localMasterAccount,
      aliceViemAccount,
      aliceViemAccountAuthData,
      aliceViemAccountPkp,
      aliceEoaAuthContext,
      masterDepositForUser,
      resolvedNetwork,
    };

    return baseResult;
  }

  if (!bobViemAccount || !bobViemAccountAuthData || !eveViemAccount) {
    throw new Error('❌ Failed to prepare accounts for full init');
  }

  /**
   * ====================================
   * Get or create PKPs for Alice and Bob
   * ====================================
   */
  const bobViemAccountPkp = await getOrCreatePkp(
    litClient,
    bobViemAccountAuthData,
    bobViemAccount
  );

  // Use custom auth to create a PKP for Eve
  const uniqueDappName = 'e2e-test-dapp';

  const authMethodConfig = litUtils.generateUniqueAuthMethodType({
    uniqueDappName: uniqueDappName,
  });

  const eveCustomAuthData = litUtils.generateAuthData({
    uniqueDappName: uniqueDappName,
    uniqueAuthMethodType: authMethodConfig.bigint,
    userId: 'eve',
  });

  const { pkpData } = await litClient.mintWithCustomAuth({
    account: eveViemAccount,
    authData: eveCustomAuthData,
    scope: 'sign-anything',
    validationIpfsCid: EVE_VALIDATION_IPFS_CID,
  });

  const eveViemAccountPkp = {
    ...pkpData.data,
    tokenId: pkpData.data.tokenId,
  };

  // Making sure all signers have sufficient ledger balance before calling the signSessionKey endpoint
  await masterDepositForUser(aliceViemAccount.address);
  await masterDepositForUser(bobViemAccount.address);
  await masterDepositForUser(aliceViemAccountPkp.ethAddress);
  await masterDepositForUser(bobViemAccountPkp.ethAddress);
  await masterDepositForUser(eveViemAccount.address);
  await masterDepositForUser(eveViemAccountPkp.ethAddress);

  /**
   * ====================================
   * Create the auth context
   * ====================================
   */
  const aliceEoaAuthContext = await createAliceEoaAuthContext();

  console.log('✅ Initialised components');

  /**
   * ====================================
   * Create PKP auth context
   * ====================================
   */
  const alicePkpAuthContext = await authManager.createPkpAuthContext({
    authData: aliceViemAccountAuthData,
    pkpPublicKey: aliceViemAccountPkp.pubkey,
    authConfig: {
      resources: [
        ['pkp-signing', '*'],
        ['lit-action-execution', '*'],
        ['access-control-condition-decryption', '*'],
      ],
      // 30m expiration
      expiration: new Date(Date.now() + 1000 * 60 * 30).toISOString(),
    },
    litClient: litClient,
  });

  const alicePkpViemAccount = await litClient.getPkpViemAccount({
    pkpPublicKey: aliceViemAccountPkp.pubkey,
    authContext: alicePkpAuthContext,
    chainConfig: networkModule.getChainConfig(),
  });

  await fundAccount(alicePkpViemAccount, masterAccount, networkModule, {
    ifLessThan: fundingAmount,
    thenFund: fundingAmount,
  });

  /**
   * ====================================
   * Depositing to Lit Ledger for different accounts
   * ====================================
   */
  await masterDepositForUser(alicePkpViemAccount.address);

  const baseResult: BaseInitResult = {
    litClient,
    authManager,
    localMasterAccount,
    aliceViemAccount,
    aliceViemAccountAuthData,
    aliceViemAccountPkp,
    aliceEoaAuthContext,
    masterDepositForUser,
    resolvedNetwork,
  };

  const fullResult: FullInitResult = {
    ...baseResult,
    bobViemAccount,
    bobViemAccountAuthData,
    bobViemAccountPkp,
    alicePkpAuthContext,
    eveViemAccount,
    eveCustomAuthData,
    eveViemAccountPkp,
    eveValidationIpfsCid: EVE_VALIDATION_IPFS_CID,
  };

  return fullResult;
}

export const init = async (
  network?: NetworkName,
  logLevel?: LogLevel
): Promise<FullInitResult> => {
  return initInternal('full', network, logLevel);
};

export const initFast = async (
  network?: NetworkName,
  logLevel?: LogLevel
): Promise<BaseInitResult> => {
  return initInternal('fast', network, logLevel);
};
