import { ConstantKeys, ConstantValues } from './constants';

/**
 * Product IDs used for price feed and node selection
 *
 * - DECRYPTION (0): Used for decryption operations
 * - SIGN (1): Used for signing operations
 * - LA (2): Used for Lit Actions execution
 * - SIGN_SESSION_KEY (3): Used for sign session key operations
 */
export const PRODUCT_IDS = {
  DECRYPTION: 0, // For decryption operations
  SIGN: 1, // For signing operations
  LIT_ACTION: 2, // For Lit Actions execution
  SIGN_SESSION_KEY: 3, // For sign session key operations
} as const;
export type PRODUCT_ID_TYPE = ConstantKeys<typeof PRODUCT_IDS>;
export type PRODUCT_ID_VALUES = ConstantValues<typeof PRODUCT_IDS>;
