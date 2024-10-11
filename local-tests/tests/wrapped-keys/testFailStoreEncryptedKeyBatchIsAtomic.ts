import { log } from '@lit-protocol/misc';
import { TinnyEnvironment } from 'local-tests/setup/tinny-environment';
import { api } from '@lit-protocol/wrapped-keys';
import { getPkpSessionSigs } from 'local-tests/setup/session-sigs/get-pkp-session-sigs';
import { batchGenerateKeysWithLitAction } from '../../../packages/wrapped-keys/src/lib/lit-actions-client';
import { getLitActionCodeOrCidCommon } from '../../../packages/wrapped-keys/src/lib/lit-actions-client/utils';
import {
  getFirstSessionSig,
  getKeyTypeFromNetwork,
  getPkpAccessControlCondition,
  getPkpAddressFromSessionSig,
} from '../../../packages/wrapped-keys/src/lib/api/utils';
import { listEncryptedKeyMetadata } from '../../../packages/wrapped-keys/src/lib/api';

const { storeEncryptedKeyBatch } = api;

/**
 * Test Commands:
 * ✅ NETWORK=datil-dev yarn test:local --filter=testSignMessageWithSolanaEncryptedKey
 * ✅ NETWORK=datil-test yarn test:local --filter=testSignMessageWithSolanaEncryptedKey
 * ✅ NETWORK=localchain yarn test:local --filter=testSignMessageWithSolanaEncryptedKey
 */
export const testFailBatchGeneratePrivateKeysAtomic = async (
  devEnv: TinnyEnvironment
) => {
  const alice = await devEnv.createRandomPerson();

  try {
    const pkpSessionSigsSigning = await getPkpSessionSigs(
      devEnv,
      alice,
      null,
      new Date(Date.now() + 1000 * 60 * 10).toISOString()
    ); // 10 mins expiry

    const solanaMessageToSign = 'This is a test solana message';
    const evmMessageToSign = 'This is a test evm message';

    const sessionSig = getFirstSessionSig(pkpSessionSigsSigning);
    const pkpAddress = getPkpAddressFromSessionSig(sessionSig);

    const allowPkpAddressToDecrypt = getPkpAccessControlCondition(pkpAddress);

    const { litActionCode, litActionIpfsCid } = getLitActionCodeOrCidCommon(
      'batchGenerateEncryptedKeys'
    );

    const actionResults = await batchGenerateKeysWithLitAction({
      litNodeClient: devEnv.litNodeClient,
      litActionIpfsCid: litActionCode ? undefined : litActionIpfsCid,
      litActionCode: litActionCode ? litActionCode : undefined,
      accessControlConditions: [allowPkpAddressToDecrypt],
      actions: [
        {
          network: 'evm',
          signMessageParams: { messageToSign: evmMessageToSign },
          generateKeyParams: { memo: 'Test evm key' },
        },
        {
          network: 'solana',
          signMessageParams: { messageToSign: solanaMessageToSign },
          generateKeyParams: { memo: 'Test solana key' },
        },
      ],
      pkpSessionSigs: pkpSessionSigsSigning,
    });

    const keyParamsBatch = actionResults.map((keyData) => {
      const { generateEncryptedPrivateKey, network } = keyData;
      return {
        ...generateEncryptedPrivateKey,
        keyType: getKeyTypeFromNetwork(network),
      };
    });

    // Intentional failure to persist due to missing publicKey
    delete keyParamsBatch[0].publicKey;

    try {
      await storeEncryptedKeyBatch({
        pkpSessionSigs: pkpSessionSigsSigning,
        litNodeClient: devEnv.litNodeClient,
        keyBatch: keyParamsBatch,
      });

      throw new Error(
        'storeEncryptedKeyBatch() succeeded but we expected it to fail!'
      );
    } catch (err) {
      // We expect `storeEncryptedKeyBatch` to fail w/ a specific error
      if (
        err.message.includes(
          'storeEncryptedKeyBatch() succeeded but we expected it to fail!'
        ) ||
        !err.message.includes(
          'keyParamsBatch[0]: Missing "publicKey" parameter in request'
        )
      ) {
        throw err;
      }

      try {
        const keys = await listEncryptedKeyMetadata({
          litNodeClient: devEnv.litNodeClient,
          pkpSessionSigs: pkpSessionSigsSigning,
        });

        console.error(
          'Got a value back we shouldnt have from listEncryptedKeyMetadata()',
          keys
        );

        throw new Error(
          'Expected `listEncryptedKeyMetadata() to fail, but it didnt!`'
        );
      } catch (err) {
        if (err.message.includes('No keys exist for pkpAddress')) {
          log('✅ testFailBatchGeneratePrivateKeysAtomic');
        } else {
          throw err;
        }
      }
    }
  } catch (err) {
    console.log(err.message, err, err.stack);
    throw err;
  } finally {
    devEnv.releasePrivateKeyFromUser(alice);
  }
};
