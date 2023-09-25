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

  // -- should have claimData
  Object.entries(res.claimData).forEach(([key, value]) => {
    if (key !== 'foo' || key !== 'bar') {
      return fail(`claimData should have "foo" or "bar" key`);
    }

    if (
      res.claimData === undefined ||
      res.claimData === null ||
      Object.keys(res.claimData).length === 0
    ) {
      return fail(`claimData should not be empty`);
    }

    if (res.claimData[key] === undefined) {
      return fail(`claimData should have "${key}" key`);
    }

    if (
      res.claimData[key].signature === undefined ||
      res.claimData[key].signature === null ||
      res.claimData[key].signature === ''
    ) {
      return fail(`claimData[${key}] should have signature`);
    }

    if (
      res.claimData[key].derivedKeyId === undefined ||
      res.claimData[key].derivedKeyId === null ||
      res.claimData[key].derivedKeyId === ''
    ) {
      return fail(`claimData[${key}] should have derivedKeyId`);
    }
  });

  // ==================== Success ====================
  return success('Lit Action should return grouped claims');
}

await testThis({ name: path.basename(import.meta.url), fn: main });
