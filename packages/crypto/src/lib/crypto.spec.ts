import * as ethers from 'ethers';
import { joinSignature } from 'ethers/lib/utils';

import { SigShare } from '@lit-protocol/types';
import { nacl } from '@lit-protocol/nacl';
import { combineEcdsaShares, walletDecrypt, walletEncrypt } from './crypto';

const MOCK_SESSION_SIGS = {
  'http://127.0.0.1:7470': {
    sig: 'fefcd74c2bb2794356a10e62722c2ca4ef47386475ca72865d8dd7cc096fd1715d8b076b29349328e0b13d09f3296768e6b1cbb81e02d2b697b7641984260b01',
    derivedVia: 'litSessionSignViaNacl',
    signedMessage: `{"sessionKey":"6db14e40ab381cf208b39aec31aebb025e7b12f0ceec60519e2b0c191f4fcb3d","resourceAbilityRequests":[{"resource":{"resource":"*","resourcePrefix":"lit-pkp"},"ability":"pkp-signing"},{"resource":{"resource":"*","resourcePrefix":"lit-litaction"},"ability":"lit-action-execution"}],"capabilities":[{"sig":"0x64192b2156f6d60f2c9aed887f5a0c6003afb6cd7a25b94683c74311fe895e8849a178d4edbe9f38cb0d8a3d7d0342b67b521ada92b68f73f0a1e5fa4f33ae751c","derivedVia":"web3.eth.personal.sign","signedMessage":"localhost wants you to sign in with your Ethereum account:\\n0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC\\n\\nThis is a test statement.  You can put anything you want here. I further authorize the stated URI to perform the following actions on my behalf: (1) 'Threshold': 'Execution' for 'lit-litaction://*'. (2) 'Threshold': 'Signing' for 'lit-pkp://*'.\\n\\nURI: lit:session:6db14e40ab381cf208b39aec31aebb025e7b12f0ceec60519e2b0c191f4fcb3d\\nVersion: 1\\nChain ID: 1\\nNonce: 0x4ee32274a45ab4622d49ea0f9bc3984f2a251e7b88320e23e231673efa564280\\nIssued At: 2025-04-09T14:37:09.339Z\\nExpiration Time: 2025-04-10T14:37:09.337Z\\nResources:\\n- urn:recap:eyJhdHQiOnsibGl0LWxpdGFjdGlvbjovLyoiOnsiVGhyZXNob2xkL0V4ZWN1dGlvbiI6W3t9XX0sImxpdC1wa3A6Ly8qIjp7IlRocmVzaG9sZC9TaWduaW5nIjpbe31dfX0sInByZiI6W119","address":"0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC"}],"issuedAt":"2025-04-09T14:37:09.373Z","expiration":"2025-04-10T14:37:09.337Z","nodeAddress":"http://127.0.0.1:7470","maxPrice":"113427455640312821154458202477256070485"}`,
    address: '6db14e40ab381cf208b39aec31aebb025e7b12f0ceec60519e2b0c191f4fcb3d',
    algo: 'ed25519',
  },
  'http://127.0.0.1:7471': {
    sig: 'ec550ae2addd6fbc399ef26158b9cf8b2a1c52240ee60b62c49c8a782c020d0aae5602090029f5a0024f936f0a747d7c007dfecee44bbe99a5cc12dcef7d3309',
    derivedVia: 'litSessionSignViaNacl',
    signedMessage: `{"sessionKey":"6db14e40ab381cf208b39aec31aebb025e7b12f0ceec60519e2b0c191f4fcb3d","resourceAbilityRequests":[{"resource":{"resource":"*","resourcePrefix":"lit-pkp"},"ability":"pkp-signing"},{"resource":{"resource":"*","resourcePrefix":"lit-litaction"},"ability":"lit-action-execution"}],"capabilities":[{"sig":"0x64192b2156f6d60f2c9aed887f5a0c6003afb6cd7a25b94683c74311fe895e8849a178d4edbe9f38cb0d8a3d7d0342b67b521ada92b68f73f0a1e5fa4f33ae751c","derivedVia":"web3.eth.personal.sign","signedMessage":"localhost wants you to sign in with your Ethereum account:\\n0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC\\n\\nThis is a test statement.  You can put anything you want here. I further authorize the stated URI to perform the following actions on my behalf: (1) 'Threshold': 'Execution' for 'lit-litaction://*'. (2) 'Threshold': 'Signing' for 'lit-pkp://*'.\\n\\nURI: lit:session:6db14e40ab381cf208b39aec31aebb025e7b12f0ceec60519e2b0c191f4fcb3d\\nVersion: 1\\nChain ID: 1\\nNonce: 0x4ee32274a45ab4622d49ea0f9bc3984f2a251e7b88320e23e231673efa564280\\nIssued At: 2025-04-09T14:37:09.339Z\\nExpiration Time: 2025-04-10T14:37:09.337Z\\nResources:\\n- urn:recap:eyJhdHQiOnsibGl0LWxpdGFjdGlvbjovLyoiOnsiVGhyZXNob2xkL0V4ZWN1dGlvbiI6W3t9XX0sImxpdC1wa3A6Ly8qIjp7IlRocmVzaG9sZC9TaWduaW5nIjpbe31dfX0sInByZiI6W119","address":"0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC"}],"issuedAt":"2025-04-09T14:37:09.373Z","expiration":"2025-04-10T14:37:09.337Z","nodeAddress":"http://127.0.0.1:7471","maxPrice":"113427455640312821154458202477256070485"}`,
    address: '6db14e40ab381cf208b39aec31aebb025e7b12f0ceec60519e2b0c191f4fcb3d',
    algo: 'ed25519',
  },
  'http://127.0.0.1:7472': {
    sig: '5f4d83f7fc425ebfca85e45fed0799b93ac215c5ae1c7d279217ca70c434eb43db6e282f365d4f4dc7d76494548e33e4cb6e5f8901b5f142e447fc9718589f07',
    derivedVia: 'litSessionSignViaNacl',
    signedMessage: `{"sessionKey":"6db14e40ab381cf208b39aec31aebb025e7b12f0ceec60519e2b0c191f4fcb3d","resourceAbilityRequests":[{"resource":{"resource":"*","resourcePrefix":"lit-pkp"},"ability":"pkp-signing"},{"resource":{"resource":"*","resourcePrefix":"lit-litaction"},"ability":"lit-action-execution"}],"capabilities":[{"sig":"0x64192b2156f6d60f2c9aed887f5a0c6003afb6cd7a25b94683c74311fe895e8849a178d4edbe9f38cb0d8a3d7d0342b67b521ada92b68f73f0a1e5fa4f33ae751c","derivedVia":"web3.eth.personal.sign","signedMessage":"localhost wants you to sign in with your Ethereum account:\\n0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC\\n\\nThis is a test statement.  You can put anything you want here. I further authorize the stated URI to perform the following actions on my behalf: (1) 'Threshold': 'Execution' for 'lit-litaction://*'. (2) 'Threshold': 'Signing' for 'lit-pkp://*'.\\n\\nURI: lit:session:6db14e40ab381cf208b39aec31aebb025e7b12f0ceec60519e2b0c191f4fcb3d\\nVersion: 1\\nChain ID: 1\\nNonce: 0x4ee32274a45ab4622d49ea0f9bc3984f2a251e7b88320e23e231673efa564280\\nIssued At: 2025-04-09T14:37:09.339Z\\nExpiration Time: 2025-04-10T14:37:09.337Z\\nResources:\\n- urn:recap:eyJhdHQiOnsibGl0LWxpdGFjdGlvbjovLyoiOnsiVGhyZXNob2xkL0V4ZWN1dGlvbiI6W3t9XX0sImxpdC1wa3A6Ly8qIjp7IlRocmVzaG9sZC9TaWduaW5nIjpbe31dfX0sInByZiI6W119","address":"0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC"}],"issuedAt":"2025-04-09T14:37:09.373Z","expiration":"2025-04-10T14:37:09.337Z","nodeAddress":"http://127.0.0.1:7472","maxPrice":"113427455640312821154458202477256070485"}`,
    address: '6db14e40ab381cf208b39aec31aebb025e7b12f0ceec60519e2b0c191f4fcb3d',
    algo: 'ed25519',
  },
};

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

describe('walletEncrypt and walletDecrypt', () => {
  it('should encrypt and decrypt a message successfully', async () => {
    // Generate key pairs using the box functionality
    const aliceKeyPair = nacl.box.keyPair();
    const bobKeyPair = nacl.box.keyPair();

    console.log('aliceKeyPair', aliceKeyPair);
    console.log('bobKeyPair', bobKeyPair);

    // Message to encrypt
    const message = new TextEncoder().encode('This is a secret message');

    // Alice encrypts a message for Bob
    const encryptedPayload = await walletEncrypt(
      aliceKeyPair.secretKey,
      bobKeyPair.publicKey,
      MOCK_SESSION_SIGS['http://127.0.0.1:7470'],
      message
    );

    console.log('encryptedPayload', encryptedPayload);

    // Verify payload structure
    expect(encryptedPayload).toHaveProperty('V1');
    expect(encryptedPayload.V1).toHaveProperty('verification_key');
    expect(encryptedPayload.V1).toHaveProperty('ciphertext_and_tag');
    expect(encryptedPayload.V1).toHaveProperty('session_signature');
    expect(encryptedPayload.V1).toHaveProperty('random');
    expect(encryptedPayload.V1).toHaveProperty('created_at');

    // Bob decrypts the message from Alice
    const decryptedMessage = await walletDecrypt(
      bobKeyPair.secretKey,
      encryptedPayload
    );

    // Verify decryption was successful
    expect(decryptedMessage).not.toBeNull();
    expect(new TextDecoder().decode(decryptedMessage as Uint8Array)).toBe(
      'This is a secret message'
    );
  });

  it('should return null when decryption fails', async () => {
    // Generate key pairs
    const aliceKeyPair = nacl.box.keyPair();
    const bobKeyPair = nacl.box.keyPair();
    const eveKeyPair = nacl.box.keyPair(); // Eve is an eavesdropper

    // Message to encrypt
    const message = new TextEncoder().encode('This is a secret message');

    // Alice encrypts a message for Bob
    const encryptedPayload = await walletEncrypt(
      aliceKeyPair.secretKey,
      bobKeyPair.publicKey,
      MOCK_SESSION_SIGS['http://127.0.0.1:7470'],
      message
    );

    // Eve tries to decrypt the message with her key (should fail)
    const decryptedByEve = await walletDecrypt(
      eveKeyPair.secretKey,
      encryptedPayload
    );

    // Verify decryption failed
    expect(decryptedByEve).toBeNull();
  });

  it('should handle tampering with the encrypted payload', async () => {
    // Generate key pairs
    const aliceKeyPair = nacl.box.keyPair();
    const bobKeyPair = nacl.box.keyPair();

    // Message to encrypt
    const message = new TextEncoder().encode('This is a secret message');

    // Alice encrypts a message for Bob
    const encryptedPayload = await walletEncrypt(
      aliceKeyPair.secretKey,
      bobKeyPair.publicKey,
      MOCK_SESSION_SIGS['http://127.0.0.1:7470'],
      message
    );

    // Tamper with the ciphertext
    const tamperedPayload = {
      ...encryptedPayload,
      V1: {
        ...encryptedPayload.V1,
        ciphertext_and_tag:
          encryptedPayload.V1.ciphertext_and_tag.substring(0, 10) +
          'ff' +
          encryptedPayload.V1.ciphertext_and_tag.substring(12),
      },
    };

    // Bob tries to decrypt the tampered message
    const decryptedTamperedMessage = await walletDecrypt(
      bobKeyPair.secretKey,
      tamperedPayload
    );

    // Verify decryption failed due to tampering
    expect(decryptedTamperedMessage).toBeNull();
  });
});
