/// <reference types="jest" />

import { ethers } from 'ethers';
import {
  messageHex,
  presignatureHex,
  publicKeyHex,
  signatureSharesHex,
} from './ecdsa-data.spec.json';
import { ecdsaCombine, ecdsaDeriveKey, init } from './ng';

const publicKey = Buffer.from(publicKeyHex, 'hex');
const uncompressedPublicKey = ethers.utils.computePublicKey(publicKey);
const presignature = Buffer.from(presignatureHex, 'hex');
const signatureShares = signatureSharesHex.map((s) => Buffer.from(s, 'hex'));
const message = Buffer.from(messageHex, 'hex');

describe('ECDSA', () => {
  beforeEach(async () => {
    await init();
  });

  it('should combine signatures', () => {
    const signature = ecdsaCombine('K256', presignature, signatureShares);
    expect(signature).toBeInstanceOf(Uint8Array);
    expect(ethers.utils.recoverPublicKey(message, signature)).toEqual(
      uncompressedPublicKey
    );
  });

  it('should derive keys', () => {
    const identity = Buffer.from('test', 'ascii');
    const derivedKey = ecdsaDeriveKey('K256', identity, [publicKey, publicKey]);

    expect(derivedKey).toBeInstanceOf(Uint8Array);
    expect(Buffer.from(derivedKey)).toEqual(
      Buffer.from(
        '0440b3dc3caa60584ad1297bc843075b30b04139bcc438a04401ed45d78526faac7fe86c033f34cac09959e1b7ad6e940028e0ed26277f5da454f9432ba7a02a8d',
        'hex'
      )
    );
  });
});
