/* global Lit */

export async function getDecryptedKey({
  accessControlConditions,
  ciphertext,
  dataToEncryptHash,
}) {
  try {
    // May be undefined, since we're using `decryptToSingleNode`
    return await Lit.Actions.decryptToSingleNode({
      accessControlConditions,
      ciphertext,
      dataToEncryptHash,
      chain: 'ethereum',
      authSig: null,
    });
  } catch (err) {
    throw new Error(`When decrypting key to a single node - ${err.message}`);
  }
}
