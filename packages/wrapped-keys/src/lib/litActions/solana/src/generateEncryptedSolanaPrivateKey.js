const { Keypair } = require('@solana/web3.js');

(async () => {
  const LIT_PREFIX = 'lit_';

  const resp = await Lit.Actions.runOnce(
    { waitForResponse: true, name: 'encryptedPrivateKey' },
    async () => {
      const solanaKeypair = Keypair.generate();
      const privateKey =
        LIT_PREFIX + Buffer.from(solanaKeypair.secretKey).toString('hex');
      let utf8Encode = new TextEncoder();
      const to_encrypt = utf8Encode.encode(privateKey);

      const { ciphertext, dataToEncryptHash } = await Lit.Actions.encrypt({
        accessControlConditions,
        to_encrypt,
      });
      return JSON.stringify({
        ciphertext,
        dataToEncryptHash,
        publicKey: solanaKeypair.publicKey.toString(),
      });
    }
  );

  Lit.Actions.setResponse({
    response: resp,
  });
})();
