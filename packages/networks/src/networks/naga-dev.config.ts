import {
  HTTP,
  HTTPS,
  LIT_ENDPOINT,
  LIT_NETWORK,
  RPC_URL_BY_NETWORK,
} from '@lit-protocol/constants';
import type { LitChainConfig } from './types'; // Assuming types.ts is one level up

/**
 * Static configuration for the NagaDev network.
 */

// Define a more specific type for NagaDev configuration if needed,
// or use a general NetworkConfigType that includes these fields.
export interface NagaDevConfig {
  networkName: string;
  httpProtocol: typeof HTTP | typeof HTTPS;
  rpcUrl: string;
  endpoints: typeof LIT_ENDPOINT; // Or a specific subset/override for NagaDev
  chainConfig: LitChainConfig;
  // contractContext?: LitContractContext; // Could be here if static, or fetched by the module
}

export const nagaDevConfig: NagaDevConfig = {
  networkName: LIT_NETWORK.NagaDev, // 'naga-dev'
  httpProtocol: HTTPS, // Default to HTTPS for production-like testnets
  rpcUrl:
    RPC_URL_BY_NETWORK[LIT_NETWORK.NagaDev] ||
    'https://chain-rpc.naga.litprotocol.com/http', // Fallback if not in constants
  endpoints: LIT_ENDPOINT, // Can be overridden if NagaDev has specific endpoint paths
  chainConfig: {
    chainId: 80001, // Example: Mumbai testnet chain ID, adjust as per NagaDev's actual chain
    name: 'NagaDev Chain', // Placeholder name
    symbol: 'NDT', // Placeholder symbol
    rpcUrl:
      RPC_URL_BY_NETWORK[LIT_NETWORK.NagaDev] ||
      'https://chain-rpc.naga.litprotocol.com/http',
    blockExplorerUrls: ['https://mumbai.polygonscan.com'], // Example, adjust for NagaDev
  },
  // contractContext: { ... } // If contract addresses are static and known, define here
};
