const { Keypair } = require('@solana/web3.js');
const bs58 = require('bs58');
const nacl = require('tweetnacl');

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

  const signature = nacl.sign.detached(
    new TextEncoder().encode(messageToSign),
    solanaKeyPair.secretKey
  );

  Lit.Actions.setResponse({ response: bs58.encode(signature) });
})();
