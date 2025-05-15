// Test Command: node 'node_modules/.bin/jest' './packages/wasm/src/lib/bls.spec.ts' -c './packages/wasm/jest.config.ts'
import { describe, expect, it } from '@jest/globals';
import {
  blsCombine,
  blsDecrypt,
  blsEncrypt,
  BlsSignatureShareJsonString,
  blsVerify,
} from '..';

const blsRootkeyHexBuffer = Buffer.from(
  '8acb0d87dcd4fc8ecb971690b5aa28ed74b205ae449dbb558729c7cff87eec278a6959eb3ee3c03366e0eabac42db3e4',
  'hex'
);
const messageBase64Buffer = Buffer.from(
  '8Be5Blchrdg1VFCHvhA6VWFLA8DXUtkFKEEC1iixNZY=',
  'base64'
);

const signatureShareJSONStrings = [
  '{"ProofOfPossession":{"identifier":"0d7c3c5d7578af7d20cb3d52059de204b07eb164092c8107df3914d4bfabe647","value":"a2204142962f7d35b2e18f16f5880e0092a3765e3b595ea437687cd88a04916dcfc2fd55b43f335949e2023071153abf0bfbc28b46ec13a3790c2639a2f40b517c2358996c31e11669f24442c650faaf4af166dde3c325fe9565ecf6872c85b4"}}',
  '{"ProofOfPossession":{"identifier":"46cd21a0d05fdd76f0640d4d9353c297eec75d7644723da318a9bfe19f9c2863","value":"a74ba6452138869712fb7a9c109fc6bda1b587f046adc9b23289f6aadefb127dbb2ec3667c23ce40f0447405bcd19bed04cdd046166d6726b60e342dafdfeca21e0d2e15ad23d11c2b7785d7790278929a974ed02f892169e4a7e4fd99781790"}}',
  '{"ProofOfPossession":{"identifier":"d5595f162d312545ea6d58efa6a9430801f229b0a088dab8267f8b722da5d658","value":"845bdefd8aa0ca99bd587062253eb6bbabbe55153ecaeb52c6ac9d29b29f2d2fd9d9a9e193fdd3bb1b23e9f31dff290d0dc9a1aab8c74f78f99add32e49b3fd9b7626f12dc852d442978c70fd3e684638d782e4aeca1981ce80fb03d64f46563"}}',
] as BlsSignatureShareJsonString[];

const identityParamsUtf8Buffer = Buffer.from([
  108, 105, 116, 45, 97, 99, 99, 101, 115, 115, 99, 111, 110, 116, 114, 111,
  108, 99, 111, 110, 100, 105, 116, 105, 111, 110, 58, 47, 47, 97, 53, 52, 53,
  99, 56, 57, 57, 101, 51, 55, 57, 57, 55, 102, 48, 98, 48, 57, 52, 97, 102, 98,
  53, 99, 48, 102, 57, 52, 98, 54, 48, 52, 100, 56, 51, 50, 56, 100, 57, 51, 52,
  57, 100, 57, 55, 97, 50, 50, 49, 57, 56, 51, 49, 100, 101, 56, 98, 48, 97, 52,
  50, 48, 53, 47, 54, 52, 101, 99, 56, 56, 99, 97, 48, 48, 98, 50, 54, 56, 101,
  53, 98, 97, 49, 97, 51, 53, 54, 55, 56, 97, 49, 98, 53, 51, 49, 54, 100, 50,
  49, 50, 102, 52, 102, 51, 54, 54, 98, 50, 52, 55, 55, 50, 51, 50, 53, 51, 52,
  97, 56, 97, 101, 99, 97, 51, 55, 102, 51, 99,
]);

describe('BLS', () => {
  it('should encrypt', async () => {
    const ciphertext = await blsEncrypt(
      blsRootkeyHexBuffer,
      messageBase64Buffer,
      identityParamsUtf8Buffer
    );
    console.log('ciphertext:', ciphertext);
    expect(ciphertext).toBeInstanceOf(Uint8Array);
    expect(ciphertext.byteLength).toEqual(115);
  });

  it('should combine signatures', async () => {
    const combinedSignature = await blsCombine(signatureShareJSONStrings);
    expect(combinedSignature.length).toEqual(192);
  });

  it('should combine and verify', async () => {
    const combinedSignature = await blsCombine(signatureShareJSONStrings);

    const toSignUint8Array = [
      94, 92, 103, 65, 185, 206, 89, 188, 160, 211, 160, 232, 203, 51, 92, 235,
      243, 181, 232, 115, 244, 199, 191, 119, 121, 130, 217, 182, 185, 151, 37,
      32,
    ];

    const toSignString = Buffer.from(toSignUint8Array);

    await expect(
      blsVerify(blsRootkeyHexBuffer, toSignString, combinedSignature)
    ).resolves.toBeUndefined();
  });

  it('should decrypt', async () => {
    const cipherTextBase64 = Buffer.from(
      'kyQOLL1FMmXIw3JHeEhuIj2o4NjUqEAnA/Fnrwiw2Ax/gWe8Wwm0CBnjbkOn/mMXVAVGUrjEcbLzMTnecWtGly1v77RST6Ml2YN0pYeraRUgrQil+Kk9GJwnI6oLI/ur7OI8iUcOeKrte5RbIBnyGTQC',
      'base64'
    );

    const jsonShares = [
      '{"ProofOfPossession":{"identifier":"d5595f162d312545ea6d58efa6a9430801f229b0a088dab8267f8b722da5d658","value":"8008e93c8117f8271eeb576fba9ef362f4716bc821dfd93fa1f05ec6c16c26ac7d79be025c88b2c416af29436867cc8c18504ab30c01ae0631283ad8cde538aa512d13b700329d8b012cc510e9a960825639c8f35c5b4628e4b3301d729a38fa"}}',
      '{"ProofOfPossession":{"identifier":"0d7c3c5d7578af7d20cb3d52059de204b07eb164092c8107df3914d4bfabe647","value":"b7604b06da87f14b59022fab6eaa94e21a55c1bc4a341de8321088077981c1145c566b1aefefb491a501be56d70ca41e134a8a40e83ce57d566921797b0b272fb4d1292bf84d8ac75a7015fc35ab1ab5a1a0f8a7eb059dc643a168463486e293"}}',
      '{"ProofOfPossession":{"identifier":"46cd21a0d05fdd76f0640d4d9353c297eec75d7644723da318a9bfe19f9c2863","value":"b604bf22318ffb9c8181fdd156f705a81e5c6366cf1ccdacb69f4020043d8957b7d2662fe17193b0cd83c604181fa3cc159de6d75bc5cc443ba3254db2b969dc16d13e07fc4cdcc72921721d9f334664978b972d5b07816c5abbdab076bf82b5"}}',
    ] as BlsSignatureShareJsonString[];

    const decryptedMessageBuffer = await blsDecrypt(
      cipherTextBase64,
      jsonShares
    );

    const decryptedMessage = Buffer.from(decryptedMessageBuffer).toString(
      'utf-8'
    );
    expect(decryptedMessage).toEqual('Hello world');
  });
});
