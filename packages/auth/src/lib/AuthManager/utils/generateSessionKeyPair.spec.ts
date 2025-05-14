import { generateSessionKeyPair } from '@lit-protocol/crypto';
import { ed25519 } from '@noble/curves/ed25519';
import { hexToBytes } from '@noble/hashes/utils';

describe('generateSessionKeyPair', () => {
  it('should generate a session key pair and sign a message', async () => {
    const sessionKeyPair = generateSessionKeyPair();
    expect(sessionKeyPair).toBeDefined();

    const uint8arrayMessage = new Uint8Array(Buffer.from('123', 'utf8'));
    const secretKeyBytes = hexToBytes(sessionKeyPair.secretKey);

    const signature = ed25519.sign(uint8arrayMessage, secretKeyBytes);
    expect(signature).toBeDefined();
    expect(signature.length).toBe(64); // Ed25519 signatures are 64 bytes
  });
});
