import * as LitJsSdk from '@lit-protocol/lit-node-client-nodejs';
import { ILitNodeClient } from '@lit-protocol/types';
import { AccessControlConditions } from 'local-tests/setup/accs/accs';
import { TinnyEnvironment } from 'local-tests/setup/tinny-environment';
import { log } from '@lit-protocol/misc';
import { getEoaSessionSigs } from 'local-tests/setup/session-sigs/get-eoa-session-sigs';
import { signMessageWithSolanaEncryptedKeyLitAction } from 'packages/wrapped-keys/src/lib/litActions/solana/signMessageWithSolanaEncryptedKey';

/**
 * Test Commands:
 * ✅ NETWORK=cayenne yarn test:local --filter=testSignMessageWithSolanaEncryptedKey
 * ✅ NETWORK=manzano yarn test:local --filter=testSignMessageWithSolanaEncryptedKey
 * ✅ NETWORK=localchain yarn test:local --filter=testSignMessageWithSolanaEncryptedKey
 */
export const testSignMessageWithSolanaEncryptedKey = async (
  devEnv: TinnyEnvironment
) => {
  const alice = await devEnv.createRandomPerson();

  const accs = AccessControlConditions.getEmvBasicAccessControlConditions({
    userAddress: await alice.wallet.getAddress(),
  });

  const encryptRes = await LitJsSdk.encryptString(
    {
      accessControlConditions: accs,
      dataToEncrypt: devEnv.bareSolAuthSig.address,
    },
    devEnv.litNodeClient as unknown as ILitNodeClient
  );

  log('encryptRes:', encryptRes);

  // await 5 seconds for the encryption to be mined

  // -- Expected output:´
  // {
  //   ciphertext: "",
  //   dataToEncryptHash: "",
  // }

  // -- assertions
  if (!encryptRes.ciphertext) {
    throw new Error(`Expected "ciphertext" in encryptRes`);
  }

  if (!encryptRes.dataToEncryptHash) {
    throw new Error(`Expected "dataToEncryptHash" to in encryptRes`);
  }

  const eoaSessionSigs = await getEoaSessionSigs(devEnv, alice);

  const messageToSign = 'The answer to the Universe is 42';
  const res = await devEnv.litNodeClient.executeJs({
    sessionSigs: eoaSessionSigs,
    code: signMessageWithSolanaEncryptedKeyLitAction,
    jsParams: {
      accessControlConditions: accs,
      ciphertext: encryptRes.ciphertext,
      dataToEncryptHash: encryptRes.dataToEncryptHash,
      sessionSigs: eoaSessionSigs,
      message: messageToSign,
    },
  });

  console.log('res', res);

  // -- Decrypt the encrypted string
  //   const decryptRes = await LitJsSdk.decryptToString(
  //     {
  //       accessControlConditions: accs,
  //       ciphertext: encryptRes.ciphertext,
  //       dataToEncryptHash: encryptRes.dataToEncryptHash,
  //       authSig: devEnv.bareEthAuthSig,
  //       chain: 'ethereum',
  //     },
  //     devEnv.litNodeClient as unknown as ILitNodeClient
  //   );

  //   if (decryptRes !== 'Hello world') {
  //     throw new Error(
  //       `Expected decryptRes to be 'Hello world' but got ${decryptRes}`
  //     );
  //   }

  //   console.log('✅ decryptRes:', decryptRes);
};
