import { createAuthManager, storagePlugins } from '@lit-protocol/auth';
import { createLitClient } from '@lit-protocol/lit-client';
import { Hex } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { env } from '../env';
import { AuthData } from '@lit-protocol/schemas';

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

  let networkModule: any;

  // TODO: Add more supports for other networks
  if (env.NETWORK === 'naga-dev') {
    const { nagaDev } = await import('@lit-protocol/networks');
    networkModule = nagaDev;
  } else if (env.NETWORK === 'naga-test') {
    const { nagaTest } = await import('@lit-protocol/networks');
    networkModule = nagaTest;
  } else if (env.NETWORK === 'naga-staging') {
    const { nagaStaging } = await import('@lit-protocol/networks');
    networkModule = nagaStaging;
  } else {
    throw new Error(`Unsupported network: ${env.NETWORK}`);
  }

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
    console.log(
      '[initSystemContext] RPC (base → effective):',
      baseRpc,
      '→',
      effRpc
    );
  } catch {}

  const litClient = await createLitClient({
    network: effectiveModule,
  });

  const account = privateKeyToAccount(env.LIT_TXSENDER_PRIVATE_KEY as Hex);

  const authManager = createAuthManager({
    storage: storagePlugins.localStorageNode({
      appName: appName,
      networkName: 'naga-dev',
      storagePath: `./lit-auth-worker-storage-${appName}`,
    }),
  });

  const { ViemAccountAuthenticator } = await import('@lit-protocol/auth');

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
          capabilityAuthSigs: [],
          expiration: new Date(Date.now() + 1000 * 60 * 10).toISOString(),
        },
        litClient: litClient,
      });
    },
    authData,
  };
  console.log('🔥 [initSystemContext] System context initialized');
}
