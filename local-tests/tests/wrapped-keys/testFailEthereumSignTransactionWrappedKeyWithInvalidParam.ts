import { log } from '@lit-protocol/misc';
import { ethers } from 'ethers';
import { TinnyEnvironment } from 'local-tests/setup/tinny-environment';
import { api, EthereumLitTransaction } from '@lit-protocol/wrapped-keys';
import { getPkpSessionSigs } from 'local-tests/setup/session-sigs/get-pkp-session-sigs';
import { getBaseTransactionForNetwork } from './util';

const { importPrivateKey, signTransactionWithEncryptedKey } = api;
/**
 * Test Commands:
 * ✅ NETWORK=cayenne yarn test:local --filter=testFailEthereumSignTransactionWrappedKeyWithInvalidParam
 * ✅ NETWORK=manzano yarn test:local --filter=testFailEthereumSignTransactionWrappedKeyWithInvalidParam
 * ✅ NETWORK=localchain yarn test:local --filter=testFailEthereumSignTransactionWrappedKeyWithInvalidParam
 */
export const testFailEthereumSignTransactionWrappedKeyWithInvalidParam = async (
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

    const unsignedTransaction: EthereumLitTransaction = {
      ...getBaseTransactionForNetwork({
        network: devEnv.litNodeClient.config.litNetwork,
        toAddress: alice.wallet.address,
      }),
      dataHex: 'Test transaction from Alice to bob',
    };

    try {
      const _res = await signTransactionWithEncryptedKey({
        pkpSessionSigs: pkpSessionSigsSigning,
        network: 'evm',
        unsignedTransaction,
        broadcast: false,
        litNodeClient: devEnv.litNodeClient,
        id,
      });
    } catch (e: any) {
      if (e.message.includes('invalid hexlify value')) {
        console.log('✅ THIS IS EXPECTED: ', e);
        console.log(e.message);
        console.log(
          '✅ testFailEthereumSignTransactionWrappedKeyWithInvalidParam is expected to have an error'
        );
      } else {
        console.log('ERROR', e.message);
        throw e;
      }
    }

    log('✅ testFailEthereumSignTransactionWrappedKeyWithInvalidParam');
  } finally {
    devEnv.releasePrivateKeyFromUser(alice);
  }
};
