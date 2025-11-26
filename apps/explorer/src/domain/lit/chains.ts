import {
  LIT_CHAIN_EXPLORER_URL,
  LIT_CHAIN_ID,
  LIT_CHAIN_NAME,
  LIT_CHAIN_RPC_URL,
  LIT_CHAIN_SYMBOL,
} from "./litChainConfig";

export interface LitChainConfig {
  id: number;
  name: string;
  symbol: string;
  rpcUrl: string;
  explorerUrl: string;
  litIdentifier: string;
  testnet: boolean;
}

export const SUPPORTED_CHAIN_ID = 2888;
const CUSTOM_CHAINS_STORAGE_KEY = "chains.custom.v1";

const LIT_CHAIN_BASE_CONFIG: LitChainConfig = {
  id: LIT_CHAIN_ID,
  name: LIT_CHAIN_NAME,
  symbol: LIT_CHAIN_SYMBOL,
  rpcUrl: LIT_CHAIN_RPC_URL,
  explorerUrl: LIT_CHAIN_EXPLORER_URL,
  litIdentifier: "lit-chain",
  testnet: false,
};

export const DEFAULT_CHAINS: Record<string, LitChainConfig> = {
  yellowstone: {
    id: 175188,
    name: "Chronicle Yellowstone",
    symbol: "tstLPX",
    rpcUrl: "https://yellowstone-rpc.litprotocol.com/",
    explorerUrl: "https://yellowstone-explorer.litprotocol.com/",
    litIdentifier: "yellowstone",
    testnet: true,
  },
  "naga-proto": {
    ...LIT_CHAIN_BASE_CONFIG,
    name: "Lit Chain (naga-proto)",
    litIdentifier: "naga-proto",
  },
  naga: {
    ...LIT_CHAIN_BASE_CONFIG,
    name: "Lit Chain (naga)",
    litIdentifier: "naga",
  },
  ethereum: {
    id: 1,
    name: "Ethereum",
    symbol: "ETH",
    rpcUrl: "https://eth.llamarpc.com",
    explorerUrl: "https://etherscan.io/",
    litIdentifier: "ethereum",
    testnet: false,
  },
  sepolia: {
    id: 11155111,
    name: "Sepolia Testnet",
    symbol: "ETH",
    rpcUrl: "https://ethereum-sepolia-rpc.publicnode.com",
    explorerUrl: "https://sepolia.etherscan.io/",
    litIdentifier: "sepolia",
    testnet: true,
  },
  polygon: {
    id: 137,
    name: "Polygon",
    symbol: "MATIC",
    rpcUrl: "https://polygon-bor-rpc.publicnode.com",
    explorerUrl: "https://polygonscan.com/",
    litIdentifier: "polygon",
    testnet: false,
  },
  arbitrum: {
    id: 42161,
    name: "Arbitrum",
    symbol: "AETH",
    rpcUrl: "https://arbitrum-one-rpc.publicnode.com",
    explorerUrl: "https://arbiscan.io/",
    litIdentifier: "arbitrum",
    testnet: false,
  },
  base: {
    id: 8453,
    name: "Base",
    symbol: "ETH",
    rpcUrl: "https://base-rpc.publicnode.com",
    explorerUrl: "https://basescan.org/",
    litIdentifier: "base",
    testnet: false,
  },
  optimism: {
    id: 10,
    name: "Optimism",
    symbol: "ETH",
    rpcUrl: "https://optimism-rpc.publicnode.com",
    explorerUrl: "https://optimistic.etherscan.io/",
    litIdentifier: "optimism",
    testnet: false,
  },
};

export const SUPPORTED_CHAINS: Record<string, LitChainConfig> = DEFAULT_CHAINS;

function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

export function validateChainConfig(
  cfg: LitChainConfig,
  _allChainsById?: Map<number, string>
): { ok: true } | { ok: false; error: string } {
  if (!cfg) return { ok: false, error: "Missing chain config" };
  if (!Number.isInteger(cfg.id) || cfg.id <= 0)
    return { ok: false, error: "id must be a positive integer" };
  if (!cfg.name || cfg.name.trim().length === 0)
    return { ok: false, error: "name is required" };
  if (!cfg.symbol || cfg.symbol.trim().length === 0)
    return { ok: false, error: "symbol is required" };
  if (!cfg.rpcUrl || !isValidUrl(cfg.rpcUrl))
    return { ok: false, error: "rpcUrl must be a valid URL" };
  if (cfg.explorerUrl && !isValidUrl(cfg.explorerUrl))
    return { ok: false, error: "explorerUrl must be a valid URL if provided" };
  if (typeof cfg.testnet !== "boolean")
    return { ok: false, error: "testnet must be a boolean" };
  if (!cfg.litIdentifier || cfg.litIdentifier.trim().length === 0)
    return { ok: false, error: "litIdentifier is required" };

  return { ok: true };
}

export function loadCustomChains(): Record<string, LitChainConfig> {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(CUSTOM_CHAINS_STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== "object") return {};
    return parsed as Record<string, LitChainConfig>;
  } catch {
    return {};
  }
}

export function saveCustomChains(chains: Record<string, LitChainConfig>): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(
      CUSTOM_CHAINS_STORAGE_KEY,
      JSON.stringify(chains)
    );
  } catch {
    // ignore
  }
}

export function getCustomChains(): Record<string, LitChainConfig> {
  return loadCustomChains();
}

export function getAllChains(): Record<string, LitChainConfig> {
  return { ...DEFAULT_CHAINS, ...getCustomChains() };
}

export function isCustomChain(slug: string): boolean {
  const custom = getCustomChains();
  return Object.prototype.hasOwnProperty.call(custom, slug);
}

export function addCustomChain(
  slug: string,
  cfg: LitChainConfig
): { ok: true } | { ok: false; error: string } {
  const existingCustom = getCustomChains();

  if (!slug || slug.trim().length === 0)
    return { ok: false, error: "slug is required" };
  const safeSlug = slug.trim();
  if (Object.prototype.hasOwnProperty.call(DEFAULT_CHAINS, safeSlug)) {
    return { ok: false, error: "Slug collides with a default chain" };
  }
  if (Object.prototype.hasOwnProperty.call(existingCustom, safeSlug)) {
    return { ok: false, error: "Slug already exists" };
  }

  const valid = validateChainConfig(cfg);
  if (!("ok" in valid) || valid.ok !== true) return valid;

  const updated = {
    ...existingCustom,
    [safeSlug]: cfg,
  } as Record<string, LitChainConfig>;
  saveCustomChains(updated);
  return { ok: true };
}

export function removeCustomChain(slug: string): void {
  const existingCustom = getCustomChains();
  if (!Object.prototype.hasOwnProperty.call(existingCustom, slug)) return;
  const { [slug]: _removed, ...rest } = existingCustom;
  saveCustomChains(rest);
}
