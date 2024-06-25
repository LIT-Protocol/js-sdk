import { log } from '@lit-protocol/misc';
import { ethers } from 'ethers';
import { TinnyEnvironment } from 'local-tests/setup/tinny-environment';
import {
  importPrivateKey,
  signTransactionWithEncryptedKey,
  EthereumLitTransaction,
} from '@lit-protocol/wrapped-keys';
import { getPkpSessionSigs } from 'local-tests/setup/session-sigs/get-pkp-session-sigs';
import { NETWORK_EVM } from 'packages/wrapped-keys/src/lib/constants';

/**
 * Test Commands:
 * ✅ NETWORK=cayenne yarn test:local --filter=testEthereumBroadcastTransactionWrappedKey
 * ✅ NETWORK=manzano yarn test:local --filter=testEthereumBroadcastTransactionWrappedKey
 * ✅ NETWORK=localchain yarn test:local --filter=testEthereumBroadcastTransactionWrappedKey
 */
export const testEthereumBroadcastTransactionWrappedKey = async (
  devEnv: TinnyEnvironment
) => {
  const alice = await devEnv.createRandomPerson();

  const pkpSessionSigs = await getPkpSessionSigs(
    devEnv,
    alice,
    null,
    new Date(Date.now() + 1000 * 60 * 10).toISOString()
  ); // 10 mins expiry

  console.log(pkpSessionSigs);

  const wrappedKeysWallet = ethers.Wallet.createRandom();
  const wrappedKeysWalletPrivateKey = wrappedKeysWallet.privateKey;

  const wrappedKeysWalletAddress = wrappedKeysWallet.address;
  console.log(`Sending funds to ${wrappedKeysWalletAddress}`);
  await devEnv.getFunds(wrappedKeysWallet.address, '0.005');

  const pkpAddress = await importPrivateKey({
    pkpSessionSigs,
    privateKey: wrappedKeysWalletPrivateKey,
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
    gasPrice: '0.001',
    gasLimit: 30000,
    dataHex: ethers.utils.hexlify(
      ethers.utils.toUtf8Bytes('Test transaction from Alice to bob')
    ),
    chain: 'chronicleTestnet',
  };

  const signedTx = await signTransactionWithEncryptedKey({
    pkpSessionSigs: pkpSessionSigsSigning,
    network: NETWORK_EVM,
    unsignedTransaction,
    broadcast: true,
    litNodeClient: devEnv.litNodeClient,
  });

  console.log('signedTx');
  console.log(signedTx);

  // TODO: Get the raw input from the tx hash, convert it to UTF-8 and assert that it contains "Test transaction from Alice to bob"
  if (!ethers.utils.isHexString(signedTx)) {
    throw new Error(`signedTx isn't hex: ${signedTx}`);
  }

  log('✅ testEthereumBroadcastTransactionWrappedKey');
};