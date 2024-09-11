const { Keypair } = require('@solana/web3.js');
const bs58 = require('bs58');
const nacl = require('tweetnacl');

const { removeSaltFromDecryptedKey } = require('../../utils');

/**
 *
 * Bundles solana/web3.js package as it's required to sign a message with the Solana wallet which is also decrypted inside the Lit Action.
 *
 * @jsParam pkpAddress - The Eth address of the PKP which is associated with the Wrapped Key
 * @jsParam ciphertext - For the encrypted Wrapped Key
 * @jsParam dataToEncryptHash - For the encrypted Wrapped Key
 * @jsParam messageToSign - The unsigned message to be signed by the Wrapped Key
 * @jsParam accessControlConditions - The access control condition that allows only the pkpAddress to decrypt the Wrapped Key
 *
 * @returns { Promise<string> } - Returns a message signed by the Solana Wrapped key. Or returns errors if any.
 */

(async () => {
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

  let privateKey;
  try {
    privateKey = removeSaltFromDecryptedKey(decryptedPrivateKey);
  } catch (err) {
    Lit.Actions.setResponse({ response: err.message });
    return;
  }
  const solanaKeyPair = Keypair.fromSecretKey(Buffer.from(privateKey, 'hex'));

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
