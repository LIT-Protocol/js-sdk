import path from 'path';
import { success, fail, testThis } from '../../tools/scripts/utils.mjs';
import LITCONFIG from '../../lit.config.json' assert { type: 'json' };
import { LitNodeClient } from '@lit-protocol/lit-node-client';

const LIT_NETWORK = 'cayenne';

export async function main() {
  // ==================== Test Logic ====================
  const client = new LitNodeClient({
    litNetwork: LIT_NETWORK,
    debug: process.env.DEBUG === 'true' ?? LITCONFIG.TEST_ENV.debug,

    minNodeCount: LITCONFIG.TEST_ENV.minNodeCount,
  });
  await client.connect();

  // ==================== Post-Validation ====================
  if (!client.ready) {
    return fail('client not ready');
  }
  if (client.config.litNetwork !== LIT_NETWORK) {
    return fail(`client not connected to ${LIT_NETWORK}`);
  }

  // ==================== Success ====================
  return success(`Connected to ${LIT_NETWORK}`);
}

await testThis({ name: path.basename(import.meta.url), fn: main });
