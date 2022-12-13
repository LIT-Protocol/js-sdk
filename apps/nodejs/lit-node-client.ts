import * as litNodeClient from '@lit-protocol/lit-node-client';

export const litNodeClientTest = async () => {
  console.log(
    '------------------------------ litNodeClientTest ------------------------------'
  );

    // console.log('litNodeClient:', litNodeClient);

  let test;
  try {
    const test = await litNodeClient.zipAndEncryptString(
      'this is a secret message'
    );
  } catch (e) {
    console.log(e);
  }

  console.log('test:', test);
};
