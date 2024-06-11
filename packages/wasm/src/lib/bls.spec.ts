// TODO(cairomassimo): move the data into a separate file

import { blsCombine, blsDecrypt, blsEncrypt, blsVerify } from '..';

import {
  ciphertextBase64,
  identityHex,
  messageBase64,
  publicKeyHex,
  signatureHex,
  signatureSharesHex,
} from './bls-data.spec.json';

const publicKey = Buffer.from(publicKeyHex, 'hex');
const identity = Buffer.from(identityHex, 'hex');
const signatureShares = signatureSharesHex.map((s) => Buffer.from(s, 'hex'));
const message = Buffer.from(messageBase64, 'base64');
const signature = Buffer.from(signatureHex, 'hex');
const ciphertext = Buffer.from(ciphertextBase64, 'base64');

describe('BLS', () => {
  it('should encrypt', async () => {
    await blsEncrypt('Bls12381G2', publicKey, message, identity);
  });

  it('should combine signatures, verify and decrypt', async () => {
    const combinedSignature = await blsCombine('Bls12381G2', signatureShares);
    blsVerify('Bls12381G2', publicKey, identity, signature);
    const decryptedMessage = await blsDecrypt(
      'Bls12381G2',
      ciphertext,
      combinedSignature
    );

    expect(combinedSignature).toBeInstanceOf(Uint8Array);
    expect(Buffer.from(combinedSignature)).toEqual(signature);
    expect(decryptedMessage).toBeInstanceOf(Uint8Array);
    expect(Buffer.from(decryptedMessage)).toEqual(message);
  });
});
