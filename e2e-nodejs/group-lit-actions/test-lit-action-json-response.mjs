import path from 'path';
import { success, fail, testThis } from '../../tools/scripts/utils.mjs';
import LITCONFIG from '../../lit.config.json' assert { type: 'json' };
import { client } from '../00-setup.mjs';

export async function main() {
  // ==================== Test Logic ====================
  const res = await client.executeJs({
    authSig: LITCONFIG.CONTROLLER_AUTHSIG,
    code: `(async () => {
      console.log('hello world')

      LitActions.setResponse({
        response: JSON.stringify({hello: 'world'})
      });

    })();`,
    jsParams: {
      toSign: [1, 2, 3, 4, 5],
      publicKey: LITCONFIG.PKP_PUBKEY,
      sigName: 'fooSig',
    },
  });

  // ==================== Post-Validation ====================
  if (!res.success) {
    return fail(`response should be success`);
  }

  if (Object.keys(res.signedData).length > 0) {
    return fail(`signedData should be empty`);
  }

  if (Object.keys(res.decryptedData).length > 0) {
    return fail(`decryptedData should be empty`);
  }

  if (Object.keys(res.claimData).length > 0) {
    return fail(`claimData should be empty`);
  }

  let jsonRes;

  try {
    jsonRes = JSON.parse(res.response);
  } catch (e) {
    return fail(`response should be a valid JSON`);
  }

  if (jsonRes.hello !== 'world') {
    return fail(
      `jsonRes.hello should be "world" but received "${jsonRes.hello}"`
    );
  }

  // ==================== Success ====================
  return success('Lit Action should be able reply with a JSON response');
}

await testThis({ name: path.basename(import.meta.url), fn: main });
