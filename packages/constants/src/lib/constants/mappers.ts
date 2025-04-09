import { nagaDev } from '@lit-protocol/contracts';

import { LIT_NETWORK_VALUES } from './constants';

/**
 * Mapping of network context by network value.
 */
export const NETWORK_CONTEXT_BY_NETWORK: {
  [key in LIT_NETWORK_VALUES]: typeof nagaDev | undefined;
} = {
  'naga-dev': nagaDev,
  custom: undefined,
} as const;

/**
 * Whether to overwrite the IPFS code for a given network.
 * This is useful when the nodes are not able to connect to the IPFS gateway,
 * so the sdk can fallback to these gateways.
 */
export const GLOBAL_OVERWRITE_IPFS_CODE_BY_NETWORK: {
  [key in LIT_NETWORK_VALUES]: boolean;
} = {
  'naga-dev': false,
  custom: false,
} as const;

/**
 * Product IDs used for price feed and node selection
 *
 * - DECRYPTION (0): Used for decryption operations
 * - SIGN (1): Used for signing operations
 * - LA (2): Used for Lit Actions execution
 */
export const PRODUCT_IDS = {
  DECRYPTION: 0, // For decryption operations
  SIGN: 1, // For signing operations
  LIT_ACTION: 2, // For Lit Actions execution
} as const;
export type PRODUCT_IDS_TYPE = keyof typeof PRODUCT_IDS;
export type PRODUCT_IDS_VALUES = (typeof PRODUCT_IDS)[keyof typeof PRODUCT_IDS];
