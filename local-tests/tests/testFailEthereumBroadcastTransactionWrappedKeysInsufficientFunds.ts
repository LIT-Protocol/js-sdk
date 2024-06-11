import { log } from '@lit-protocol/misc';
import { ethers } from 'ethers';
import { TinnyEnvironment } from 'local-tests/setup/tinny-environment';
import {
  importPrivateKey,
  signTransactionWithEncryptedKey,
  EthereumLitTransaction,
  signTransactionWithEthereumEncryptedKeyLitAction,
} from '@lit-protocol/wrapped-keys';
import { getPkpSessionSigs } from 'local-tests/setup/session-sigs/get-pkp-session-sigs';

/**
 * Test Commands:
 * ✅ NETWORK=cayenne yarn test:local --filter=testFailEthereumBroadcastTransactionWrappedKeysInsufficientFunds
 * ✅ NETWORK=manzano yarn test:local --filter=testFailEthereumBroadcastTransactionWrappedKeysInsufficientFunds
 * ✅ NETWORK=localchain yarn test:local --filter=testFailEthereumBroadcastTransactionWrappedKeysInsufficientFunds
 */
export const testFailEthereumBroadcastTransactionWrappedKeysInsufficientFunds = async (
  devEnv: TinnyEnvironment
) => {
  // TODO!: Send funds to the PKP funds
  const alice = await devEnv.createRandomPerson();

  const pkpSessionSigs = await getPkpSessionSigs(
    devEnv,
    alice,
    null,
    new Date(Date.now() + 1000 * 60 * 10).toISOString()
  ); // 10 mins expiry

  console.log(pkpSessionSigs);

  const privateKey = ethers.Wallet.createRandom().privateKey;

  const pkpAddress = await importPrivateKey({
    pkpSessionSigs,
    privateKey,
    litNodeClient: devEnv.litNodeClient,
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
    const _res = await signTransactionWithEncryptedKey({
      pkpSessionSigs: pkpSessionSigsSigning,
      litActionCode: signTransactionWithEthereumEncryptedKeyLitAction,
      unsignedTransaction,
      broadcast: true,
      litNodeClient: devEnv.litNodeClient,
    });
  } catch (e: any) {
    console.log('❌ THIS IS EXPECTED: ', e);
    console.log(e.message);

    if (
      e.message.includes(
        'Error executing the Signing Lit Action: Error: When signing transaction- processing response'
      ) &&
      e.message.includes('insufficient FPE funds for gas * price + value')
    ) {
      console.log(
        '✅ testFailEthereumBroadcastTransactionWrappedKeysInsufficientFunds is expected to have an error'
      );
    } else {
      throw e;
    }
  }

  log('✅ testFailEthereumBroadcastTransactionWrappedKeysInsufficientFunds');
};
