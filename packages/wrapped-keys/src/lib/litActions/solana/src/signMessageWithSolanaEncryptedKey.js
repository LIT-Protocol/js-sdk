const { Keypair } = require('@solana/web3.js');
const bs58 = require('bs58');
const nacl = require('tweetnacl');

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

  let signature;
  try {
    signature = nacl.sign.detached(
      new TextEncoder().encode(messageToSign),
      solanaKeyPair.secretKey
    );
  } catch (error) {
    Lit.Actions.setResponse({
      response: `Error: When signing message: ${error.message}`,
    });
    return;
  }

  try {
    const isValid = nacl.sign.detached.verify(
      Buffer.from(messageToSign),
      signature,
      solanaKeyPair.publicKey.toBuffer()
    );
    if (!isValid) {
      Lit.Actions.setResponse({
        response:
          'Error: Signature did not verify to expected Solana public key',
      });
      return;
    }
  } catch (error) {
    Lit.Actions.setResponse({
      response: `Error: When validating signed message is valid: ${error.message}`,
    });
    return;
  }

  Lit.Actions.setResponse({ response: bs58.encode(signature) });
})();
