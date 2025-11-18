export type { LitChainConfig as ChainConfig } from "@/domain/lit/chains";
export {
  SUPPORTED_CHAIN_ID,
  DEFAULT_CHAINS,
  SUPPORTED_CHAINS,
  validateChainConfig,
  loadCustomChains,
  saveCustomChains,
  getCustomChains,
  getAllChains,
  isCustomChain,
  addCustomChain,
  removeCustomChain,
} from "@/domain/lit/chains";
