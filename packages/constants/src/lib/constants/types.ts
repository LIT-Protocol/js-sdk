/**
 *
 * The default required properties of all chains
 *
 * @typedef { Object } LITChainRequiredProps
 */
export interface LITChainRequiredProps {
  name: string;
  symbol: string;
  decimals: number;
  rpcUrls: string[];
  blockExplorerUrls: string[];
  vmType: string;
}

/**
 * @typedef {Object} LITChain
 * @property {string} vmType - Either EVM for an Ethereum compatible chain or SVM for a Solana compatible chain
 * @property {string} name - The human readable name of the chain
 */
export type LITChain<T> = Record<string, T>;
/**
 * @typedef { Object } LITCosmosChain
 * @property {string} chainId - The chain ID of the chain that this token contract is deployed on.  Used for Cosmos chains.
 */
export type LITCosmosChain = LITChainRequiredProps & {
  chainId: string;
};
/**
 * @typedef { Object } LITEVMChain
 * @property { string } contractAddress - The address of the token contract for the optional predeployed ERC1155 contract.  Only present on EVM chains.
 * @property { string } chainId - The chain ID of the chain that this token contract is deployed on.  Used for EVM chains.
 * @property { string } name - The human readable name of the chain
 */
export type LITEVMChain = LITChainRequiredProps & {
  contractAddress: string | null;
  chainId: number;
  type: string | null;
};

/**
 * @typedef { Object } LITSVMChain
 */
export type LITSVMChain = LITChainRequiredProps;
