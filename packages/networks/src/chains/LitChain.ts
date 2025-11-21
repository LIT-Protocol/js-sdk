import { createConfig } from '@wagmi/core';
import { Chain, http } from 'viem';

export const CHAIN_ID = 175200;
export const CHAIN_NAME = 'Lit Chain';
export const CHAIN_SYMBOL = 'LITKEY';
export const RPC_URL = 'https://lit-chain-rpc.litprotocol.com/';
export const EXPLORER_URL = 'https://lit-chain-explorer.litprotocol.com/';
export const EXPLORER_NAME = 'Lit Chain Explorer';

/**
 * Configuration for the Lit Chain mainnet.
 */
export const viemChainConfig: Readonly<Chain> = Object.freeze({
  id: CHAIN_ID,
  name: CHAIN_NAME,
  nativeCurrency: {
    name: CHAIN_NAME,
    symbol: CHAIN_SYMBOL,
    decimals: 18,
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

/**
 * Resolve the effective RPC URL from an optional override.
 */
export function resolveRpcUrl(overrideRpc?: string): string {
  return overrideRpc ?? RPC_URL;
}

/**
 * Build a Chain config using the base Lit Chain config,
 * applying an optional RPC override to both default and public http URLs.
 */
export function buildViemChainConfig(overrideRpc?: string): Chain {
  const rpc = resolveRpcUrl(overrideRpc);
  const base = viemChainConfig;
  return {
    ...base,
    rpcUrls: {
      ...base.rpcUrls,
      default: { ...base.rpcUrls.default, http: [rpc] },
      public: { ...(base.rpcUrls as any)['public'], http: [rpc] },
    },
  } as Chain;
}
