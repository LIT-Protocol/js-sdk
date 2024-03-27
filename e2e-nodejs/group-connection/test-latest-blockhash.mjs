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

  const latestBlockhash = await litNodeClient.getLatestBlockhash();

  // ==================== Post-Validation ====================
  if (!latestBlockhash) {
    return fail('latest blockhash not found');
  }

  if (!latestBlockhash.startsWith('0x')) {
    return fail('latest blockhash not in hex format');
  }

  // ==================== Success ====================
  return success(`Latest blockhash found: ${latestBlockhash}`);
}

await testThis({ name: path.basename(import.meta.url), fn: main });
