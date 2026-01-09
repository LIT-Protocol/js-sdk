import {
  createAuthManager,
  ViemAccountAuthenticator,
} from '@lit-protocol/auth';
import { storagePlugins } from '@lit-protocol/auth/storage-node';
import { createLitClient } from '@lit-protocol/lit-client';
import { nagaDev, nagaTest } from '@lit-protocol/networks';
import { Hex } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { env } from '../env';
import { AuthData } from '@lit-protocol/schemas';
import { getChildLogger } from '@lit-protocol/logger';

const _logger = getChildLogger({ name: 'initSystemContext' });

declare global {
  var systemContext: {
    litClient: Awaited<ReturnType<typeof createLitClient>>;
    account: Awaited<ReturnType<typeof privateKeyToAccount>>;
    authManager: Awaited<ReturnType<typeof createAuthManager>>;
    createEoaAuthContext: any;
    authData: AuthData;
  };
}

export async function initSystemContext({
  appName,
  rpcUrl,
}: {
  appName: string;
  rpcUrl?: string;
}) {
  console.log('🔥 [initSystemContext] Initializing system context...');

  let networkModule: typeof nagaDev | typeof nagaTest;
  if (env.NETWORK === 'naga-dev') networkModule = nagaDev;
  else if (env.NETWORK === 'naga-test') networkModule = nagaTest;
  else throw new Error(`Unsupported network: ${env.NETWORK}`);

  _logger.info({ env: env.NETWORK }, 'Using env.NETWORK');

  const overrideRpc = rpcUrl || env.LIT_TXSENDER_RPC_URL;

  // Apply runtime override if rpcUrl provided
  const effectiveModule =
    overrideRpc && typeof networkModule.withOverrides === 'function'
      ? networkModule.withOverrides({ rpcUrl: overrideRpc })
      : networkModule;

  try {
    const baseRpc =
      typeof networkModule.getRpcUrl === 'function'
        ? networkModule.getRpcUrl()
        : 'n/a';
    const effRpc =
      typeof effectiveModule.getRpcUrl === 'function'
        ? effectiveModule.getRpcUrl()
        : 'n/a';

    _logger.info(
      { baseRpc, effRpc },
      '[initSystemContext] RPC (base → effective):'
    );
  } catch {
    throw new Error(
      `Failed to determine RPC URL from network module ${networkModule}`
    );
  }

  const litClient = await createLitClient({
    network: effectiveModule,
  });

  const account = privateKeyToAccount(env.LIT_TXSENDER_PRIVATE_KEY as Hex);

  const authManager = createAuthManager({
    storage: storagePlugins.localStorageNode({
      appName: appName,
      networkName: env.NETWORK,
      storagePath: `./lit-auth-worker-storage-${appName}`,
    }),
  });

  const authData = await ViemAccountAuthenticator.authenticate(account);

  globalThis.systemContext = {
    litClient: litClient,
    account: account,
    authManager: authManager,
    createEoaAuthContext: async () => {
      return authManager.createEoaAuthContext({
        config: {
          account: account,
        },
        authConfig: {
          statement: `${appName} is running..`,
          domain: 'worker.litprotocol.com',
          resources: [['pkp-signing', '*']],
          expiration: new Date(Date.now() + 1000 * 60 * 10).toISOString(),
        },
        litClient: litClient,
      });
    },
    authData,
  };
  _logger.info('🔥 [initSystemContext] System context initialized');
}
