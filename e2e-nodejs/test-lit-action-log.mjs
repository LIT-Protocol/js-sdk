import path from 'path';
import { LitNodeClient } from '@lit-protocol/lit-node-client';
import { success, fail, testThis } from '../tools/scripts/utils.mjs';
import LITCONFIG from '../lit.config.json' assert { type: 'json' };

// -- setup
const client = new LitNodeClient({
  litNetwork: LITCONFIG.TEST_ENV.litNetwork,
  debug: LITCONFIG.TEST_ENV.debug,
  minNodeCount: LITCONFIG.TEST_ENV.minNodeCount,
});
await client.connect();

// -- test
export async function main() {
  if (client.ready !== true) {
    return fail('client not ready');
  }

  if (LITCONFIG.CONTROLLER_AUTHSIG === undefined) {
    return fail('Controller authSig cannot be empty');
  }

  if (LITCONFIG.PKP_PUBKEY === undefined) {
    return fail('PKP pubkey cannot be empty');
  }

  const res = await client.executeJs({
    authSig: LITCONFIG.CONTROLLER_AUTHSIG,
    code: `(async () => {
      console.log('hello world')
    })();`,
    jsParams: {
      publicKey: LITCONFIG.PKP_PUBKEY,
    },
  });

  if (!res.logs.includes('hello world')) {
    return fail('lit action client should be ready');
  }

  if (!res.success) {
    return fail('response should be success');
  }

  return success('Lit Action should log "hello world"');
}

await testThis({ name: path.basename(import.meta.url), fn: main });
