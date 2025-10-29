interface SignTypedDataParams {
  privateKey: string;
  messageToSign: {
    domain: any;
    types: Record<string, any[]>;
    value: Record<string, any>;
  };
}

interface VerifyMessageSignatureParams {
  messageToSign: {
    domain: any;
    types: Record<string, any[]>;
    value: Record<string, any>;
  };
  signature: string;
}

async function signTypedData({
  privateKey,
  messageToSign,
}: SignTypedDataParams): Promise<{ signature: string; walletAddress: string }> {
  try {
    const wallet = new ethers.Wallet(privateKey);
    const signature = await wallet._signTypedData(
      messageToSign.domain,
      messageToSign.types,
      messageToSign.value
    );

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
    return ethers.utils.verifyTypedData(
      messageToSign.domain,
      messageToSign.types,
      messageToSign.value,
      signature
    );
  } catch (err: unknown) {
    throw new Error(
      `When validating signed Ethereum message is valid: ${
        (err as Error).message
      }`
    );
  }
}

export async function signTypedDataEthereumKey({
  privateKey,
  messageToSign,
}: SignTypedDataParams): Promise<string> {
  const { signature, walletAddress } = await signTypedData({
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
