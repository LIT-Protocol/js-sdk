import { Keypair } from '@solana/web3.js';

import { LIT_PREFIX } from '../../constants';

/* global Lit */

/**
 * Bundles solana/web3.js package as it's required to generate a random Solana key and only allows the provided PKP to decrypt it
 * This should be executed using `runOnce` to avoid generating `n` new private keys where we only want 1.
 *
 * @private
 * @returns { Promise<{ciphertext: string, dataToEncryptHash: string, publicKey: string}> } - The ciphertext & dataToEncryptHash which are the result of the encryption, and the publicKey of the newly generated Ethers Wrapped Key.
 */
export async function generateEncryptedSolanaPrivateKey({
  accessControlConditions,
}) {
  const solanaKeypair = Keypair.generate();
  const privateKey =
    LIT_PREFIX + Buffer.from(solanaKeypair.secretKey).toString('hex');
  let utf8Encode = new TextEncoder();
  const to_encrypt = utf8Encode.encode(privateKey);

  const { ciphertext, dataToEncryptHash } = await Lit.Actions.encrypt({
    accessControlConditions,
    to_encrypt,
  });

  return {
    ciphertext,
    dataToEncryptHash,
    publicKey: solanaKeypair.publicKey.toString(),
  };
}
