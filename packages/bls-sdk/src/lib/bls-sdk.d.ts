/**
 *Initialize function for the wasm library
 */
export function initWasmBlsSdk(): void;
/**
 *Encrypts the data to the public key and identity. All inputs are hex encoded strings.
 * @param {string} public_key
 * @param {string} message
 * @param {string} identity
 * @returns {string}
 */
export function encrypt(
  public_key: string,
  message: string,
  identity: string
): string;
/**
 *Verifies the decryption shares are valid and decrypts the data.
 * @param {string} public_key
 * @param {string} identity
 * @param {string} ciphertext
 * @param {any} shares
 * @returns {string}
 */
export function verify_and_decrypt_with_signature_shares(
  public_key: string,
  identity: string,
  ciphertext: string,
  shares: any
): string;
/**
 *Decrypts the data with signature shares.
 * @param {string} ciphertext
 * @param {any} shares
 * @returns {string}
 */
export function decrypt_with_signature_shares(
  ciphertext: string,
  shares: any
): string;

/**
 *Combines the signature shares into a single signature.
 * @param {any} shares
 * @returns {string}
 */
export function combine_signature_shares(shares: any): string;
