import { init } from '../../init';
import { assert } from '../assertions';

export const createEncryptDecryptFlowTest = (
  ctx: Awaited<ReturnType<typeof init>>,
  getAuthContext: () => any,
  address?: string
) => {
  return async () => {
    const { createAccBuilder } = await import(
      '@lit-protocol/access-control-conditions'
    );

    const authContext = getAuthContext();

    // Determine which address to use for Alice based on auth context type
    let aliceAddress: string;
    if (authContext === ctx.aliceEoaAuthContext) {
      aliceAddress = ctx.aliceViemAccount.address;
    } else {
      aliceAddress = address || ctx.aliceViemAccountPkp.ethAddress;
    }

    // Set up access control conditions requiring Bob's wallet ownership
    const builder = createAccBuilder();
    const accs = builder
      .requireWalletOwnership(ctx.bobViemAccount.address)
      .on('ethereum')
      .build();

    // Test 1: Encrypt string data
    const stringData = 'Hello from encrypt-decrypt flow test!';
    const encryptedStringData = await ctx.litClient.encrypt({
      dataToEncrypt: stringData,
      unifiedAccessControlConditions: accs,
      chain: 'ethereum',
    });

    assert.toBeDefined(encryptedStringData);
    assert.toBeDefined(encryptedStringData.ciphertext);
    assert.toBeDefined(encryptedStringData.dataToEncryptHash);
    assert.toBe(encryptedStringData.metadata?.dataType, 'string');

    // Test 2: Encrypt JSON object
    const jsonData = {
      message: 'Test JSON data',
      sender: aliceAddress,
      recipient: ctx.bobViemAccount.address,
      timestamp: Date.now(),
    };

    const encryptedJsonData = await ctx.litClient.encrypt({
      dataToEncrypt: jsonData,
      unifiedAccessControlConditions: accs,
      chain: 'ethereum',
    });

    assert.toBeDefined(encryptedJsonData);
    assert.toBe(encryptedJsonData.metadata?.dataType, 'json');

    // Test 3: Encrypt Uint8Array
    const uint8Data = new Uint8Array([72, 101, 108, 108, 111]); // "Hello"
    const encryptedUint8Data = await ctx.litClient.encrypt({
      dataToEncrypt: uint8Data,
      unifiedAccessControlConditions: accs,
      chain: 'ethereum',
    });

    assert.toBeDefined(encryptedUint8Data);
    // Note: Uint8Array may not have automatic dataType inference, so we check if metadata exists
    assert.toBeDefined(encryptedUint8Data.ciphertext);
    assert.toBeDefined(encryptedUint8Data.dataToEncryptHash);

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

    assert.toBeDefined(encryptedFileData);
    assert.toBe(encryptedFileData.metadata?.dataType, 'file');
    assert.toBe(encryptedFileData.metadata?.mimeType, 'application/pdf');
    assert.toBe(encryptedFileData.metadata?.filename, 'secret-document.pdf');

    // Create Bob's auth context for decryption
    const bobAuthContext = await ctx.authManager.createEoaAuthContext({
      config: {
        account: ctx.bobViemAccount,
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

    assert.toBeDefined(decryptedStringResponse);
    assert.toBe(decryptedStringResponse.convertedData, stringData);

    // Test 6: Decrypt JSON data (traditional method)
    const decryptedJsonResponse = await ctx.litClient.decrypt({
      ciphertext: encryptedJsonData.ciphertext,
      dataToEncryptHash: encryptedJsonData.dataToEncryptHash,
      metadata: encryptedJsonData.metadata,
      unifiedAccessControlConditions: accs,
      chain: 'ethereum',
      authContext: bobAuthContext,
    });

    assert.toBeDefined(decryptedJsonResponse);
    assert.toEqual(decryptedJsonResponse.convertedData, jsonData);

    // Test 7: Decrypt Uint8Array data
    const decryptedUint8Response = await ctx.litClient.decrypt({
      data: encryptedUint8Data,
      unifiedAccessControlConditions: accs,
      chain: 'ethereum',
      authContext: bobAuthContext,
    });

    assert.toBeDefined(decryptedUint8Response);
    // For Uint8Array, the decrypted data might be in a different format
    // Check if convertedData exists, otherwise check the raw data
    if (decryptedUint8Response.convertedData) {
      assert.toEqual(decryptedUint8Response.convertedData, uint8Data);
    } else {
      // If no convertedData, check that we can get the raw data back
      assert.toBeDefined(decryptedUint8Response.decryptedData);
      assert.toEqual(decryptedUint8Response.decryptedData, uint8Data);
    }

    // Test 8: Decrypt file data with custom metadata
    const decryptedFileResponse = await ctx.litClient.decrypt({
      data: encryptedFileData,
      unifiedAccessControlConditions: accs,
      chain: 'ethereum',
      authContext: bobAuthContext,
    });

    assert.toBeDefined(decryptedFileResponse);
    assert.toBe(decryptedFileResponse.metadata?.dataType, 'file');
    assert.toBe(
      decryptedFileResponse.metadata?.filename,
      'secret-document.pdf'
    );
    assert.toBe(decryptedFileResponse.metadata?.custom?.author, 'Alice');

    // When dataType is 'file', convertedData returns a File object
    if (decryptedFileResponse.convertedData instanceof File) {
      assert.toBe(
        decryptedFileResponse.convertedData.name,
        'secret-document.pdf'
      );
      assert.toBe(decryptedFileResponse.convertedData.type, 'application/pdf');

      // Convert File to Uint8Array to compare content
      const fileArrayBuffer =
        await decryptedFileResponse.convertedData.arrayBuffer();
      const fileUint8Array = new Uint8Array(fileArrayBuffer);
      assert.toEqual(fileUint8Array, documentData);
    } else {
      // Fallback: expect the raw data
      assert.toEqual(decryptedFileResponse.convertedData, documentData);
    }
  };
};
