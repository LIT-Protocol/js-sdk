/**
 * Rust U128 max
 * See https://cheats.rs/ for more info
 */
export const UNSIGNED_128_MAX =
  340_282_366_920_938_463_463_374_607_431_768_211_455n;

/**
 * Product IDs used for price feed and node selection
 *
 * - DECRYPTION (0): Used for decryption operations
 * - SIGN (1): Used for signing operations
 * - LIT_ACTION (2): Used for Lit Actions execution
 * - SIGN_SESSION_KEY (3): Used for sign session key operations
 */
export const PRODUCT_IDS = {
  DECRYPTION: 0n, // For decryption operations
  SIGN: 1n, // For signing operations
  LIT_ACTION: 2n, // For Lit Actions execution
  SIGN_SESSION_KEY: 3n, // For sign session key operations
} as const;
