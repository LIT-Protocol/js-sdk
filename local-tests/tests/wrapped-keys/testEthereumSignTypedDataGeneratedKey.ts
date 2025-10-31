import { log } from '@lit-protocol/misc';
import { ethers } from 'ethers';
import { TinnyEnvironment } from 'local-tests/setup/tinny-environment';
import { api } from '@lit-protocol/wrapped-keys';
import { getPkpSessionSigs } from 'local-tests/setup/session-sigs/get-pkp-session-sigs';
import { deriveAddressFromGeneratedPublicKey } from './util';

const { generatePrivateKey, signTypedDataWithEncryptedKey } = api;

/**
 * Test Commands:
 * ✅ NETWORK=datil-dev yarn test:local --filter=testEthereumSignTypedDataGeneratedKey
 * ✅ NETWORK=datil-test yarn test:local --filter=testEthereumSignTypedDataGeneratedKey
 * ✅ NETWORK=custom yarn test:local --filter=testEthereumSignTypedDataGeneratedKey
 */
export const testEthereumSignTypedDataGeneratedKey = async (
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

    const { pkpAddress, id, generatedPublicKey } = await generatePrivateKey({
      pkpSessionSigs,
      network: 'evm',
      litNodeClient: devEnv.litNodeClient,
      memo: 'Test key',
    });

    const alicePkpAddress = alice.authMethodOwnedPkp.ethAddress;
    if (pkpAddress !== alicePkpAddress) {
      throw new Error(
        `Received address: ${pkpAddress} doesn't match Alice's PKP address: ${alicePkpAddress}`
      );
    }

    const aliceWrappedKeyAddress =
      deriveAddressFromGeneratedPublicKey(generatedPublicKey);

    const pkpSessionSigsSigning = await getPkpSessionSigs(
      devEnv,
      alice,
      null,
      new Date(Date.now() + 1000 * 60 * 10).toISOString()
    ); // 10 mins expiry

    // Test EIP-712 typed data with different structure
    const typedData = {
      domain: {
        name: 'TestApp',
        version: '2',
        chainId: 1,
        verifyingContract: '0x1234567890123456789012345678901234567890',
      },
      types: {
        Transaction: [
          { name: 'to', type: 'address' },
          { name: 'value', type: 'uint256' },
          { name: 'data', type: 'bytes' },
          { name: 'operation', type: 'uint8' },
          { name: 'safeTxGas', type: 'uint256' },
          { name: 'baseGas', type: 'uint256' },
          { name: 'gasPrice', type: 'uint256' },
          { name: 'gasToken', type: 'address' },
          { name: 'refundReceiver', type: 'address' },
          { name: 'nonce', type: 'uint256' },
        ],
      },
      value: {
        to: '0x1234567890123456789012345678901234567890',
        value: '0',
        data: '0x',
        operation: 0,
        safeTxGas: 0,
        baseGas: 0,
        gasPrice: 0,
        gasToken: '0x0000000000000000000000000000000000000000',
        refundReceiver: '0x0000000000000000000000000000000000000000',
        nonce: 0,
      },
    };

    const signature = await signTypedDataWithEncryptedKey({
      pkpSessionSigs: pkpSessionSigsSigning,
      network: 'evm',
      messageToSign: typedData,
      litNodeClient: devEnv.litNodeClient,
      id,
    });

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
        `Recovered address: ${recoveredAddress} doesn't match Wrapped Key address: ${aliceWrappedKeyAddress}`
      );
    }

    log('✅ testEthereumSignTypedDataGeneratedKey');
  } finally {
    devEnv.releasePrivateKeyFromUser(alice);
  }
};
