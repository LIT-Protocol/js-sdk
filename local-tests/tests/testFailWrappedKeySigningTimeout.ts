import { log } from '@lit-protocol/misc';
import { ethers } from 'ethers';
import { TinnyEnvironment } from 'local-tests/setup/tinny-environment';
import {
  importPrivateKey,
  signTransactionWithEncryptedKey,
  EthereumLitTransaction,
  signingTimeoutEncryptedKeyLitAction,
} from '@lit-protocol/wrapped-keys';
import { getPkpSessionSigs } from 'local-tests/setup/session-sigs/get-pkp-session-sigs';

/**
 * Test Commands:
 * ✅ NETWORK=cayenne yarn test:local --filter=testFailWrappedKeySigningTimeout
 * ✅ NETWORK=manzano yarn test:local --filter=testFailWrappedKeySigningTimeout
 * ✅ NETWORK=localchain yarn test:local --filter=testFailWrappedKeySigningTimeout
 */
export const testFailWrappedKeySigningTimeout = async (
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

  try {
    const _signedTx = await signTransactionWithEncryptedKey({
      pkpSessionSigs,
      litActionCode: signingTimeoutEncryptedKeyLitAction,
      unsignedTransaction,
      broadcast: true,
      litNodeClient: devEnv.litNodeClient,
    });
  } catch (e: any) {
    console.log('❌ THIS IS EXPECTED: ', e);
    console.log('❌ e.message: ', e.message);

    if (
      e.message.includes(
        'There was a timeout error executing the Javascript for this action'
      ) &&
      e.message.includes(
        "This doesn't mean that your transaction wasn't broadcast but that it took more than 30 secs to confirm. Please confirm whether it went through on the blockchain explorer for your chain."
      )
    ) {
      console.log(
        '✅ testFailWrappedKeySigningTimeout is expected to have an error'
      );
    } else {
      throw e;
    }
  }

  log('✅ testFailWrappedKeySigningTimeout');
};
