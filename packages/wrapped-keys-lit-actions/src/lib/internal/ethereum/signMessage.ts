/**
 * The global ethers library (5.7.0) is available on Lit Action (Unbundled)
 */
import { ethers } from 'ethers';

interface SignMessageParams {
  privateKey: string;
  messageToSign: string;
}

interface VerifyMessageSignatureParams {
  messageToSign: string;
  signature: string;
}

async function signMessage({
  privateKey,
  messageToSign,
}: SignMessageParams): Promise<{ signature: string; walletAddress: string }> {
  try {
    const wallet = new ethers.Wallet(privateKey);
    const signature = await wallet.signMessage(messageToSign);

    return { signature, walletAddress: wallet.address };
  } catch (err: unknown) {
    if (err instanceof Error) {
      throw new Error(`When signing message - ${err.message}`);
    } else {
      throw new Error(`An unexpected error occurred: ${err}`);
    }
  }
}

function verifyMessageSignature({
  messageToSign,
  signature,
}: VerifyMessageSignatureParams): string {
  try {
    return ethers.utils.verifyMessage(messageToSign, signature);
  } catch (err: unknown) {
    throw new Error(
      `When validating signed Ethereum message is valid: ${
        (err as Error).message
      }`
    );
  }
}

export async function signMessageEthereumKey({
  privateKey,
  messageToSign,
}: SignMessageParams): Promise<string> {
  const { signature, walletAddress } = await signMessage({
    privateKey,
    messageToSign,
  });

  const recoveredAddress = verifyMessageSignature({ messageToSign, signature });

  if (recoveredAddress !== walletAddress) {
    throw new Error(
      "Recovered address from verifyMessage doesn't match the wallet address"
    );
  }

  return signature;
}
