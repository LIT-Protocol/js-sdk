import path from 'path';
import { success, fail, testThis } from '../../tools/scripts/utils.mjs';
import * as LitJsSdk from '@lit-protocol/lit-node-client';
import { LocalStorage } from 'node-localstorage';

export async function main() {
  const client = new LitNodeClient({
    litNetwork: globalThis.LitCI.network,
    debug: globalThis.LitCI.debug,
    minNodeCount: globalThis.LitCI.minNodeCount,
    checkNodeAttestation: globalThis.LitCI.sevAttestation,
    storageProvider: {
      provider: new LocalStorage('./storage.test.db'),
    },
  });

  await client.connect();
  let blockhash = await client.getLatestBlockhash();
  await Promise.resolve(
    new Promise((resolve, reject) => {
      setTimeout(resolve, 40_000);
    })
  );
  let updatedBlockhash = await client.getLatestBlockhash();

  if (blockhash === updatedBlockhash) {
    fail('block hash should be updated from handshake');
  }
  console.log('block hashes: ', blockhash, updatedBlockhash);
  return success('block hash updates after expiration period');
}

await testThis({ name: path.basename(import.meta.url), fn: main });
