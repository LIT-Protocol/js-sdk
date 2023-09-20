import { LitNodeClient } from '@lit-protocol/lit-node-client';
import LITCONFIG from '../lit.config.json' assert { type: 'json' };

const client = new LitNodeClient({
  litNetwork: LITCONFIG.TEST_ENV.litNetwork,
  debug: process.env.DEBUG ?? LITCONFIG.TEST_ENV.debug,
  minNodeCount: LITCONFIG.TEST_ENV.minNodeCount,
});
await client.connect();

export { client };
