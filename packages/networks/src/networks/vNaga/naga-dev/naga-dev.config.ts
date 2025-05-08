import { HTTPS, LIT_NETWORK, LIT_ENDPOINT } from '@lit-protocol/constants';
import type { LitNetworkConfig } from '../../../types';
import { ChronicleYellowstoneChain } from '../../shared/chains/ChronicleYellowstone'; // Assuming NagaDev runs on a Yellowstone-like chain

/**
 * Static configuration for the NagaDev network.
 */
export const nagaDevConfigData: Readonly<LitNetworkConfig> = Object.freeze({
  networkName: LIT_NETWORK.NagaDev, // 'naga-dev'
  httpProtocol: HTTPS,
  endpoints: LIT_ENDPOINT, // Uses default LIT_ENDPOINT structure
  rpcUrl: ChronicleYellowstoneChain.rpcUrl, // NagaDev RPC, aligns with its chain
  chainConfig: {
    // Overriding parts of ChronicleYellowstoneChain if NagaDev has slight differences
    // but shares the core infrastructure. Or, if it's identical, just spread it:
    // ...ChronicleYellowstoneChain,
    // For this example, let's assume it IS ChronicleYellowstone for its chain aspects
    ...ChronicleYellowstoneChain,
    // If NagaDev had a specific chainId or name different from generic Yellowstone, override here:
    // chainId: 456789, 
    // name: "NagaDev Bespoke Chain",
  },
  minNodeCount: 5, // Example: specific minimum node count for NagaDev
}); 