/// <reference types="jest" />

import * as fs from 'node:fs';
import { init, sevSnpGetVcekUrl, sevSnpVerify } from './ng';
import {
  attestation,
  challenge as challengeHex,
  vcekUrl,
} from './sev-snp.spec/data.json';

const data = Object.fromEntries(
  Object.entries(attestation.data).map(([key, value]) => [
    key,
    Buffer.from(value, 'base64'),
  ])
);
const signatures = attestation.signatures.map((s) => Buffer.from(s, 'base64'));
const challenge = Buffer.from(challengeHex, 'hex');
const report = Buffer.from(attestation.report, 'base64');
const vcek = fs.readFileSync(`${__dirname}/sev-snp.spec/vcek.crt`);

describe('ng sev-snp', () => {
  beforeEach(async () => {
    await init();
  });

  it('should get the vcek url', async () => {
    expect(sevSnpGetVcekUrl(report)).toEqual(vcekUrl);
  });

  it('should verify attestation reports', async () => {
    sevSnpVerify(report, data, signatures, challenge, vcek);
  });

  it('should reject invalid vcek', async () => {
    const vcek2 = Buffer.from(vcek);
    vcek2[vcek2.length - 1] ^= 0x01;
    expect(() =>
      sevSnpVerify(report, data, signatures, challenge, vcek2)
    ).toThrow();
  });

  it('should reject wrong vcek', async () => {
    const vcek2 = fs.readFileSync(`${__dirname}/sev-snp.spec/vcek2.crt`);
    expect(() =>
      sevSnpVerify(report, data, signatures, challenge, vcek2)
    ).toThrow();
  });

  it('should reject extra data', async () => {
    const data2 = Object.fromEntries([...Object.entries(data), ['a', Buffer.alloc(0)]]);
    expect(() =>
      sevSnpVerify(report, data2, signatures, challenge, vcek)
    ).toThrow();
  });

  it('should reject missing data', async () => {
    const data2 = Object.fromEntries([...Object.entries(data)].slice(0, -1));
    expect(() =>
      sevSnpVerify(report, data2, signatures, challenge, vcek)
    ).toThrow();
  });

  it('should reject wrong challenge', async () => {
    const challenge2 = Buffer.from(challenge);
    challenge2[0] ^= 0x01;
    expect(() =>
      sevSnpVerify(report, data, signatures, challenge2, vcek)
    ).toThrow();
  });
});
