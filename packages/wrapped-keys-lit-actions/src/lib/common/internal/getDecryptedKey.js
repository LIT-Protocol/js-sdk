/* global Lit */

export async function getDecryptedKey({
  accessControlConditions,
  ciphertext,
  dataToEncryptHash,
}) {
  try {
    // May be undefined, since we're using `decryptToSingleNode`
    const privateKey = await Lit.Actions.decryptToSingleNode({
      accessControlConditions,
      ciphertext,
      dataToEncryptHash,
      chain: 'ethereum',
      authSig: null,
    });

    return privateKey;
  } catch (err) {
    throw new Error('When decrypting key to a single node - ' + err.message);
  }
}
