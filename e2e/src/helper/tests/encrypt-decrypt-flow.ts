import { init } from '../../init';

export const createEncryptDecryptFlowTest = (
  ctx: Awaited<ReturnType<typeof init>>,
  getAuthContext: () => any
) => {
  return async () => {
    const { createAccBuilder } = await import(
      '@lit-protocol/access-control-conditions'
    );
    const { generatePrivateKey, privateKeyToAccount } = await import(
      'viem/accounts'
    );

    const authContext = getAuthContext();

    // Create a test account for Bob (recipient)
    const bobAccount = privateKeyToAccount(generatePrivateKey());

    // Determine which address to use for Alice based on auth context type
    let aliceAddress: string;
    if (authContext === ctx.aliceEoaAuthContext) {
      aliceAddress = ctx.aliceViemAccount.address;
    } else {
      aliceAddress = ctx.aliceViemAccountPkp.ethAddress;
    }

    // Set up access control conditions requiring Bob's wallet ownership
    const builder = createAccBuilder();
    const accs = builder
      .requireWalletOwnership(bobAccount.address)
      .on('ethereum')
      .build();

    // Test 1: Encrypt string data
    const stringData = 'Hello from encrypt-decrypt flow test!';
    const encryptedStringData = await ctx.litClient.encrypt({
      dataToEncrypt: stringData,
      unifiedAccessControlConditions: accs,
      chain: 'ethereum',
    });

    expect(encryptedStringData).toBeDefined();
    expect(encryptedStringData.ciphertext).toBeDefined();
    expect(encryptedStringData.dataToEncryptHash).toBeDefined();
    expect(encryptedStringData.metadata?.dataType).toBe('string');

    // Test 2: Encrypt JSON object
    const jsonData = {
      message: 'Test JSON data',
      sender: aliceAddress,
      recipient: bobAccount.address,
      timestamp: Date.now(),
    };

    const encryptedJsonData = await ctx.litClient.encrypt({
      dataToEncrypt: jsonData,
      unifiedAccessControlConditions: accs,
      chain: 'ethereum',
    });

    expect(encryptedJsonData).toBeDefined();
    expect(encryptedJsonData.metadata?.dataType).toBe('json');

    // Test 3: Encrypt Uint8Array
    const uint8Data = new Uint8Array([72, 101, 108, 108, 111]); // "Hello"
    const encryptedUint8Data = await ctx.litClient.encrypt({
      dataToEncrypt: uint8Data,
      unifiedAccessControlConditions: accs,
      chain: 'ethereum',
    });

    expect(encryptedUint8Data).toBeDefined();
    // Note: Uint8Array may not have automatic dataType inference, so we check if metadata exists
    expect(encryptedUint8Data.ciphertext).toBeDefined();
    expect(encryptedUint8Data.dataToEncryptHash).toBeDefined();

    // Test 4: Encrypt with custom metadata
    const documentData = new TextEncoder().encode(
      'This is a PDF document content...'
    );
    const encryptedFileData = await ctx.litClient.encrypt({
      dataToEncrypt: documentData,
      unifiedAccessControlConditions: accs,
      chain: 'ethereum',
      metadata: {
        dataType: 'file',
        mimeType: 'application/pdf',
        filename: 'secret-document.pdf',
        size: documentData.length,
        custom: {
          author: 'Alice',
          createdDate: new Date().toISOString(),
          confidential: true,
        },
      },
    });

    expect(encryptedFileData).toBeDefined();
    expect(encryptedFileData.metadata?.dataType).toBe('file');
    expect(encryptedFileData.metadata?.mimeType).toBe('application/pdf');
    expect(encryptedFileData.metadata?.filename).toBe('secret-document.pdf');

    // Create Bob's auth context for decryption
    const bobAuthContext = await ctx.authManager.createEoaAuthContext({
      config: {
        account: bobAccount,
      },
      authConfig: {
        domain: 'localhost',
        statement: 'Decrypt test data',
        expiration: new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString(),
        resources: [['access-control-condition-decryption', '*']],
      },
      litClient: ctx.litClient,
    });

    // Test 5: Decrypt string data (simplified method)
    const decryptedStringResponse = await ctx.litClient.decrypt({
      data: encryptedStringData,
      unifiedAccessControlConditions: accs,
      chain: 'ethereum',
      authContext: bobAuthContext,
    });

    expect(decryptedStringResponse).toBeDefined();
    expect(decryptedStringResponse.convertedData).toBe(stringData);

    // Test 6: Decrypt JSON data (traditional method)
    const decryptedJsonResponse = await ctx.litClient.decrypt({
      ciphertext: encryptedJsonData.ciphertext,
      dataToEncryptHash: encryptedJsonData.dataToEncryptHash,
      metadata: encryptedJsonData.metadata,
      unifiedAccessControlConditions: accs,
      chain: 'ethereum',
      authContext: bobAuthContext,
    });

    expect(decryptedJsonResponse).toBeDefined();
    expect(decryptedJsonResponse.convertedData).toEqual(jsonData);

    // Test 7: Decrypt Uint8Array data
    const decryptedUint8Response = await ctx.litClient.decrypt({
      data: encryptedUint8Data,
      unifiedAccessControlConditions: accs,
      chain: 'ethereum',
      authContext: bobAuthContext,
    });

    expect(decryptedUint8Response).toBeDefined();
    // For Uint8Array, the decrypted data might be in a different format
    // Check if convertedData exists, otherwise check the raw data
    if (decryptedUint8Response.convertedData) {
      expect(decryptedUint8Response.convertedData).toEqual(uint8Data);
    } else {
      // If no convertedData, check that we can get the raw data back
      expect(decryptedUint8Response.decryptedData).toBeDefined();
      expect(new Uint8Array(decryptedUint8Response.decryptedData)).toEqual(
        uint8Data
      );
    }

    // Test 8: Decrypt file data with custom metadata
    const decryptedFileResponse = await ctx.litClient.decrypt({
      data: encryptedFileData,
      unifiedAccessControlConditions: accs,
      chain: 'ethereum',
      authContext: bobAuthContext,
    });

    expect(decryptedFileResponse).toBeDefined();
    expect(decryptedFileResponse.metadata?.dataType).toBe('file');
    expect(decryptedFileResponse.metadata?.filename).toBe(
      'secret-document.pdf'
    );
    expect(decryptedFileResponse.metadata?.custom?.author).toBe('Alice');

    // When dataType is 'file', convertedData returns a File object
    if (decryptedFileResponse.convertedData instanceof File) {
      expect(decryptedFileResponse.convertedData.name).toBe(
        'secret-document.pdf'
      );
      expect(decryptedFileResponse.convertedData.type).toBe('application/pdf');

      // Convert File to Uint8Array to compare content
      const fileArrayBuffer =
        await decryptedFileResponse.convertedData.arrayBuffer();
      const fileUint8Array = new Uint8Array(fileArrayBuffer);
      expect(fileUint8Array).toEqual(documentData);
    } else {
      // Fallback: expect the raw data
      expect(decryptedFileResponse.convertedData).toEqual(documentData);
    }
  };
};
