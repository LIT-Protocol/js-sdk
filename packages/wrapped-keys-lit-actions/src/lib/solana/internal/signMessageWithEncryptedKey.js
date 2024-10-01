import { Keypair } from '@solana/web3.js';
import bs58 from 'bs58';
import nacl from 'tweetnacl';

import { getDecryptedKey } from '../../common/internal/getDecryptedKey';
import { removeSaltFromDecryptedKey } from '../../utils';

async function signMessage({ messageToSign, solanaKeyPair }) {
  try {
    const signature = nacl.sign.detached(
      new TextEncoder().encode(messageToSign),
      solanaKeyPair.secretKey
    );

    return { signature };
  } catch (err) {
    throw new Error(`When signing message - ${err.message}`);
  }
}

function verifyMessageSignature({ signature, solanaKeyPair, messageToSign }) {
  try {
    const isValid = nacl.sign.detached.verify(
      Buffer.from(messageToSign),
      signature,
      solanaKeyPair.publicKey.toBuffer()
    );

    return isValid;
  } catch (err) {
    throw new Error(`When validating signed message is valid: ${err.message}`);
  }
}

export async function signMessageWithEncryptedKey({
  accessControlConditions,
  ciphertext,
  dataToEncryptHash,
  messageToSign,
}) {
  const decryptedPrivateKey = await getDecryptedKey({
    accessControlConditions,
    ciphertext,
    dataToEncryptHash,
  });

  if (!decryptedPrivateKey) {
    // Silently exit on nodes which didn't run the `decryptToSingleNode` code
    return;
  }

  const solanaKeyPair = Keypair.fromSecretKey(
    Buffer.from(removeSaltFromDecryptedKey(decryptedPrivateKey), 'hex')
  );

  const { signature } = await signMessage({
    messageToSign,
    solanaKeyPair,
  });

  const isValid = verifyMessageSignature({ signature, solanaKeyPair });

  if (!isValid) {
    throw new Error('Signature did not verify to expected Solana public key');
  }

  return bs58.encode(signature);
}
