// TODO: Remove this test only for demonstrating an error
import { log } from '@lit-protocol/misc';
import { TinnyEnvironment } from 'local-tests/setup/tinny-environment';
import { getPkpSessionSigs } from 'local-tests/setup/session-sigs/get-pkp-session-sigs';
import { ethers } from 'ethers';
import { CHAIN_ETHEREUM, LIT_PREFIX } from 'packages/wrapped-keys/src/lib/constants';
import { getFirstSessionSig, getPkpAccessControlCondition, getPkpAddressFromSessionSig } from 'packages/wrapped-keys/src/lib/utils';
import { decryptToString } from '@lit-protocol/encryption';
import { generatePrivateKeyLitAction } from '@lit-protocol/wrapped-keys';

/**
 * Test Commands:
 * ✅ NETWORK=cayenne yarn test:local --filter=testRemoveDecryptFailingOutsideLitAction
 * ✅ NETWORK=manzano yarn test:local --filter=testRemoveDecryptFailingOutsideLitAction
 * ✅ NETWORK=localchain yarn test:local --filter=testRemoveDecryptFailingOutsideLitAction
 */
export const testRemoveDecryptFailingOutsideLitAction = async (devEnv: TinnyEnvironment) => {
  const alice = await devEnv.createRandomPerson();

  const pkpSessionSigs = await getPkpSessionSigs(
    devEnv,
    alice,
    null,
    new Date(Date.now() + 1000 * 60 * 10).toISOString()
  ); // 10 mins expiry

  console.log(pkpSessionSigs);

  // const wallet = ethers.Wallet.createRandom();
  // const privateKey = LIT_PREFIX + wallet.privateKey.toString();
  // let utf8Encode = new TextEncoder();
  // const to_encrypt = utf8Encode.encode(privateKey);
  // console.log('to_encrypt');
  // console.log(to_encrypt);

  const firstSessionSig = getFirstSessionSig(pkpSessionSigs);
  const pkpAddress = getPkpAddressFromSessionSig(firstSessionSig);
  const allowPkpAddressToDecrypt = getPkpAccessControlCondition(pkpAddress);

  // const { ciphertext, dataToEncryptHash } = await devEnv.litNodeClient.encrypt({
  //     accessControlConditions: allowPkpAddressToDecrypt,
  //     dataToEncrypt: to_encrypt,
  // });

  let ciphertext, dataToEncryptHash, publicKey;
  try {
    const result = await devEnv.litNodeClient.executeJs({
      sessionSigs: pkpSessionSigs,
      code: generatePrivateKeyLitAction,
      jsParams: {
        pkpAddress,
        accessControlConditions: allowPkpAddressToDecrypt,
      },
    });

    console.log('result');
    console.log(result);

    const response = result.response as string;
    ({ ciphertext, dataToEncryptHash, publicKey } = JSON.parse(response));
  } catch (err: any) {
    throw new Error(
      `Lit Action threw an unexpected error: ${JSON.stringify(err)}`
    );
  }

  console.log('ciphertext: ', ciphertext);
  console.log('dataToEncryptHash: ', dataToEncryptHash);
  console.log('accessControlConditions: ', allowPkpAddressToDecrypt);

  const decryptedPrivateKey = await decryptToString(
    {
      accessControlConditions: allowPkpAddressToDecrypt,
      chain: CHAIN_ETHEREUM,
      ciphertext,
      dataToEncryptHash,
      sessionSigs: pkpSessionSigs,
    },
    devEnv.litNodeClient,
  );

  console.log('decryptedPrivateKey');
  console.log(decryptedPrivateKey);

  log('✅ testRemoveDecryptFailingOutsideLitAction');
};
