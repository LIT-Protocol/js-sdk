import { frostAggregate, frostVerify, FrostVariant } from '..';

import {
  variant,
  messageHex,
  verifyingKeyHex,
  shares,
  signatureHex,
} from './frost-data.spec.json';

const frostVariant = variant as FrostVariant;
const message = Buffer.from(messageHex, 'hex');
const verifyingKey = Buffer.from(verifyingKeyHex, 'hex');
const signature = Buffer.from(signatureHex, 'hex');

describe('FROST', () => {
  it('should aggregate signatures', async () => {
    const identifiers = [] as Uint8Array[];
    const signingCommitments = [] as Uint8Array[];
    const signatureShares = [] as Uint8Array[];
    const signerPublicKeys = [] as Uint8Array[];

    shares.forEach((share) => {
      identifiers.push(Buffer.from(share.identifierHex, 'hex'));
      signingCommitments.push(Buffer.from(share.signingCommitmentHex, 'hex'));
      signatureShares.push(Buffer.from(share.signatureShareHex, 'hex'));
      signerPublicKeys.push(Buffer.from(share.verifyingShareHex, 'hex'));
    });

    const [scheme, aggregatedSignature] = await frostAggregate(
      frostVariant,
      message,
      identifiers,
      signingCommitments,
      signatureShares,
      signerPublicKeys,
      verifyingKey
    );
    expect(scheme).toBe(frostVariant);
    expect(Buffer.from(aggregatedSignature).toString('hex')).toBe(signatureHex);
  });

  it('should verify signature', async () => {
    await frostVerify(message, verifyingKey, [frostVariant, signature]);
  });
});
