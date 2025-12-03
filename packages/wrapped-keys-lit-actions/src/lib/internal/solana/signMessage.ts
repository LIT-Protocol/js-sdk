import { Buffer } from 'buffer';

import { Keypair } from '@solana/web3.js';
import nacl from 'tweetnacl';

interface SignMessageParams {
  messageToSign: string;
  solanaKeyPair: Keypair;
}

interface VerifyMessageSignatureParams {
  signature: Uint8Array;
  solanaKeyPair: Keypair;
  messageToSign: string;
}

function signMessage({ messageToSign, solanaKeyPair }: SignMessageParams): {
  signature: Uint8Array;
} {
  try {
    const signature = nacl.sign.detached(
      new TextEncoder().encode(messageToSign),
      solanaKeyPair.secretKey
    );

    return { signature };
  } catch (err: unknown) {
    if (err instanceof Error) {
      throw new Error(`When signing message - ${err.message}`);
    } else {
      throw new Error(`An unexpected error occurred: ${err}`);
    }
  }
}

function verifyMessageSignature({
  signature,
  solanaKeyPair,
  messageToSign,
}: VerifyMessageSignatureParams): boolean {
  try {
    const isValid = nacl.sign.detached.verify(
      Buffer.from(messageToSign),
      signature,
      solanaKeyPair.publicKey.toBuffer()
    );

    return isValid;
  } catch (err: unknown) {
    throw new Error(
      `When validating signed Solana message is valid: ${
        (err as Error).message
      }`
    );
  }
}

export async function signMessageSolanaKey({
  messageToSign,
  privateKey,
}: {
  messageToSign: string;
  privateKey: string;
}): Promise<string> {
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
