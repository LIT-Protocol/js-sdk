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

const {
  clusterApiUrl,
  Connection,
  Keypair,
  Transaction,
} = require('@solana/web3.js');

(async () => {
  const LIT_PREFIX = 'lit_';
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

  const privateKey = decryptedPrivateKey.startsWith(LIT_PREFIX)
    ? decryptedPrivateKey.slice(LIT_PREFIX.length)
    : decryptedPrivateKey;
  const solanaKeyPair = Keypair.fromSecretKey(
    Uint8Array.from(Buffer.from(privateKey, 'hex'))
  );

  try {
    const transaction = Transaction.from(
      Buffer.from(unsignedTransaction.serializedTransaction, 'base64')
    );

    transaction.sign(solanaKeyPair);
    const signature = transaction.signature.toString('base64');
    Lit.Actions.setResponse({ response: signature });

    if (broadcast) {
      const solanaConnection = new Connection(
        clusterApiUrl(unsignedTransaction.chain),
        'confirmed'
      );
      await solanaConnection.sendRawTransaction(transaction.serialize()); // FIXME: Shouldn't this return the tx hash for consistency with the evm action?
    }
  } catch (error) {
    Lit.Actions.setResponse({
      response: `Error: During transaction signing and submission: ${error.message}`,
    });
  }
})();
