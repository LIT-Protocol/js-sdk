import { LitNodeClient } from '@lit-protocol/lit-node-client';
import crypto from '../polyfills.mjs';

if (typeof globalThis.crypto === 'undefined') {
  globalThis.crypto = crypto;
}

globalThis.litConfig = {
  debug: true
}

const DATA_TO_SIGN = new Uint8Array(
  await crypto.subtle.digest('SHA-256', new TextEncoder().encode('Hello world'))
);

export async function main() {
  // ==================== Test Logic ====================
  const litNodeClient = new LitNodeClient({
    litNetwork: 'cayenne',
    debug: true,
  });

  await litNodeClient.connect();

  // for every second, get new epoch number
  setInterval(async () => {
    const epochNumber = await litNodeClient.getCurrentEpochNumber();
    console.log('epochNumber:', epochNumber);
  }, 1000);
}

main();
