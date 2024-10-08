const {
  getDecryptedKeyToSingleNode,
} = require('./internal/getDecryptedKeyToSingleNode');
const { removeSaltFromDecryptedKey } = require('../utils');

/* global accessControlConditions, ciphertext, dataToEncryptHash, Lit */

/**
 *
 * Exports the private key after decrypting and removing the salt from it.
 *
 * @jsParam pkpAddress - The Eth address of the PKP which is associated with the Wrapped Key
 * @jsParam ciphertext - For the encrypted Wrapped Key
 * @jsParam dataToEncryptHash - For the encrypted Wrapped Key
 * @jsParam accessControlConditions - The access control condition that allows only the pkpAddress to decrypt the Wrapped Key
 *
 * @returns { Promise<string> } - Returns a decrypted private key.
 */

(async () => {
  try {
    const decryptedPrivateKey = await getDecryptedKeyToSingleNode({
      accessControlConditions,
      ciphertext,
      dataToEncryptHash,
    });

    if (!decryptedPrivateKey) {
      // Silently exit on nodes which didn't run the `decryptToSingleNode` code
      return;
    }

    const privateKey = removeSaltFromDecryptedKey(decryptedPrivateKey);
    Lit.Actions.setResponse({ response: privateKey });
  } catch (err) {
    Lit.Actions.setResponse({ response: `Error: ${err.message}` });
  }
})();
