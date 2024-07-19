import { metamaskChainInfo } from './constants';

/**
 * Represents the Lit Network constants.
 */
export const LIT_NETWORK = {
  Cayenne: 'cayenne',
  Manzano: 'manzano',
  Habanero: 'habanero',
  DatilDev: 'datil-dev',
  DatilTest: 'datil-test',
  Custom: 'custom',
  Localhost: 'localhost',
};

/**
 * The type representing the keys of the LIT_NETWORK object.
 */
export type LIT_NETWORK_TYPES = keyof typeof LIT_NETWORK;

/**
 * The type representing the values of the LIT_NETWORK object.
 */
export type LIT_NETWORK_VALUES = (typeof LIT_NETWORK)[keyof typeof LIT_NETWORK];

/**
 * Constants representing the available LIT RPC endpoints.
 */
export const LIT_RPC = {
  /**
   * Local Anvil RPC endpoint.
   */
  LOCAL_ANVIL: 'http://127.0.0.1:8545',

  /**
   * Chronicle RPC endpoint - Used for Cayenne, Manzano, Habanero
   */
  CHRONICLE: 'https://chain-rpc.litprotocol.com/http',

  /**
   * Chronicle Vesuvius RPC endpoint - used for Datil-dev
   * @deprecated Will be removed in version 7.x. - Use CHRONICLE_VESUVIUS instead
   */
  VESUVIUS: 'https://vesuvius-rpc.litprotocol.com',

  /**
   * Chronicle Vesuvius RPC endpoint - used for Datil-dev
   * More info: https://app.conduit.xyz/published/view/vesuvius-as793xpg5g
   */
  CHRONICLE_VESUVIUS: 'https://vesuvius-rpc.litprotocol.com',

  /**
   * Chronicle Yellowstone RPC endpoint - used for >= Datil-test
   * More info: https://app.conduit.xyz/published/view/chronicle-yellowstone-testnet-9qgmzfcohk
   */
  CHRONICLE_YELLOWSTONE: 'https://yellowstone-rpc.litprotocol.com',
} as const;

/**
 * RPC URL by Network
 *
 * A mapping of network names to their corresponding RPC URLs.
 */
export const RPC_URL_BY_NETWORK: { [key in LIT_NETWORK_VALUES]: string } = {
  cayenne: LIT_RPC.CHRONICLE,
  manzano: LIT_RPC.CHRONICLE,
  habanero: LIT_RPC.CHRONICLE,
  'datil-dev': LIT_RPC.CHRONICLE_VESUVIUS,
  'datil-test': LIT_RPC.CHRONICLE_YELLOWSTONE,
  custom: LIT_RPC.LOCAL_ANVIL,
  localhost: LIT_RPC.LOCAL_ANVIL,
};

/**
 * Mapping of network names to their corresponding relayer URLs.
 */
export const RELAYER_URL_BY_NETWORK: {
  [key in LIT_NETWORK_VALUES]: string;
} = {
  cayenne: 'https://relayer-server-staging-cayenne.getlit.dev',
  manzano: 'https://manzano-relayer.getlit.dev',
  habanero: 'https://habanero-relayer.getlit.dev',
  'datil-dev': 'https://datil-dev-relayer.getlit.dev',
  'datil-test': 'https://datil-test-relayer.getlit.dev',
  custom: 'http://localhost:3000',
  localhost: 'http://localhost:3000',
};

/**
 * URL mappings for general worker URLs by network.
 */
export const GENERAL_WORKER_URL_BY_NETWORK: {
  [key in LIT_NETWORK_VALUES]: string;
} = {
  cayenne: 'https://apis.getlit.dev/cayenne/contracts',
  manzano: 'https://apis.getlit.dev/manzano/contracts',
  habanero: 'https://apis.getlit.dev/habanero/contracts',
  'datil-dev': 'https://apis.getlit.dev/datil-dev/contracts',
  'datil-test': 'https://apis.getlit.dev/datil-test/contracts',

  // just use cayenne abis for custom and localhost
  custom: 'https://apis.getlit.dev/cayenne/contracts',
  localhost: 'https://apis.getlit.dev/cayenne/contracts',
};

/**
 * URL constants for the staging worker by network.
 */
export const GENERAL_STAGING_WORKER_URL_BY_NETWORK: {
  [key in LIT_NETWORK_VALUES]: string;
} = {
  cayenne: 'https://staging.apis.getlit.dev/cayenne/contracts',
  manzano: 'https://staging.apis.getlit.dev/manzano/contracts',
  habanero: 'https://staging.apis.getlit.dev/habanero/contracts',
  'datil-dev': 'https://staging.apis.getlit.dev/datil-dev/contracts',
  'datil-test': 'https://staging.apis.getlit.dev/datil-test/contracts',

  // just use cayenne abis for custom and localhost
  custom: 'https://apis.getlit.dev/cayenne/contracts',
  localhost: 'https://apis.getlit.dev/cayenne/contracts',
};

/**
 * Mapping of network values to corresponding Metamask chain info.
 */
export const METAMASK_CHAIN_INFO_BY_NETWORK: Record<
  LIT_NETWORK_VALUES,
  | typeof metamaskChainInfo.chronicle
  | typeof metamaskChainInfo.chronicleVesuvius
> = {
  cayenne: metamaskChainInfo.chronicle,
  manzano: metamaskChainInfo.chronicle,
  habanero: metamaskChainInfo.chronicle,
  'datil-dev': metamaskChainInfo.chronicleVesuvius,
  'datil-test': metamaskChainInfo.yellowstone,
  custom: metamaskChainInfo.chronicleVesuvius,
  localhost: metamaskChainInfo.chronicleVesuvius,
};

const HTTP = 'http://';
const HTTPS = 'https://';

/**
 * Mapping of network values to corresponding http protocol.
 */
export const HTTP_BY_NETWORK: Record<
  LIT_NETWORK_VALUES,
  typeof HTTP | typeof HTTPS
> = {
  cayenne: HTTPS,
  manzano: HTTPS,
  habanero: HTTPS,
  'datil-dev': HTTPS,
  'datil-test': HTTPS,
  custom: HTTP,
  localhost: HTTP,
};

/**
 * Mapping of network values to their corresponding centralisation status.
 */
export const CENTRALISATION_BY_NETWORK: Record<
  LIT_NETWORK_VALUES,
  'centralised' | 'decentralised' | 'unknown'
> = {
  cayenne: 'centralised',
  manzano: 'decentralised',
  habanero: 'decentralised',
  'datil-dev': 'centralised',
  'datil-test': 'decentralised',
  custom: 'unknown',
  localhost: 'unknown',
} as const;
