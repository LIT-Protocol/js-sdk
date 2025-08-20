import { createPublicClient, http } from 'viem';
import { z } from 'zod';

// ----- Configurations -----
export const NETWORK_CONFIG = {
  'naga-dev': { importName: 'nagaDev', type: 'live' },
  'naga-test': { importName: 'nagaTest', type: 'live' },
  'naga-local': { importName: 'nagaLocal', type: 'local' },
  'naga-staging': { importName: 'nagaStaging', type: 'live' },
} as const;

const SupportedNetworkSchema = z.enum([
  'naga-dev',
  'naga-test',
  'naga-local',
  'naga-staging',
]);
type SupportedNetwork = z.infer<typeof SupportedNetworkSchema>;

export const getLitNetworkModule = async (network?: SupportedNetwork) => {
  const _network = network || process.env['NETWORK'];

  if (!_network) {
    throw new Error(
      `❌ Network not specified. Please set the NETWORK environment variable or pass a network parameter. Available networks: ${SupportedNetworkSchema.options.join(
        ', '
      )}`
    );
  }

  const config = NETWORK_CONFIG[_network as keyof typeof NETWORK_CONFIG];
  if (!config) {
    throw new Error(`❌ Invalid network: ${_network}`);
  }

  const networksModule = await import('@lit-protocol/networks');
  const _networkModule = networksModule[config.importName];
  console.log('✅ Lit Network Module created for network:', _network);
  console.log('🔍 Chain:', _networkModule.getChainConfig().name);
  console.log(
    '🔍 RPC URL:',
    _networkModule.getChainConfig().rpcUrls.default.http[0]
  );
  return _networkModule;
};

export const getViemPublicClient = async ({
  networkModule,
}: {
  networkModule: any;
}) => {
  const viemChainConfig = networkModule.getChainConfig();
  const defaultRpcUrl = viemChainConfig.rpcUrls.default.http[0];
  const isLocalNetwork = defaultRpcUrl.includes('127.0.0.1');
  const customRpcUrl = isLocalNetwork
    ? process.env['LOCAL_RPC_URL']
    : process.env['LIT_YELLOWSTONE_PRIVATE_RPC_URL'];

  if (customRpcUrl) {
    console.log(`🔧 Using custom E2E RPC URL: ***${customRpcUrl.slice(-6)}`);
  }

  const publicClient = createPublicClient({
    chain: viemChainConfig,
    transport: customRpcUrl ? http(customRpcUrl) : http(),
  });

  return publicClient;
};
