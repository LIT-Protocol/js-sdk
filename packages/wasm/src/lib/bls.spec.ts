import { describe, expect, it } from '@jest/globals';
import { blsCombine, blsDecrypt, blsEncrypt, blsVerify } from '..';

const blsRootkeyHexBuffer = Buffer.from("99becf3f854c2073b06e4bdb5653f72d0b37615eb12e8e64d58db25568cbff66de804b9af7f90be4c87884adab52c50b", 'hex');
const messageBase64Buffer = Buffer.from("8Be5Blchrdg1VFCHvhA6VWFLA8DXUtkFKEEC1iixNZY=", 'base64');
const signatureShareJSONStrings = [
  "{\"ProofOfPossession\":{\"identifier\":\"7acf36f7be1c2c7143708cb6e8b55700f51417f060e948b71859f03628110027\",\"value\":\"8b5c1c0bab3e75adb7d1f2bb7233d62425b2ea3c10b74a368535b541b839a46708899a96538c4b2b84f4acb69d4729c3067b692e193087c99b75ce66820d747cffd465224b3b077413254511ab5c27e8561f64512c7d3c0d36f2764c0dbf15d1\"}}",
  "{\"ProofOfPossession\":{\"identifier\":\"7d73445245e6e45fc0bdc707ee151466c0052f7d31aca69fb6f9f621bbf2d525\",\"value\":\"aaa72a0cf895de2d355131a2044c602b14c7d5a86d890538ec15892a73d44de22be8cd3afabd91e73d93a558d27fc10a19ab372e2a237ac4ca0589e4b63a957392d90deffc8e17c8523febff7ab5ff9e2b5d0c2443664d54b33e31d4719d846f\"}}",
];

const oldFormattedSignatureShareJSONStrings = [
  "{\"ProofOfPossession\":\"028b5c1c0bab3e75adb7d1f2bb7233d62425b2ea3c10b74a368535b541b839a46708899a96538c4b2b84f4acb69d4729c3067b692e193087c99b75ce66820d747cffd465224b3b077413254511ab5c27e8561f64512c7d3c0d36f2764c0dbf15d1\"}",
  "{\"ProofOfPossession\":\"03aaa72a0cf895de2d355131a2044c602b14c7d5a86d890538ec15892a73d44de22be8cd3afabd91e73d93a558d27fc10a19ab372e2a237ac4ca0589e4b63a957392d90deffc8e17c8523febff7ab5ff9e2b5d0c2443664d54b33e31d4719d846f\"}",
];

// The hash of the private data
// <resource>://<hashOfAccs>/<hashOfPrivateData>
const identityParamsUtf8Buffer = Buffer.from("lit-accesscontrolcondition://998a67a9f2a362bd00a884bb7ac1252a470c7396fdd877a3d9a51c96fbf3ea63/64ec88ca00b268e5ba1a35678a1b5316d212f4f366b2477232534a8aeca37f3c", 'utf8');

const cipherText = Buffer.from("gde2ccRMkMpC42544vHngsOG2Wdl5a7IpeTNmq+h0FKzVargGrOWToM48pc02EtHXSyewu8Khrr1YlF+l4xo4pR2tApEnIYp/22zQgS2LvcgURe9pbcLeJ57fsxsdbrmMQVgg6hPcqbmWT4tU0+7KTAC", 'base64');

describe('BLS', () => {
  it('should encrypt', async () => {
    const ciphertext = await blsEncrypt(
      'Bls12381G2',
      blsRootkeyHexBuffer,
      messageBase64Buffer,
      identityParamsUtf8Buffer
    );
    expect(ciphertext).toBeInstanceOf(Uint8Array);
    expect(ciphertext.byteLength).toEqual(115);
  });

  it('should combine signatures', async () => {
    const combinedSignature = await blsCombine(signatureShareJSONStrings);
    expect(combinedSignature.length).toEqual(192);
  });

  describe('old format', () => {
    it('should combine signatures', async () => {
      const combinedSignature = await blsCombine(oldFormattedSignatureShareJSONStrings);
      expect(combinedSignature.length).toEqual(192);
    });

    it("should combine and verify", async () => {
      const combinedSignature = await blsCombine(oldFormattedSignatureShareJSONStrings);

      // Should not throw if verification succeeds
      await expect(blsVerify(
        'Bls12381G2',
        blsRootkeyHexBuffer,
        identityParamsUtf8Buffer,
        combinedSignature
      )).resolves.toBeUndefined();
    });

    it('should decrypt', async () => {
      const decryptedMessageBuffer = await blsDecrypt(
        'Bls12381G2',
        cipherText,
        oldFormattedSignatureShareJSONStrings
      );

      // convert to base64
      const decryptedMessage = Buffer.from(decryptedMessageBuffer).toString('utf-8');
      expect(decryptedMessage).toEqual('Hello world');
    });
  });

  describe('new format', () => {
    it('should combine signatures', async () => {
      const combinedSignature = await blsCombine(signatureShareJSONStrings);
      expect(combinedSignature.length).toEqual(192);
    });

    it("should combine and verify", async () => {
      const combinedSignature = await blsCombine(signatureShareJSONStrings);

      // Should not throw if verification succeeds
      await expect(blsVerify(
        'Bls12381G2',
        blsRootkeyHexBuffer,
        identityParamsUtf8Buffer,
        combinedSignature
      )).resolves.toBeUndefined();
    })

    it('should decrypt', async () => {
      const decryptedMessageBuffer = await blsDecrypt(
        'Bls12381G2',
        cipherText,
        signatureShareJSONStrings
      );

      const decryptedMessage = Buffer.from(decryptedMessageBuffer).toString('utf-8');
      expect(decryptedMessage).toEqual('Hello world');
    });
  });
});