import path from 'path';
import { success, fail, testThis, log } from '../../tools/scripts/utils.mjs';
import { LitNodeClient } from '@lit-protocol/lit-node-client';
import { LocalStorage } from 'node-localstorage';
export async function main() {
  const networks = ['habanero', 'manzano'];
  const storageProvider = new LocalStorage('./storage.test.db');
  for (const network of networks) {
    // ==================== Test Logic ====================
    const client = new LitNodeClient({
      litNetwork: network,
      debug: globalThis.LitCI.debug,
      storageProvider: {
        provider: storageProvider,
      },
    });
    log(`connecting to ${network.toUpperCase()}...`);
    await client.connect();

    // ==================== Post-Validation ====================
    if (!client.ready) {
      return fail('client not ready');
    }
    if (client.config.litNetwork !== network) {
      return fail(`client not connected to ${network}`);
    }

    if (storageProvider.length < 1) {
      fail(`cache is not hydrated with certificates`);
    }

    if (storageProvider.length < client.config.bootstrapUrls) {
      fail(
        `cache is not hydrated with enough certificates found: ${storageProvider.length} need ${client.config.bootstrapUrls.length}`
      );
    }
    for (let i = 0; i < storageProvider.length; i++) {
      const key = storageProvider.key(i);
      if (!key.includes('https://kdsintf.amd.com/vcek/')) {
        fail(
          'found cache item which does not match indexing schema should contain: https://kdsintf.amd.com/vcek/v1/Milan/'
        );
      }
    }
  }

  // ==================== Success ====================
  return success(
    `Connected to ${networks.join(', ')} and found certs in cache`
  );
}

await testThis({ name: path.basename(import.meta.url), fn: main });
