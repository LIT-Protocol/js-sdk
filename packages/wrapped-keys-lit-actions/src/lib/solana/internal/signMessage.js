import { Keypair } from '@solana/web3.js';
import nacl from 'tweetnacl';

/* global ethers */

function signMessage({ messageToSign, solanaKeyPair }) {
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
    throw new Error(
      `When validating signed Solana message is valid: ${err.message}`
    );
  }
}

export async function signMessageSolanaKey({ messageToSign, privateKey }) {
  const solanaKeyPair = Keypair.fromSecretKey(Buffer.from(privateKey, 'hex'));

  const { signature } = signMessage({
    messageToSign,
    solanaKeyPair,
  });

  const isValid = verifyMessageSignature({
    signature,
    solanaKeyPair,
    messageToSign,
  });

  if (!isValid) {
    throw new Error('Signature did not verify to expected Solana public key');
  }

  return ethers.utils.base58.encode(signature);
}
