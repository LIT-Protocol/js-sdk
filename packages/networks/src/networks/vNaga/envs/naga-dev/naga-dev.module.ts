import { HTTP, HTTPS, LIT_NETWORK } from '@lit-protocol/constants';
import { ethers } from 'ethers';
import type { LitNetworkOperations } from '../../../LitNetworkOperations';
import { nagaDevNetworkConfig } from './naga-dev.config';
import type { LitContractContext, EpochInfo } from '@lit-protocol/types';
import { NagaChainClient } from '../../LitChainClient/NagaChainClient.bak';

// Type for the connection info combining chain client data and other static/derived info
type NagaDevConnectionInfo = {
  stakingContract: ethers.Contract; // Specifically the staking contract instance
  epochInfo: EpochInfo;
  minNodeCount: number;
  bootstrapUrls: string[];
  nodePrices: { url: string; prices: bigint[] }[];
  // Internal caching metadata
  _fetchedWithProtocol: typeof HTTP | typeof HTTPS;
  _fetchedWithRpcUrl: string;
  _fetchedWithLitContractContext?: LitContractContext; // Optional: if context was overridden
};

// Type for overrides in getConnectionInfo
type ConnectionInfoConfigOverride = {
  nodeProtocol?: typeof HTTP | typeof HTTPS;
  litContractContext?: LitContractContext; // Allow passing a full context, bypassing some chain client fetches
  rpcUrl?: string;
  // Note: If litContractContext is provided, the chain client might not need to fetch contract addresses/ABIs.
};

let connectionInfoCache: Promise<NagaDevConnectionInfo> | null = null;

const DEFAULT_MIN_NODE_COUNT = nagaDevNetworkConfig.minimumThreshold || 1;

const fetchAndCacheConnectionInfo = async (
  configOverride?: ConnectionInfoConfigOverride
): Promise<NagaDevConnectionInfo> => {
  const rpcUrlToUse = configOverride?.rpcUrl || nagaDevNetworkConfig.rpcUrl;
  const networkName =
    nagaDevNetworkConfig.network as (typeof LIT_NETWORK)[keyof typeof LIT_NETWORK];

  // Initialize Chain Client
  const chainClient = new NagaChainClient({
    rpcUrl: rpcUrlToUse,
    networkName: networkName,
  });

  let contractSetups;
  let litContractContextToUse: LitContractContext;
  let extendedDetails;

  if (configOverride?.litContractContext) {
    // If a full LitContractContext is provided, we might not need to fetch it via chainClient
    // However, we'd still need contract *instances* (setups) for internal operations like fetching epoch by the module.
    // This part needs careful design based on how much `litContractContext` override bypasses.
    // For this conceptual example, assume if litContractContext is given, we use it directly for some parts.
    litContractContextToUse = configOverride.litContractContext;
    // We'd still need to create contract instances from this provided context for internal use
    // This part of NagaChainClient would need to accept a LitContractContext to build ethers.Contract instances.
    // Or, the module itself does it. Let's assume chainClient can create setups from a given context.
    // conceptual: contractSetups = await chainClient.getContractSetupsFromContext(litContractContextToUse);
    // For now, we will re-fetch to keep it simple for the conceptual demo
    contractSetups = await chainClient.getContractSetups();
    extendedDetails = await chainClient.getExtendedConnectionDetails(
      contractSetups
    );
  } else {
    contractSetups = await chainClient.getContractSetups();
    litContractContextToUse = await chainClient.getLitContractContext(); // Get full context if not overridden
    extendedDetails = await chainClient.getExtendedConnectionDetails(
      contractSetups
    );
  }

  const stakingContract = contractSetups['Staking'];
  if (!stakingContract) {
    throw new Error('Staking contract not found via NagaChainClient.');
  }

  // The protocol for node communication is distinct from chain RPC
  const nodeProtocolToUse =
    configOverride?.nodeProtocol || nagaDevNetworkConfig.httpProtocol;

  // Construct the final connection info object
  const connectionInfoResult: NagaDevConnectionInfo = {
    stakingContract: stakingContract,
    epochInfo: extendedDetails.epochInfo,
    minNodeCount: extendedDetails.minNodeCount || DEFAULT_MIN_NODE_COUNT,
    bootstrapUrls: extendedDetails.bootstrapUrls, // These would come from extendedDetails
    nodePrices: extendedDetails.nodePrices, // These also from extendedDetails
    _fetchedWithProtocol: nodeProtocolToUse,
    _fetchedWithRpcUrl: rpcUrlToUse,
    _fetchedWithLitContractContext: configOverride?.litContractContext
      ? litContractContextToUse
      : undefined,
  };

  connectionInfoCache = Promise.resolve(connectionInfoResult);
  return connectionInfoResult;
};

export const NagaDevOperations: LitNetworkOperations = {
  getNetworkName: () => nagaDevNetworkConfig.network,
  getHttpProtocol: () => nagaDevNetworkConfig.httpProtocol,
  getEndpoints: () => nagaDevNetworkConfig.endpoints,
  getRpcUrl: () => nagaDevNetworkConfig.rpcUrl,
  getChainConfig: () => nagaDevNetworkConfig.chainConfig,

  // getConnectionInfo now uses the NagaChainClient for on-chain data
  getConnectionInfo: async (configOverride?: ConnectionInfoConfigOverride) => {
    const rpcUrlToUse = configOverride?.rpcUrl || nagaDevNetworkConfig.rpcUrl;
    const nodeProtocolToUse =
      configOverride?.nodeProtocol || nagaDevNetworkConfig.httpProtocol;

    if (
      !connectionInfoCache ||
      (configOverride?.litContractContext &&
        (await connectionInfoCache)._fetchedWithLitContractContext !==
          configOverride.litContractContext) ||
      (await connectionInfoCache)._fetchedWithRpcUrl !== rpcUrlToUse ||
      (await connectionInfoCache)._fetchedWithProtocol !== nodeProtocolToUse
    ) {
      return fetchAndCacheConnectionInfo(configOverride);
    }
    return connectionInfoCache;
  },
};

export const clearNagaDevCache = () => {
  connectionInfoCache = null;
};
