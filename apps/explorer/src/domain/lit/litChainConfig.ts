import type { Chain } from "viem";

const DEFAULT_LIT_CHAIN_RPC_URL = "https://lit-chain-rpc.litprotocol.com/";
const DEFAULT_LIT_CHAIN_EXPLORER_URL =
  "https://lit-chain-explorer.litprotocol.com/";
const DEFAULT_LIT_CHAIN_EXPLORER_NAME = "Lit Chain Explorer";

export const LIT_CHAIN_ID = 175200;
export const LIT_CHAIN_NAME = "Lit Chain";
export const LIT_CHAIN_SYMBOL = "LITKEY";

export const LIT_CHAIN_RPC_URL =
  import.meta.env.VITE_LIT_CHAIN_RPC_URL || DEFAULT_LIT_CHAIN_RPC_URL;
export const LIT_CHAIN_EXPLORER_URL =
  import.meta.env.VITE_LIT_CHAIN_EXPLORER_URL ||
  DEFAULT_LIT_CHAIN_EXPLORER_URL;
export const LIT_CHAIN_EXPLORER_NAME =
  import.meta.env.VITE_LIT_CHAIN_EXPLORER_NAME ||
  DEFAULT_LIT_CHAIN_EXPLORER_NAME;

export const litChainViemConfig: Chain = {
  id: LIT_CHAIN_ID,
  name: LIT_CHAIN_NAME,
  nativeCurrency: {
    name: LIT_CHAIN_NAME,
    symbol: LIT_CHAIN_SYMBOL,
    decimals: 18,
  },
  rpcUrls: {
    default: { http: [LIT_CHAIN_RPC_URL] },
    public: { http: [LIT_CHAIN_RPC_URL] },
  },
  blockExplorers: {
    default: {
      name: LIT_CHAIN_EXPLORER_NAME,
      url: LIT_CHAIN_EXPLORER_URL,
    },
  },
  testnet: false,
};
