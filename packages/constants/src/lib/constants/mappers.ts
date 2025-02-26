import { _nagaDev } from '@lit-protocol/contracts';

import {
  LIT_NETWORK,
  LIT_NETWORK_VALUES,
  ConstantKeys,
  ConstantValues,
} from './constants';

/**
 * Mapping of network context by network value.
 */
export const NETWORK_CONTEXT_BY_NETWORK: Record<
  LIT_NETWORK_VALUES,
  typeof _nagaDev | undefined
> = {
  [LIT_NETWORK.NagaDev]: _nagaDev,
  [LIT_NETWORK.Custom]: undefined,
} as const;

/**
 * Whether to overwrite the IPFS code for a given network.
 * This is useful when the nodes are not able to connect to the IPFS gateway,
 * so the sdk can fallback to these gateways.
 */
export const GLOBAL_OVERWRITE_IPFS_CODE_BY_NETWORK: Record<
  LIT_NETWORK_VALUES,
  boolean
> = {
  [LIT_NETWORK.NagaDev]: false,
  [LIT_NETWORK.Custom]: false,
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
export type PRODUCT_ID_TYPE = ConstantKeys<typeof PRODUCT_IDS>;
export type PRODUCT_ID_VALUES = ConstantValues<typeof PRODUCT_IDS>;
