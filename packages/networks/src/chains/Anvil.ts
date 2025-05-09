import { Chain } from 'viem';

// ==================== Your Chain Config ====================
export const CHAIN_ID = 31337;
export const CHAIN_NAME = 'Anvil Localhost';
export const CHAIN_SYMBOL = 'ETH';
export const RPC_URL = 'http://127.0.0.1:8545';
export const DEV_PRIVATE_KEY = '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80';

/**
 * Configuration for a local Anvil network.
 */
export const viemChainConfig: Readonly<Chain> = Object.freeze({
  id: CHAIN_ID,
  name: CHAIN_NAME,
  nativeCurrency: {
    name: CHAIN_SYMBOL,
    symbol: CHAIN_SYMBOL,
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: [RPC_URL],
      websocket: [],
    },
    public: {
      http: [RPC_URL],
      websocket: [],
    },
  },
  blockExplorerUrls: [],
});
