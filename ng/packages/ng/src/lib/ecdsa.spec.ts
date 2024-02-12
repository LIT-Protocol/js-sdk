/// <reference types="jest" />

import { ethers } from 'ethers';
import {
  bigR,
  dataSigned,
  publicKey as publicKeyHex,
  signatureShares,
} from './ecdsa-data.spec.json';
import { ecdsaCombine, ecdsaDeriveKey, init } from './ng';

describe('ECDSA', () => {
  beforeEach(async () => {
    await init();
  });

  it('should combine signatures', () => {
    const publicKey = Buffer.from(publicKeyHex, 'hex');
    const R = Buffer.from(bigR, 'hex');
    const s = ecdsaCombine(
      'K256',
      signatureShares.map((s) => Buffer.from(s, 'hex'))
    );
    expect(s).toBeInstanceOf(Uint8Array);

    const sig = Buffer.concat([
      Uint8Array.prototype.slice.call(R, 1),
      s,
      new Uint8Array(R[0] === 0x03 ? [1] : [0]),
    ]);
    const msg = Buffer.from(dataSigned, 'hex');

    const recoveredPublicKey = ethers.utils.recoverPublicKey(msg, sig);

    // TODO(cairomassimo): recoveredPublicKey is uncompressed, otherwise the check would work
    // expect(recoveredPublicKey).toEqual(ethers.utils.hexlify(publicKey));

    const addr = ethers.utils.computeAddress(publicKey);
    const recoveredAddr = ethers.utils.computeAddress(recoveredPublicKey);
    expect(recoveredAddr).toEqual(addr);
  });

  it('should derive keys', () => {
    const publicKey = Buffer.from(publicKeyHex, 'hex');
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
