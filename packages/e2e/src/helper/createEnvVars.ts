const supportedNetworks = ['naga-local', 'naga-test', 'naga-dev'] as const;
type EnvName = 'local' | 'live';

export type EnvVars = {
  network: string;
  privateKey: `0x${string}`;
  rpcUrl?: string | undefined;
  localContextPath?: string;
};

// -- configure
const testEnv: Record<
  EnvName,
  { type: EnvName; key: 'LOCAL_MASTER_ACCOUNT' | 'LIVE_MASTER_ACCOUNT' }
> = {
  local: { type: 'local', key: 'LOCAL_MASTER_ACCOUNT' },
  live: { type: 'live', key: 'LIVE_MASTER_ACCOUNT' },
};

export function createEnvVars(): EnvVars {
  // 1. Get network string
  const network = process.env['NETWORK']!!;

  if (!network || !supportedNetworks.includes(network as any)) {
    throw new Error(
      `❌ NETWORK env var is not set or not supported. Found. ${network}`
    );
  }

  const selectedNetwork = network.includes('local') ? 'local' : 'live';

  // 2. Get private key
  let privateKey: `0x${string}`;
  if (network.includes('local')) {
    Object.assign(testEnv.local, { type: 'local' });
    privateKey = process.env[testEnv.local.key]!! as `0x${string}`;
  } else {
    Object.assign(testEnv.live, { type: 'live' });
    privateKey = process.env[testEnv.live.key]!! as `0x${string}`;
  }

  if (!privateKey) {
    throw new Error(
      `❌ You are on "${selectedNetwork}" environment, network ${network}. We are expecting  `
    );
  }

  // 3. Get RPC URL
  let rpcUrl: string | undefined;
  let localContextPath: string | undefined;

  // -- local network
  if (network === 'naga-local') {
    localContextPath = process.env['NAGA_LOCAL_CONTEXT_PATH'];
    const localRpcUrl = process.env['LOCAL_RPC_URL']!!;
    const defaultRpcUrl = 'http://127.0.0.1:8545';

    if (!localContextPath) {
      throw new Error(
        `NAGA_LOCAL_CONTEXT_PATH is not set for naga-local network. Received ${localContextPath}`
      );
    }

    if (!localRpcUrl) {
      console.error(
        `⚠️ LOCAL_RPC_URL is not set for naga-local network. Default to ${defaultRpcUrl}`
      );
    }

    rpcUrl = localRpcUrl || defaultRpcUrl;
  }

  // -- live networks
  if (network === 'naga-dev' || network === 'naga-test') {
    const liveRpcUrl = process.env['LIT_YELLOWSTONE_PRIVATE_RPC_URL'];

    if (liveRpcUrl) {
      rpcUrl = liveRpcUrl;
    }
  }

  const result = {
    network,
    privateKey,
    rpcUrl,
    localContextPath,
  };

  const clone = Object.freeze({
    ...result,
    privateKey: (privateKey.slice(0, 6) + '...') as `0x${string}`,
  });

  console.log('✅ Env Vars:', clone);

  return result;
}
