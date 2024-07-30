import { log } from '@lit-protocol/misc';
import { ethers } from 'ethers';
import { TinnyEnvironment } from 'local-tests/setup/tinny-environment';
import { api, EthereumLitTransaction } from '@lit-protocol/wrapped-keys';
import { getPkpSessionSigs } from 'local-tests/setup/session-sigs/get-pkp-session-sigs';
import { getBaseTransactionForNetwork } from './util';

const { signTransactionWithEncryptedKey, generatePrivateKey } = api;

/**
 * Test Commands:
 * ✅ NETWORK=cayenne yarn test:local --filter=testEthereumBroadcastTransactionGeneratedKey
 * ✅ NETWORK=manzano yarn test:local --filter=testEthereumBroadcastTransactionGeneratedKey
 * ✅ NETWORK=localchain yarn test:local --filter=testEthereumBroadcastTransactionGeneratedKey
 */
export const testEthereumBroadcastTransactionGeneratedKey = async (
  devEnv: TinnyEnvironment
) => {
  const alice = await devEnv.createRandomPerson();

  try {
    const pkpSessionSigs = await getPkpSessionSigs(
      devEnv,
      alice,
      null,
      new Date(Date.now() + 1000 * 60 * 10).toISOString()
    ); // 10 mins expiry

    const { pkpAddress, generatedPublicKey, id } = await generatePrivateKey({
      pkpSessionSigs,
      network: 'evm',
      litNodeClient: devEnv.litNodeClient,
      memo: 'Test key',
    });

    const generatedKeysWalletAddress =
      ethers.utils.computeAddress(generatedPublicKey);
    console.log(`Sending funds to ${generatedKeysWalletAddress}`);
    await devEnv.getFunds(generatedKeysWalletAddress, '0.005');

    const alicePkpAddress = alice.authMethodOwnedPkp.ethAddress;
    if (pkpAddress !== alicePkpAddress) {
      throw new Error(
        `Received address: ${pkpAddress} doesn't match Alice's PKP address: ${alicePkpAddress}`
      );
    }

    const pkpSessionSigsSigning = await getPkpSessionSigs(
      devEnv,
      alice,
      null,
      new Date(Date.now() + 1000 * 60 * 10).toISOString()
    ); // 10 mins expiry

    // console.log(pkpSessionSigsSigning);

    const unsignedTransaction = getBaseTransactionForNetwork({
      network: devEnv.litNodeClient.config.litNetwork,
      toAddress: alice.wallet.address,
    });

    const signedTx = await signTransactionWithEncryptedKey({
      pkpSessionSigs: pkpSessionSigsSigning,
      network: 'evm',
      unsignedTransaction,
      broadcast: true,
      litNodeClient: devEnv.litNodeClient,
      id,
    });

    // console.log('signedTx');
    // console.log(signedTx);

    if (!ethers.utils.isHexString(signedTx)) {
      throw new Error(`signedTx isn't hex: ${signedTx}`);
    }

    log('✅ testEthereumBroadcastTransactionGeneratedKey');
  } finally {
    devEnv.releasePrivateKeyFromUser(alice);
  }
};
