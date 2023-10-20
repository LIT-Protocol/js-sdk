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
      Lit.Actions.claimKey({keyId: "bar"});
    })();`,
    jsParams: {
      // Nada!
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

  // -- should have claims
  Object.entries(res.claims).forEach(([key, value]) => {
    if (key !== 'foo' || key !== 'bar') {
      return fail(`claims should have "foo" or "bar" key`);
    }

    if (
      res.claims === undefined ||
      res.claims === null ||
      Object.keys(res.claims).length === 0
    ) {
      return fail(`claims should not be empty`);
    }

    if (res.claims[key] === undefined) {
      return fail(`claims should have "${key}" key`);
    }

    if (
      res.claims[key].signature === undefined ||
      res.claims[key].signature === null ||
      res.claims[key].signature.length < 1
    ) {
      return fail(`claims[${key}] should have signature`);
    }

    if (
      res.claims[key].derivedKeyId === undefined ||
      res.claims[key].derivedKeyId === null ||
      res.claims[key].derivedKeyId === ''
    ) {
      return fail(`claims[${key}] should have derivedKeyId`);
    }

    for (let i = 0; i < res.claims[key].signatures.length; i++) {
      if (!res.claims[key].signatures[i].r || !res.claims[key].signatures[i].s || res.claims[key].signatures[i].v) {
        return fail(`signature data mis formed, should be of ethers signature format`);
      }
    }
  });

  // ==================== Success ====================
  return success('Lit Action should return grouped claims');
}

await testThis({ name: path.basename(import.meta.url), fn: main });
