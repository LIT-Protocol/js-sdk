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
      console.log('hello world')

      async function signMultipleSigs(numSigs, toSign, publicKey) {
        const sigShares = [];
        for(let i = 0; i < numSigs; i++) {
          const sigShare = await LitActions.signEcdsa({
            toSign,
            publicKey,
            sigName: "sig" + i,
          });
          sigShares.push(sigShare);
        }
        return sigShares;
      }

      const sigShares = await signMultipleSigs(numberOfSigs, [1,2,3,4,5], publicKey);

    })();`,
    jsParams: {
      numberOfSigs: 2,
      toSign: [1, 2, 3, 4, 5],
      publicKey: LITCONFIG.PKP_PUBKEY,
      sigName: 'fooSig',
    },
  });

  // ==================== Post-Validation ====================
  if (Object.keys(res.signatures).length !== 2) {
    return fail(
      `should have 2 signatures but received ${
        Object.keys(res.signatures).length
      }`
    );
  }

  Object.entries(res.signatures).forEach(([key, sig]) => {
    if (key !== 'sig0' && key !== 'sig1') {
      return fail(`sig name ${key} is not expected`);
    }

    // sig should have r, s, recid, signature, publicKey, dataSigned
    // *** sig.r cannot be undefined or an empty string
    if (sig.r === undefined || sig.r === '') {
      return fail(`sig.r is undefined or an empty string`);
    }

    // *** sig.s cannot be undefined or an empty string
    if (sig.s === undefined || sig.s === '') {
      return fail(`sig.s is undefined or an empty string`);
    }

    // *** sig.recid cannot be undefined, an empty string, or a non-number
    if (
      sig.recid === undefined ||
      sig.recid === '' ||
      typeof sig.recid !== 'number'
    ) {
      return fail(`sig.recid is undefined, an empty string, or not a number`);
    }

    // *** sig.signature cannot be undefined or an empty string
    if (sig.signature === undefined || sig.signature === '') {
      return fail(`sig.signature is undefined or an empty string`);
    }

    // *** sig.publicKey cannot be undefined or an empty string
    if (sig.publicKey === undefined || sig.publicKey === '') {
      return fail(`sig.publicKey is undefined or an empty string`);
    }

    // *** sig.dataSigned cannot be undefined or an empty string
    if (sig.dataSigned === undefined || sig.dataSigned === '') {
      return fail(`sig.dataSigned is undefined or an empty string`);
    }
  });

  // ==================== Success ====================
  return success('Lit Action should be able to sign data');
}

await testThis({ name: path.basename(import.meta.url), fn: main });
