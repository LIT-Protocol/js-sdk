const { Keypair } = require('@solana/web3.js');
const bs58 = require('bs58');
const nacl = require('tweetnacl');

(async () => {
  const LIT_PREFIX = 'lit_';

  const decryptedPrivateKey = await Lit.Actions.decryptToSingleNode({
    accessControlConditions,
    chain: 'ethereum',
    ciphertext,
    dataToEncryptHash,
    authSig: null,
    sessionSigs,
  });

  if (!decryptedPrivateKey) {
    // Exit the nodes which don't have the decryptedData
    return;
  }

  const privateKey = decryptedPrivateKey.startsWith(LIT_PREFIX)
    ? decryptedPrivateKey.slice(LIT_PREFIX.length)
    : decryptedPrivateKey;
  const solanaKeyPair = Keypair.fromSecretKey(bs58.decode(privateKey));

  const signature = nacl.sign.detached(
    new TextEncoder().encode(messageToSign),
    solanaKeyPair.secretKey
  );

  const isValid = nacl.sign.detached.verify(
    Buffer.from(messageToSign),
    bs58.decode(signature),
    solanaKeyPair.publicKey.toBuffer()
  );
  if (!isValid) {
    Lit.Actions.setResponse({
      response: 'Error: Signature did not verify to expected Solana public key',
    });
    return;
  }

  Lit.Actions.setResponse({ response: bs58.encode(signature) });
})();
