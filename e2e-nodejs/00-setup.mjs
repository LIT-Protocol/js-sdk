import { LitNodeClient } from '@lit-protocol/lit-node-client';
import LITCONFIG from '../lit.config.json' assert { type: 'json' };
import { fail } from '../tools/scripts/utils.mjs';

const client = new LitNodeClient({
  litNetwork: LITCONFIG.TEST_ENV.litNetwork,
  debug: process.env.DEBUG === 'true' ?? LITCONFIG.TEST_ENV.debug,
  minNodeCount: LITCONFIG.TEST_ENV.minNodeCount,
  checkNodeAttestation: false,
});
await client.connect();

// ==================== Validation ====================
if (client.ready !== true) {
  fail('client not ready');
}

if (LITCONFIG.CONTROLLER_AUTHSIG === undefined) {
  fail('Controller authSig cannot be empty');
}

if (LITCONFIG.PKP_PUBKEY === undefined) {
  fail('PKP pubkey cannot be empty');
}

// ==================== Success ====================
export { client };
