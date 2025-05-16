/**
 * @module crypto-utils
 * This module provides cryptographic utility functions.
 */

/**
 * Compresses an uncompressed secp256k1 public key.
 *
 * @param {Uint8Array} uncompressedPubKey - The uncompressed public key (65 bytes: 0x04 + X + Y).
 * @returns {Uint8Array} The compressed public key (33 bytes: 0x02/0x03 + X).
 * @throws {Error} If the public key format is invalid.
 */
export function publicKeyCompress(uncompressedPubKey: Uint8Array): Uint8Array {
  if (uncompressedPubKey.length !== 65) {
    throw new Error(
      'Invalid uncompressed public key length. Expected 65 bytes.'
    );
  }
  if (uncompressedPubKey[0] !== 0x04) {
    throw new Error(
      'Invalid uncompressed public key format. Expected 0x04 prefix.'
    );
  }

  const x = uncompressedPubKey.slice(1, 33);
  const y = uncompressedPubKey.slice(33, 65);

  // Determine the prefix (0x02 for even Y, 0x03 for odd Y)
  // The last byte of Y determines its parity.
  const prefix = y[31] % 2 === 0 ? 0x02 : 0x03;

  const compressedPubKey = new Uint8Array(33);
  compressedPubKey[0] = prefix;
  compressedPubKey.set(x, 1);

  return compressedPubKey;
}
