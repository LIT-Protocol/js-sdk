const {
  signMessageWithEncryptedEthereumKey,
} = require('./internal/signMessageWithEncryptedKey');
const { getDecryptedKey } = require('../common/internal/getDecryptedKey');
const { removeSaltFromDecryptedKey } = require('../utils');

/* global accessControlConditions, ciphertext, dataToEncryptHash, messageToSign, Lit */

/**
 * Signs a message with the Ethers wallet which is also decrypted inside the Lit Action.
 *
 * @jsParam pkpAddress - The Eth address of the PKP which is associated with the Wrapped Key
 * @jsParam ciphertext - For the encrypted Wrapped Key
 * @jsParam dataToEncryptHash - For the encrypted Wrapped Key
 * @jsParam messageToSign - The unsigned message to be signed by the Wrapped Key
 * @jsParam accessControlConditions - The access control condition that allows only the pkpAddress to decrypt the Wrapped Key
 *
 * @returns { Promise<string> } - Returns a message signed by the Ethers Wrapped key. Or returns errors if any.
 */

(async () => {
  try {
    const decryptedPrivateKey = await getDecryptedKey({
      accessControlConditions,
      ciphertext,
      dataToEncryptHash,
    });

    if (!decryptedPrivateKey) {
      // Silently exit on nodes which didn't run the `decryptToSingleNode` code
      return;
    }

    const privateKey = removeSaltFromDecryptedKey(decryptedPrivateKey);

    const signature = await signMessageWithEncryptedEthereumKey({
      privateKey,
      messageToSign,
    });

    Lit.Actions.setResponse({ response: signature });
  } catch (err) {
    Lit.Actions.setResponse({ response: `Error: ${err.message}` });
  }
})();
