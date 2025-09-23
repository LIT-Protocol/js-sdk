/**
 * Network Configuration
 * Contains all network-related constants and configurations
 */
export declare const GITHUB_API_BASE = "https://api.github.com/repos";
export declare const USERNAME = "LIT-Protocol";
export declare const NETWORKS_REPO = "networks";
export declare const LIT_ASSETS_REPO = "lit-assets";
export declare const PROD_PATH_BY_NETWORK: {
    readonly datil: "datil-prod";
    readonly "datil-dev": "datil-dev";
    readonly "datil-test": "datil-test";
    readonly "naga-dev": "naga-dev";
    readonly "naga-test": "naga-test";
    readonly "naga-staging": "naga-staging";
};
export declare const DEV_PATH_BY_NETWORK: {
    readonly develop: "develop";
};
export type ProdNetworkName = keyof typeof PROD_PATH_BY_NETWORK;
export type DevNetworkName = keyof typeof DEV_PATH_BY_NETWORK;
export type NetworkName = ProdNetworkName | DevNetworkName;
export type NetworkPath = (typeof PROD_PATH_BY_NETWORK)[ProdNetworkName] | (typeof DEV_PATH_BY_NETWORK)[DevNetworkName];
/**
 * Network path configuration for GitHub API requests
 *
 * Production:
 * - Uses network-specific subdirectories (e.g., "datil-prod/abis" for datil network)
 * - Special case: "datil" network uses "datil-prod" directory
 *
 * Development:
 * - Uses a flat structure without network subdirectories
 * - All files are in the same directory (e.g., "rust/lit-core/blockchain/abis")
 */
export declare const NETWORK_PATHS: {
    readonly prod: {
        /**
         * Maps network names to their directory names
         * Example: "datil" -> "datil-prod", "datil-dev" -> "datil-dev"
         */
        readonly networkToPath: {
            readonly datil: "datil-prod";
            readonly "datil-dev": "datil-dev";
            readonly "datil-test": "datil-test";
            readonly "naga-dev": "naga-dev";
            readonly "naga-test": "naga-test";
            readonly "naga-staging": "naga-staging";
        };
        /**
         * Constructs the full path for production networks
         * Format: <network-directory>/<content-path>
         * Example: "datil-prod/abis"
         */
        readonly getContentPath: (network: ProdNetworkName, contentPath: string) => string;
    };
    readonly dev: {
        /**
         * Maps network names to their directory names
         * Example: "develop" -> "develop"
         */
        readonly networkToPath: {
            readonly develop: "develop";
        };
        /**
         * Constructs the full path for development
         * Uses the content path directly without network subdirectory
         * Example: "rust/lit-core/blockchain/abis"
         */
        readonly getContentPath: (network: DevNetworkName, contentPath: string) => string;
    };
};
export declare const NETWORKS: {
    readonly prod: {
        readonly networks: ProdNetworkName[];
        readonly deployedContracts: {
            readonly "datil-dev": "https://raw.githubusercontent.com/LIT-Protocol/networks/main/datil-dev/deployed-lit-node-contracts-temp.json";
            readonly "datil-test": "https://raw.githubusercontent.com/LIT-Protocol/networks/main/datil-test/deployed-lit-node-contracts-temp.json";
            readonly datil: "https://raw.githubusercontent.com/LIT-Protocol/networks/main/datil-prod/deployed-lit-node-contracts-temp.json";
            readonly "naga-dev": "https://raw.githubusercontent.com/LIT-Protocol/networks/main/naga-dev/deployed-lit-node-contracts-temp.json";
            readonly "naga-staging": "https://raw.githubusercontent.com/LIT-Protocol/networks/main/naga-staging/deployed-lit-node-contracts-temp.json";
            readonly "naga-test": "https://raw.githubusercontent.com/LIT-Protocol/networks/main/naga-test/deployed-lit-node-contracts-temp.json";
        };
    };
    readonly dev: {
        readonly networks: DevNetworkName[];
        readonly deployedContracts: {
            readonly develop: "https://raw.githubusercontent.com/LIT-Protocol/networks/main/naga-dev/deployed-lit-node-contracts-temp.json";
            readonly "datil-clone": "https://raw.githubusercontent.com/LIT-Protocol/networks/main/datil-clone/deployed-lit-node-contracts-temp.json";
        };
    };
};
export declare const CONTRACT_NAME_MAP: {
    readonly litTokenContractAddress: "LITToken";
    readonly pkpNftContractAddress: "PKPNFT";
    readonly pkpHelperContractAddress: "PKPHelper";
    readonly pkpPermissionsContractAddress: "PKPPermissions";
    readonly pkpNftMetadataContractAddress: "PKPNFTMetadata";
    readonly pubkeyRouterContractAddress: "PubkeyRouter";
    readonly rateLimitNftContractAddress: "RateLimitNFT";
    readonly stakingBalancesContractAddress: "StakingBalances";
    readonly stakingContractAddress: "Staking";
    readonly multisenderContractAddress: "Multisender";
    readonly allowlistContractAddress: "Allowlist";
    readonly paymentDelegationContractAddress: "PaymentDelegation";
    readonly priceFeedContractAddress: "PriceFeed";
    readonly cloneNetContractAddress: "CloneNet";
    readonly ledgerContractAddress: "Ledger";
};
export declare const ENV_CONFIG: {
    readonly prod: {
        readonly repoName: "networks";
        readonly path: "abis";
        readonly fileExtensionToRemove: ".abi";
        readonly abiSourceInJson: readonly [];
    };
    readonly dev: {
        readonly repoName: "lit-assets";
        readonly path: "rust/lit-core/lit-blockchain/abis";
        readonly fileExtensionToRemove: ".json";
        readonly abiSourceInJson: readonly ["abi"];
    };
};
