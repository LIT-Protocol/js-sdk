import {
  createAuthManager,
  storagePlugins,
  ViemAccountAuthenticator,
} from '@lit-protocol/auth';
import { createLitClient, utils as litUtils } from '@lit-protocol/lit-client';
import { generatePrivateKey, privateKeyToAccount } from 'viem/accounts';
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

const SupportedNetworkSchema = z.enum([
  'naga-dev',
  'naga-test',
  'naga-local',
  'naga-staging',
]);

type SupportedNetwork = z.infer<typeof SupportedNetworkSchema>;

const LogLevelSchema = z.enum(['silent', 'info', 'debug']);
type LogLevel = z.infer<typeof LogLevelSchema>;

// Configurations
const LIVE_NETWORK_FUNDING_AMOUNT = '0.01';
const LOCAL_NETWORK_FUNDING_AMOUNT = '1';
const LIVE_NETWORK_LEDGER_DEPOSIT_AMOUNT = '2';

const EVE_VALIDATION_IPFS_CID =
  'QmcxWmo3jefFsPUnskJXYBwsJYtiFuMAH1nDQEs99AwzDe';

export const init = async (
  network?: SupportedNetwork,
  logLevel?: LogLevel
): Promise<{
  litClient: LitClientInstance;
  authManager: AuthManagerInstance;
  localMasterAccount: ViemAccount;
  aliceViemAccount: ViemAccount;
  aliceViemAccountAuthData: AuthData;
  aliceViemAccountPkp: PKPData;
  bobViemAccount: ViemAccount;
  bobViemAccountAuthData: AuthData;
  bobViemAccountPkp: PKPData;
  aliceEoaAuthContext: AuthContext;
  alicePkpAuthContext: AuthContext;
  eveViemAccount: ViemAccount;
  eveCustomAuthData: CustomAuthData;
  eveViemAccountPkp: PKPData;
  eveValidationIpfsCid: `Qm${string}`;
  masterDepositForUser: (userAddress: string) => Promise<void>;
}> => {
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

  const bobViemAccount = privateKeyToAccount(generatePrivateKey());
  const bobViemAccountAuthData = await ViemAccountAuthenticator.authenticate(
    bobViemAccount
  );

  const eveViemAccount = privateKeyToAccount(generatePrivateKey());

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
   * Network configuration and setup
   * ❗️ If it's on local chain, we will fund it with the first Anvil account.
   * ❗️ If it's on live chain, we will fund it with the master account. (set in the .env file)
   * ====================================
   */

  // Network configuration map
  const networkConfig = {
    'naga-dev': { importName: 'nagaDev', type: 'live' },
    'naga-test': { importName: 'nagaTest', type: 'live' },
    'naga-local': { importName: 'nagaLocal', type: 'local' },
    'naga-staging': { importName: 'nagaStaging', type: 'live' },
  } as const;

  const config = networkConfig[_network as keyof typeof networkConfig];
  if (!config) {
    throw new Error(`❌ Invalid network: ${_network}`);
  }

  // Dynamic import of network module
  const networksModule = await import('@lit-protocol/networks');
  const _baseNetworkModule = networksModule[config.importName];

  // Optional RPC override from env
  const rpcOverride = process.env['LIT_YELLOWSTONE_PRIVATE_RPC_URL'];
  const _networkModule = _baseNetworkModule;

  if (rpcOverride) {
    console.log(
      '✅ Using RPC override (LIT_YELLOWSTONE_PRIVATE_RPC_URL):',
      rpcOverride
    );
  }

  // Fund accounts based on network type
  const isLocal = config.type === 'local';
  const masterAccount = isLocal ? localMasterAccount : liveMasterAccount;
  const fundingAmount = isLocal
    ? LOCAL_NETWORK_FUNDING_AMOUNT
    : LIVE_NETWORK_FUNDING_AMOUNT;

  // Fund accounts sequentially to avoid nonce conflicts with same sponsor
  await fundAccount(aliceViemAccount, masterAccount, _networkModule, {
    ifLessThan: fundingAmount,
    thenFundWith: fundingAmount,
  });

  await fundAccount(bobViemAccount, masterAccount, _networkModule, {
    ifLessThan: fundingAmount,
    thenFundWith: fundingAmount,
  });

  await fundAccount(eveViemAccount, masterAccount, _networkModule, {
    ifLessThan: fundingAmount,
    thenFundWith: fundingAmount,
  });

  /**
   * ====================================
   * Initialise the LitClient
   * ====================================
   */
  const litClient = await createLitClient({ network: _networkModule });

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
   * Get or create PKPs for Alice and Bob
   * ====================================
   */
  const [aliceViemAccountPkp, bobViemAccountPkp] = await Promise.all([
    getOrCreatePkp(litClient, aliceViemAccountAuthData, aliceViemAccount),
    getOrCreatePkp(litClient, bobViemAccountAuthData, bobViemAccount),
  ]);

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
    chainConfig: _networkModule.getChainConfig(),
  });

  await fundAccount(alicePkpViemAccount, masterAccount, _networkModule, {
    ifLessThan: LOCAL_NETWORK_FUNDING_AMOUNT,
    thenFundWith: LOCAL_NETWORK_FUNDING_AMOUNT,
  });

  /**
   * ====================================
   * Depositing to Lit Ledger for differen
   * ====================================
   */

  async function masterDepositForUser(userAddress: string) {
    await masterPaymentManager.depositForUser({
      userAddress: userAddress,
      amountInEth: LIVE_NETWORK_LEDGER_DEPOSIT_AMOUNT,
    });
    console.log(
      `✅ New ${userAddress} Ledger Balance:`,
      await masterPaymentManager.getBalance({ userAddress: userAddress })
    );
  }

  // Deposit to the Alice EOA Ledger
  await masterDepositForUser(aliceViemAccount.address);

  // Deposit to the PKP Ledger
  await masterDepositForUser(alicePkpViemAccount.address);

  // Deposit to the Bob EOA Ledger
  await masterDepositForUser(bobViemAccount.address);

  // Deposit to the Bob PKP Ledger
  await masterDepositForUser(bobViemAccountPkp.ethAddress);

  // Deposit to the Eve EOA Ledger
  await masterDepositForUser(eveViemAccount.address);

  // Deposit to the Eve PKP Ledger
  await masterDepositForUser(eveViemAccountPkp.ethAddress);

  // const alicePkpViemAccountPermissionsManager = await litClient.getPKPPermissionsManager({
  //   pkpIdentifier: {
  //     tokenId: aliceViemAccountPkp.tokenId,
  //   },
  //   account: alicePkpViemAccount,
  // });

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
    aliceViemAccountPkp,
    bobViemAccount,
    bobViemAccountAuthData,
    bobViemAccountPkp,
    eveViemAccount,
    eveCustomAuthData,
    eveViemAccountPkp,
    eveValidationIpfsCid: EVE_VALIDATION_IPFS_CID,
    aliceEoaAuthContext,
    alicePkpAuthContext,
    masterDepositForUser,
    // alicePkpViemAccountPermissionsManager
  };
};
