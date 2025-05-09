import { HTTP, HTTPS, LIT_NETWORK } from '@lit-protocol/constants';
import { LitContracts } from '@lit-protocol/contracts-sdk';
import type { EpochInfo, LitContractContext } from '@lit-protocol/types';
import { ethers } from 'ethers';
import type { LitNetworkOperations } from './LitNetworkOperations';
import { nagaDevConfig } from './naga-dev.config';

// Re-define LitNetworkValue here if not easily importable from lit-core or a shared types package
// This assumes LIT_NETWORK is an object like { NagaDev: 'naga-dev', Custom: 'custom' }
// and it has been exported with `as const` or its values are otherwise string literals.
export type LitNetworkValue = (typeof LIT_NETWORK)[keyof typeof LIT_NETWORK];

type ConnectionInfo = {
  stakingContract: ethers.Contract;
  epochInfo: EpochInfo;
  minNodeCount: number;
  bootstrapUrls: string[];
  nodePrices: { url: string; prices: bigint[] }[];
  // Internal field to track the protocol used for caching
  _fetchedWithProtocol: typeof HTTP | typeof HTTPS;
};

type ConnectionInfoConfigOverride = {
  nodeProtocol?: typeof HTTP | typeof HTTPS;
  networkContext?: LitContractContext;
  rpcUrl?: string;
};

// We only need to cache the result of getConnectionInfo now.
let connectionInfoCache: Promise<ConnectionInfo> | null = null;

// Helper function to fetch and cache connection info
const fetchAndCacheConnectionInfo = async (
  configOverride?: ConnectionInfoConfigOverride
): Promise<ConnectionInfo> => {
  const currentConfig = { ...nagaDevConfig, ...configOverride };
  const networkName = currentConfig.networkName as LitNetworkValue;
  const protocolToUse =
    configOverride?.nodeProtocol || nagaDevConfig.httpProtocol;
  const rpcUrlToUse = configOverride?.rpcUrl || nagaDevConfig.rpcUrl;
  let contextToUse = configOverride?.networkContext;

  // If no specific context override, fetch/use default (requires provider)
  if (!contextToUse) {
    const provider = new ethers.providers.StaticJsonRpcProvider(rpcUrlToUse);
    contextToUse = await LitContracts.getContractAddresses(
      networkName,
      provider
    );
  }

  // Fetch the connection information
  const info = await LitContracts.getConnectionInfo({
    litNetwork: networkName,
    networkContext: contextToUse,
    rpcUrl: rpcUrlToUse,
    nodeProtocol: protocolToUse,
  });

  // Add the internal caching metadata
  const connectionInfoResult: ConnectionInfo = {
    ...info,
    _fetchedWithProtocol: protocolToUse,
  };

  // Cache the promise containing the result
  connectionInfoCache = Promise.resolve(connectionInfoResult);
  return connectionInfoResult;
};

export const NagaDevNetworkModule: LitNetworkOperations = {
  getNetworkName: () => nagaDevConfig.networkName as LitNetworkValue,
  getHttpProtocol: () => nagaDevConfig.httpProtocol,
  getEndpoints: () => nagaDevConfig.endpoints,
  getRpcUrl: () => nagaDevConfig.rpcUrl,
  getConnectionInfo: async (
    configOverride?: ConnectionInfoConfigOverride
  ): Promise<ConnectionInfo> => {
    const protocolToUse =
      configOverride?.nodeProtocol || nagaDevConfig.httpProtocol;

    // Check cache validity: invalidate if override exists or protocol differs from cached
    if (
      !connectionInfoCache ||
      configOverride || // If any override is passed, force refetch for simplicity for now
      (connectionInfoCache &&
        (await connectionInfoCache)._fetchedWithProtocol !== protocolToUse)
    ) {
      return fetchAndCacheConnectionInfo(configOverride);
    }

    // Return cached promise if valid
    return connectionInfoCache;
  },

  getChainConfig: () => nagaDevConfig.chainConfig,
};

export const clearNagaDevCache = () => {
  connectionInfoCache = null;
};
