/* global ethers */

import { getDecryptedKey } from '../../common/internal/getDecryptedKey';
import { removeSaltFromDecryptedKey } from '../../utils';

async function signMessage({ privateKey, messageToSign }) {
  try {
    const wallet = new ethers.Wallet(privateKey);
    const signature = await wallet.signMessage(messageToSign);

    return { signature, walletAddress: wallet.address };
  } catch (err) {
    throw new Error(`When signing message - ${err.message}`);
  }
}

function verifyMessageSignature(messageToSign, signature) {
  try {
    return ethers.utils.verifyMessage(messageToSign, signature);
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

  const privateKey = removeSaltFromDecryptedKey(decryptedPrivateKey);

  const { signature, walletAddress } = await signMessage({
    privateKey,
    messageToSign,
  });

  const recoveredAddress = verifyMessageSignature(
    messageToSign,
    signature,
    walletAddress
  );

  if (recoveredAddress !== walletAddress) {
    throw new Error(
      "Recovered address from verifyMessage doesn't match the wallet address"
    );
  }

  return signature;
}
