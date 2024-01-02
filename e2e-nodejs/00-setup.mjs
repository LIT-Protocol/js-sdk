import { LitNodeClient } from '@lit-protocol/lit-node-client';
import LITCONFIG from '../lit.config.json' assert { type: 'json' };
import { fail } from '../tools/scripts/utils.mjs';
import { LocalStorage } from 'node-localstorage';

const client = new LitNodeClient({
  litNetwork: globalThis.LitCI.network,
  debug: globalThis.LitCI.debug,
  minNodeCount: globalThis.LitCI.minNodeCount,
  checkNodeAttestation: globalThis.LitCI.sevAttestation,
  storageProvider: {
    provider: new LocalStorage('./storage.test.db'),
  },
});
await client.connect();

// ==================== Validation ====================
if (client.ready !== true) {
  fail('client not ready');
}

if (LITCONFIG.CONTROLLER_AUTHSIG === undefined) {
  fail('Controller authSig cannot be empty');
}

// ==================== Success ====================
export { client };
