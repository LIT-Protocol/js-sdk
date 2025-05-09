import { Chain, http } from 'viem';
import { createConfig } from 'wagmi';

export const CHAIN_ID = 175188;
export const CHAIN_NAME = 'Chronicle Yellowstone';
export const CHAIN_SYMBOL = 'tstLPX';
export const RPC_URL = 'https://yellowstone-rpc.litprotocol.com/http';
export const EXPLORER_URL = 'https://yellowstone-explorer.litprotocol.com/';
export const EXPLORER_NAME = 'Yellowstone Explorer'; // Added for viem compatibility

/**
 * Configuration for the Chronicle Yellowstone network.
 */
export const viemChainConfig: Readonly<Chain> = Object.freeze({
  id: CHAIN_ID,
  name: CHAIN_NAME,
  nativeCurrency: {
    name: CHAIN_NAME, // Often the same as chain name or a more specific currency name
    symbol: CHAIN_SYMBOL,
    decimals: 18, // Standard for many EVM chains
  },
  rpcUrls: {
    default: {
      http: [RPC_URL],
    },
    public: {
      http: [RPC_URL],
    },
  },
  blockExplorers: {
    default: {
      name: EXPLORER_NAME,
      url: EXPLORER_URL,
    },
  },
});

export const WagmiConfig = createConfig({
  chains: [viemChainConfig],
  transports: {
    [viemChainConfig.id]: http(),
  },
});
