import path from 'path';
import { success, fail, testThis } from '../../tools/scripts/utils.mjs';
import LITCONFIG from '../../lit.config.json' assert { type: 'json' };
import { client } from '../00-setup.mjs';

export async function main() {
  // ==================== Setup ====================
  // const xxx = 'yyy';
  // ==================== Test Logic ====================
  // const res = await client.executeJs({
  //   authSig: LITCONFIG.CONTROLLER_AUTHSIG,
  //   code: `(async () => {
  //     console.log('hello world')
  //   })();`,
  //   jsParams: {
  //     publicKey: LITCONFIG.PKP_PUBKEY,
  //   },
  // });
  // ==================== Post-Validation ====================
  // if (!res.logs.includes('hello world')) {
  //   return fail('lit action client should be ready');
  // }
  // if (!res.success) {
  //   return fail('response should be success');
  // }
  // ==================== Success ====================
  // return success('Lit Action should log "hello world"');
}

await testThis({ name: path.basename(import.meta.url), fn: main });
