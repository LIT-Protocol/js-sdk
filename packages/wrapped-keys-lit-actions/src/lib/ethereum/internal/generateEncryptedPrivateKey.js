/* global ethers, Lit */

/**
 * Generates a random Ethers private key that only allows the provided PKP to decrypt it
 * This should be executed using `runOnce` to avoid generating `n` new private keys where we only want 1.
 *
 * @private
 * @returns { Promise<{ciphertext: string, dataToEncryptHash: string, publicKey: string}> } - The ciphertext & dataToEncryptHash which are the result of the encryption, and the publicKey of the newly generated Ethers Wrapped Key.
 */
import { LIT_PREFIX } from '../../constants';

export async function generateEncryptedEthereumPrivateKey({
  accessControlConditions,
}) {
  const wallet = ethers.Wallet.createRandom();
  const privateKey = LIT_PREFIX + wallet.privateKey.toString();

  let utf8Encode = new TextEncoder();
  const to_encrypt = utf8Encode.encode(privateKey);

  const { ciphertext, dataToEncryptHash } = await Lit.Actions.encrypt({
    accessControlConditions,
    to_encrypt,
  });

  return {
    ciphertext,
    dataToEncryptHash,
    publicKey: wallet.publicKey,
  };
}
