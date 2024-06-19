(async () => {
  const LIT_PREFIX = 'lit_';

  const resp = await Lit.Actions.runOnce(
    { waitForResponse: true, name: 'encryptedPrivateKey' },
    async () => {
      const wallet = ethers.Wallet.createRandom();
      const privateKey = LIT_PREFIX + wallet.privateKey.toString();
      let utf8Encode = new TextEncoder();
      const to_encrypt = utf8Encode.encode(privateKey);

      const { ciphertext, dataToEncryptHash } = await Lit.Actions.encrypt({
        accessControlConditions,
        to_encrypt,
      });
      return JSON.stringify({
        ciphertext,
        dataToEncryptHash,
        publicKey: wallet.publicKey,
      });
    }
  );

  Lit.Actions.setResponse({
    response: resp,
  });
})();
