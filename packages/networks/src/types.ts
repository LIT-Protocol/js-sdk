// TODO: These types can probably be moved into the `networks` package and only exposed by way of the `LitNetwork` if necessary
import { LIT_ENDPOINT, HTTP, HTTPS } from '@lit-protocol/constants';

/**
 * Configuration specific to the underlying blockchain of a Lit network.
 */
export interface LitChainConfig {
  chainId: number;
  name: string; // e.g., "Chronicle Yellowstone", "Anvil Localhost"
  symbol: string; // e.g., "tstLPX", "ETH"
  rpcUrl: string; // Primary RPC URL for this chain
  blockExplorerUrls?: string[];
  // Add other chain-specific properties as needed, e.g., contract addresses for chain-specific registries
}

/**
 * Configuration for a specific Lit network.
 */
export interface LitNetworkConfig {
  networkName: string; // Unique identifier, e.g., "naga-dev", "manzano-mainnet"
  httpProtocol: typeof HTTP | typeof HTTPS; // Default protocol for Lit nodes
  endpoints: typeof LIT_ENDPOINT; // Base LIT_ENDPOINT, potentially overridden for the network
  rpcUrl: string; // Default RPC for this Lit network (often same as chainConfig.rpcUrl)
  chainConfig: LitChainConfig; // Blockchain-specific details
  minNodeCount?: number; // Optional: Minimum nodes required for network operations, defaults can be set in modules
}

// Re-exporting from @lit-protocol/types for convenience if widely used, or import directly.
// For now, assuming they are imported where needed.
// export type { LitContractContext, EpochInfo } from '@lit-protocol/types';
