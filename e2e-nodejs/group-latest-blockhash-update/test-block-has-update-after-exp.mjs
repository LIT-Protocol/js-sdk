import path from 'path';
import { success, fail, testThis } from '../../tools/scripts/utils.mjs';
import { LitNodeClient } from '@lit-protocol/lit-node-client';
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
  console.log(client.hdRootPubkeys);
  let subnetKey = '' + client.subnetPubKey;
  let rootKeys = client.hdRootPubkeys;
  let blockhash = await client.getLatestBlockhash();
  await new Promise((resolve, _reject) => {
    setTimeout(resolve, 35_000);
  });

  let updatedBlockhash = await client.getLatestBlockhash();

  if (blockhash === updatedBlockhash) {
    return fail('block hash should be updated from handshake');
  }

  if (
    rootKeys.filter((item) => client.hdRootPubkeys.includes(item) === false)
      .length > 0 ||
    subnetKey != client.subnetPubKey
  ) {
    console.log(
      'current root keys: ',
      client.hdRootPubkeys,
      'old root keys: ',
      rootKeys
    );
    console.log(
      'old subnet key: ',
      subnetKey,
      'current subnnet key: ',
      client.subnetPubKey
    );
    return fail('network properties do not match after syncing');
  }
  console.log('block hashes: ', blockhash, updatedBlockhash);
  return success('block hash updates after expiration period');
}

await testThis({ name: path.basename(import.meta.url), fn: main });
