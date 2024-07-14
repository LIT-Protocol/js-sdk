const { removeSaltFromDecryptedKey } = require('../../utils');

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
  let decryptedPrivateKey;
  try {
    decryptedPrivateKey = await Lit.Actions.decryptToSingleNode({
      accessControlConditions,
      ciphertext,
      dataToEncryptHash,
      chain: 'ethereum',
      authSig: null,
    });
  } catch (err) {
    const errorMessage =
      'Error: When decrypting to a single node- ' + err.message;
    Lit.Actions.setResponse({ response: errorMessage });
    return;
  }

  if (!decryptedPrivateKey) {
    // Exit the nodes which don't have the decryptedData
    return;
  }

  try {
    const privateKey = removeSaltFromDecryptedKey(decryptedPrivateKey);
    Lit.Actions.setResponse({ response: privateKey });
  } catch (err) {
    Lit.Actions.setResponse({ response: err.message });
  }
})();
