const { encryptPrivateKey } = require('../../internal/common/encryptKey');
const {
  generateSolanaPrivateKey,
} = require('../../internal/solana/generatePrivateKey');

/* global Lit */

/**
 * Bundles solana/web3.js package as it's required to generate a random Solana key and only allows the provided PKP to decrypt it
 *
 * @jsParam pkpAddress - The Eth address of the PKP which is associated with the Wrapped Key
 * @jsParam accessControlConditions - The access control condition that allows only the pkpAddress to decrypt the Wrapped Key
 *
 * @returns { Promise<string> } - Returns a stringified JSON object with ciphertext & dataToEncryptHash which are the result of the encryption. Also returns the publicKey of the newly generated Solana Wrapped Key.
 */
export async function generateEncryptedSolanaPrivateKey({
  accessControlConditions,
}) {
  const { privateKey, publicKey } = generateSolanaPrivateKey();
  const encryptedKeyResult = await encryptPrivateKey({
    accessControlConditions,
    publicKey,
    privateKey,
  });

  Lit.Actions.setResponse({
    response: JSON.stringify(encryptedKeyResult),
  });
}
