import { log } from '@lit-protocol/misc';
import { TinnyEnvironment } from 'local-tests/setup/tinny-environment';
import { api } from '@lit-protocol/wrapped-keys';
import { getPkpSessionSigs } from 'local-tests/setup/session-sigs/get-pkp-session-sigs';
import nacl from 'tweetnacl';
import bs58 from 'bs58';
import { ethers } from 'ethers';
import { BatchGeneratePrivateKeysActionResult } from '../../../packages/wrapped-keys/src/lib/types';

const { batchGeneratePrivateKeys, exportPrivateKey } = api;

async function verifySolanaSignature(
  solanaResult: BatchGeneratePrivateKeysActionResult,
  solanaMessageToSign
) {
  const {
    signedMessage: { signature },
    generatedPrivateKey: { generatedPublicKey },
  } = solanaResult;
  const signatureIsValidForPublicKey = nacl.sign.detached.verify(
    Buffer.from(solanaMessageToSign),
    bs58.decode(signature),
    bs58.decode(generatedPublicKey)
  );

  console.log({ signatureIsValidForPublicKey, signature });
  if (!signatureIsValidForPublicKey) {
    throw new Error(
      `signature: ${signature} doesn't validate for the Solana public key: ${generatedPublicKey}`
    );
  }
}
async function verifyEvmSignature(
  litNodeClient,
  evmResult,
  messageToSign,
  pkpSessionSigs
) {
  function verifyMessageSignature() {
    try {
      return ethers.utils.verifyMessage(
        messageToSign,
        evmResult.signedMessage.signature
      );
    } catch (err) {
      throw new Error(
        `When validating signed Ethereum message is valid: ${err.message}`
      );
    }
  }

  const { decryptedPrivateKey } = await exportPrivateKey({
    litNodeClient,
    network: 'evm',
    id: evmResult.generatedPrivateKey.id,
    pkpSessionSigs,
  });

  const recoveredAddress = verifyMessageSignature();

  const wallet = new ethers.Wallet(decryptedPrivateKey);

  console.log({
    recoveredAddress,
    walletAddress: wallet.address,
    signature: evmResult.signedMessage.signature,
  });
  if (recoveredAddress !== wallet.address) {
    throw new Error(
      "Recovered address from verifyMessage doesn't match the wallet address"
    );
  }
}

/**
 * Test Commands:
 * ✅ NETWORK=cayenne yarn test:local --filter=testSignMessageWithSolanaEncryptedKey
 * ✅ NETWORK=manzano yarn test:local --filter=testSignMessageWithSolanaEncryptedKey
 * ✅ NETWORK=localchain yarn test:local --filter=testSignMessageWithSolanaEncryptedKey
 */
export const testBatchGeneratePrivateKeys = async (
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
    const results = await batchGeneratePrivateKeys({
      pkpSessionSigs: pkpSessionSigsSigning,
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

    console.log('solana verify sig');
    await verifySolanaSignature(results[1], solanaMessageToSign);

    console.log('evm verify sig');
    await verifyEvmSignature(
      devEnv.litNodeClient,
      results[0],
      evmMessageToSign,
      pkpSessionSigsSigning
    );
    console.log('results', results);

    log('✅ testBatchGenerateEncryptedKeys');
  } catch (err) {
    console.log(err.message, err, err.stack);
    throw err;
  } finally {
    devEnv.releasePrivateKeyFromUser(alice);
  }
};
