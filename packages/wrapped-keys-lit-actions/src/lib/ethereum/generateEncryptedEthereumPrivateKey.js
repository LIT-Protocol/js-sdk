/* global accessControlConditions, Lit */

/**
 *
 * Generates a random Ethers private key and only allows the provided PKP to decrypt it
 *
 * @jsParam pkpAddress - The Eth address of the PKP which is associated with the Wrapped Key
 * @jsParam accessControlConditions - The access control condition that allows only the pkpAddress to decrypt the Wrapped Key
 *
 * @returns { Promise<string> } - Returns a stringified JSON object with ciphertext & dataToEncryptHash which are the result of the encryption. Also returns the publicKey of the newly generated Ethers Wrapped Key.
 */
import { generateEthereumPrivateKey } from './internal/generatePrivateKey';
import { encryptPrivateKey } from '../common/internal/encryptKey';

(async () => {
  const { privateKey, publicKey } = generateEthereumPrivateKey();
  const encryptedKeyResult = await encryptPrivateKey({
    accessControlConditions,
    privateKey,
    publicKey,
  });

  Lit.Actions.setResponse({
    response: JSON.stringify(encryptedKeyResult),
  });
})();
