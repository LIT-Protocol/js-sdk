const {
  clusterApiUrl,
  Connection,
  Keypair,
  PublicKey,
  SystemProgram,
  Transaction,
} = require('@solana/web3.js');
const bs58 = require('bs58');

(async () => {
  const solanaPrivateKey = await Lit.Actions.decryptAndCombine({
    accessControlConditions,
    chain: 'ethereum',
    ciphertext,
    dataToEncryptHash,
    authSig: null,
    sessionSigs,
  });
  const solanaKeyPair = Keypair.fromSecretKey(bs58.decode(solanaPrivateKey));

  const transaction = new Transaction();
  transaction.add(
    SystemProgram.transfer({
      fromPubkey: solanaKeyPair.publicKey,
      toPubkey: new PublicKey(transactionRecipient),
      lamports: transactionAmount,
    })
  );

  const solanaConnection = new Connection(clusterApiUrl('devnet'), 'confirmed');
  const { blockhash } = await solanaConnection.getLatestBlockhash();
  transaction.recentBlockhash = blockhash;

  transaction.sign(solanaKeyPair);
  const signature = await solanaConnection.sendRawTransaction(
    transaction.serialize()
  );

  Lit.Actions.setResponse({ response: signature });
})();
