import path from 'path';
import { success, fail, testThis } from '../../tools/scripts/utils.mjs';
import LITCONFIG from '../../lit.config.json' assert { type: 'json' };
import { LitNodeClient } from '@lit-protocol/lit-node-client';
import {LitContracts} from '@lit-protocol/contracts-sdk';

const LIT_NETWORK = 'cayenne';

export async function main() {
  // ==================== Test Logic ====================
  const client = new LitNodeClient({
    litNetwork: LIT_NETWORK
  });
  await client.connect();

  // ==================== Post-Validation ====================
  if (!client.ready) {
    return fail('client not ready');
  }
  if (client.config.litNetwork !== LIT_NETWORK) {
    return fail(`client not connected to ${LIT_NETWORK}`);
  }


  let threshold = await LitContracts.getMinNodeCount(LIT_NETWORK);
  console.log(`threshold ${threshold}`);
  console.log(`config threshold ${client.config.threshold}`)
  client.config.threshold
  if (client.config.minNodeCount !== threshold) {
    return fail(`threshold does not match config threshold, network state diverged`);
  }

  // ==================== Success ====================
  return success(`Connected to ${LIT_NETWORK}`);
}

await testThis({ name: path.basename(import.meta.url), fn: main });