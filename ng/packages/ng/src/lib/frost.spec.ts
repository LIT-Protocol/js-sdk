/// <reference types="jest" />

import {
  signatureHex,
  messageHex,
  publicKeyHex,
  shares,
} from './frost-data.spec.json';
import { frostEd25519Combine, frostEd25519Verify, init } from './ng';

const message = Buffer.from(messageHex, 'hex');
const publicKey = Buffer.from(publicKeyHex, 'hex');
const signature = Buffer.from(signatureHex, 'hex');

describe('FROST', () => {
  beforeEach(async () => {
    await init();
  });

  it('should sign and verify', () => {
    expect(
      Buffer.from(
        frostEd25519Combine(
          message,
          publicKey,
          shares.map((s) => Buffer.from(s.identifierHex, 'hex')),
          shares.map((s) => Buffer.from(s.hidingNonceHex, 'hex')),
          shares.map((s) => Buffer.from(s.bindingNonceHex, 'hex')),
          shares.map((s) => Buffer.from(s.signatureShareHex, 'hex')),
          shares.map((s) => Buffer.from(s.verifyingShareHex, 'hex'))
        )
      )
    ).toEqual(signature);

    frostEd25519Verify(message, publicKey, signature);
  });


  it('should reject invalid signatures', () => {
    const invalidSignature = Buffer.from(signature);
    invalidSignature[0] ^= 0x01;
    expect(() => frostEd25519Verify(message, publicKey, invalidSignature)).toThrow();
  });
});
