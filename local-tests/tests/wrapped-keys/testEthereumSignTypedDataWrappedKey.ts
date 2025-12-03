import { log } from '@lit-protocol/misc';
import { ethers } from 'ethers';
import { TinnyEnvironment } from 'local-tests/setup/tinny-environment';
import { api } from '@lit-protocol/wrapped-keys';
import { getPkpSessionSigs } from 'local-tests/setup/session-sigs/get-pkp-session-sigs';
import { deriveAddressFromGeneratedPublicKey } from './util';

const { importPrivateKey, signTypedDataWithEncryptedKey } = api;

/**
 * Test Commands:
 * ✅ NETWORK=datil-dev yarn test:local --filter=testEthereumSignTypedDataWrappedKey
 * ✅ NETWORK=datil-test yarn test:local --filter=testEthereumSignTypedDataWrappedKey
 * ✅ NETWORK=custom yarn test:local --filter=testEthereumSignTypedDataWrappedKey
 */
export const testEthereumSignTypedDataWrappedKey = async (
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

    const aliceWrappedKey = ethers.Wallet.createRandom();
    const privateKey = aliceWrappedKey.privateKey;
    const aliceWrappedKeyAddress = aliceWrappedKey.address;

    const { pkpAddress, id } = await importPrivateKey({
      pkpSessionSigs,
      privateKey,
      litNodeClient: devEnv.litNodeClient,
      publicKey: aliceWrappedKeyAddress,
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

    // Test EIP-712 typed data
    const typedData = {
      domain: {
        name: 'TestApp',
        version: '1',
        chainId: 1,
        verifyingContract: '0x1234567890123456789012345678901234567890',
      },
      types: {
        Person: [
          { name: 'name', type: 'string' },
          { name: 'wallet', type: 'address' },
        ],
        Mail: [
          { name: 'from', type: 'Person' },
          { name: 'to', type: 'Person' },
          { name: 'contents', type: 'string' },
        ],
      },
      value: {
        from: {
          name: 'Alice',
          wallet: alice.wallet.address,
        },
        to: {
          name: 'Bob',
          wallet: '0x1234567890123456789012345678901234567890',
        },
        contents: 'Hello, Bob!',
      },
    };

    const signature = await signTypedDataWithEncryptedKey({
      pkpSessionSigs: pkpSessionSigsSigning,
      network: 'evm',
      messageToSign: typedData,
      litNodeClient: devEnv.litNodeClient,
      id,
    });

    // console.log('signature');
    // console.log(signature);

    if (!ethers.utils.isHexString(signature)) {
      throw new Error(`signature isn't hex: ${signature}`);
    }

    // Verify the signature is valid by recovering the address
    const recoveredAddress = ethers.utils.verifyTypedData(
      typedData.domain,
      typedData.types,
      typedData.value,
      signature
    );

    if (
      recoveredAddress.toLowerCase() !== aliceWrappedKeyAddress.toLowerCase()
    ) {
      throw new Error(
        `Recovered address: ${recoveredAddress} doesn't match PKP address: ${pkpAddress}`
      );
    }

    log('✅ testEthereumSignTypedDataWrappedKey');
  } finally {
    devEnv.releasePrivateKeyFromUser(alice);
  }
};
