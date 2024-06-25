import { log } from '@lit-protocol/misc';
import { TinnyEnvironment } from 'local-tests/setup/tinny-environment';
import {
  customGeneratePrivateKey,
} from '@lit-protocol/wrapped-keys';
import { getPkpSessionSigs } from 'local-tests/setup/session-sigs/get-pkp-session-sigs';
import { LIT_ACTION_CID_REPOSITORY } from 'packages/wrapped-keys/src/lib/constants';

const CUSTOM_LIT_ACTION_CODE = `
(async () => {
  const LIT_PREFIX = 'lit_';

  const resp = await Lit.Actions.runOnce(
    { waitForResponse: true, name: 'encryptedPrivateKey' },
    async () => {
      const wallet = ethers.Wallet.createRandom();
      const privateKey = LIT_PREFIX + wallet.privateKey.toString();
      let utf8Encode = new TextEncoder();
      const to_encrypt = utf8Encode.encode(privateKey);

      const { ciphertext, dataToEncryptHash } = await Lit.Actions.encrypt({
        accessControlConditions,
        to_encrypt,
      });
      return JSON.stringify({
        ciphertext,
        dataToEncryptHash,
        publicKey: wallet.publicKey,
      });
    }
  );

  Lit.Actions.setResponse({
    response: resp,
  });
})();
`

/**
 * Test Commands:
 * ✅ NETWORK=cayenne yarn test:local --filter=testCustomGenerateWrappedKey
 * ✅ NETWORK=manzano yarn test:local --filter=testCustomGenerateWrappedKey
 * ✅ NETWORK=localchain yarn test:local --filter=testCustomGenerateWrappedKey
 */
export const testCustomGenerateWrappedKey = async (
  devEnv: TinnyEnvironment
) => {
  // Generate custom keys with IPFS CID
  const alice = await devEnv.createRandomPerson();

  const alicePkpSessionSigs = await getPkpSessionSigs(
    devEnv,
    alice,
    null,
    new Date(Date.now() + 1000 * 60 * 10).toISOString()
  ); // 10 mins expiry

  const ipfsCustomPrivateKeys = await customGeneratePrivateKey({
    pkpSessionSigs: alicePkpSessionSigs,
    litActionIpfsCid: LIT_ACTION_CID_REPOSITORY.generateEncryptedSolanaPrivateKey,
    litNodeClient: devEnv.litNodeClient,
  });

  console.log(`IPFS CID generatedPublicKey: ${ipfsCustomPrivateKeys.generatedPublicKey}`);

  const alicePkpAddress = alice.authMethodOwnedPkp.ethAddress;
  if (ipfsCustomPrivateKeys.pkpAddress !== alicePkpAddress) {
    throw new Error(
      `Received address: ${ipfsCustomPrivateKeys.pkpAddress} doesn't match Alice's PKP address: ${alicePkpAddress}`
    );
  }

  // Generate custom keys with code
  const bob = await devEnv.createRandomPerson();

  const bobPkpSessionSigs = await getPkpSessionSigs(
    devEnv,
    bob,
    null,
    new Date(Date.now() + 1000 * 60 * 10).toISOString()
  ); // 10 mins expiry

  const codeCustomPrivateKeys = await customGeneratePrivateKey({
    pkpSessionSigs: bobPkpSessionSigs,
    litActionCode: CUSTOM_LIT_ACTION_CODE,
    litNodeClient: devEnv.litNodeClient,
  });

  console.log(`Code generatedPublicKey: ${codeCustomPrivateKeys.generatedPublicKey}`);

  const bobPkpAddress = bob.authMethodOwnedPkp.ethAddress;
  if (codeCustomPrivateKeys.pkpAddress !== bobPkpAddress) {
    throw new Error(
      `Received address: ${codeCustomPrivateKeys.pkpAddress} doesn't match Bob's PKP address: ${bobPkpAddress}`
    );
  }

  log('✅ testCustomGenerateWrappedKey');
};
