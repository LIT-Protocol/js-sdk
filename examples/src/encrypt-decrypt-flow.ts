import {
  createAccBuilder,
  humanizeUnifiedAccessControlConditions,
  validateAccessControlConditions,
} from '@lit-protocol/access-control-conditions';
import { generatePrivateKey, privateKeyToAccount } from 'viem/accounts';
import { init } from './init';

export const encryptDecryptFlow = async () => {
  const { litClient } = await init();

  // Alice's account
  const AliceAccount = privateKeyToAccount(generatePrivateKey());
  console.log('🙋‍♀️ AliceAccount:', AliceAccount.address);

  // Bob's account
  const BobsAccount = privateKeyToAccount(generatePrivateKey());
  console.log('🙋‍♂️ BobsAccount:', BobsAccount.address);

  // ========================================
  //                ENCRYPTION
  // ========================================

  // 1. Set up access control conditions
  const builder = createAccBuilder();

  const accs2 = builder
    .requireWalletOwnership(BobsAccount.address)
    .on('ethereum')
    .and()
    .requireEthBalance('0', '=')
    .on('yellowstone')
    // .and()
    // .requireLitAction(
    //   'Qme2pfQUV9cuxWmzHrhMKuvTVvKVx87iLiz4AnQnEwS3B6',
    //   'go',
    //   ['123456'], // <-- parameters
    //   'true' // <-- expected value
    // )
    .build();

  console.log('🔑 Accs2:', accs2);

  const humanised = await humanizeUnifiedAccessControlConditions({
    unifiedAccessControlConditions: accs2,
  });
  console.log('🔑 Humanised:', humanised);

  const validated = await validateAccessControlConditions({
    unifiedAccessControlConditions: accs2,
  });
  console.log('🔑 Validated:', validated);

  // -- Demo 1: Encrypt string data with explicit metadata
  const stringData = 'Hello, my love!';
  console.log('🔑 String data to encrypt:', stringData);

  const encryptedStringData = await litClient.encrypt({
    dataToEncrypt: stringData,
    unifiedAccessControlConditions: accs2,
    chain: 'ethereum',
    // metadata: { dataType: 'string' }, // <-- will be inferred as 'string' EASY
  });

  console.log('🔑 Encrypted string data:', encryptedStringData);
  process.exit();

  // -- Demo 2: Encrypt JSON object with automatic type inference
  const jsonData = {
    message: 'Hello, my love!',
    sender: AliceAccount.address,
    recipient: BobsAccount.address,
    timestamp: Date.now(),
  };

  console.log('🔑 JSON data to encrypt:', jsonData);

  const encryptedJsonData = await litClient.encrypt({
    dataToEncrypt: jsonData,
    unifiedAccessControlConditions: accs2,
    chain: 'ethereum',
    // No metadata provided - will be inferred as 'json'
  });

  console.log('🔑 Encrypted JSON data:', encryptedJsonData);

  // -- Demo 3: Encrypt Uint8Array with no metadata (default behavior)
  const uint8Data = new Uint8Array([72, 101, 108, 108, 111]); // "Hello"
  console.log('🔑 Uint8Array data to encrypt:', uint8Data);

  const encryptedUint8Data = await litClient.encrypt({
    dataToEncrypt: uint8Data,
    unifiedAccessControlConditions: accs2,
    chain: 'ethereum',
  });

  console.log('🔑 Encrypted Uint8Array data:', encryptedUint8Data);

  // -- Demo 4: Encrypt an image file (simulated with base64 data)
  console.log('🔑 Simulating image encryption...');

  // Create a simple 1x1 PNG image data
  const pngData = new Uint8Array([
    0x89,
    0x50,
    0x4e,
    0x47,
    0x0d,
    0x0a,
    0x1a,
    0x0a, // PNG signature
    0x00,
    0x00,
    0x00,
    0x0d,
    0x49,
    0x48,
    0x44,
    0x52, // IHDR chunk
    0x00,
    0x00,
    0x00,
    0x01,
    0x00,
    0x00,
    0x00,
    0x01, // 1x1 dimensions
    0x08,
    0x02,
    0x00,
    0x00,
    0x00,
    0x90,
    0x77,
    0x53,
    0xde, // IHDR data
    0x00,
    0x00,
    0x00,
    0x0c,
    0x49,
    0x44,
    0x41,
    0x54, // IDAT chunk
    0x08,
    0x1d,
    0x01,
    0x01,
    0x00,
    0x00,
    0xfe,
    0xff, // Image data
    0x00,
    0x00,
    0x00,
    0x02,
    0x00,
    0x01,
    0x00,
    0x00,
    0x00,
    0x00,
    0x00,
    0x00,
    0x00,
    0x00, // End
  ]);

  // Create a simulated File object (if running in browser environment)
  let imageFile: any;
  if (typeof File !== 'undefined') {
    imageFile = new File([pngData], 'test-image.png', { type: 'image/png' });
  } else {
    // In Node.js, simulate with Uint8Array + metadata
    imageFile = pngData;
  }

  const encryptedImageData = await litClient.encrypt({
    dataToEncrypt: imageFile,
    unifiedAccessControlConditions: accs2,
    chain: 'ethereum',
    metadata: {
      dataType: 'image',
      mimeType: 'image/png',
      filename: 'encrypted-test-image.png',
      size: pngData.length,
      custom: {
        description: 'A test image for encryption demo',
        category: 'demo',
      },
    },
  });

  console.log('🔑 Encrypted image data:', encryptedImageData);

  // -- Demo 5: Encrypt video metadata (simulated)
  console.log('🔑 Simulating video encryption...');

  const videoData = new Uint8Array([
    0x00, 0x00, 0x00, 0x20, 0x66, 0x74, 0x79, 0x70,
  ]); // MP4 header start

  const encryptedVideoData = await litClient.encrypt({
    dataToEncrypt: videoData,
    unifiedAccessControlConditions: accs2,
    chain: 'ethereum',
    metadata: {
      dataType: 'video',
      mimeType: 'video/mp4',
      filename: 'demo-video.mp4',
      size: videoData.length,
      custom: {
        duration: 30,
        resolution: '1080p',
        codec: 'h264',
      },
    },
  });

  console.log('🔑 Encrypted video data:', encryptedVideoData);

  // -- Demo 6: Encrypt a generic file
  console.log('🔑 Simulating file encryption...');

  const documentData = new TextEncoder().encode(
    'This is a PDF document content...'
  );

  const encryptedFileData = await litClient.encrypt({
    dataToEncrypt: documentData,
    unifiedAccessControlConditions: accs2,
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

  console.log('🔑 Encrypted file data:', encryptedFileData);

  // ========================================
  //                DECRYPTION
  // ========================================
  const { litClient: bobsLitClient, authManager: bobsAuthManager } =
    await init();

  const bobAuthContext = await bobsAuthManager.createEoaAuthContext({
    config: {
      account: BobsAccount,
    },
    authConfig: {
      domain: 'localhost',
      statement: 'Decrypt test data',
      expiration: new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString(),
      resources: [
        ['access-control-condition-decryption', '*'],
        ['lit-action-execution', '*'],
        // ['lit-payment-delegation', '*'],
      ],
    },
    litClient: bobsLitClient,
  });

  // 3a. Bob decrypts the string data (NEW SIMPLIFIED METHOD)
  console.log('🔓 Decrypting string data (simplified method)...');
  const decryptedStringResponse = await bobsLitClient.decrypt({
    data: encryptedStringData, // Pass the complete encrypted response
    unifiedAccessControlConditions: accs2,
    chain: 'ethereum',
    authContext: bobAuthContext,
  });

  console.log('🔓 Decrypted string response:', decryptedStringResponse);
  console.log(
    '🔓 Converted string data:',
    decryptedStringResponse.convertedData
  );

  // 3b. Bob decrypts the JSON data (TRADITIONAL METHOD for comparison)
  console.log('🔓 Decrypting JSON data (traditional method)...');
  const decryptedJsonResponse = await bobsLitClient.decrypt({
    ciphertext: encryptedJsonData.ciphertext,
    dataToEncryptHash: encryptedJsonData.dataToEncryptHash,
    metadata: encryptedJsonData.metadata,
    unifiedAccessControlConditions: accs2,
    chain: 'ethereum',
    authContext: bobAuthContext,
  });

  console.log('🔓 Decrypted JSON response:', decryptedJsonResponse);
  console.log('🔓 Converted JSON data:', decryptedJsonResponse.convertedData);

  // 3c. Bob decrypts the Uint8Array data (SIMPLIFIED METHOD)
  console.log('🔓 Decrypting Uint8Array data (simplified method)...');
  const decryptedUint8Response = await bobsLitClient.decrypt({
    data: encryptedUint8Data,
    unifiedAccessControlConditions: accs2,
    chain: 'ethereum',
    authContext: bobAuthContext,
  });

  console.log('🔓 Decrypted Uint8Array response:', decryptedUint8Response);

  // 3d. Bob decrypts the image data (SIMPLIFIED METHOD)
  console.log('🔓 Decrypting image data (simplified method)...');
  const decryptedImageResponse = await bobsLitClient.decrypt({
    data: encryptedImageData,
    unifiedAccessControlConditions: accs2,
    chain: 'ethereum',
    authContext: bobAuthContext,
  });

  console.log('🔓 Decrypted image response:', decryptedImageResponse);
  console.log(
    '🔓 Converted image data type:',
    typeof decryptedImageResponse.convertedData
  );
  console.log('🔓 Image metadata:', decryptedImageResponse.metadata);

  // 3e. Bob decrypts the video data (SIMPLIFIED METHOD)
  console.log('🔓 Decrypting video data (simplified method)...');
  const decryptedVideoResponse = await bobsLitClient.decrypt({
    data: encryptedVideoData,
    unifiedAccessControlConditions: accs2,
    chain: 'ethereum',
    authContext: bobAuthContext,
  });

  console.log('🔓 Decrypted video response:', decryptedVideoResponse);
  console.log('🔓 Video metadata:', decryptedVideoResponse.metadata);

  // 3f. Bob decrypts the file data (SIMPLIFIED METHOD)
  console.log('🔓 Decrypting file data (simplified method)...');
  const decryptedFileResponse = await bobsLitClient.decrypt({
    data: encryptedFileData,
    unifiedAccessControlConditions: accs2,
    chain: 'ethereum',
    authContext: bobAuthContext,
  });

  console.log('🔓 Decrypted file response:', decryptedFileResponse);
  console.log('🔓 File metadata:', decryptedFileResponse.metadata);

  // -- Demo 7: Demonstrate error handling for invalid JSON (TRADITIONAL METHOD)
  console.log('🧪 Testing error handling...');
  try {
    // Try to decrypt string data as JSON (should handle gracefully)
    const invalidJsonResponse = await bobsLitClient.decrypt({
      ciphertext: encryptedStringData.ciphertext,
      dataToEncryptHash: encryptedStringData.dataToEncryptHash,
      metadata: { dataType: 'json' as const }, // Force JSON parsing on string data
      unifiedAccessControlConditions: accs2,
      chain: 'ethereum',
      authContext: bobAuthContext,
    });
    console.log('🧪 Forced JSON conversion (might fail):', invalidJsonResponse);
  } catch (error: any) {
    console.log(
      '🚨 Expected error for invalid JSON conversion:',
      error.message
    );
  }
};

encryptDecryptFlow();
