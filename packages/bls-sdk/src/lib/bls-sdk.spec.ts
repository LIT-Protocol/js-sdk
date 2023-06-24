// @ts-nocheck
import { TextEncoder, TextDecoder } from 'util';
global.TextEncoder = TextEncoder;
// @ts-ignore
global.TextDecoder = TextDecoder;

import * as blsSdk from './bls-sdk';

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

describe('imported functions', () => {
  it('should be non-zero', () => {
    const OUTPUT = Object.keys(blsSdk).length;

    expect(OUTPUT).toBeGreaterThan(0);
  });
});

describe('blsSdk', () => {
  beforeAll(async () => {
    await blsSdk.initWasmBlsSdk();
  });

  it('should encrypt a message', async () => {
    // execute
    const ciphertext = blsSdk.encrypt(
      publicKey,
      byteArrayToHex(secretMessage),
      byteArrayToHex(identityParam)
    );

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
    const plaintext = blsSdk.decrypt_with_signature_shares(
      ciphertext,
      signatureShares.slice(0, 2).map((s) =>
        JSON.stringify({
          ProofOfPossession: s,
        })
      )
    );

    // assert
    expect(new Uint8Array(base64ToArrayBuffer(plaintext))).toEqual(
      secretMessage
    );
  });

  it('should verify + decrypt', async () => {
    // prepare
    const ciphertext =
      'l9a/01WDJB/euKxtbWcuQ8ez/c9eZ+jQryTHZVLN0kfd7XHoLs6FeWUVmk89ovQGkQJnnFDKjq6kgJxvIIrxXd9DaGuRBozLdA1G9Nk413YhTEqsENuHU0nSa4i6F912KltE15sbWKpDfPnZF6CA2UKBAw==';
    const signatureShares = [
      '01b2b44a0bf7184f19efacad98e213818edd3f8909dd798129ef169b877d68d77ba630005609f48b80203717d82092a45b06a9de0e61a97b2672b38b31f9ae43e64383d0375a51c75db8972613cc6b099b95c189fd8549ed973ee94b08749f4cac',
      '02a8343d5602f523286c4c59356fdcfc51953290495d98cb91a56b59bd1a837ea969cc521382164e85787128ce7f944de303d8e0b5fc4becede0c894bec1adc490fdc133939cca70fb3f504b9bf7b156527b681d9f0619828cd8050c819e46fdb1',
      '03b1594ab0cb56f47437b3720dc181661481ca0e36078b79c9a4acc50042f076bf66b68fbd12a1d55021a668555f0eed0a08dfe74455f557b30f1a9c32435a81479ca8843f5b74b176a8d10c5845a84213441eaaaf2ba57e32581584393541c5aa',
    ];

    // execute
    const plaintext = blsSdk.verify_and_decrypt_with_signature_shares(
      publicKey,
      arrayBufferToBase64(identityParam),
      ciphertext,
      signatureShares.slice(0, 2).map((s) =>
        JSON.stringify({
          ProofOfPossession: s,
        })
      )
    );

    // assert
    expect(new Uint8Array(base64ToArrayBuffer(plaintext))).toEqual(
      secretMessage
    );
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
    const combinedSignature = blsSdk.combine_signature_shares(
      signatureShares.map((s) => JSON.stringify(s))
    );

    // assert
    expect(combinedSignature.length).toEqual(192);
  });

  it('should verify signature', async () => {
    const publicKey =
      'ad1bd6c66f849ccbcc20fa08c26108f3df7db0068df032cc184779cc967159da4dd5669de563af7252b540f0759aee5a';

    // execute
    blsSdk.verify_signature(
      publicKey,
      'ZXlKaGJHY2lPaUpDVEZNeE1pMHpPREVpTENKMGVYQWlPaUpLVjFRaWZRLmV5SnBjM01pT2lKTVNWUWlMQ0p6ZFdJaU9pSXdlRFF5TlRsbE5EUTJOekF3TlRNME9URmxOMkkwWm1VMFlURXlNR00zTUdKbE1XVmhaRFkwTm1JaUxDSmphR0ZwYmlJNkltVjBhR1Z5WlhWdElpd2lhV0YwSWpveE5qZzNOVFl5TWpjMUxDSmxlSEFpT2pFMk9EYzJNRFUwTnpVc0ltRmpZMlZ6YzBOdmJuUnliMnhEYjI1a2FYUnBiMjV6SWpwYmV5SmpiMjUwY21GamRFRmtaSEpsYzNNaU9pSWlMQ0pqYUdGcGJpSTZJbVYwYUdWeVpYVnRJaXdpYzNSaGJtUmhjbVJEYjI1MGNtRmpkRlI1Y0dVaU9pSWlMQ0p0WlhSb2IyUWlPaUlpTENKd1lYSmhiV1YwWlhKeklqcGJJanAxYzJWeVFXUmtjbVZ6Y3lKZExDSnlaWFIxY201V1lXeDFaVlJsYzNRaU9uc2lZMjl0Y0dGeVlYUnZjaUk2SWowaUxDSjJZV3gxWlNJNklqQjROREkxT1VVME5EWTNNREExTXpRNU1VVTNZalJHUlRSQk1USXdRemN3WW1VeFpVRkVOalEyWWlKOWZWMHNJbVYyYlVOdmJuUnlZV04wUTI5dVpHbDBhVzl1Y3lJNmJuVnNiQ3dpYzI5c1VuQmpRMjl1WkdsMGFXOXVjeUk2Ym5Wc2JDd2lkVzVwWm1sbFpFRmpZMlZ6YzBOdmJuUnliMnhEYjI1a2FYUnBiMjV6SWpwdWRXeHNmUQ==',
      'trkIFY8XLxWAHvErjc5sEMfyEMjDVW0m4zSEiO8Ladb+F2vsaUmBMPIR4axyHdayDJ7/qdxUsxM1Xt/AUMcYRCVbUqNZZmkAGtOFGODAjieGdv9Q3aPnsrQXkDzW0ITP'
    );
  });
});

function base64ToArrayBuffer(base64) {
  var binaryString = atob(base64);
  var bytes = new Uint8Array(binaryString.length);
  for (var i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes.buffer;
}

function arrayBufferToBase64(buffer) {
  var binary = '';
  var bytes = new Uint8Array(buffer);
  var len = bytes.byteLength;
  for (var i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function byteArrayToHex(byteArray: Uint8Array) {
  return Array.from(byteArray, function (byte: any) {
    return ('0' + (byte & 0xff).toString(16)).slice(-2);
  }).join('');
}
