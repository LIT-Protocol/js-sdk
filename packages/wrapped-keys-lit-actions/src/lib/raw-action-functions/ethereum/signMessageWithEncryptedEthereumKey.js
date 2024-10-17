const {
  getDecryptedKeyToSingleNode,
} = require('../../internal/common/getDecryptedKeyToSingleNode');
const {
  signMessageEthereumKey,
} = require('../../internal/ethereum/signMessage');

/**
 * Signs a message with the Ethers wallet which is also decrypted inside the Lit Action.
 *
 * @jsParam pkpAddress - The Eth address of the PKP which is associated with the Wrapped Key
 * @jsParam ciphertext - For the encrypted Wrapped Key
 * @jsParam dataToEncryptHash - For the encrypted Wrapped Key
 * @jsParam messageToSign - The unsigned message to be signed by the Wrapped Key
 * @jsParam accessControlConditions - The access control condition that allows only the pkpAddress to decrypt the Wrapped Key
 *
 * @returns { Promise<string> } - Returns a message signed by the Ethers Wrapped key. Or returns errors if any.
 */

export async function signMessageWithEncryptedEthereumKey({
  accessControlConditions,
  ciphertext,
  dataToEncryptHash,
  messageToSign,
}) {
  const privateKey = await getDecryptedKeyToSingleNode({
    accessControlConditions,
    ciphertext,
    dataToEncryptHash,
  });

  return signMessageEthereumKey({
    privateKey,
    messageToSign,
  });
}
