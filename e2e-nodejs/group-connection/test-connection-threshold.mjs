import path from 'path';
import { success, fail, testThis } from '../../tools/scripts/utils.mjs';
import LITCONFIG from '../../lit.config.json' assert { type: 'json' };
import { LitNodeClient } from '@lit-protocol/lit-node-client';
import {LitContracts} from '@lit-protocol/contracts-sdk';



export async function main() {
  // ==================== Test Logic ====================
  const client = new LitNodeClient({
    litNetwork: globalThis.LitCI.network,
    debug: LITCONFIG.TEST_ENV.debug,
    checkNodeAttestation: globalThis.LitCI.sevAttestation
  });
  await client.connect();

  // ==================== Post-Validation ====================
  if (!client.ready) {
    return fail('client not ready');
  }
  if (client.config.litNetwork !== globalThis.LitCI.network) {
    return fail(`client not connected to ${globalThis.LitCI.network}`);
  }


  let threshold = await LitContracts.getMinNodeCount(globalThis.LitCI.network);
  console.log(`threshold ${threshold}`);
  console.log(`config threshold ${client.config.minNodeCount}`);

  if (parseInt(client.config.minNodeCount, 10) !== parseInt(threshold, 10)) {
    return fail(`threshold does not match config threshold, network state diverged`);
  }

  // ==================== Success ====================
  return success(`Connected to ${globalThis.LitCI.network}`);
}

await testThis({ name: path.basename(import.meta.url), fn: main });