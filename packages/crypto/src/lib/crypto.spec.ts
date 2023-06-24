import {
  decryptWithSignatureShares,
  encrypt,
  verifyAndDecryptWithSignatureShares,
  combineSignatureShares,
  verifySignature,
} from './crypto';

// @ts-nocheck
import { TextEncoder, TextDecoder } from 'util';
global.TextEncoder = TextEncoder;
// @ts-ignore
global.TextDecoder = TextDecoder;

import * as blsSdk from '@lit-protocol/bls-sdk';

const publicKey =
  '8e29447d7b0666fe41c357dbbdbdac0ac8ac973f88439a07f85fa31fa6fa3cea87c2eaa8b367e1c97764800fb5636892';
const secretMessage = new Uint8Array([
  240, 23, 185, 6, 87, 33, 173, 216, 53, 84, 80, 135, 190, 16, 58, 85, 97, 75,
  3, 192, 215, 82, 217, 5, 40, 65, 2, 214, 40, 177, 53, 150,
]);
const identityParam = new Uint8Array([
  101, 110, 99, 114, 121, 112, 116, 95, 100, 101, 99, 114, 121, 112, 116, 95,
  119, 111, 114, 107, 115,
]);

describe('crypto', () => {
  beforeAll(async () => {
    await blsSdk.initWasmBlsSdk();
  });

  it('should encrypt', async () => {
    // execute
    const ciphertext = encrypt(publicKey, secretMessage, identityParam);

    // assert
    expect(ciphertext.length).toBeGreaterThan(0);
  });

  it('should decrypt', async () => {
    // prepare
    const ciphertext =
      'l9a/01WDJB/euKxtbWcuQ8ez/c9eZ+jQryTHZVLN0kfd7XHoLs6FeWUVmk89ovQGkQJnnFDKjq6kgJxvIIrxXd9DaGuRBozLdA1G9Nk413YhTEqsENuHU0nSa4i6F912KltE15sbWKpDfPnZF6CA2UKBAw==';
    const signatureShares = [
      '01b2b44a0bf7184f19efacad98e213818edd3f8909dd798129ef169b877d68d77ba630005609f48b80203717d82092a45b06a9de0e61a97b2672b38b31f9ae43e64383d0375a51c75db8972613cc6b099b95c189fd8549ed973ee94b08749f4cac',
      '02a8343d5602f523286c4c59356fdcfc51953290495d98cb91a56b59bd1a837ea969cc521382164e85787128ce7f944de303d8e0b5fc4becede0c894bec1adc490fdc133939cca70fb3f504b9bf7b156527b681d9f0619828cd8050c819e46fdb1',
      '03b1594ab0cb56f47437b3720dc181661481ca0e36078b79c9a4acc50042f076bf66b68fbd12a1d55021a668555f0eed0a08dfe74455f557b30f1a9c32435a81479ca8843f5b74b176a8d10c5845a84213441eaaaf2ba57e32581584393541c5aa',
    ];

    // execute
    const plaintext = decryptWithSignatureShares(
      ciphertext,
      signatureShares.map((s) => ({
        ProofOfPossession: s,
      }))
    );

    // assert
    expect(plaintext).toEqual(secretMessage);
  });

  it('should verify + decrypt', async () => {
    const ciphertext =
      'l9a/01WDJB/euKxtbWcuQ8ez/c9eZ+jQryTHZVLN0kfd7XHoLs6FeWUVmk89ovQGkQJnnFDKjq6kgJxvIIrxXd9DaGuRBozLdA1G9Nk413YhTEqsENuHU0nSa4i6F912KltE15sbWKpDfPnZF6CA2UKBAw==';
    const signatureShares = [
      '01b2b44a0bf7184f19efacad98e213818edd3f8909dd798129ef169b877d68d77ba630005609f48b80203717d82092a45b06a9de0e61a97b2672b38b31f9ae43e64383d0375a51c75db8972613cc6b099b95c189fd8549ed973ee94b08749f4cac',
      '02a8343d5602f523286c4c59356fdcfc51953290495d98cb91a56b59bd1a837ea969cc521382164e85787128ce7f944de303d8e0b5fc4becede0c894bec1adc490fdc133939cca70fb3f504b9bf7b156527b681d9f0619828cd8050c819e46fdb1',
      '03b1594ab0cb56f47437b3720dc181661481ca0e36078b79c9a4acc50042f076bf66b68fbd12a1d55021a668555f0eed0a08dfe74455f557b30f1a9c32435a81479ca8843f5b74b176a8d10c5845a84213441eaaaf2ba57e32581584393541c5aa',
    ];

    // execute
    const plaintext = verifyAndDecryptWithSignatureShares(
      publicKey,
      identityParam,
      ciphertext,
      signatureShares.map((s) => ({
        ProofOfPossession: s,
      }))
    );

    // assert
    expect(plaintext).toEqual(secretMessage);
  });

  it('should combine signature shares', async () => {
    const signatureShares = [
      '01b2b44a0bf7184f19efacad98e213818edd3f8909dd798129ef169b877d68d77ba630005609f48b80203717d82092a45b06a9de0e61a97b2672b38b31f9ae43e64383d0375a51c75db8972613cc6b099b95c189fd8549ed973ee94b08749f4cac',
      '02a8343d5602f523286c4c59356fdcfc51953290495d98cb91a56b59bd1a837ea969cc521382164e85787128ce7f944de303d8e0b5fc4becede0c894bec1adc490fdc133939cca70fb3f504b9bf7b156527b681d9f0619828cd8050c819e46fdb1',
      '03b1594ab0cb56f47437b3720dc181661481ca0e36078b79c9a4acc50042f076bf66b68fbd12a1d55021a668555f0eed0a08dfe74455f557b30f1a9c32435a81479ca8843f5b74b176a8d10c5845a84213441eaaaf2ba57e32581584393541c5aa',
    ].map((s) => ({
      ProofOfPossession: s,
    }));

    // execute
    const combinedSignature = combineSignatureShares(signatureShares);

    // assert
    expect(combinedSignature.length).toEqual(192);
  });

  it('should verify signature', async () => {
    const publicKey =
      'ad1bd6c66f849ccbcc20fa08c26108f3df7db0068df032cc184779cc967159da4dd5669de563af7252b540f0759aee5a';
    const message = new Uint8Array([
      101, 121, 74, 104, 98, 71, 99, 105, 79, 105, 74, 67, 84, 70, 77, 120, 77,
      105, 48, 122, 79, 68, 69, 105, 76, 67, 74, 48, 101, 88, 65, 105, 79, 105,
      74, 75, 86, 49, 81, 105, 102, 81, 46, 101, 121, 74, 112, 99, 51, 77, 105,
      79, 105, 74, 77, 83, 86, 81, 105, 76, 67, 74, 122, 100, 87, 73, 105, 79,
      105, 73, 119, 101, 68, 81, 121, 78, 84, 108, 108, 78, 68, 81, 50, 78, 122,
      65, 119, 78, 84, 77, 48, 79, 84, 70, 108, 78, 50, 73, 48, 90, 109, 85, 48,
      89, 84, 69, 121, 77, 71, 77, 51, 77, 71, 74, 108, 77, 87, 86, 104, 90, 68,
      89, 48, 78, 109, 73, 105, 76, 67, 74, 106, 97, 71, 70, 112, 98, 105, 73,
      54, 73, 109, 86, 48, 97, 71, 86, 121, 90, 88, 86, 116, 73, 105, 119, 105,
      97, 87, 70, 48, 73, 106, 111, 120, 78, 106, 103, 51, 78, 84, 89, 121, 77,
      106, 99, 49, 76, 67, 74, 108, 101, 72, 65, 105, 79, 106, 69, 50, 79, 68,
      99, 50, 77, 68, 85, 48, 78, 122, 85, 115, 73, 109, 70, 106, 89, 50, 86,
      122, 99, 48, 78, 118, 98, 110, 82, 121, 98, 50, 120, 68, 98, 50, 53, 107,
      97, 88, 82, 112, 98, 50, 53, 122, 73, 106, 112, 98, 101, 121, 74, 106, 98,
      50, 53, 48, 99, 109, 70, 106, 100, 69, 70, 107, 90, 72, 74, 108, 99, 51,
      77, 105, 79, 105, 73, 105, 76, 67, 74, 106, 97, 71, 70, 112, 98, 105, 73,
      54, 73, 109, 86, 48, 97, 71, 86, 121, 90, 88, 86, 116, 73, 105, 119, 105,
      99, 51, 82, 104, 98, 109, 82, 104, 99, 109, 82, 68, 98, 50, 53, 48, 99,
      109, 70, 106, 100, 70, 82, 53, 99, 71, 85, 105, 79, 105, 73, 105, 76, 67,
      74, 116, 90, 88, 82, 111, 98, 50, 81, 105, 79, 105, 73, 105, 76, 67, 74,
      119, 89, 88, 74, 104, 98, 87, 86, 48, 90, 88, 74, 122, 73, 106, 112, 98,
      73, 106, 112, 49, 99, 50, 86, 121, 81, 87, 82, 107, 99, 109, 86, 122, 99,
      121, 74, 100, 76, 67, 74, 121, 90, 88, 82, 49, 99, 109, 53, 87, 89, 87,
      120, 49, 90, 86, 82, 108, 99, 51, 81, 105, 79, 110, 115, 105, 89, 50, 57,
      116, 99, 71, 70, 121, 89, 88, 82, 118, 99, 105, 73, 54, 73, 106, 48, 105,
      76, 67, 74, 50, 89, 87, 120, 49, 90, 83, 73, 54, 73, 106, 66, 52, 78, 68,
      73, 49, 79, 85, 85, 48, 78, 68, 89, 51, 77, 68, 65, 49, 77, 122, 81, 53,
      77, 85, 85, 51, 89, 106, 82, 71, 82, 84, 82, 66, 77, 84, 73, 119, 81, 122,
      99, 119, 89, 109, 85, 120, 90, 85, 70, 69, 78, 106, 81, 50, 89, 105, 74,
      57, 102, 86, 48, 115, 73, 109, 86, 50, 98, 85, 78, 118, 98, 110, 82, 121,
      89, 87, 78, 48, 81, 50, 57, 117, 90, 71, 108, 48, 97, 87, 57, 117, 99,
      121, 73, 54, 98, 110, 86, 115, 98, 67, 119, 105, 99, 50, 57, 115, 85, 110,
      66, 106, 81, 50, 57, 117, 90, 71, 108, 48, 97, 87, 57, 117, 99, 121, 73,
      54, 98, 110, 86, 115, 98, 67, 119, 105, 100, 87, 53, 112, 90, 109, 108,
      108, 90, 69, 70, 106, 89, 50, 86, 122, 99, 48, 78, 118, 98, 110, 82, 121,
      98, 50, 120, 68, 98, 50, 53, 107, 97, 88, 82, 112, 98, 50, 53, 122, 73,
      106, 112, 117, 100, 87, 120, 115, 102, 81,
    ]);
    const signature = new Uint8Array([
      182, 185, 8, 21, 143, 23, 47, 21, 128, 30, 241, 43, 141, 206, 108, 16,
      199, 242, 16, 200, 195, 85, 109, 38, 227, 52, 132, 136, 239, 11, 105, 214,
      254, 23, 107, 236, 105, 73, 129, 48, 242, 17, 225, 172, 114, 29, 214, 178,
      12, 158, 255, 169, 220, 84, 179, 19, 53, 94, 223, 192, 80, 199, 24, 68,
      37, 91, 82, 163, 89, 102, 105, 0, 26, 211, 133, 24, 224, 192, 142, 39,
      134, 118, 255, 80, 221, 163, 231, 178, 180, 23, 144, 60, 214, 208, 132,
      207,
    ]);

    // execute
    verifySignature(publicKey, message, signature);
  });
});
