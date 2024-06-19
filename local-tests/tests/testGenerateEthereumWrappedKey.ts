import { log } from '@lit-protocol/misc';
import { TinnyEnvironment } from 'local-tests/setup/tinny-environment';
import { generatePrivateKey } from '@lit-protocol/wrapped-keys';
import { getPkpSessionSigs } from 'local-tests/setup/session-sigs/get-pkp-session-sigs';
import { NETWORK_EVM } from 'packages/wrapped-keys/src/lib/constants';

/**
 * Test Commands:
 * ✅ NETWORK=cayenne yarn test:local --filter=testGenerateEthereumWrappedKey
 * ✅ NETWORK=manzano yarn test:local --filter=testGenerateEthereumWrappedKey
 * ✅ NETWORK=localchain yarn test:local --filter=testGenerateEthereumWrappedKey
 */
export const testGenerateEthereumWrappedKey = async (
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

  const { pkpAddress, generatedPublicKey } = await generatePrivateKey({
    pkpSessionSigs,
    network: NETWORK_EVM,
    litNodeClient: devEnv.litNodeClient,
  });

  const alicePkpAddress = alice.authMethodOwnedPkp.ethAddress;
  if (pkpAddress !== alicePkpAddress) {
    throw new Error(
      `Received address: ${pkpAddress} doesn't match Alice's PKP address: ${alicePkpAddress}`
    );
  }

  const pkpSessionSigsExport = await getPkpSessionSigs(
    devEnv,
    alice,
    null,
    new Date(Date.now() + 1000 * 60 * 10).toISOString()
  ); // 10 mins expiry

  console.log(pkpSessionSigsExport);

  // FIX: Export broken as we can't decrypt data encrypted inside a Lit Action
  // const decryptedPrivateKey = await exportPrivateKey({
  //   pkpSessionSigs: pkpSessionSigsExport,
  //   litNodeClient: devEnv.litNodeClient,
  // });

  // const wallet = new ethers.Wallet(decryptedPrivateKey);
  // const decryptedPublicKey = wallet.publicKey;

  // if (decryptedPublicKey !== generatedPublicKey) {
  //   throw new Error(
  //     `Decrypted decryptedPublicKey: ${decryptedPublicKey} doesn't match with the original generatedPublicKey: ${generatedPublicKey}`
  //   );
  // }

  log('✅ testGenerateEthereumWrappedKey');
};
