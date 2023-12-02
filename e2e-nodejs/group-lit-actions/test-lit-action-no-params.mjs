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
        LitActions.setResponse({
            response: JSON.stringify({success: true})
          });
    })();`,
    authMethods: [],
  });

  // ==================== Post-Validation ====================
  let jsonRes;

  try {
    jsonRes = JSON.parse(res.response);
  } catch (e) {
    return fail(`response should be a valid JSON`);
  }

  if (jsonRes.success !== true) {
    return fail(
      `jsonRes.success should be true but received "${jsonRes.success}"`
    );
  }

  // ==================== Success ====================
  return success('Lit action should return response with no params given');
}

await testThis({ name: path.basename(import.meta.url), fn: main });
