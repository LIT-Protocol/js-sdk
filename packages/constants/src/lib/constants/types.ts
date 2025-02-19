/**
 * The default required properties of all chains
 *
 * @typedef { Object } LITChainRequiredProps
 * @property {string} name - The human readable name of the chain
 * @property {string} symbol - The symbol of the native currency
 * @property {number} decimals - The number of decimals in the native currency
 * @property {string[]} rpcUrls - The RPC URLs of the chain
 * @property {string[]} blockExplorerUrls - The block explorer URLs of the chain
 * @property {string} vmType - Either EVM for an Ethereum compatible chain or SVM for a Solana compatible chain
 */
export interface LITChainRequiredProps {
  readonly name: string;
  readonly symbol: string;
  readonly decimals: number;
  readonly rpcUrls: readonly string[];
  readonly blockExplorerUrls: string[];
}

export type LITChain<T> = Record<string, T>;
/**
 * @typedef { Object } LITCosmosChain
 * @property {string} chainId - The chain ID of the chain that this token contract is deployed on.  Used for Cosmos chains.
 */
export type LITCosmosChain = LITChainRequiredProps & {
  readonly chainId: string;
  readonly vmType: 'CVM';
};
/**
 * @typedef { Object } LITEVMChain
 * @property { string } contractAddress - The address of the token contract for the optional predeployed ERC1155 contract.  Only present on EVM chains.
 * @property { string } chainId - The chain ID of the chain that this token contract is deployed on.  Used for EVM chains.
 * @property { string } name - The human readable name of the chain
 */
export type LITEVMChain = LITChainRequiredProps & {
  readonly contractAddress: string | null;
  readonly chainId: number;
  readonly type: string | null;
  readonly vmType: 'EVM';
};

/**
 * @typedef { Object } LITSVMChain
 */
export type LITSVMChain = LITChainRequiredProps & {
  readonly vmType: 'SVM';
};
