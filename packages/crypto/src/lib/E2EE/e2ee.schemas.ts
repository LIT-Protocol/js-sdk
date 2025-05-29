import { z } from 'zod';

/**
 * Schema to ensure public keys are always exactly 32 bytes.
 *
 * Handles common issues where public keys might be missing leading zeros,
 * resulting in 31 bytes instead of the required 32 bytes for cryptographic operations.
 *
 * @param key - Input Uint8Array that should represent a 32-byte public key
 * @returns A validated Uint8Array that is guaranteed to be exactly 32 bytes
 *
 * @example
 * ```typescript
 * const publicKey = new Uint8Array(31); // Missing leading zero
 * const validatedKey = Always32BytesSchema.parse(publicKey); // Returns 32-byte array
 * ```
 */
export const Always32BytesSchema = z.instanceof(Uint8Array).transform((key) => {
  const validatedKey = new Uint8Array(32);

  if (key.length === 32) {
    // Perfect - already 32 bytes
    validatedKey.set(key);
  } else if (key.length === 31) {
    // Common issue - missing leading zero, pad with zero at start
    validatedKey.set(key, 1); // Copy to position 1, leaving first byte as 0
  } else if (key.length < 32) {
    // Pad with zeros at the start
    validatedKey.set(key, 32 - key.length);
  } else {
    // Truncate if too long
    validatedKey.set(key.slice(0, 32));
  }

  return validatedKey;
});

/**
 * Schema for constructing Lit Protocol AAD (Additional Authenticated Data).
 *
 * Creates a standardised 89-byte structure used for authenticated encryption:
 * - version (1 byte): Protocol version identifier
 * - random (16 bytes): Cryptographically secure random data
 * - timestamp (8 bytes): Creation timestamp for replay protection
 * - theirPublicKey (32 bytes): Recipient's public key
 * - myPublicKey (32 bytes): Sender's public key
 *
 * Total structure: version(1) + random(16) + timestamp(8) + theirPublicKey(32) + myPublicKey(32) = 89 bytes
 *
 * @param input - Object containing all required AAD components
 * @param input.version - 1-byte version identifier
 * @param input.random - 16-byte random data
 * @param input.timestamp - 8-byte timestamp
 * @param input.theirPublicKey - 32-byte recipient public key
 * @param input.myPublicKey - 32-byte sender public key
 * @returns Concatenated 89-byte Uint8Array ready for cryptographic operations
 *
 * @example
 * ```typescript
 * const aadData = LitAADSchema.parse({
 *   version: new Uint8Array([0x01]),
 *   random: crypto.getRandomValues(new Uint8Array(16)),
 *   timestamp: timestampBuffer,
 *   theirPublicKey: recipientKey,
 *   myPublicKey: senderKey
 * });
 * ```
 */
export const LitAADSchema = z
  .object({
    version: z
      .instanceof(Uint8Array)
      .refine((arr) => arr.length === 1, 'Version must be 1 byte'),
    random: z
      .instanceof(Uint8Array)
      .refine((arr) => arr.length === 16, 'Random must be 16 bytes'),
    timestamp: z
      .instanceof(Uint8Array)
      .refine((arr) => arr.length === 8, 'Timestamp must be 8 bytes'),
    theirPublicKey: Always32BytesSchema, // Reuse our existing schema
    myPublicKey: Always32BytesSchema, // Reuse our existing schema
  })
  .transform(({ version, random, timestamp, theirPublicKey, myPublicKey }) => {
    // Construct the 89-byte AAD structure
    return new Uint8Array([
      ...version,
      ...random,
      ...timestamp,
      ...theirPublicKey,
      ...myPublicKey,
    ]);
  });

/**
 * Schema to convert TweetNaCl.js ciphertext format to sodalite-compatible format.
 *
 * Sodalite expects ciphertext with 16 bytes of padding at the beginning:
 * - Sodalite format: [ENCRYPTED_PADDING(16)] + [TWEETNACL_COMPATIBLE(67+)]
 * - TweetNaCl.js format: [TWEETNACL_COMPATIBLE(67+)]
 *
 * This transformation prepends the required 16 zero bytes to make TweetNaCl.js
 * output compatible with sodalite's expected format.
 *
 * @param tweetNaClCiphertext - Raw ciphertext output from TweetNaCl.js encryption
 * @returns Sodalite-compatible ciphertext with 16-byte padding prefix
 *
 * @example
 * ```typescript
 * const tweetNaClOutput = nacl.box(message, nonce, publicKey, secretKey);
 * const sodaliteCompatible = SodaliteCompatibleSchema.parse(tweetNaClOutput);
 * // sodaliteCompatible now has 16 zero bytes + original ciphertext
 * ```
 */
export const SodaliteCompatibleSchema = z
  .instanceof(Uint8Array)
  .transform((tweetNaClCiphertext) => {
    // Prepend 16 zero bytes to match sodalite's expected format
    const sodaliteCompatible = new Uint8Array(16 + tweetNaClCiphertext.length);
    sodaliteCompatible.set(new Uint8Array(16).fill(0), 0); // 16 zero bytes padding
    sodaliteCompatible.set(tweetNaClCiphertext, 16); // Original TweetNaCl.js output

    return sodaliteCompatible;
  });
