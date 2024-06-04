import { log } from '@lit-protocol/misc';
import { ethers } from 'ethers';
import { TinnyEnvironment } from 'local-tests/setup/tinny-environment';
import {
  importPrivateKey,
  signWithEncryptedKey,
  signWithEthereumEncryptedKeyLitAction,
  SolanaLitTransaction,
} from '@lit-protocol/wrapped-keys';
import { getPkpSessionSigs } from 'local-tests/setup/session-sigs/get-pkp-session-sigs';

/**
 * Test Commands:
 * ✅ NETWORK=cayenne yarn test:local --filter=testFailEthereumSignWrappedKeyWithMissingParam
 * ✅ NETWORK=manzano yarn test:local --filter=testFailEthereumSignWrappedKeyWithMissingParam
 * ✅ NETWORK=localchain yarn test:local --filter=testFailEthereumSignWrappedKeyWithMissingParam
 */
export const testFailEthereumSignWrappedKeyWithMissingParam = async (
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

  // Using SolanaLitTransaction to mimic a missing field (chainId) param as Typescript will complain about missing chainId
  const unsignedTransaction: SolanaLitTransaction = {
    toAddress: alice.wallet.address,
    value: '0.0001', // in ethers (Lit tokens)
    chain: 'chronicleTestnet',
  };

  try {
    const _res = await signWithEncryptedKey({
      pkpSessionSigs: pkpSessionSigsSigning,
      litActionCode: signWithEthereumEncryptedKeyLitAction,
      unsignedTransaction,
      broadcast: false,
      litNodeClient: devEnv.litNodeClient,
    });
  } catch (e: any) {
    console.log('❌ THIS IS EXPECTED: ', e);
    console.log(e.message);

    if (
      e.message.includes(
        'Error executing the Signing Lit Action: Error: Missing required field: chainId'
      )
    ) {
      console.log(
        '✅ testFailEthereumSignWrappedKeyWithMissingParam is expected to have an error'
      );
    } else {
      throw e;
    }
  }

  log('✅ testFailEthereumSignWrappedKeyWithMissingParam');
};
