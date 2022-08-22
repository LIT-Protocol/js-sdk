/**
 * @typedef {Object} LITChain
 * @property {string} vmType - Either EVM for an Ethereum compatible chain or SVM for a Solana compatible chain
 * @property {string} name - The human readable name of the chain
 */
/**
 * @typedef {Object} LITEVMChain
 * @property {string} contractAddress - The address of the token contract for the optional predeployed ERC1155 contract.  Only present on EVM chains.
 * @property {string} chainId - The chain ID of the chain that this token contract is deployed on.  Used for EVM chains.
 * @property {string} name - The human readable name of the chain
 */
/**
 * @typedef {Object} LITSVMChain
 * @property {string} name - The human readable name of the chain
 */
/**
 * @typedef {Object} LITCosmosChain
 * @property {string} name - The human readable name of the chain
 */
/**
 * EVM Chains supported by the LIT protocol.  Each chain includes an optional pre-deployed token contract that you may use for minting LITs.  These are ERC1155 contracts that let you mint any quantity of a given token.  Use the chain name as a key in this object.
 * @constant
 * @type {LITEVMChain}
 * @default
 */
export declare const LIT_CHAINS: {
    ethereum: {
        contractAddress: string;
        chainId: number;
        name: string;
        symbol: string;
        decimals: number;
        type: string;
        rpcUrls: string[];
        blockExplorerUrls: string[];
        vmType: string;
    };
    polygon: {
        contractAddress: string;
        chainId: number;
        name: string;
        symbol: string;
        decimals: number;
        rpcUrls: string[];
        blockExplorerUrls: string[];
        type: string;
        vmType: string;
    };
    fantom: {
        contractAddress: string;
        chainId: number;
        name: string;
        symbol: string;
        decimals: number;
        rpcUrls: string[];
        blockExplorerUrls: string[];
        type: string;
        vmType: string;
    };
    xdai: {
        contractAddress: string;
        chainId: number;
        name: string;
        symbol: string;
        decimals: number;
        rpcUrls: string[];
        blockExplorerUrls: string[];
        type: string;
        vmType: string;
    };
    bsc: {
        contractAddress: string;
        chainId: number;
        name: string;
        symbol: string;
        decimals: number;
        rpcUrls: string[];
        blockExplorerUrls: string[];
        type: string;
        vmType: string;
    };
    arbitrum: {
        contractAddress: string;
        chainId: number;
        name: string;
        symbol: string;
        decimals: number;
        type: string;
        rpcUrls: string[];
        blockExplorerUrls: string[];
        vmType: string;
    };
    avalanche: {
        contractAddress: string;
        chainId: number;
        name: string;
        symbol: string;
        decimals: number;
        type: string;
        rpcUrls: string[];
        blockExplorerUrls: string[];
        vmType: string;
    };
    fuji: {
        contractAddress: string;
        chainId: number;
        name: string;
        symbol: string;
        decimals: number;
        type: string;
        rpcUrls: string[];
        blockExplorerUrls: string[];
        vmType: string;
    };
    harmony: {
        contractAddress: string;
        chainId: number;
        name: string;
        symbol: string;
        decimals: number;
        type: string;
        rpcUrls: string[];
        blockExplorerUrls: string[];
        vmType: string;
    };
    kovan: {
        contractAddress: string;
        chainId: number;
        name: string;
        symbol: string;
        decimals: number;
        rpcUrls: string[];
        blockExplorerUrls: string[];
        type: string;
        vmType: string;
    };
    mumbai: {
        contractAddress: string;
        chainId: number;
        name: string;
        symbol: string;
        decimals: number;
        rpcUrls: string[];
        blockExplorerUrls: string[];
        type: string;
        vmType: string;
    };
    goerli: {
        contractAddress: string;
        chainId: number;
        name: string;
        symbol: string;
        decimals: number;
        rpcUrls: string[];
        blockExplorerUrls: string[];
        type: string;
        vmType: string;
    };
    ropsten: {
        contractAddress: string;
        chainId: number;
        name: string;
        symbol: string;
        decimals: number;
        rpcUrls: string[];
        blockExplorerUrls: string[];
        type: string;
        vmType: string;
    };
    rinkeby: {
        contractAddress: string;
        chainId: number;
        name: string;
        symbol: string;
        decimals: number;
        rpcUrls: string[];
        blockExplorerUrls: string[];
        type: string;
        vmType: string;
    };
    cronos: {
        contractAddress: string;
        chainId: number;
        name: string;
        symbol: string;
        decimals: number;
        rpcUrls: string[];
        blockExplorerUrls: string[];
        type: string;
        vmType: string;
    };
    optimism: {
        contractAddress: string;
        chainId: number;
        name: string;
        symbol: string;
        decimals: number;
        rpcUrls: string[];
        blockExplorerUrls: string[];
        type: string;
        vmType: string;
    };
    celo: {
        contractAddress: string;
        chainId: number;
        name: string;
        symbol: string;
        decimals: number;
        rpcUrls: string[];
        blockExplorerUrls: string[];
        type: string;
        vmType: string;
    };
    aurora: {
        contractAddress: any;
        chainId: number;
        name: string;
        symbol: string;
        decimals: number;
        rpcUrls: string[];
        blockExplorerUrls: string[];
        type: any;
        vmType: string;
    };
    eluvio: {
        contractAddress: any;
        chainId: number;
        name: string;
        symbol: string;
        decimals: number;
        rpcUrls: string[];
        blockExplorerUrls: string[];
        type: any;
        vmType: string;
    };
    alfajores: {
        contractAddress: any;
        chainId: number;
        name: string;
        symbol: string;
        decimals: number;
        rpcUrls: string[];
        blockExplorerUrls: string[];
        type: any;
        vmType: string;
    };
    xdc: {
        contractAddress: any;
        chainId: number;
        name: string;
        symbol: string;
        decimals: number;
        rpcUrls: string[];
        blockExplorerUrls: string[];
        type: any;
        vmType: string;
    };
    evmos: {
        contractAddress: any;
        chainId: number;
        name: string;
        symbol: string;
        decimals: number;
        rpcUrls: string[];
        blockExplorerUrls: string[];
        type: any;
        vmType: string;
    };
    evmosTestnet: {
        contractAddress: any;
        chainId: number;
        name: string;
        symbol: string;
        decimals: number;
        rpcUrls: string[];
        blockExplorerUrls: string[];
        type: any;
        vmType: string;
    };
};
/**
 * Solana Chains supported by the LIT protocol.  Use the chain name as a key in this object.
 * @constant
 * @type {LITSVMChain}
 * @default
 */
export declare const LIT_SVM_CHAINS: {
    solana: {
        name: string;
        symbol: string;
        decimals: number;
        rpcUrls: string[];
        blockExplorerUrls: string[];
        vmType: string;
    };
    solanaDevnet: {
        name: string;
        symbol: string;
        decimals: number;
        rpcUrls: string[];
        blockExplorerUrls: string[];
        vmType: string;
    };
    solanaTestnet: {
        name: string;
        symbol: string;
        decimals: number;
        rpcUrls: string[];
        blockExplorerUrls: string[];
        vmType: string;
    };
};
/**
 * Cosmos Chains supported by the LIT protocol.  Use the chain name as a key in this object.
 * @constant
 * @type {LITCosmosChain}
 * @default
 */
export declare const LIT_COSMOS_CHAINS: {
    cosmos: {
        name: string;
        symbol: string;
        decimals: number;
        chainId: string;
        rpcUrls: string[];
        blockExplorerUrls: string[];
        vmType: string;
    };
    kyve: {
        name: string;
        symbol: string;
        decimals: number;
        chainId: string;
        rpcUrls: string[];
        blockExplorerUrls: string[];
        vmType: string;
    };
    evmosCosmos: {
        name: string;
        symbol: string;
        decimals: number;
        chainId: string;
        rpcUrls: string[];
        blockExplorerUrls: string[];
        vmType: string;
    };
    evmosCosmosTestnet: {
        name: string;
        symbol: string;
        decimals: number;
        chainId: string;
        rpcUrls: string[];
        blockExplorerUrls: string[];
        vmType: string;
    };
};
/**
 * All Chains supported by the LIT protocol.  Use the chain name as a key in this object.
 * @constant
 * @type {LITChain}
 * @default
 */
export declare const ALL_LIT_CHAINS: {
    cosmos: {
        name: string;
        symbol: string;
        decimals: number;
        chainId: string;
        rpcUrls: string[];
        blockExplorerUrls: string[];
        vmType: string;
    };
    kyve: {
        name: string;
        symbol: string;
        decimals: number;
        chainId: string;
        rpcUrls: string[];
        blockExplorerUrls: string[];
        vmType: string;
    };
    evmosCosmos: {
        name: string;
        symbol: string;
        decimals: number;
        chainId: string;
        rpcUrls: string[];
        blockExplorerUrls: string[];
        vmType: string;
    };
    evmosCosmosTestnet: {
        name: string;
        symbol: string;
        decimals: number;
        chainId: string;
        rpcUrls: string[];
        blockExplorerUrls: string[];
        vmType: string;
    };
    solana: {
        name: string;
        symbol: string;
        decimals: number;
        rpcUrls: string[];
        blockExplorerUrls: string[];
        vmType: string;
    };
    solanaDevnet: {
        name: string;
        symbol: string;
        decimals: number;
        rpcUrls: string[];
        blockExplorerUrls: string[];
        vmType: string;
    };
    solanaTestnet: {
        name: string;
        symbol: string;
        decimals: number;
        rpcUrls: string[];
        blockExplorerUrls: string[];
        vmType: string;
    };
    ethereum: {
        contractAddress: string;
        chainId: number;
        name: string;
        symbol: string;
        decimals: number;
        type: string;
        rpcUrls: string[];
        blockExplorerUrls: string[];
        vmType: string;
    };
    polygon: {
        contractAddress: string;
        chainId: number;
        name: string;
        symbol: string;
        decimals: number;
        rpcUrls: string[];
        blockExplorerUrls: string[];
        type: string;
        vmType: string;
    };
    fantom: {
        contractAddress: string;
        chainId: number;
        name: string;
        symbol: string;
        decimals: number;
        rpcUrls: string[];
        blockExplorerUrls: string[];
        type: string;
        vmType: string;
    };
    xdai: {
        contractAddress: string;
        chainId: number;
        name: string;
        symbol: string;
        decimals: number;
        rpcUrls: string[];
        blockExplorerUrls: string[];
        type: string;
        vmType: string;
    };
    bsc: {
        contractAddress: string;
        chainId: number;
        name: string;
        symbol: string;
        decimals: number;
        rpcUrls: string[];
        blockExplorerUrls: string[];
        type: string;
        vmType: string;
    };
    arbitrum: {
        contractAddress: string;
        chainId: number;
        name: string;
        symbol: string;
        decimals: number;
        type: string;
        rpcUrls: string[];
        blockExplorerUrls: string[];
        vmType: string;
    };
    avalanche: {
        contractAddress: string;
        chainId: number;
        name: string;
        symbol: string;
        decimals: number;
        type: string;
        rpcUrls: string[];
        blockExplorerUrls: string[];
        vmType: string;
    };
    fuji: {
        contractAddress: string;
        chainId: number;
        name: string;
        symbol: string;
        decimals: number;
        type: string;
        rpcUrls: string[];
        blockExplorerUrls: string[];
        vmType: string;
    };
    harmony: {
        contractAddress: string;
        chainId: number;
        name: string;
        symbol: string;
        decimals: number;
        type: string;
        rpcUrls: string[];
        blockExplorerUrls: string[];
        vmType: string;
    };
    kovan: {
        contractAddress: string;
        chainId: number;
        name: string;
        symbol: string;
        decimals: number;
        rpcUrls: string[];
        blockExplorerUrls: string[];
        type: string;
        vmType: string;
    };
    mumbai: {
        contractAddress: string;
        chainId: number;
        name: string;
        symbol: string;
        decimals: number;
        rpcUrls: string[];
        blockExplorerUrls: string[];
        type: string;
        vmType: string;
    };
    goerli: {
        contractAddress: string;
        chainId: number;
        name: string;
        symbol: string;
        decimals: number;
        rpcUrls: string[];
        blockExplorerUrls: string[];
        type: string;
        vmType: string;
    };
    ropsten: {
        contractAddress: string;
        chainId: number;
        name: string;
        symbol: string;
        decimals: number;
        rpcUrls: string[];
        blockExplorerUrls: string[];
        type: string;
        vmType: string;
    };
    rinkeby: {
        contractAddress: string;
        chainId: number;
        name: string;
        symbol: string;
        decimals: number;
        rpcUrls: string[];
        blockExplorerUrls: string[];
        type: string;
        vmType: string;
    };
    cronos: {
        contractAddress: string;
        chainId: number;
        name: string;
        symbol: string;
        decimals: number;
        rpcUrls: string[];
        blockExplorerUrls: string[];
        type: string;
        vmType: string;
    };
    optimism: {
        contractAddress: string;
        chainId: number;
        name: string;
        symbol: string;
        decimals: number;
        rpcUrls: string[];
        blockExplorerUrls: string[];
        type: string;
        vmType: string;
    };
    celo: {
        contractAddress: string;
        chainId: number;
        name: string;
        symbol: string;
        decimals: number;
        rpcUrls: string[];
        blockExplorerUrls: string[];
        type: string;
        vmType: string;
    };
    aurora: {
        contractAddress: any;
        chainId: number;
        name: string;
        symbol: string;
        decimals: number;
        rpcUrls: string[];
        blockExplorerUrls: string[];
        type: any;
        vmType: string;
    };
    eluvio: {
        contractAddress: any;
        chainId: number;
        name: string;
        symbol: string;
        decimals: number;
        rpcUrls: string[];
        blockExplorerUrls: string[];
        type: any;
        vmType: string;
    };
    alfajores: {
        contractAddress: any;
        chainId: number;
        name: string;
        symbol: string;
        decimals: number;
        rpcUrls: string[];
        blockExplorerUrls: string[];
        type: any;
        vmType: string;
    };
    xdc: {
        contractAddress: any;
        chainId: number;
        name: string;
        symbol: string;
        decimals: number;
        rpcUrls: string[];
        blockExplorerUrls: string[];
        type: any;
        vmType: string;
    };
    evmos: {
        contractAddress: any;
        chainId: number;
        name: string;
        symbol: string;
        decimals: number;
        rpcUrls: string[];
        blockExplorerUrls: string[];
        type: any;
        vmType: string;
    };
    evmosTestnet: {
        contractAddress: any;
        chainId: number;
        name: string;
        symbol: string;
        decimals: number;
        rpcUrls: string[];
        blockExplorerUrls: string[];
        type: any;
        vmType: string;
    };
};
export declare const NETWORK_PUB_KEY = "9971e835a1fe1a4d78e381eebbe0ddc84fde5119169db816900de796d10187f3c53d65c1202ac083d099a517f34a9b62";
export declare const LIT_AUTH_SIG_CHAIN_KEYS: string[];
