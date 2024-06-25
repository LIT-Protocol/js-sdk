import { log } from '@lit-protocol/misc';
import { TinnyEnvironment } from 'local-tests/setup/tinny-environment';
import {
  customGeneratePrivateKey,
} from '@lit-protocol/wrapped-keys';
import { getPkpSessionSigs } from 'local-tests/setup/session-sigs/get-pkp-session-sigs';
import { LIT_ACTION_CID_REPOSITORY } from 'packages/wrapped-keys/src/lib/constants';

const CUSTOM_LIT_ACTION_CODE = `
(async () => {
  const LIT_PREFIX = 'lit_';

  const resp = await Lit.Actions.runOnce(
    { waitForResponse: true, name: 'encryptedPrivateKey' },
    async () => {
      const wallet = ethers.Wallet.createRandom();
      const privateKey = LIT_PREFIX + wallet.privateKey.toString();
      let utf8Encode = new TextEncoder();
      const to_encrypt = utf8Encode.encode(privateKey);

      const { ciphertext, dataToEncryptHash } = await Lit.Actions.encrypt({
        accessControlConditions,
        to_encrypt,
      });
      return JSON.stringify({
        ciphertext,
        dataToEncryptHash,
        publicKey: wallet.publicKey,
      });
    }
  );

  Lit.Actions.setResponse({
    response: resp,
  });
})();
`

/**
 * Test Commands:
 * ✅ NETWORK=cayenne yarn test:local --filter=testFailCustomGenerateKeyWithBothIpfsAndCode
 * ✅ NETWORK=manzano yarn test:local --filter=testFailCustomGenerateKeyWithBothIpfsAndCode
 * ✅ NETWORK=localchain yarn test:local --filter=testFailCustomGenerateKeyWithBothIpfsAndCode
 */
export const testFailCustomGenerateKeyWithBothIpfsAndCode = async (
  devEnv: TinnyEnvironment
) => {
  const alice = await devEnv.createRandomPerson();

  const alicePkpSessionSigs = await getPkpSessionSigs(
    devEnv,
    alice,
    null,
    new Date(Date.now() + 1000 * 60 * 10).toISOString()
  ); // 10 mins expiry


  try {
    await customGeneratePrivateKey({
        pkpSessionSigs: alicePkpSessionSigs,
        litActionIpfsCid: LIT_ACTION_CID_REPOSITORY.generateEncryptedSolanaPrivateKey,
        litActionCode: CUSTOM_LIT_ACTION_CODE,
        litNodeClient: devEnv.litNodeClient,
    });
  } catch (e: any) {
    console.log('❌ THIS IS EXPECTED: ', e);

    if (e.message === "Can't provide both the litActionIpfsCid or litActionCode") {
      console.log(
        '✅ testFailImportWrappedKeysWithSamePrivateKey is expected to have an error'
      );
    } else {
      throw e;
    }
  }

  log('✅ testFailCustomGenerateKeyWithBothIpfsAndCode');
};
