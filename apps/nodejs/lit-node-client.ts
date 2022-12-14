import * as litNodeClient from '@lit-protocol/lit-node-client';

// globalThis.crypto = require('crypto').webcrypto;
// globalThis.Blob = require('node:buffer').Blob;

export const litNodeClientTest = async () => {
  console.log(
    '------------------------------ litNodeClientTest ------------------------------'
  );

  // console.log('globalThis.crypto:', globalThis.crypto);
  // const key = await globalThis.crypto.subtle.generateKey(
  //   {
  //     name: 'AES-CBC',
  //     length: 256,
  //   },
  //   true,
  //   ['encrypt', 'decrypt']
  // );
  // console.log('key:', key);
  // console.log('litNodeClient:', litNodeClient);

  const test = await litNodeClient.zipAndEncryptString(
    'this is a secret message'
  );

  console.log('test:', test);
};