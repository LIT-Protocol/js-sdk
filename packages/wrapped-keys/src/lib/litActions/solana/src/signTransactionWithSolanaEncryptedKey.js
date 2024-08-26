const {
  clusterApiUrl,
  Connection,
  Keypair,
  Transaction,
} = require('@solana/web3.js');

const { removeSaltFromDecryptedKey } = require('../../utils');

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
  const VALID_NETWORKS = ['devnet', 'testnet', 'mainnet-beta'];

  if (!VALID_NETWORKS.includes(unsignedTransaction.chain)) {
    Lit.Actions.setResponse({
      response: `Error: Invalid Solana network: ${unsignedTransaction.chain}`,
    });
    return;
  }

  if (
    !unsignedTransaction.serializedTransaction ||
    !unsignedTransaction.serializedTransaction.length === 0
  ) {
    Lit.Actions.setResponse({
      response: `Error: Invalid serializedTransaction: ${unsignedTransaction.serializedTransaction}`,
    });
    return;
  }

  let decryptedPrivateKey;
  try {
    decryptedPrivateKey = await Lit.Actions.decryptToSingleNode({
      accessControlConditions,
      chain: 'ethereum',
      ciphertext,
      dataToEncryptHash,
      authSig: null,
    });
  } catch (error) {
    Lit.Actions.setResponse({
      response: `Error: When decrypting data to private key: ${error.message}`,
    });
    return;
  }

  if (!decryptedPrivateKey) {
    // Exit the nodes which don't have the decryptedData
    return;
  }

  let privateKey;
  try {
    privateKey = removeSaltFromDecryptedKey(decryptedPrivateKey);
  } catch (err) {
    Lit.Actions.setResponse({ response: err.message });
    return;
  }

  const solanaKeyPair = Keypair.fromSecretKey(
    Uint8Array.from(Buffer.from(privateKey, 'hex'))
  );

  try {
    const transaction = Transaction.from(
      Buffer.from(unsignedTransaction.serializedTransaction, 'base64')
    );

    transaction.sign(solanaKeyPair);
    const signature = transaction.signature.toString('base64');

    if (broadcast) {
      const solanaConnection = new Connection(
        clusterApiUrl(unsignedTransaction.chain),
        'confirmed'
      );
      const transactionSignature = await solanaConnection.sendRawTransaction(
        transaction.serialize()
      );

      Lit.Actions.setResponse({ response: transactionSignature });
    } else {
      Lit.Actions.setResponse({ response: signature });
    }
  } catch (error) {
    Lit.Actions.setResponse({
      response: `Error: During transaction signing and submission: ${error.message}`,
    });
  }
})();
