import { HTTP, HTTPS, LIT_ENDPOINT } from '@lit-protocol/constants';
import type { EpochInfo, LitContractContext } from '@lit-protocol/types';
import { ethers } from 'ethers';
// import type { LitChainConfig } from './types'; // Import LitChainConfig from local types.ts
import { Chain } from 'viem';

/**
 * Defines the operations that a network module must provide.
 * This functional approach replaces the previous LitNetwork abstract class.
 */
export interface LitNetworkOperations {
  /**
   * Gets the unique string name of the network (e.g., "naga-dev", "datil-mainnet").
   */
  getNetworkName: () => string;

  /**
   * Gets the default HTTP/HTTPS protocol for nodes in this network.
   */
  getHttpProtocol: () => typeof HTTP | typeof HTTPS;

  /**
   * Gets the base LIT_ENDPOINT object for this network.
   * This might be used to derive specific node URLs or could be an object
   * containing direct endpoint URLs if they differ structurally from the global LIT_ENDPOINT.
   */
  getEndpoints: () => typeof LIT_ENDPOINT; // Or a more specific endpoint map type for the network

  /**
   * Gets the default RPC URL for interacting with the blockchain of this network.
   */
  getRpcUrl: () => string;

  /**
   * Retrieves the core connection information needed to interact with the network,
   * including contract instances, epoch details, node lists, and pricing.
   * Assumes underlying implementation handles fetching, validation, and caching.
   * @param configOverride - Optional overrides, e.g., for node protocol.
   */
  getConnectionInfo: (configOverride?: {
    nodeProtocol?: typeof HTTP | typeof HTTPS;
    networkContext?: LitContractContext; // Allow passing context, e.g., for resolver scenarios
    rpcUrl?: string;
  }) => Promise<{
    stakingContract: ethers.Contract;
    epochInfo: EpochInfo;
    minNodeCount: number;
    bootstrapUrls: string[];
    nodePrices: { url: string; prices: bigint[] }[];
  }>;

  /**
   * Gets the chain-specific configuration for this network.
   */
  getChainConfig: () => Chain;
}
