import { log } from '@lit-protocol/misc';
import { ethers } from 'ethers';
import { TinnyEnvironment } from 'local-tests/setup/tinny-environment';
import {
  importPrivateKey,
  signMessageWithEncryptedKey,
  signMessageWithEthereumEncryptedKeyLitAction,
} from '@lit-protocol/wrapped-keys';
import { getPkpSessionSigs } from 'local-tests/setup/session-sigs/get-pkp-session-sigs';

/**
 * Test Commands:
 * ✅ NETWORK=cayenne yarn test:local --filter=testEthereumSignMessageWrappedKey
 * ✅ NETWORK=manzano yarn test:local --filter=testEthereumSignMessageWrappedKey
 * ✅ NETWORK=localchain yarn test:local --filter=testEthereumSignMessageWrappedKey
 */
export const testEthereumSignMessageWrappedKey = async (devEnv: TinnyEnvironment) => {
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

  const unsignedStringMessage = "This is a test message";

  const signature = await signMessageWithEncryptedKey({
    pkpSessionSigs: pkpSessionSigsSigning,
    litActionCode: signMessageWithEthereumEncryptedKeyLitAction,
    unsignedMessage: unsignedStringMessage,
    litNodeClient: devEnv.litNodeClient,
  });

  console.log('signature');
  console.log(signature);

  if (!ethers.utils.isHexString(signature)) {
    throw new Error(`signature isn't hex: ${signature}`);
  }

  const unsignedBinaryMessage = ethers.utils.arrayify(ethers.utils.toUtf8Bytes(unsignedStringMessage));

  const signatureBinary = await signMessageWithEncryptedKey({
    pkpSessionSigs: pkpSessionSigsSigning,
    litActionCode: signMessageWithEthereumEncryptedKeyLitAction,
    unsignedMessage: unsignedBinaryMessage,
    litNodeClient: devEnv.litNodeClient,
  });

  console.log('signatureBinary');
  console.log(signatureBinary);

  if (!ethers.utils.isHexString(signatureBinary)) {
    throw new Error(`signatureBinary isn't hex: ${signatureBinary}`);
  }

  if (signatureBinary !== signature) {
    throw new Error(`signature: ${signature} doesn't match it's signatureBinary form: ${signatureBinary}`);
  }

  log('✅ testEthereumSignMessageWrappedKey');
};
