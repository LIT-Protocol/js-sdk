import path from 'path';
import { success, fail, testThis } from '../../tools/scripts/utils.mjs';

import { LitNodeClient } from '@lit-protocol/lit-node-client';

const LIT_NETWORK = 'internalDev';

export async function main() {
  // ==================== Test Logic ====================
  const client = new LitNodeClient({
    litNetwork: 'internalDev',
    checkNodeAttestation: true
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