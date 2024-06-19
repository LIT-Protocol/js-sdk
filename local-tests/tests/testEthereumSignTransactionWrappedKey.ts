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
 * ✅ NETWORK=cayenne yarn test:local --filter=testEthereumSignTransactionWrappedKey
 * ✅ NETWORK=manzano yarn test:local --filter=testEthereumSignTransactionWrappedKey
 * ✅ NETWORK=localchain yarn test:local --filter=testEthereumSignTransactionWrappedKey
 */
export const testEthereumSignTransactionWrappedKey = async (
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

  const signedTx = await signTransactionWithEncryptedKey({
    pkpSessionSigs: pkpSessionSigsSigning,
    network: NETWORK_EVM,
    unsignedTransaction,
    broadcast: false,
    litNodeClient: devEnv.litNodeClient,
  });

  console.log('signedTx');
  console.log(signedTx);

  if (!ethers.utils.isHexString(signedTx)) {
    throw new Error(`signedTx isn't hex: ${signedTx}`);
  }

  log('✅ testEthereumSignTransactionWrappedKey');
};
