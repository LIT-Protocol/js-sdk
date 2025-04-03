import { ed25519 } from '@noble/curves/ed25519';
import { ethers } from 'ethers';
import { joinSignature } from 'ethers/lib/utils';

import { SigShare } from '@lit-protocol/types';

import {
  combineEcdsaShares,
  generateSessionKeyPair,
  publicKeyCompress,
} from './crypto';

describe('generateSessionKeyPair', () => {
  it('generates a valid key pair where secretKey contains the publicKey', () => {
    const sessionKeyPair = generateSessionKeyPair();

    const publicKeyBytes = ethers.utils.arrayify(
      '0x' + sessionKeyPair.publicKey
    );
    const secretKeyBytes = ethers.utils.arrayify(
      '0x' + sessionKeyPair.secretKey
    );

    expect(secretKeyBytes.length).toBe(64);
    expect(publicKeyBytes.length).toBe(32);

    const derivedPublicKeyFromSecret = secretKeyBytes.slice(32);
    expect(derivedPublicKeyFromSecret).toEqual(publicKeyBytes);
  });

  it('derives public key from secret key', () => {
    const sessionKeyPair = generateSessionKeyPair();

    const publicKeyBytes = ethers.utils.arrayify(
      '0x' + sessionKeyPair.publicKey
    );
    const secretKeyBytes = ethers.utils.arrayify(
      '0x' + sessionKeyPair.secretKey
    );

    const privateKeySeed = secretKeyBytes.slice(0, 32);

    const derivedPublicKey = ed25519.getPublicKey(privateKeySeed);

    expect(derivedPublicKey).toEqual(publicKeyBytes);
  });
});

describe('combine ECDSA Shares', () => {
  it('Should recombine ECDSA signature shares', async () => {
    const sigShares: SigShare[] = [
      {
        sigType: 'ECDSA_CAIT_SITH' as const,
        signatureShare:
          'BC8108AD9CAE8358942BB4B27632B87FFA705CCB675F85A59847CC1B84845A38',
        bigR: '03E6D15C805443F57F57E180C730C2FCA5297F7671E8148A669410808AB4D70122',
        publicKey:
          '03AECABDF2EDC1194BED6FE9650F08D109C77D2526236EA3F6C20F88E0675643BC',
        dataSigned:
          '90AB86E6389AA65B56D701E36EEECD786242405C792ED863C395FA7C55E517A4',
        sigName: 'sig',
      },
      {
        sigType: 'K256' as const,
        signatureShare:
          'BA77EB500884A60583DEA49578D4BB64BB55EF497F37C88DF935D739CE8E0A9F',
        bigR: '03E6D15C805443F57F57E180C730C2FCA5297F7671E8148A669410808AB4D70122',
        publicKey:
          '03AECABDF2EDC1194BED6FE9650F08D109C77D2526236EA3F6C20F88E0675643BC',
        dataSigned:
          '90AB86E6389AA65B56D701E36EEECD786242405C792ED863C395FA7C55E517A4',
        sigName: 'sig',
      },
      {
        sigType: 'ECDSA_CAIT_SITH' as const,
        signatureShare:
          'EF850AE61B6D658976B2560B880BF03ABC1A070BACDEAE2311781F65A524F245',
        bigR: '03E6D15C805443F57F57E180C730C2FCA5297F7671E8148A669410808AB4D70122',
        publicKey:
          '03AECABDF2EDC1194BED6FE9650F08D109C77D2526236EA3F6C20F88E0675643BC',
        dataSigned:
          '90AB86E6389AA65B56D701E36EEECD786242405C792ED863C395FA7C55E517A4',
        sigName: 'sig',
      },
    ];

    const sig = await combineEcdsaShares(sigShares);
    expect(sig.r).toBeDefined();
    expect(sig.s).toBeDefined();
    expect(sig.recid).toBeDefined();

    const sigRes = joinSignature({
      r: '0x' + sig.r,
      s: '0x' + sig.s,
      v: sig.recid,
    });

    const msg = ethers.utils.arrayify('0x' + sigShares[0].dataSigned);
    const recoveredPk = ethers.utils.recoverPublicKey(msg, sigRes);

    // normalize the public keys to addresses and compare
    const addr = ethers.utils.computeAddress(
      ethers.utils.arrayify('0x' + sigShares[0].publicKey)
    );
    const recoveredAddr = ethers.utils.computeAddress(
      ethers.utils.arrayify(recoveredPk)
    );
    expect(recoveredAddr).toEqual(addr);
  });
});

describe('publicKeyCompress', () => {
  const COMPRESSED_PUBLIC_KEY_HEX =
    '03bc0a563a9ddaf097ef31c3e936dda312acdbe2504953f0ea4ecb94ee737237df';
  const COMPRESSED_PUBLIC_KEY = Buffer.from(COMPRESSED_PUBLIC_KEY_HEX, 'hex');

  const UNCOMPRESSED_PUBLIC_KEY_HEX =
    '04bc0a563a9ddaf097ef31c3e936dda312acdbe2504953f0ea4ecb94ee737237dfa2be4f2e38de7540ae64cf362b897d0f93567adc23ce0abc997c18edd269d73b';
  const UNCOMPRESSED_PUBLIC_KEY = Buffer.from(
    UNCOMPRESSED_PUBLIC_KEY_HEX,
    'hex'
  );

  it('should return the same compressed key when already compressed', () => {
    const result = publicKeyCompress(COMPRESSED_PUBLIC_KEY);
    expect(result).toEqual(COMPRESSED_PUBLIC_KEY);
  });

  it('should compress an uncompressed public key correctly', () => {
    const result = publicKeyCompress(UNCOMPRESSED_PUBLIC_KEY);
    expect(result).toEqual(COMPRESSED_PUBLIC_KEY);
  });

  it('should throw an error for invalid key length', () => {
    const invalidKey = Buffer.from('1234567890abcdef', 'hex'); // 8 bytes only
    expect(() => publicKeyCompress(invalidKey)).toThrow(
      'Invalid public key length. Expected 33 (compressed) or 65 (uncompressed) bytes.'
    );
  });

  it('should throw an error if uncompressed key does not start with 0x04', () => {
    // Create a 65-byte buffer with an invalid prefix (not 0x04)
    const invalidUncompressed = Buffer.alloc(65, 0);
    invalidUncompressed[0] = 0x05;
    expect(() => publicKeyCompress(invalidUncompressed)).toThrow(
      'Invalid uncompressed public key format: does not start with 0x04.'
    );
  });
});
