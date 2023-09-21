import path from 'path';
import { success, fail, testThis } from '../../tools/scripts/utils.mjs';
import LITCONFIG from '../../lit.config.json' assert { type: 'json' };
import { client } from '../00-setup.mjs';
import { ethers } from 'ethers';

// NOTE: you need to hash data before you send it in.
// If you send something that isn't 32 bytes, the nodes will return an error.
const TO_SIGN = ethers.utils.arrayify(ethers.utils.keccak256([1, 2, 3, 4, 5]));

export async function main() {
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

      const sigShares = await signMultipleSigs(numberOfSigs, toSign, publicKey);

    })();`,
    jsParams: {
      numberOfSigs: 2,
      toSign: TO_SIGN,
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

  // Checking each sig in the signatures array
  Object.entries(res.signatures).forEach(([key, sig]) => {
    if (key !== 'sig0' && key !== 'sig1') {
      return fail(`sig name ${key} is not expected`);
    }

    ['r', 's', 'recid', 'signature', 'publicKey', 'dataSigned'].forEach(
      (key) => {
        if (!sig[key]) {
          return fail(`sig.${key} is undefined, empty, or null`);
        }
      }
    );
  });

  // ==================== Success ====================
  return success('Lit Action should be able to sign data x2 sigs');
}

await testThis({ name: path.basename(import.meta.url), fn: main });
