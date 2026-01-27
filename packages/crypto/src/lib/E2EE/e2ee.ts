import { nacl } from '@lit-protocol/nacl';
import {
  bytesToHex,
  hexToBytes,
  numberToBytesBE,
} from '@noble/curves/abstract/utils';
import { z } from 'zod';
import {
  Always32BytesSchema,
  LitAADSchema,
  SodaliteCompatibleSchema,
} from './e2ee.schemas';
import { EncryptedVersion1Schema } from '@lit-protocol/schemas';

export const walletEncrypt = (
  myWalletSecretKey: Uint8Array,
  theirWalletPublicKey: Uint8Array,
  message: Uint8Array
): z.infer<typeof EncryptedVersion1Schema> => {
  const validatedTheirPublicKey =
    Always32BytesSchema.parse(theirWalletPublicKey);

  const random = new Uint8Array(16);
  crypto.getRandomValues(random);

  const dateNow = Date.now();
  const createdAt = Math.floor(dateNow / 1000);
  const timestamp = numberToBytesBE(BigInt(createdAt), 8);

  const keyPair = nacl.box.keyPair.fromSecretKey(myWalletSecretKey);
  const myWalletPublicKey = keyPair.publicKey;

  const versionByte = new Uint8Array([0x01]);

  const aadData = LitAADSchema.parse({
    version: versionByte,
    random,
    timestamp,
    theirPublicKey: validatedTheirPublicKey,
    myPublicKey: myWalletPublicKey,
  });

  const aadHash = nacl.hash(aadData);
  const nonce = aadHash.slice(0, 24);

  const ciphertext = nacl.box(
    message,
    nonce,
    validatedTheirPublicKey,
    myWalletSecretKey
  );

  const sodaliteCompatibleCiphertext =
    SodaliteCompatibleSchema.parse(ciphertext);

  const result = EncryptedVersion1Schema.parse({
    V1: {
      verification_key: bytesToHex(myWalletPublicKey),
      ciphertext_and_tag: bytesToHex(sodaliteCompatibleCiphertext), // Send sodalite-compatible format
      random: bytesToHex(random),
      created_at: new Date(dateNow).toISOString(),
    },
  });

  return result;
};

export const walletDecrypt = (
  myWalletSecretKey: Uint8Array,
  data: z.infer<typeof EncryptedVersion1Schema>
): Uint8Array => {
  const dateSent = new Date(data.payload.created_at);
  const createdAt = Math.floor(dateSent.getTime() / 1000);
  const timestamp = numberToBytesBE(BigInt(createdAt), 8);

  const keyPair = nacl.box.keyPair.fromSecretKey(myWalletSecretKey);
  const myWalletPublicKey = keyPair.publicKey;

  // Use schema to validate and fix their public key
  const theirPublicKeyRaw = hexToBytes(data.payload.verification_key);
  const theirPublicKey = Always32BytesSchema.parse(theirPublicKeyRaw);

  const versionByte = new Uint8Array([0x01]);
  const random = hexToBytes(data.payload.random);

  // IMPORTANT: When decrypting, we need to reconstruct the AAD from the encrypting party's perspective
  // The verification_key is the encrypting party's public key (their perspective: "my" key)
  // Our public key is from their perspective: "their" key
  // So the AAD order should be: version + random + timestamp + myWalletPublicKey + theirPublicKey
  const aadData = LitAADSchema.parse({
    version: versionByte,
    random,
    timestamp,
    theirPublicKey: myWalletPublicKey, // Our key from their perspective
    myPublicKey: theirPublicKey, // Their key from their perspective
  });

  const aadHash = nacl.hash(aadData);
  const nonce = aadHash.slice(0, 24);

  // Convert hex ciphertext back to Uint8Array and handle format conversion
  const rawCiphertext = hexToBytes(data.payload.ciphertext_and_tag);

  // Handle sodalite-compatible format conversion
  let ciphertext: Uint8Array;
  if (rawCiphertext.length >= 83) {
    // Likely sodalite format - strip first 16 bytes
    ciphertext = rawCiphertext.slice(16);
  } else {
    // Likely TweetNaCl.js format - use as is
    ciphertext = rawCiphertext;
  }

  const message = nacl.box.open(
    ciphertext,
    nonce,
    theirPublicKey,
    myWalletSecretKey
  );

  if (!message) {
    throw new Error('Decryption failed - invalid ciphertext or incorrect keys');
  }

  return message;
};
