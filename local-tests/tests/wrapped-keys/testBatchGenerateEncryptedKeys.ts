import { log } from '@lit-protocol/misc';
import { TinnyEnvironment } from 'local-tests/setup/tinny-environment';
import { api } from '@lit-protocol/wrapped-keys';
import { getPkpSessionSigs } from 'local-tests/setup/session-sigs/get-pkp-session-sigs';

const { batchGenerateEncryptedKeys } = api;

/**
 * Test Commands:
 * ✅ NETWORK=cayenne yarn test:local --filter=testSignMessageWithSolanaEncryptedKey
 * ✅ NETWORK=manzano yarn test:local --filter=testSignMessageWithSolanaEncryptedKey
 * ✅ NETWORK=localchain yarn test:local --filter=testSignMessageWithSolanaEncryptedKey
 */
export const testBatchGenerateEncryptedKeys = async (
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

    const results = await batchGenerateEncryptedKeys({
      pkpSessionSigs: pkpSessionSigsSigning,
      actions: [
        {
          network: 'evm',
          signMessageParams: { messageToSign: 'This is a test evm message' },
          generateKeyParams: { memo: 'Test evm key' },
        },
        {
          network: 'solana',
          signMessageParams: { messageToSign: 'This is a test solana message' },
          generateKeyParams: { memo: 'Test solana key' },
        },
      ],
      litNodeClient: devEnv.litNodeClient,
    });

    if (results.length !== 2) {
      throw new Error(
        `Incorrect # of results; expected 2, got ${results.length}`
      );
    }

    if (
      results[0].generatedPrivateKey.memo !== 'Test evm key' ||
      results[1].generatedPrivateKey.memo !== 'Test solana key'
    ) {
      throw new Error(
        'Results not in order sent; expected evm as first result, solana as second'
      );
    }

    if (
      !results[0].signedMessage.signature ||
      !results[1].signedMessage.signature
    ) {
      throw new Error('Missing message signature in response');
    }

    console.log('results', results);

    log('✅ testBatchGenerateEncryptedKeys');
  } catch (err) {
    console.log(err.message, err, err.stack);
    throw err;
  } finally {
    devEnv.releasePrivateKeyFromUser(alice);
  }
};
