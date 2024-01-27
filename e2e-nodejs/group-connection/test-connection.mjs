import path from 'path';
import { success, fail, testThis } from '../../tools/scripts/utils.mjs';
import LITCONFIG from '../../lit.config.json' assert { type: 'json' };
import { LitNodeClient } from '@lit-protocol/lit-node-client';

const LIT_NETWORK = 'cayenne';

export async function main() {
  // ==================== Test Logic ====================
  const client = new LitNodeClient({
    litNetwork: globalThis.LitCI.network,
    debug: globalThis.LitCI.debug,
    checkNodeAttestation: globalThis.LitCI.sevAttestation,
  });
  await client.connect();

  // ==================== Post-Validation ====================
  if (!client.ready) {
    return fail('client not ready');
  }
  if (client.config.litNetwork !== globalThis.LitCI.network) {
    return fail(`client not connected to ${globalThis.LitCI.network}`);
  }

  // ==================== Success ====================
  return success(`Connected to ${globalThis.LitCI.network}`);
}

await testThis({ name: path.basename(import.meta.url), fn: main });
