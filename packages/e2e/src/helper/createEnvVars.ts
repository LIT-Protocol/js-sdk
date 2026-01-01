export const SUPPORTED_NETWORKS = [
  'naga-local',
  'naga-test',
  'naga-dev',
  'naga-staging',
  'naga-proto',
  'naga',
] as const;
export type SupportedNetwork = (typeof SUPPORTED_NETWORKS)[number];
type EnvName = 'local' | 'live';

const RPC_ENV_KEY_BY_NETWORK: Record<SupportedNetwork, string | undefined> = {
  'naga-local': undefined,
  'naga-dev': 'LIT_YELLOWSTONE_PRIVATE_RPC_URL',
  'naga-test': 'LIT_YELLOWSTONE_PRIVATE_RPC_URL',
  'naga-staging': 'LIT_YELLOWSTONE_PRIVATE_RPC_URL',
  'naga-proto': 'LIT_MAINNET_RPC_URL',
  naga: 'LIT_MAINNET_RPC_URL',
} as const;

export type EnvVars = {
  network: SupportedNetwork;
  privateKey: `0x${string}`;
  rpcUrl?: string | undefined;
  localContextPath?: string;
};

const PrivateKeySchema = /^(0x)?[0-9a-fA-F]{64}$/;

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
  const networkEnvRaw = process.env['NETWORK'];
  const networkEnv = networkEnvRaw?.trim();

  if (
    !networkEnv ||
    !SUPPORTED_NETWORKS.includes(networkEnv as SupportedNetwork)
  ) {
    throw new Error(
      `❌ NETWORK env var is not set or not supported. Found: ${
        networkEnvRaw ?? 'undefined'
      }`
    );
  }

  const network = networkEnv as SupportedNetwork;

  const selectedNetwork = network.includes('local') ? 'local' : 'live';

  // 2. Get private key
  let privateKey: `0x${string}`;
  let privateKeyEnvKey: (typeof testEnv)[EnvName]['key'];
  if (network.includes('local')) {
    Object.assign(testEnv.local, { type: 'local' });
    privateKeyEnvKey = testEnv.local.key;
    privateKey = (process.env[privateKeyEnvKey] ?? '').trim() as `0x${string}`;
  } else {
    Object.assign(testEnv.live, { type: 'live' });
    privateKeyEnvKey = testEnv.live.key;
    privateKey = (process.env[privateKeyEnvKey] ?? '').trim() as `0x${string}`;
  }

  if (!privateKey) {
    throw new Error(
      `❌ Missing required env var ${privateKeyEnvKey} for "${selectedNetwork}" environment (${network}).`
    );
  }

  if (!PrivateKeySchema.test(privateKey)) {
    throw new Error(
      `❌ Invalid private key format in ${privateKeyEnvKey}. Expected 32-byte hex string (64 chars) with optional 0x prefix.`
    );
  }

  if (!privateKey.startsWith('0x')) {
    privateKey = `0x${privateKey}` as unknown as `0x${string}`;
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
  const rpcEnvKey = RPC_ENV_KEY_BY_NETWORK[network];

  if (rpcEnvKey) {
    console.log(
      `ℹ️ Checking override env var ${rpcEnvKey} for network ${network}`
    );
    const liveRpcUrl = process.env[rpcEnvKey];
    if (liveRpcUrl) {
      rpcUrl = liveRpcUrl;
      console.log(`🔧 Using RPC override (${rpcEnvKey}) for ${network}`);
    } else {
      console.log(
        `ℹ️ No RPC override provided via ${rpcEnvKey}; using module default for ${network}`
      );
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
  console.log("When RPC URL is undefined, module's default RPC will be used.");

  return result;
}
