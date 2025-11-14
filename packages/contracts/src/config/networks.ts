/**
 * Network Configuration
 * Contains all network-related constants and configurations
 */

// GitHub Configuration
export const GITHUB_API_BASE = 'https://api.github.com/repos';
export const USERNAME = 'LIT-Protocol';
export const NETWORKS_REPO = 'networks';
export const LIT_ASSETS_REPO = 'lit-assets';

// Network path mapping - single source of truth
export const PROD_PATH_BY_NETWORK = {
  datil: 'datil-prod',
  'datil-dev': 'datil-dev',
  'datil-test': 'datil-test',
  'naga-dev': 'naga-dev',
  'naga-test': 'naga-test',
  'naga-staging': 'naga-staging',
  'naga-proto': 'naga-proto',
  'naga': 'naga-prod',
} as const;

export const DEV_PATH_BY_NETWORK = {
  develop: 'develop',
  // "datil-clone": "datil-clone",
} as const;

// Network types derived from path mappings
export type ProdNetworkName = keyof typeof PROD_PATH_BY_NETWORK;
export type DevNetworkName = keyof typeof DEV_PATH_BY_NETWORK;
export type NetworkName = ProdNetworkName | DevNetworkName;
export type NetworkPath =
  | (typeof PROD_PATH_BY_NETWORK)[ProdNetworkName]
  | (typeof DEV_PATH_BY_NETWORK)[DevNetworkName];

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
export const NETWORK_PATHS = {
  prod: {
    /**
     * Maps network names to their directory names
     * Example: "datil" -> "datil-prod", "datil-dev" -> "datil-dev"
     */
    networkToPath: PROD_PATH_BY_NETWORK,
    /**
     * Constructs the full path for production networks
     * Format: <network-directory>/<content-path>
     * Example: "datil-prod/abis"
     */
    getContentPath: (network: ProdNetworkName, contentPath: string) => {
      const networkDir = PROD_PATH_BY_NETWORK[network];
      return `${networkDir}/${contentPath}`;
    },
  },
  dev: {
    /**
     * Maps network names to their directory names
     * Example: "develop" -> "develop"
     */
    networkToPath: DEV_PATH_BY_NETWORK,
    /**
     * Constructs the full path for development
     * Uses the content path directly without network subdirectory
     * Example: "rust/lit-core/blockchain/abis"
     */
    getContentPath: (network: DevNetworkName, contentPath: string) =>
      contentPath,
  },
} as const;

// Network Configurations
export const NETWORKS = {
  prod: {
    networks: Object.keys(PROD_PATH_BY_NETWORK) as ProdNetworkName[],
    deployedContracts: {
      'datil-dev':
        'https://raw.githubusercontent.com/LIT-Protocol/networks/main/datil-dev/deployed-lit-node-contracts-temp.json',
      'datil-test':
        'https://raw.githubusercontent.com/LIT-Protocol/networks/main/datil-test/deployed-lit-node-contracts-temp.json',
      datil:
        'https://raw.githubusercontent.com/LIT-Protocol/networks/main/datil-prod/deployed-lit-node-contracts-temp.json',
      'naga-dev':
        'https://raw.githubusercontent.com/LIT-Protocol/networks/main/naga-dev/deployed-lit-node-contracts-temp.json',
      'naga-staging':
        'https://raw.githubusercontent.com/LIT-Protocol/networks/main/naga-staging/deployed-lit-node-contracts-temp.json',
      'naga-test':
        'https://raw.githubusercontent.com/LIT-Protocol/networks/main/naga-test/deployed-lit-node-contracts-temp.json',
      'naga-proto':
        'https://raw.githubusercontent.com/LIT-Protocol/networks/main/naga-proto/deployed-lit-node-contracts-temp.json',
      'naga':
        'https://raw.githubusercontent.com/LIT-Protocol/networks/main/naga-prod/deployed-lit-node-contracts-temp.json',
    },
  },
  dev: {
    networks: Object.keys(DEV_PATH_BY_NETWORK) as DevNetworkName[],
    deployedContracts: {
      develop:
        'https://raw.githubusercontent.com/LIT-Protocol/networks/main/naga-dev/deployed-lit-node-contracts-temp.json',
      'datil-clone':
        'https://raw.githubusercontent.com/LIT-Protocol/networks/main/datil-clone/deployed-lit-node-contracts-temp.json',
    },
  },
} as const;

// Contract Name Mapping
export const CONTRACT_NAME_MAP = {
  litTokenContractAddress: 'LITToken',
  pkpNftContractAddress: 'PKPNFT',
  pkpHelperContractAddress: 'PKPHelper',
  pkpPermissionsContractAddress: 'PKPPermissions',
  pkpNftMetadataContractAddress: 'PKPNFTMetadata',
  pubkeyRouterContractAddress: 'PubkeyRouter',
  rateLimitNftContractAddress: 'RateLimitNFT',
  stakingBalancesContractAddress: 'StakingBalances',
  stakingContractAddress: 'Staking',
  multisenderContractAddress: 'Multisender',
  allowlistContractAddress: 'Allowlist',
  paymentDelegationContractAddress: 'PaymentDelegation',
  priceFeedContractAddress: 'PriceFeed',
  cloneNetContractAddress: 'CloneNet',
  ledgerContractAddress: 'Ledger',
} as const;

// Environment Configuration
export const ENV_CONFIG = {
  prod: {
    repoName: NETWORKS_REPO,
    path: 'abis',
    fileExtensionToRemove: '.abi',
    abiSourceInJson: [],
  },
  dev: {
    repoName: LIT_ASSETS_REPO,
    path: 'rust/lit-core/lit-blockchain/abis',
    fileExtensionToRemove: '.json',
    abiSourceInJson: ['abi'],
  },
} as const;
