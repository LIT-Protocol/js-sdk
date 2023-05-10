import {
  generateSymmetricKey,
  encryptWithSymmetricKey,
  decryptWithSymmetricKey,
  importSymmetricKey,
} from './crypto';

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
