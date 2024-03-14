import { LitNodeClient } from '@lit-protocol/lit-node-client';
import crypto from '../polyfills.mjs';

if (typeof globalThis.crypto === 'undefined') {
  globalThis.crypto = crypto;
}

globalThis.litConfig = {
  debug: true,
};

const DATA_TO_SIGN = new Uint8Array(
  await crypto.subtle.digest('SHA-256', new TextEncoder().encode('Hello world'))
);

export async function main() {
  try {
    const litNodeClient = new LitNodeClient({
      litNetwork: 'cayenne',
      debug: true,
    });

    await litNodeClient.connect();

    // for every second, get new epoch number
    setInterval(async () => {
      try {
        const epochNumber = litNodeClient.currentEpochNumber;
        console.log('epochNumber:', epochNumber);
      } catch (e) {
        console.log(e);
      }
    }, 1000);
  } catch (e) {
    console.log(e);
  }
}

main();
