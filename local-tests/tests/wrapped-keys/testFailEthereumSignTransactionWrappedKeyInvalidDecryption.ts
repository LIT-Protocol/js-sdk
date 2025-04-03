import { ethers } from 'ethers';
import { TinnyEnvironment } from 'local-tests/setup/tinny-environment';
import { getPkpSessionSigs } from 'local-tests/setup/session-sigs/get-pkp-session-sigs';
import { LIT_PREFIX } from 'packages/wrapped-keys/src/lib/constants';
import { LIT_ACTION_CID_REPOSITORY } from '../../../packages/wrapped-keys/src/lib/lit-actions-client/constants';
import { getBaseTransactionForNetwork } from './util';
import { GLOBAL_OVERWRITE_IPFS_CODE_BY_NETWORK } from '@lit-protocol/constants';
import { getPkpAccessControlCondition } from '../../../packages/wrapped-keys/src/lib/api/utils';

/**
 * Test Commands:
 * ✅ NETWORK=datil-dev yarn test:local --filter=testFailEthereumSignTransactionWrappedKeyInvalidDecryption
 * ✅ NETWORK=datil-test yarn test:local --filter=testFailEthereumSignTransactionWrappedKeyInvalidDecryption
 * ✅ NETWORK=custom yarn test:local --filter=testFailEthereumSignTransactionWrappedKeyInvalidDecryption
 */
export const testFailEthereumSignTransactionWrappedKeyInvalidDecryption =
  async (devEnv: TinnyEnvironment) => {
    const alice = await devEnv.createRandomPerson();
    const bob = await devEnv.createRandomPerson();

    try {
      const privateKey = ethers.Wallet.createRandom().privateKey;
      const alicePkpAddress = alice.authMethodOwnedPkp.ethAddress;
      const decryptionAccessControlCondition =
        getPkpAccessControlCondition(alicePkpAddress);
      const { ciphertext, dataToEncryptHash } =
        await devEnv.litNodeClient.encrypt({
          accessControlConditions: [decryptionAccessControlCondition],
          dataToEncrypt: Buffer.from(LIT_PREFIX + privateKey, 'utf8'),
        });

      const pkpSessionSigsSigning = await getPkpSessionSigs(
        devEnv,
        bob,
        null,
        new Date(Date.now() + 1000 * 60 * 10).toISOString()
      ); // 10 mins expiry
      // console.log(pkpSessionSigsSigning);

      const unsignedTransaction = getBaseTransactionForNetwork({
        network: devEnv.litNodeClient.config.litNetwork,
        toAddress: alice.wallet.address,
      });

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
          ipfsOptions: {
            overwriteCode:
              GLOBAL_OVERWRITE_IPFS_CODE_BY_NETWORK[
                devEnv.litNodeClient.config.litNetwork
              ],
          },
        });
      } catch (e: any) {
        if (
          e.message.includes(
            'There was an error getting the signing shares from the nodes'
          )
        ) {
          console.log('✅ THIS IS EXPECTED: ', e);
          console.log(e.message);
          console.log(
            '✅ testFailEthereumSignTransactionWrappedKeyInvalidDecryption is expected to have an error'
          );
        } else {
          throw e;
        }
      }

      console.log(
        '✅ testFailEthereumSignTransactionWrappedKeyInvalidDecryption'
      );
    } finally {
      devEnv.releasePrivateKeyFromUser(alice);
      devEnv.releasePrivateKeyFromUser(bob);
    }
  };
