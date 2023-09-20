import path from 'path';
import { success, fail, testThis } from '../tools/scripts/utils.mjs';
import LITCONFIG from '../lit.config.json' assert { type: 'json' };
import { client } from './00-setup.mjs';

export async function main() {
  // ==================== Pre-Validation ====================
  if (client.ready !== true) {
    return fail('client not ready');
  }

  if (LITCONFIG.CONTROLLER_AUTHSIG === undefined) {
    return fail('Controller authSig cannot be empty');
  }

  if (LITCONFIG.PKP_PUBKEY === undefined) {
    return fail('PKP pubkey cannot be empty');
  }

  // ==================== Test Logic ====================
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

  // ==================== Post-Validation ====================
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

  // ==================== Success ====================
  return success('Lit Action should be able to sign data');
}

await testThis({ name: path.basename(import.meta.url), fn: main });
