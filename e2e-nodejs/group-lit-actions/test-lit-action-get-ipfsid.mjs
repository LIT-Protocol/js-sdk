import path from 'path';
import { success, fail, testThis } from '../../tools/scripts/utils.mjs';
import LITCONFIG from '../../lit.config.json' assert { type: 'json' };
import { client } from '../00-setup.mjs';

export async function main() {
  // ==================== Test Logic ====================
  const ipfsCid = await client.getIpfsId({
    authSig: globalThis.LitCI.CONTROLLER_AUTHSIG,
    dataToHash: 'Hakuna Matata',
  });

  console.log('ipfsCid:', ipfsCid);

  // ==================== Post-Validation ====================
  if (!ipfsCid) {
    return fail('Lit Action failed to return IPFS CID');
  }

  // ==================== Success ====================
  return success('Lit Action return IPFS CID successfully');
}

await testThis({ name: path.basename(import.meta.url), fn: main });
