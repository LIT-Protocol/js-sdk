import { datilDev, datilTest, datil, _nagaDev } from '@lit-protocol/contracts';

import { LIT_NETWORK_VALUES } from './constants';

/**
 * Mapping of network context by network value.
 */
export const NETWORK_CONTEXT_BY_NETWORK: {
  [key in LIT_NETWORK_VALUES]:
    | typeof datilDev
    | typeof datilTest
    | typeof datil
    | typeof _nagaDev;
} = {
  'datil-dev': datilDev,
  'datil-test': datilTest,
  datil: datil,
  'naga-dev': _nagaDev,
  custom: datilDev,
} as const;

export const GLOBAL_OVERWRITE_IPFS_CODE_BY_NETWORK: {
  [key in LIT_NETWORK_VALUES]: boolean;
} = {
  'datil-dev': false,
  'datil-test': false,
  datil: false,
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
  LA: 2, // For Lit Actions execution
} as const;
