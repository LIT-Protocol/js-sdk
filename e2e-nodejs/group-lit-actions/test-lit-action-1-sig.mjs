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
    authSig: globalThis.LitCI.CONTROLLER_AUTHSIG,
    code: `(async () => {
      const sigShare = await LitActions.signEcdsa({
        toSign: dataToSign,
        publicKey,
        sigName: "sig",
      });
    })();`,
    authMethods: [],
    jsParams: {
      dataToSign: TO_SIGN,
      publicKey: globalThis.LitCI.PKP_INFO.publicKey,
    },
  });

  // ==================== Post-Validation ====================
  if (Object.keys(res.signatures).length <= 0) {
    return fail(
      `should have at least 1 signature but received ${
        Object.keys(res.signatures).length
      }`
    );
  }

  ['sig', 'r', 's', 'recid', 'signature', 'publicKey', 'dataSigned'].forEach(
    (key) => {
      if (!res.signatures.sig[key]) {
        return fail(`sig.${key} is undefined, empty, or null`);
      }
    }
  );

  // ==================== Success ====================
  return success('Lit Action should log sign x1 sig');
}

await testThis({ name: path.basename(import.meta.url), fn: main });
