import { log } from '@lit-protocol/misc';
import { ethers } from 'ethers';
import { TinnyEnvironment } from 'local-tests/setup/tinny-environment';
import { EthereumLitTransaction } from '@lit-protocol/wrapped-keys';
import { getPkpSessionSigs } from 'local-tests/setup/session-sigs/get-pkp-session-sigs';
import { getPkpAccessControlCondition } from 'packages/wrapped-keys/src/lib/utils';
import { encryptString } from '@lit-protocol/encryption';
import { LIT_PREFIX } from 'packages/wrapped-keys/src/lib/constants';
import { LIT_ACTION_CID_REPOSITORY } from '../../packages/wrapped-keys/src/lib/lit-actions-client/constants';

/**
 * Test Commands:
 * ✅ NETWORK=cayenne yarn test:local --filter=testFailEthereumSignTransactionWrappedKeyInvalidDecryption
 * ✅ NETWORK=manzano yarn test:local --filter=testFailEthereumSignTransactionWrappedKeyInvalidDecryption
 * ✅ NETWORK=localchain yarn test:local --filter=testFailEthereumSignTransactionWrappedKeyInvalidDecryption
 */
export const testFailEthereumSignTransactionWrappedKeyInvalidDecryption =
  async (devEnv: TinnyEnvironment) => {
    const alice = await devEnv.createRandomPerson();
    const privateKey = ethers.Wallet.createRandom().privateKey;
    const alicePkpAddress = alice.authMethodOwnedPkp.ethAddress;
    const decryptionAccessControlCondition =
      getPkpAccessControlCondition(alicePkpAddress);
    const { ciphertext, dataToEncryptHash } = await encryptString(
      {
        accessControlConditions: [decryptionAccessControlCondition],
        dataToEncrypt: LIT_PREFIX + privateKey,
      },
      devEnv.litNodeClient
    );

    const bob = await devEnv.createRandomPerson();
    const pkpSessionSigsSigning = await getPkpSessionSigs(
      devEnv,
      bob,
      null,
      new Date(Date.now() + 1000 * 60 * 10).toISOString()
    ); // 10 mins expiry
    console.log(pkpSessionSigsSigning);

    const unsignedTransaction: EthereumLitTransaction = {
      toAddress: alice.wallet.address,
      value: '0.0001', // in ethers (Lit tokens)
      chainId: 175177, // Chronicle
      gasPrice: '50',
      gasLimit: 21000,
      dataHex: ethers.utils.hexlify(
        ethers.utils.toUtf8Bytes('Test transaction from Alice to bob')
      ),
      chain: 'chronicleTestnet',
    };

    try {
      const _res = await devEnv.litNodeClient.executeJs({
        sessionSigs: pkpSessionSigsSigning,
        ipfsId: LIT_ACTION_CID_REPOSITORY.signTransaction.evm,
        jsParams: {
          ciphertext,
          dataToEncryptHash,
          unsignedTransaction,
          accessControlConditions: [decryptionAccessControlCondition],
        },
      });
    } catch (e: any) {
      console.log('❌ THIS IS EXPECTED: ', e);
      console.log(e.message);

      if (
        e.message.includes(
          'There was an error getting the signing shares from the nodes'
        )
      ) {
        console.log(
          '✅ testFailEthereumSignTransactionWrappedKeyInvalidDecryption is expected to have an error'
        );
      } else {
        throw e;
      }
    }

    log('✅ testFailEthereumSignTransactionWrappedKeyInvalidDecryption');
  };
