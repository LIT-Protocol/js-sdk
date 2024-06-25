import { log } from '@lit-protocol/misc';
import { ethers } from 'ethers';
import { TinnyEnvironment } from 'local-tests/setup/tinny-environment';
import {
  customSignMessageWithEncryptedKey,
  importPrivateKey,
} from '@lit-protocol/wrapped-keys';
import { getPkpSessionSigs } from 'local-tests/setup/session-sigs/get-pkp-session-sigs';

const CUSTOM_LIT_ACTION_CODE = `
(async () => {
  const LIT_PREFIX = 'lit_';

  let decryptedPrivateKey;
  try {
    decryptedPrivateKey = await Lit.Actions.decryptToSingleNode({
      accessControlConditions,
      ciphertext,
      dataToEncryptHash,
      chain: 'ethereum',
      authSig: null,
    });
  } catch (err) {
    const errorMessage =
      'Error: When decrypting to a single node- ' + err.message;
    Lit.Actions.setResponse({ response: errorMessage });
    return;
  }

  if (!decryptedPrivateKey) {
    // Exit the nodes which don't have the decryptedData
    return;
  }

  const privateKey = decryptedPrivateKey.startsWith(LIT_PREFIX)
    ? decryptedPrivateKey.slice(LIT_PREFIX.length)
    : decryptedPrivateKey;
  const wallet = new ethers.Wallet(privateKey);

  try {
    const signature = await wallet.signMessage(messageToSign);

    const recoveredAddress = ethers.utils.verifyMessage(
      messageToSign,
      signature
    );

    if (recoveredAddress !== wallet.address) {
      Lit.Actions.setResponse({
        response: "Error: Recovered address doesn't match the wallet address",
      });
      return;
    }

    Lit.Actions.setResponse({ response: signature });
  } catch (err) {
    const errorMessage = 'Error: When signing message- ' + err.message;
    Lit.Actions.setResponse({ response: errorMessage });
  }
})();
`;

/**
 * Test Commands:
 * ✅ NETWORK=cayenne yarn test:local --filter=testCustomignMessageWrappedKey
 * ✅ NETWORK=manzano yarn test:local --filter=testCustomignMessageWrappedKey
 * ✅ NETWORK=localchain yarn test:local --filter=testCustomignMessageWrappedKey
 */
export const testCustomignMessageWrappedKey = async (
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

  const unsignedStringMessage = 'This is a test message';

  const signature = await customSignMessageWithEncryptedKey({
    pkpSessionSigs: pkpSessionSigsSigning,
    litActionCode: CUSTOM_LIT_ACTION_CODE,
    messageToSign: unsignedStringMessage,
    litNodeClient: devEnv.litNodeClient,
  });

  console.log('signature');
  console.log(signature);

  if (!ethers.utils.isHexString(signature)) {
    throw new Error(`signature isn't hex: ${signature}`);
  }

  log('✅ testCustomignMessageWrappedKey');
};
