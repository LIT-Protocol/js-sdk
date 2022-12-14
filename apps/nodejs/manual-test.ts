import * as litNodeClient from '@lit-protocol/lit-node-client';

console.log(
  '------------------------------ litNodeClientTest ------------------------------'
);
// globalThis.crypto = require('crypto').webcrypto;
// globalThis.Blob = require('node:buffer').Blob;

export const manualTest = async () => {
  const test = await litNodeClient.zipAndEncryptString(
    'this is a secret message'
  );

  // console.log('test:', test);
};