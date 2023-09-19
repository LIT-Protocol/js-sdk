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
      const sigShare = await LitActions.signEcdsa({
        toSign,
        publicKey,
        sigName
      });
    })();`,
    jsParams: {
      toSign: [1, 2, 3, 4, 5],
      publicKey: LITCONFIG.PKP_PUBKEY,
      sigName: 'fooSig',
    },
  });

  console.log('res:', res);

  // ----- validate response
  if (res.signatures.fooSig === undefined) {
    return fail(`cannot find "fooSig" signature`);
  } else {
    const sig = res.signatures.fooSig;

    if (sig.r === undefined) {
      return fail(`sig.r is undefined`);
    }

    if (sig.s === undefined) {
      return fail(`sig.s is undefined`);
    }

    if (sig.recid === undefined) {
      return fail(`sig.recid is undefined`);
    }

    if (sig.signature === undefined) {
      return fail(`sig.signature is undefined`);
    }

    if (sig.publicKey === undefined) {
      return fail(`sig.publicKey is undefined`);
    }

    if (sig.dataSigned === undefined) {
      return fail(`sig.dataSigned is undefined`);
    }
  }

  // -- all good
  return success('Lit Action should log "hello world"');
}

await testThis({ name: path.basename(import.meta.url), fn: main });
