import path from 'path';
import { success, fail, testThis } from '../../tools/scripts/utils.mjs';
import LITCONFIG from '../../lit.config.json' assert { type: 'json' };
import { client } from '../00-setup.mjs';

export async function main() {
  // ==================== Test Logic ====================
  const res = await client.executeJs({
    authSig: LITCONFIG.CONTROLLER_AUTHSIG,
    code: `(async () => {
      Lit.Actions.claimKey({keyId: "foo"});
    })();`,
    authMethods: [],
    jsParams: {
      // Nada!
    },
  });

  // ==================== Post-Validation ====================
  if (!res.success && !res.claims) {
    return fail(`response should be success`);
  }

  // -- should have claimData
  if (
    res.claims === undefined ||
    res.claims === null ||
    Object.keys(res.claims).length === 0
  ) {
    return fail(`claimData should not be empty`);
  }

  if (res.claims['foo'] === undefined) {
    return fail(`claimData should have "foo" key`);
  }

  ['signature', 'derivedKeyId'].forEach((key) => {
    if (!res.claims.foo[key]) {
      return fail(`claimData.foo should have ${key}`);
    }
  });
  const key = 'foo';
  for (let i = 0; i < res.claims[key].signatures.length; i++) {
    if (!res.claims[key].signatures[i].r || !res.claims[key].signatures[i].s || !res.claims[key].signatures[i].v) {
      return fail(`signature data misformed, should be of ethers signature format`);
    }
  }

  // ==================== Success ====================
  return success('Lit Action should return claim');
}

await testThis({ name: path.basename(import.meta.url), fn: main });
