import type { LitChainConfig } from '../../../types';

const CHAIN_ID = 31337;
const CHAIN_NAME = 'Anvil Localhost';
const CHAIN_SYMBOL = 'ETH';
const RPC_URL = 'http://127.0.0.1:8545';

/**
 * Configuration for a local Anvil network.
 */
export const AnvilChain: Readonly<LitChainConfig> = Object.freeze({
  chainId: CHAIN_ID,
  name: CHAIN_NAME,
  symbol: CHAIN_SYMBOL,
  rpcUrl: RPC_URL,
  blockExplorerUrls: [], // Anvil typically doesn't have a public explorer
});

// For direct import if needed elsewhere.
export const anvilRpcUrl = RPC_URL;
