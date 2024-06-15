const {
  clusterApiUrl,
  Connection,
  Keypair,
  Transaction,
} = require('@solana/web3.js');

(async () => {
  const LIT_PREFIX = 'lit_';

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
      Buffer.from(serializedTransaction, 'base64')
    );

    transaction.sign(solanaKeyPair);
    const signature = transaction.signature.toString('base64');
    Lit.Actions.setResponse({ response: signature });

    if (broadcast) {
      const solanaConnection = new Connection(
        clusterApiUrl(solanaNetwork),
        'confirmed'
      );
      await solanaConnection.sendRawTransaction(transaction.serialize());
    }
  } catch (error) {
    Lit.Actions.setResponse({
      response: `Error during transaction signing and submission: ${error.message}`,
    });
  }
})();
