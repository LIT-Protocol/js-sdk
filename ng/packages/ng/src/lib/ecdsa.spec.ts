/// <reference types="jest" />

import { ethers } from 'ethers';
import {
  bigR,
  dataSigned,
  publicKey as publicKeyHex,
  signatureShares,
} from './ecdsa-data.spec.json';
import { ecdsaK256Combine, init } from './ng';

describe('ECDSA', () => {
  beforeEach(async () => {
    await init();
  });

  it('should combine signatures', () => {
    const publicKey = Buffer.from(publicKeyHex, 'hex');
    const R = Buffer.from(bigR, 'hex');
    const s = ecdsaK256Combine(
      signatureShares.map((s) => Buffer.from(s, 'hex'))
    );

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
});
