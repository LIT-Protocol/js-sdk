import { log } from '@lit-protocol/misc';
import { ethers } from 'ethers';
import { TinnyEnvironment } from 'local-tests/setup/tinny-environment';
import { api } from '@lit-protocol/wrapped-keys';
import { getPkpSessionSigs } from 'local-tests/setup/session-sigs/get-pkp-session-sigs';

const { importPrivateKey, signTypedDataWithEncryptedKey } = api;

/**
 * Test Commands:
 * ✅ NETWORK=datil-dev yarn test:local --filter=testFailEthereumSignTypedDataWrappedKeyWithInvalidParam
 * ✅ NETWORK=datil-test yarn test:local --filter=testFailEthereumSignTypedDataWrappedKeyWithInvalidParam
 * ✅ NETWORK=custom yarn test:local --filter=testFailEthereumSignTypedDataWrappedKeyWithInvalidParam
 */
export const testFailEthereumSignTypedDataWrappedKeyWithInvalidParam = async (
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

    try {
      const _res = await signTypedDataWithEncryptedKey({
        pkpSessionSigs: pkpSessionSigsSigning,
        network: 'evm',
        messageToSign: {
          domain: {
            name: 'TestApp',
            version: '1',
            chainId: 'invalid-chain-id', // Invalid: should be number
            verifyingContract: 'invalid-address', // Invalid: should be valid address
          },
          types: {
            Person: [
              { name: 'name', type: 'string' },
              { name: 'wallet', type: 'address' },
            ],
          },
          value: {
            name: 'Alice',
            wallet: 'invalid-address', // Invalid: should be valid address
          },
        },
        litNodeClient: devEnv.litNodeClient,
        id,
      });
    } catch (e: any) {
      if (
        e.message.includes('invalid address') ||
        e.message.includes('Invalid typed data') ||
        e.message.includes('chainId') ||
        e.message.includes('verifyingContract') ||
        e.message.includes('wallet')
      ) {
        console.log('✅ THIS IS EXPECTED: ', e);
        console.log(e.message);
        console.log(
          '✅ testFailEthereumSignTypedDataWrappedKeyWithInvalidParam is expected to have an error'
        );
      } else {
        console.log('ERROR', e.message);
        throw e;
      }
    }

    log('✅ testFailEthereumSignTypedDataWrappedKeyWithInvalidParam');
  } finally {
    devEnv.releasePrivateKeyFromUser(alice);
  }
};
