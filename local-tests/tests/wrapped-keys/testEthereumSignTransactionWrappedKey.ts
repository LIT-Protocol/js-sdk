import { log } from '@lit-protocol/misc';
import { ethers } from 'ethers';
import { TinnyEnvironment } from 'local-tests/setup/tinny-environment';
import { api } from '@lit-protocol/wrapped-keys';
import { getPkpSessionSigs } from 'local-tests/setup/session-sigs/get-pkp-session-sigs';

import type { EthereumLitTransaction } from '@lit-protocol/wrapped-keys';
import { getBaseTransactionForNetwork } from './util';

const { importPrivateKey, signTransactionWithEncryptedKey } = api;

/**
 * Test Commands:
 * ✅ NETWORK=cayenne yarn test:local --filter=testEthereumSignTransactionWrappedKey
 * ✅ NETWORK=manzano yarn test:local --filter=testEthereumSignTransactionWrappedKey
 * ✅ NETWORK=localchain yarn test:local --filter=testEthereumSignTransactionWrappedKey
 */
export const testEthereumSignTransactionWrappedKey = async (
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

    const privateKey = ethers.Wallet.createRandom().privateKey;

    const { pkpAddress, id } = await importPrivateKey({
      pkpSessionSigs,
      privateKey,
      litNodeClient: devEnv.litNodeClient,
      publicKey: '0xdeadbeef',
      keyType: 'K256',
      memo: 'Test key',
    });

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
      broadcast: false,
      litNodeClient: devEnv.litNodeClient,
      id,
    });

    // console.log('signedTx');
    // console.log(signedTx);

    if (!ethers.utils.isHexString(signedTx)) {
      throw new Error(`signedTx isn't hex: ${signedTx}`);
    }

    log('✅ testEthereumSignTransactionWrappedKey');
  } finally {
    devEnv.releasePrivateKeyFromUser(alice);
  }
};
