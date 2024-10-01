const {
  signTransactionWithEncryptedKey,
} = require('./internal/signTransactionWithEncryptedKey');

/* global accessControlConditions, ciphertext, dataToEncryptHash, unsignedTransaction, broadcast, Lit */

/**
 *
 * Signs a transaction with the Ethers wallet whose private key is decrypted inside the Lit Action.
 *
 * @jsParam pkpAddress - The Eth address of the PKP which is associated with the Wrapped Key
 * @jsParam ciphertext - For the encrypted Wrapped Key
 * @jsParam dataToEncryptHash - For the encrypted Wrapped Key
 * @jsParam unsignedTransaction - The unsigned message to be signed by the Wrapped Key
 * @jsParam broadcast - Flag used to determine whether to just sign the message or also to broadcast it using the node's RPC. Note, if the RPC doesn't exist for the chain then the Lit Action will throw an unsupported error.
 * @jsParam accessControlConditions - The access control condition that allows only the pkpAddress to decrypt the Wrapped Key
 *
 * @returns { Promise<string> } - Returns the transaction hash if broadcast is set as true else returns only the signed transaction. Or returns errors if any.
 */
(async () => {
  try {
    const txResult = await signTransactionWithEncryptedKey({
      accessControlConditions,
      ciphertext,
      dataToEncryptHash,
      unsignedTransaction,
      broadcast,
    });

    if (txResult) {
      Lit.Actions.setResponse({ response: txResult });
    }
  } catch (err) {
    Lit.Actions.setResponse({
      response: `Error: ${err.message}`,
    });
  }
})();
