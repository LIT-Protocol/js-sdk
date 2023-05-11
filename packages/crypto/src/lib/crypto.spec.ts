import { initWasmEcdsaSdk } from '@lit-protocol/ecdsa-sdk';
import {
  generateSymmetricKey,
  encryptWithSymmetricKey,
  decryptWithSymmetricKey,
  importSymmetricKey,
  combineEcdsaShares,
} from './crypto';
import { SigShare } from '@lit-protocol/types';
import * as ethers from 'ethers';
import { joinSignature } from 'ethers/lib/utils';

describe('crypto', () => {
  it('should generateSymmetricKey', async () => {
    const symmetricKey = await generateSymmetricKey();

    expect(symmetricKey).toBeDefined();
    expect(symmetricKey.algorithm.name).toBe('AES-CBC');
    expect(symmetricKey.type).toBe('secret');
    expect(symmetricKey.extractable).toBe(true);
    expect(symmetricKey.usages).toEqual(['encrypt', 'decrypt']);
  });

  it('should import a valid symmetric key from raw bytes', async () => {
    const symmetricKey = await generateSymmetricKey();
    const exportedKey = await crypto.subtle.exportKey('raw', symmetricKey);
    const importedKey = await importSymmetricKey(exportedKey as ArrayBuffer);

    expect(importedKey).toBeDefined();
    expect(importedKey.algorithm.name).toBe('AES-CBC');
    expect(importedKey.type).toBe('secret');
    expect(importedKey.extractable).toBe(true);
    expect(importedKey.usages).toEqual(['encrypt', 'decrypt']);
  });

  it('should import the same symmetric key if given the same raw bytes', async () => {
    const symmetricKey = await generateSymmetricKey();
    const exportedKey = await crypto.subtle.exportKey('raw', symmetricKey);
    const importedKey1 = await importSymmetricKey(exportedKey as ArrayBuffer);
    const importedKey2 = await importSymmetricKey(exportedKey as ArrayBuffer);

    const exportedKey1 = await crypto.subtle.exportKey('raw', importedKey1);
    const exportedKey2 = await crypto.subtle.exportKey('raw', importedKey2);

    expect(exportedKey1).toEqual(exportedKey2);
  });
});

describe('encryptWithSymmetricKey', () => {
  // Helper function to generate random data
  const generateRandomData = (length: number): Uint8Array => {
    return crypto.getRandomValues(new Uint8Array(length));
  };

  // Generate test data of various sizes
  const testData = [
    generateRandomData(16),
    generateRandomData(32),
    generateRandomData(64),
    generateRandomData(128),
    generateRandomData(256),
    generateRandomData(512),
    generateRandomData(1024),
    generateRandomData(2048),
    generateRandomData(4096),
    generateRandomData(8192),
  ];

  let symmetricKey: CryptoKey;

  beforeAll(async () => {
    symmetricKey = await generateSymmetricKey();
  });

  testData.forEach((data, index) => {
    it(`should encrypt data (test case ${index + 1})`, async () => {
      const encryptedBlob = await encryptWithSymmetricKey(symmetricKey, data);

      expect(encryptedBlob).toBeDefined();
      expect(encryptedBlob instanceof Blob).toBe(true);
      expect(encryptedBlob.type).toBe('application/octet-stream');
      expect(encryptedBlob.size).toBeGreaterThan(data.length);
    });
  });
});

describe('combine ECDSA Shares', () => {
  beforeAll(async () => {
    await initWasmEcdsaSdk();
  });

  it('Should recombine ECDSA signature shares', async () => {
    /*
          JSON.parse(
        '{ "sig_type": "EcdsaCaitSith", "data_signed": "A591A6D40BF420404A011733CFB7B190D62C65BF0BCDA32B57B277D9AD9F146E", "signature_share": "01C4E0EDD498B14DFE8D87163C39F738B8AC17172B55A6A9518E3704362B4FC1", "share_index": 0, "local_x": "0203899AD2B6B56D65130DDAE01A099D867FDC5DF9219CD1B31A48B03FA0AF05EA", "local_y": "0203899AD2B6B56D65130DDAE01A099D867FDC5DF9219CD1B31A48B03FA0AF05EA", "public_key": "03D589E6B6FF8B611D073F6161E8A8D9A9A737C6B102D284984ACE0F0326073402", "sig_name": "sig1" }'
      ),
      JSON.parse(
        '{ "sig_type": "EcdsaCaitSith", "data_signed": "A591A6D40BF420404A011733CFB7B190D62C65BF0BCDA32B57B277D9AD9F146E", "signature_share": "FE3B1F122B674EB2017278E9C3C608C60202C5CF83F2F9926E4427889A0AF180", "share_index": 0, "local_x": "0203899AD2B6B56D65130DDAE01A099D867FDC5DF9219CD1B31A48B03FA0AF05EA", "local_y": "0203899AD2B6B56D65130DDAE01A099D867FDC5DF9219CD1B31A48B03FA0AF05EA", "public_key": "03D589E6B6FF8B611D073F6161E8A8D9A9A737C6B102D284984ACE0F0326073402", "sig_name": "sig1" }'
      ),
      JSON.parse(
        `{ \"sig_type\": \"EcdsaCaitSith\", \"data_signed\": \"A591A6D40BF420404A011733CFB7B190D62C65BF0BCDA32B57B277D9AD9F146E\", \"signature_share\": \"55EC4AF9F1883B19FF84825CBEBDFD127BC8FBFF48DF6CF705CADC85ACCB3056\", \"share_index\": 0, \"local_x\": \"0203899AD2B6B56D65130DDAE01A099D867FDC5DF9219CD1B31A48B03FA0AF05EA\", \"local_y\": \"0203899AD2B6B56D65130DDAE01A099D867FDC5DF9219CD1B31A48B03FA0AF05EA\", \"public_key\": \"03D589E6B6FF8B611D073F6161E8A8D9A9A737C6B102D284984ACE0F0326073402\", \"sig_name\": \"sig1\" }`
      ),
    */
    const sigShares = [
      {
        sigType:"EcdsaCaitSithK256",
        dataSigned: "A591A6D40BF420404A011733CFB7B190D62C65BF0BCDA32B57B277D9AD9F146E",
        signatureShare:  "01C4E0EDD498B14DFE8D87163C39F738B8AC17172B55A6A9518E3704362B4FC1",
        shareIndex: 0,
        localX: "0203899AD2B6B56D65130DDAE01A099D867FDC5DF9219CD1B31A48B03FA0AF05EA",
        localY: "0203899AD2B6B56D65130DDAE01A099D867FDC5DF9219CD1B31A48B03FA0AF05EA",
        publicKey: "03D589E6B6FF8B611D073F6161E8A8D9A9A737C6B102D284984ACE0F0326073402",
        sigName: "sig1"
      },
      {
        sigType:"EcdsaCaitSithK256",
        dataSigned: "A591A6D40BF420404A011733CFB7B190D62C65BF0BCDA32B57B277D9AD9F146E",
        signatureShare: "FE3B1F122B674EB2017278E9C3C608C60202C5CF83F2F9926E4427889A0AF180",
        shareIndex: 0,
        localX: "0203899AD2B6B56D65130DDAE01A099D867FDC5DF9219CD1B31A48B03FA0AF05EA",
        localY: "0203899AD2B6B56D65130DDAE01A099D867FDC5DF9219CD1B31A48B03FA0AF05EA",
        publicKey: "03D589E6B6FF8B611D073F6161E8A8D9A9A737C6B102D284984ACE0F0326073402",
        sigName: "sig1",
      },
      {
        sigType:"EcdsaCaitSithK256",
        dataSigned: "A591A6D40BF420404A011733CFB7B190D62C65BF0BCDA32B57B277D9AD9F146E",
        signatureShare: "55EC4AF9F1883B19FF84825CBEBDFD127BC8FBFF48DF6CF705CADC85ACCB3056",
        shareIndex: 0,
        localX: "0203899AD2B6B56D65130DDAE01A099D867FDC5DF9219CD1B31A48B03FA0AF05EA",
        localY: "0203899AD2B6B56D65130DDAE01A099D867FDC5DF9219CD1B31A48B03FA0AF05EA",
        publicKey: "03D589E6B6FF8B611D073F6161E8A8D9A9A737C6B102D284984ACE0F0326073402",
        sigName: "sig1",
      }
    ];

    let sig = combineEcdsaShares(sigShares);
    expect(sig.r).toBeDefined();
    expect(sig.s).toBeDefined();
    expect(sig.recid).toBeDefined();

    sig = joinSignature({
      r: '0x' + sig.r,
      s: '0x' + sig.s,
      v: 0 
    });
    let msg: any = ethers.utils.arrayify('0x' + sigShares[0].dataSigned)
    const recoveredPk = ethers.utils.recoverPublicKey(msg, sig);

    
    // recovered keys in address format, currently unmatching.
    const addr = ethers.utils.computeAddress(ethers.utils.arrayify('0x' + sigShares[0].publicKey));
    const recoveredAddr = ethers.utils.computeAddress(ethers.utils.arrayify(recoveredPk)); 
    expect(recoveredAddr).toEqual(addr);


  });
});
