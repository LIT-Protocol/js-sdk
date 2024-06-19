(async () => {
  const LIT_PREFIX = 'lit_';

  let decryptedPrivateKey;
  try {
    decryptedPrivateKey = await Lit.Actions.decryptToSingleNode({
      accessControlConditions,
      ciphertext,
      dataToEncryptHash,
      chain: 'ethereum',
      authSig: null,
    });
  } catch (err) {
    const errorMessage =
      'Error: When decrypting to a single node- ' + err.message;
    Lit.Actions.setResponse({ response: errorMessage });
    return;
  }

  if (!decryptedPrivateKey) {
    // Exit the nodes which don't have the decryptedData
    return;
  }

  const privateKey = decryptedPrivateKey.startsWith(LIT_PREFIX)
    ? decryptedPrivateKey.slice(LIT_PREFIX.length)
    : decryptedPrivateKey;
  const wallet = new ethers.Wallet(privateKey);

  try {
    const signature = await wallet.signMessage(messageToSign);

    const recoveredAddress = ethers.utils.verifyMessage(
      messageToSign,
      signature
    );

    if (recoveredAddress !== wallet.address) {
      Lit.Actions.setResponse({
        response: "Error: Recovered address doesn't match the wallet address",
      });
      return;
    }

    Lit.Actions.setResponse({ response: signature });
  } catch (err) {
    const errorMessage = 'Error: When signing message- ' + err.message;
    Lit.Actions.setResponse({ response: errorMessage });
  }
})();
