/// <reference types="jest" />

import {
  messageHex,
  publicKeyHex,
  shares,
  signatureHex,
} from './frost-data.spec.json';
import { frostCombine, frostVerify } from '..';

const message = Buffer.from(messageHex, 'hex');
const publicKey = Buffer.from(publicKeyHex, 'hex');
const signature = Buffer.from(signatureHex, 'hex');

describe('FROST', () => {
  it('should sign and verify', () => {
    const combinedSignature = frostCombine(
      'Ed25519Sha512',
      message,
      publicKey,
      shares.map((s) => Buffer.from(s.identifierHex, 'hex')),
      shares.map((s) => Buffer.from(s.hidingNonceHex, 'hex')),
      shares.map((s) => Buffer.from(s.bindingNonceHex, 'hex')),
      shares.map((s) => Buffer.from(s.signatureShareHex, 'hex')),
      shares.map((s) => Buffer.from(s.verifyingShareHex, 'hex'))
    );
    expect(combinedSignature).toBeInstanceOf(Uint8Array);
    expect(Buffer.from(combinedSignature)).toEqual(signature);

    frostVerify('Ed25519Sha512', message, publicKey, signature);
  });

  it('should reject invalid signatures', () => {
    const invalidSignature = Buffer.from(signature);
    invalidSignature[0] ^= 0x01;
    expect(() =>
      frostVerify('Ed25519Sha512', message, publicKey, invalidSignature)
    ).toThrow();
  });
});
