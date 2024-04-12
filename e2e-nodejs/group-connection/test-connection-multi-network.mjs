import path from 'path';
import { success, fail, testThis, log } from '../../tools/scripts/utils.mjs';
import { LitNodeClient } from '@lit-protocol/lit-node-client';
import { LocalStorage } from 'node-localstorage';
export async function main() {
  const networks = ['cayenne', 'habanero', 'manzano'];

  for (const network of networks) {
    // ==================== Test Logic ====================
    const client = new LitNodeClient({
      litNetwork: network,
      debug: globalThis.LitCI.debug,
      storageProvider: {
        provider: new LocalStorage('./storage.test.db'),
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
  }

  // ==================== Success ====================
  return success(`Connected to ${networks.join(', ')}`);
}

await testThis({ name: path.basename(import.meta.url), fn: main });
