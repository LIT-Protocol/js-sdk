const {
  signTransactionSolanaKey,
  validateUnsignedTransaction,
} = require('./internal/signTransaction');
const {
  getDecryptedKeyToSingleNode,
} = require('../common/internal/getDecryptedKeyToSingleNode');
const { removeSaltFromDecryptedKey } = require('../utils');

/* global accessControlConditions, ciphertext, dataToEncryptHash, unsignedTransaction, Lit, broadcast */

/**
 *
 * Bundles solana/web3.js package as it's required to sign a transaction with the Solana wallet which is also decrypted inside the Lit Action.
 *
 * @jsParam pkpAddress - The Eth address of the PKP which is associated with the Wrapped Key
 * @jsParam ciphertext - For the encrypted Wrapped Key
 * @jsParam dataToEncryptHash - For the encrypted Wrapped Key
 * @jsParam unsignedTransaction - The unsigned message to be signed by the Wrapped Key
 * @jsParam broadcast - Flag used to determine whether to just sign the message or also to broadcast it using the node's RPC.
 * @jsParam accessControlConditions - The access control condition that allows only the pkpAddress to decrypt the Wrapped Key
 *
 * @returns { Promise<string> } - Returns the transaction signature. Or returns errors if any.
 */

(async () => {
  try {
    validateUnsignedTransaction(unsignedTransaction);

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

    const txResult = await signTransactionSolanaKey({
      broadcast,
      privateKey,
      unsignedTransaction,
    });

    Lit.Actions.setResponse({ response: txResult });
  } catch (err) {
    Lit.Actions.setResponse({
      response: `Error: ${err.message}`,
    });
  }
})();
