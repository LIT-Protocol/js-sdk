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
      await solanaConnection.sendRawTransaction(transaction.serialize());
    }
  } catch (error) {
    Lit.Actions.setResponse({
      response: `Error: During transaction signing and submission: ${error.message}`,
    });
  }
})();
