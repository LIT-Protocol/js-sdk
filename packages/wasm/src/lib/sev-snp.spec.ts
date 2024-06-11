/// <reference types="jest" />

import * as fs from 'node:fs';
import { sevSnpGetVcekUrl, sevSnpVerify } from '..';
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

describe('wasm sev-snp', () => {
  it('should get the vcek url', async () => {
    expect(await sevSnpGetVcekUrl(report)).toEqual(vcekUrl);
  });

  it('should verify attestation reports', async () => {
    await sevSnpVerify(report, data, signatures, challenge, vcek);
  });
});
