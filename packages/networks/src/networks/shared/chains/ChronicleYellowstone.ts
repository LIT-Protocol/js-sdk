import type { LitChainConfig } from '../../../types';

const CHAIN_ID = 175188;
const CHAIN_NAME = 'Chronicle Yellowstone';
const CHAIN_SYMBOL = 'tstLPX';
const RPC_URL = 'https://yellowstone-rpc.litprotocol.com/http';
const EXPLORER_URL = 'https://yellowstone-explorer.litprotocol.com/';

/**
 * Configuration for the Chronicle Yellowstone network.
 */
export const ChronicleYellowstoneChain:
  Readonly<LitChainConfig>
 = Object.freeze({
  chainId: CHAIN_ID,
  name: CHAIN_NAME,
  symbol: CHAIN_SYMBOL,
  rpcUrl: RPC_URL,
  blockExplorerUrls: [EXPLORER_URL],
});

// For direct import if needed elsewhere, though using the object is preferred.
export const chronicleYellowstoneRpcUrl = RPC_URL; 