import { SessionKeyPairSchema } from '@lit-protocol/schemas';
import { SessionKeyPair } from '@lit-protocol/types';
import { ed25519 } from '@noble/curves/ed25519';
/**
 * Generates a session key pair using the ed25519 algorithm.
 * The session key pair includes a public key, a secret key (concatenation of private and public keys),
 * and a sessionKeyUri derived from the public key.
 *
 * @returns {SessionKeyPair} An object containing the generated session key pair (publicKey, secretKey, sessionKeyUri).
 *
 * @example
 * const sessionKeys = generateSessionKeyPair();
 * console.log(sessionKeys);
 * // Output might look like:
 * // {
 * //   publicKey: "fd675dccf88acfe02975ccd7308e84991e694e3fcb46a1934aa491e2bc93e707",
 * //   secretKey: "557dc82e14cce51a2948732f952722e57980e44abc4e3fad2bec93162394e822fd675dccf88acfe02975ccd7308e84991e694e3fcb46a1934aa491e2bc93e707",
 * //   sessionKeyUri: "lit:session:fd675dccf88acfe02975ccd7308e84991e694e3fcb46a1934aa491e2bc93e707"
 * // }
 */
export const generateSessionKeyPair = (): SessionKeyPair => {
  const privateKey = ed25519.utils.randomPrivateKey();
  const publicKey = ed25519.getPublicKey(privateKey);
  const combinedSecretKey = new Uint8Array(
    privateKey.length + publicKey.length
  );
  combinedSecretKey.set(privateKey, 0);
  combinedSecretKey.set(publicKey, privateKey.length);

  const sessionKeyPair = {
    publicKey: Buffer.from(publicKey).toString('hex'),
    secretKey: Buffer.from(combinedSecretKey).toString('hex'), // TODO check if concatenated public key is needed
  };

  // Parse and validate using the Zod schema, which also adds the sessionKeyUri
  const parsedSessionKeyPair = SessionKeyPairSchema.parse(sessionKeyPair);

  return parsedSessionKeyPair;
};

// if (import.meta.main) {
//   const sessionKeyPair = generateSessionKeyPair();
//   console.log(sessionKeyPair);
// }
