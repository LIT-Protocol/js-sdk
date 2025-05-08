// Core types and interfaces
export type { LitNetworkConfig, LitChainConfig } from './types';
export type { LitNetworkOperations } from './LitNetworkOperations';

// Available Network Names (Manually maintained or auto-generated from directories)
// This uses LIT_NETWORK constants for consistency if they cover all network names.
// Otherwise, define a specific union type.
import { LIT_NETWORK } from '@lit-protocol/constants';
export type LitKnownNetwork = typeof LIT_NETWORK[keyof typeof LIT_NETWORK] | 'custom' | 'local-dev'; // Add other known string literals if not in LIT_NETWORK

// Network Modules
import { NagaDevOperations, clearNagaDevCache as clearNagaDev } from './networks/vNaga/naga-dev';
// --- Conceptual: Import other network modules as they are created ---
// import { ManzanoMainnetOperations, clearManzanoMainnetCache } from './networks/vManzano/manzano-mainnet';
// import { LocalDevelopOperations, clearLocalDevelopCache } from './networks/vNaga/local-develop';

const networkModules: Partial<Record<LitKnownNetwork, LitNetworkOperations>> = {
  [LIT_NETWORK.NagaDev]: NagaDevOperations,
  // [LIT_NETWORK.ManzanoMainnet]: ManzanoMainnetOperations, // Example
  // 'local-dev': LocalDevelopOperations, // Example for a network not in LIT_NETWORK enum
};

/**
 * Retrieves the network operations module for a specified Lit Protocol network.
 *
 * @param network The name of the Lit Protocol network (e.g., "naga-dev", "manzano-mainnet").
 * @returns The LitNetworkOperations object for the specified network.
 * @throws Error if the network module is not found.
 */
export function getLitNetwork(network: LitKnownNetwork): LitNetworkOperations {
  const selectedModule = networkModules[network];
  if (!selectedModule) {
    throw new Error(`Network module for "${network}" not found or not yet implemented.`);
  }
  return selectedModule;
}

/**
 * Clears the connection info cache for a specific network, or all networks if no name is provided.
 * @param network (Optional) The name of the network to clear the cache for.
 */
export function clearLitNetworkCache(network?: LitKnownNetwork): void {
  if (network) {
    switch (network) {
      case LIT_NETWORK.NagaDev:
        clearNagaDev();
        break;
      // --- Conceptual: Add cases for other networks ---
      // case LIT_NETWORK.ManzanoMainnet:
      //   clearManzanoMainnetCache();
      //   break;
      // case 'local-dev':
      //   clearLocalDevelopCache();
      //   break;
      default:
        console.warn(`Cache clearing not implemented for network: ${network}`);
    }
  } else {
    // Clear all known caches
    clearNagaDev();
    // clearManzanoMainnetCache(); // Example
    // clearLocalDevelopCache(); // Example
    console.log('Cleared all known Lit Network caches.');
  }
}

// Export individual network operation modules if direct access is desired
export { NagaDevOperations };
// export { ManzanoMainnetOperations }; // Example
// export { LocalDevelopOperations }; // Example

// Export shared chain configurations for convenience
export { ChronicleYellowstoneChain } from './networks/shared/chains/ChronicleYellowstone';
export { AnvilChain } from './networks/shared/chains/anvil'; 