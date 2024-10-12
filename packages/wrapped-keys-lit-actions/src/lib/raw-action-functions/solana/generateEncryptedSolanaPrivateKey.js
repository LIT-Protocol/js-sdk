const { encryptPrivateKey } = require('../../internal/common/encryptKey');
const {
  generateSolanaPrivateKey,
} = require('../../internal/solana/generatePrivateKey');

/**
 * Bundles solana/web3.js package as it's required to generate a random Solana key and only allows the provided PKP to decrypt it
 *
 * @jsParam pkpAddress - The Eth address of the PKP which is associated with the Wrapped Key
 * @jsParam accessControlConditions - The access control condition that allows only the pkpAddress to decrypt the Wrapped Key
 *
 * @returns { Promise<{ciphertext: string, dataToEncryptHash: string, publicKey: string}> } - Returns JSON object with ciphertext & dataToEncryptHash which are the result of the encryption. Also returns the publicKey of the newly generated Solana Wrapped Key.
 */
export async function generateEncryptedSolanaPrivateKey({
  accessControlConditions,
}) {
  const { privateKey, publicKey } = generateSolanaPrivateKey();

  return encryptPrivateKey({
    accessControlConditions,
    publicKey,
    privateKey,
  });
}
