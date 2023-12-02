import path from 'path';
import { success, fail, testThis } from '../../tools/scripts/utils.mjs';
import LITCONFIG from '../../lit.config.json' assert { type: 'json' };
import { client } from '../00-setup.mjs';

export async function main() {
  // ==================== Test Logic ====================
  const res = await client.executeJs({
    authSig: globalThis.LitCI.CONTROLLER_AUTHSIG,
    code: `(async () => {
      console.log('hello world')
    })();`,
    jsParams: {
      publicKey: globalThis.LitCI.PKP_INFO.publicKey,
    },
  });

  // ==================== Post-Validation ====================
  if (!res.logs.includes('hello world')) {
    return fail('lit action client should be ready');
  }

  if (!res.success) {
    return fail('response should be success');
  }

  // ==================== Success ====================
  return success('Lit Action should log "hello world"');
}

await testThis({ name: path.basename(import.meta.url), fn: main });
