import { hexToUint8Array, uint8ArrayToHex } from '@lit-protocol/crypto';
import { nacl } from '@lit-protocol/nacl';
import { WalletEncryptedPayload } from '@lit-protocol/types';

export const walletEncrypt = (
  myWalletSecretKey: Uint8Array,
  theirWalletPublicKey: Uint8Array,
  message: Uint8Array
): WalletEncryptedPayload => {
  console.log(
    '🔑 Encrypting with server key:',
    Buffer.from(theirWalletPublicKey).toString('hex')
  );

  // 🔧 FIX: Ensure theirWalletPublicKey is always exactly 32 bytes
  // Root problem: theirWalletPublicKey might be missing leading zeros, resulting in 31 bytes instead of 32
  const validatedTheirPublicKey = new Uint8Array(32);

  if (theirWalletPublicKey.length === 32) {
    // Perfect - already 32 bytes
    validatedTheirPublicKey.set(theirWalletPublicKey);
    console.log('✅ Their public key is correct 32 bytes');
  } else if (theirWalletPublicKey.length === 31) {
    // Common issue - missing leading zero, pad with zero at start
    validatedTheirPublicKey.set(theirWalletPublicKey, 1); // Copy to position 1, leaving first byte as 0
    console.log(
      '🔧 Fixed: Padded 31-byte key to 32 bytes (added leading zero)'
    );
  } else {
    // Unexpected length - log and attempt to handle
    console.warn(
      `⚠️  Unexpected public key length: ${theirWalletPublicKey.length} bytes`
    );
    if (theirWalletPublicKey.length < 32) {
      // Pad with zeros at the start
      validatedTheirPublicKey.set(
        theirWalletPublicKey,
        32 - theirWalletPublicKey.length
      );
      console.log(
        `🔧 Padded ${theirWalletPublicKey.length}-byte key to 32 bytes`
      );
    } else {
      // Truncate if too long
      validatedTheirPublicKey.set(theirWalletPublicKey.slice(0, 32));
      console.log(
        `🔧 Truncated ${theirWalletPublicKey.length}-byte key to 32 bytes`
      );
    }
  }

  console.log('🔍 Public key validation (encrypt):');
  console.log(`  Raw length: ${theirWalletPublicKey.length} bytes`);
  console.log(`  Final length: ${validatedTheirPublicKey.length} bytes`);
  console.log(
    `  Raw hex: ${Buffer.from(theirWalletPublicKey).toString('hex')}`
  );
  console.log(
    `  Final hex: ${Buffer.from(validatedTheirPublicKey).toString('hex')}`
  );

  const random = new Uint8Array(16);
  crypto.getRandomValues(random);
  console.log('🎲 Random bytes:', Buffer.from(random).toString('hex'));

  const dateNow = Date.now();
  const createdAt = Math.floor(dateNow / 1000);
  const timestamp = Buffer.alloc(8);
  timestamp.writeBigUInt64BE(BigInt(createdAt), 0);

  const keyPair = nacl.box.keyPair.fromSecretKey(myWalletSecretKey);
  const myWalletPublicKey = keyPair.publicKey;

  const versionByte = new Uint8Array([0x01]);

  // version + random + timestamp + validatedTheirPublicKey + myWalletPublicKey
  // 1 + 16 + 8 + 32 + 32 = 89
  const aadData = new Uint8Array([
    ...versionByte,
    ...random,
    ...timestamp,
    ...validatedTheirPublicKey,
    ...myWalletPublicKey,
  ]);

  const aadHash = nacl.hash(aadData);
  console.log('🎯 AAD Hash:', Buffer.from(aadHash).toString('hex'));
  const nonce = aadHash.slice(0, 24);
  console.log('🎲 Derived nonce:', Buffer.from(nonce).toString('hex'));

  console.log('  📌 Message length:', message.length);

  // Use TweetNaCl.js native format - no padding needed!
  console.log('🔧 Using TweetNaCl.js native format (no padding)...');

  const ciphertext = nacl.box(
    message, // Use original message without any modifications
    nonce,
    validatedTheirPublicKey,
    myWalletSecretKey
  );
  console.log('🔒 TweetNaCl.js encryption completed:', ciphertext.length);

  // 🚀 COMPATIBILITY FIX: Convert TweetNaCl.js format to sodalite format
  // Sodalite expects: [ENCRYPTED_PADDING(16)] + [TWEETNACL_COMPATIBLE(67)]
  // TweetNaCl.js produces: [TWEETNACL_COMPATIBLE(67)]
  // Solution: Prepend 16 zero bytes to match sodalite's expected format
  console.log('🔄 Converting to sodalite-compatible format...');
  const sodaliteCompatibleCiphertext = new Uint8Array(16 + ciphertext.length);
  sodaliteCompatibleCiphertext.set(new Uint8Array(16).fill(0), 0); // 16 zero bytes for sodalite padding
  sodaliteCompatibleCiphertext.set(ciphertext, 16); // TweetNaCl.js output

  console.log('📏 Format conversion:');
  console.log(`  Original TweetNaCl.js: ${ciphertext.length} bytes`);
  console.log(
    `  Sodalite compatible: ${sodaliteCompatibleCiphertext.length} bytes`
  );
  console.log(`  Added padding: 16 zero bytes`);

  const result: WalletEncryptedPayload = {
    V1: {
      verification_key: uint8ArrayToHex(myWalletPublicKey),
      ciphertext_and_tag: uint8ArrayToHex(sodaliteCompatibleCiphertext), // Send sodalite-compatible format
      random: uint8ArrayToHex(random),
      created_at: new Date(dateNow).toISOString(),
    },
  };

  // console.log('📤 Encrypted payload with sodalite-compatible format:', result);
  return result;
};

export const walletDecrypt = (
  myWalletSecretKey: Uint8Array,
  payload: WalletEncryptedPayload
): Uint8Array => {
  console.log('🔓 Starting wallet decryption process...');
  console.log('📥 Received payload:');
  console.log('  📌 verification_key:', payload.V1.verification_key);
  const truncatedInputCiphertext =
    payload.V1.ciphertext_and_tag.length > 64
      ? `${payload.V1.ciphertext_and_tag.substring(
          0,
          32
        )}...${payload.V1.ciphertext_and_tag.substring(
          payload.V1.ciphertext_and_tag.length - 32
        )}`
      : payload.V1.ciphertext_and_tag;
  console.log('  📌 ciphertext_and_tag (truncated):', truncatedInputCiphertext);
  console.log('  📌 random:', payload.V1.random);
  console.log('  📌 created_at:', payload.V1.created_at);

  const dateSent = new Date(payload.V1.created_at);
  const createdAt = Math.floor(dateSent.getTime() / 1000);
  const timestamp = Buffer.alloc(8);
  timestamp.writeBigUInt64BE(BigInt(createdAt), 0);
  console.log('⏰ Parsed timestamp (createdAt):', createdAt);
  console.log('⏰ Timestamp bytes:', Buffer.from(timestamp).toString('hex'));

  const myWalletPublicKey = new Uint8Array(32);

  // TweetNaCl doesn't have lowlevel, use direct method
  // Generate public key from secret key using TweetNaCl's method
  const keyPair = nacl.box.keyPair.fromSecretKey(myWalletSecretKey);
  myWalletPublicKey.set(keyPair.publicKey);
  console.log(
    '🔐 My wallet public key:',
    Buffer.from(myWalletPublicKey).toString('hex')
  );

  // Construct AAD - must match the format used during encryption
  // Include version byte (0x01) at the beginning to match server expectations
  const version = Buffer.from([0x01]);
  const random = Buffer.from(hexToUint8Array(payload.V1.random));

  // 🔧 FIX: Ensure theirPublicKey is always exactly 32 bytes
  // Root problem: verification_key might be missing leading zeros, resulting in 31 bytes instead of 32
  const theirPublicKeyRaw = hexToUint8Array(payload.V1.verification_key);
  const theirPublicKey = new Uint8Array(32);

  if (theirPublicKeyRaw.length === 32) {
    // Perfect - already 32 bytes
    theirPublicKey.set(theirPublicKeyRaw);
    console.log('✅ Their public key is correct 32 bytes');
  } else if (theirPublicKeyRaw.length === 31) {
    // Common issue - missing leading zero, pad with zero at start
    theirPublicKey.set(theirPublicKeyRaw, 1); // Copy to position 1, leaving first byte as 0
    console.log(
      '🔧 Fixed: Padded 31-byte key to 32 bytes (added leading zero)'
    );
  } else {
    // Unexpected length - log and attempt to handle
    console.warn(
      `⚠️  Unexpected public key length: ${theirPublicKeyRaw.length} bytes`
    );
    if (theirPublicKeyRaw.length < 32) {
      // Pad with zeros at the start
      theirPublicKey.set(theirPublicKeyRaw, 32 - theirPublicKeyRaw.length);
      console.log(`🔧 Padded ${theirPublicKeyRaw.length}-byte key to 32 bytes`);
    } else {
      // Truncate if too long
      theirPublicKey.set(theirPublicKeyRaw.slice(0, 32));
      console.log(
        `🔧 Truncated ${theirPublicKeyRaw.length}-byte key to 32 bytes`
      );
    }
  }

  console.log('🔍 Public key validation:');
  console.log(`  Raw length: ${theirPublicKeyRaw.length} bytes`);
  console.log(`  Final length: ${theirPublicKey.length} bytes`);
  console.log(`  Raw hex: ${Buffer.from(theirPublicKeyRaw).toString('hex')}`);
  console.log(`  Final hex: ${Buffer.from(theirPublicKey).toString('hex')}`);

  const theirPublicKeyBuffer = Buffer.from(theirPublicKey);
  const myPublicKey = Buffer.from(myWalletPublicKey);

  const aad = Buffer.concat([
    version,
    random,
    timestamp,
    theirPublicKeyBuffer,
    myPublicKey,
  ]);

  console.log('📦 AAD Reconstruction for decryption:');
  console.log('  📌 Version byte:', Buffer.from(version).toString('hex'));
  console.log('  📌 Random (16 bytes):', Buffer.from(random).toString('hex'));
  console.log(
    '  📌 Timestamp (8 bytes):',
    Buffer.from(timestamp).toString('hex')
  );
  console.log(
    '  📌 Their public key (32 bytes):',
    Buffer.from(theirPublicKeyBuffer).toString('hex')
  );
  console.log(
    '  📌 My public key (32 bytes):',
    Buffer.from(myPublicKey).toString('hex')
  );
  console.log(
    '  📌 Complete AAD (89 bytes):',
    Buffer.from(aad).toString('hex')
  );
  console.log('  📌 AAD length:', aad.length);

  const hash = nacl.hash(new Uint8Array(aad));
  console.log('🔨 Hash (SHA-512) of AAD:', Buffer.from(hash).toString('hex'));

  const nonce = hash.slice(0, 24);
  console.log(
    '🎯 Nonce (first 24 bytes of hash):',
    Buffer.from(nonce).toString('hex')
  );

  // Convert hex ciphertext back to Uint8Array
  const rawCiphertext = hexToUint8Array(payload.V1.ciphertext_and_tag);

  // 🚀 COMPATIBILITY FIX: Handle sodalite-compatible format
  // Sodalite format: [ENCRYPTED_PADDING(16)] + [TWEETNACL_COMPATIBLE(67+)]
  // TweetNaCl.js format: [TWEETNACL_COMPATIBLE(67+)]
  // Solution: Strip first 16 bytes if present to get TweetNaCl.js format
  let ciphertext: Uint8Array;
  let formatDetected: string;

  // Detect format based on common patterns
  // Sodalite format typically has 83+ bytes (16 padding + 67+ data)
  // TweetNaCl.js format typically has 67+ bytes
  if (rawCiphertext.length >= 83) {
    // Likely sodalite format - strip first 16 bytes
    console.log(
      '🔍 Detected sodalite-compatible format, stripping 16-byte padding...'
    );
    ciphertext = rawCiphertext.slice(16);
    formatDetected = 'sodalite-compatible';
    console.log('📏 Format conversion:');
    console.log(`  Input (sodalite): ${rawCiphertext.length} bytes`);
    console.log(`  Output (TweetNaCl.js): ${ciphertext.length} bytes`);
    console.log(`  Stripped padding: 16 bytes`);
  } else {
    // Likely TweetNaCl.js format - use as is
    console.log(
      '🔍 Detected TweetNaCl.js native format, no conversion needed...'
    );
    ciphertext = rawCiphertext;
    formatDetected = 'TweetNaCl.js native';
    console.log(`  Using original format: ${ciphertext.length} bytes`);
  }

  const ciphertextHex = Buffer.from(ciphertext).toString('hex');
  const truncatedDecryptCiphertext =
    ciphertextHex.length > 64
      ? `${ciphertextHex.substring(0, 32)}...${ciphertextHex.substring(
          ciphertextHex.length - 32
        )}`
      : ciphertextHex;
  console.log(
    `🔒 Ciphertext to decrypt (${formatDetected}, truncated):`,
    truncatedDecryptCiphertext
  );

  const message = nacl.box.open(
    ciphertext,
    nonce,
    theirPublicKey,
    myWalletSecretKey
  );

  if (!message) {
    throw new Error('Decryption failed - invalid ciphertext or incorrect keys');
  }

  console.log('✅ Decryption successful, message length:', message.length);
  return message;
};
