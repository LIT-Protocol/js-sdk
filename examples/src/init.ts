import {
  createAuthManager,
  storagePlugins,
  ViemAccountAuthenticator,
} from '@lit-protocol/auth';
import { createLitClient } from '@lit-protocol/lit-client';
import { nagaDev, nagaLocal } from '@lit-protocol/networks';
import { createPublicClient, parseEther } from 'viem';
import { http } from 'viem';
import { createWalletClient } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { z } from 'zod';
import { mainnet } from 'viem/chains';

const SupportedNetworkSchema = z.enum(['naga-dev', 'naga-local']);
type SupportedNetwork = z.infer<typeof SupportedNetworkSchema>;

const LogLevelSchema = z.enum(['silent', 'info', 'debug']);
type LogLevel = z.infer<typeof LogLevelSchema>;

const ANVIL_PRIVATE_KEY =
  '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80';

const privateKey = process.env.PRIVATE_KEY || ANVIL_PRIVATE_KEY;

export const init = async (network?: SupportedNetwork, logLevel?: LogLevel) => {
  console.log("Make sure to fund your account if you haven't done so.");

  // Prepare the account we will use for authentication (for this test)
  const anvilAccount = privateKeyToAccount(ANVIL_PRIVATE_KEY);
  const myAccount = privateKeyToAccount(privateKey as `0x${string}`);
  const viemAccountAuthData = await ViemAccountAuthenticator.authenticate(
    myAccount
  );

  // 1. Environment settings
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

  // 2. Prepare the network module
  let _networkModule;

  if (_network === 'naga-dev') {
    _networkModule = nagaDev;
  } else if (_network === 'naga-local') {
    _networkModule = nagaLocal;

    const walletClient = createWalletClient({
      account: anvilAccount,
      transport: http('http://localhost:8545'),
    });
    const anvilChain = {
      ...mainnet,
      id: 31337,
      name: 'Anvil',
    };
    const res = await walletClient.sendTransaction({
      to: myAccount.address,
      value: parseEther('1'),
      chain: anvilChain,
    });

    // check account balance
    const publicClient = createPublicClient({
      chain: anvilChain,
      transport: http('http://localhost:8545'),
    });
    const balance = await publicClient.getBalance({
      address: myAccount.address,
    });
    console.log('✅ balance:', balance);
  } else {
    throw new Error(`❌ Invalid network: ${_network}`);
  }

  // 4a. (LitClient) Initialisation
  const litClient = await createLitClient({ network: _networkModule });

  // 4b. (Auth Manager) Initialisation
  const authManager = createAuthManager({
    storage: storagePlugins.localStorageNode({
      appName: 'my-local-testing-app',
      networkName: _network,
      storagePath: './lit-auth-local',
    }),
  });

  // mint one
  // if (_network === 'naga-local') {
  await litClient.mintWithAuth({
    authData: viemAccountAuthData,
    account: myAccount,
    scopes: ['sign-anything'],
  });
  // }

  // 5. Select a PKP we are going to use for this test
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
  const viemAccountPkp = viemAccountPkps[0];

  // 6. Create the auth context
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

  // 7. Return the initialised components
  return {
    myAccount,
    litClient,
    authManager,
    viemAccountAuthData,
    viemAccountPkp,
    viemAuthContext,
  };
};
