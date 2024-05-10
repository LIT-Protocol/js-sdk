import * as LitJsSdk from '@lit-protocol/lit-node-client-nodejs';
import { ILitNodeClient, LitAbility } from '@lit-protocol/types';
import { AccessControlConditions } from 'local-tests/setup/accs/accs';
import { LitAccessControlConditionResource } from '@lit-protocol/auth-helpers';
import { getPkpSessionSigs } from 'local-tests/setup/session-sigs/get-pkp-session-sigs';
import { TinnyEnvironment } from 'local-tests/setup/tinny-environment';
import { log } from '@lit-protocol/misc';

/**
 * Test Commands:
 * ✅ NETWORK=cayenne yarn test:local --filter=testUsePkpSessionSigsToEncryptDecryptFile
 * ✅ NETWORK=manzano yarn test:local --filter=testUsePkpSessionSigsToEncryptDecryptFile
 * ✅ NETWORK=localchain yarn test:local --filter=testUsePkpSessionSigsToEncryptDecryptFile
 */
export const testUsePkpSessionSigsToEncryptDecryptFile = async (
  devEnv: TinnyEnvironment
) => {
  const alice = await devEnv.createRandomPerson();

  const message = 'Hello world';
  const blob = new Blob([message], { type: 'text/plain' });
  const blobArray = new Uint8Array(await blob.arrayBuffer());

  // set access control conditions for encrypting and decrypting
  const accs = AccessControlConditions.getEmvBasicAccessControlConditions({
    userAddress: alice.authMethodOwnedPkp.ethAddress,
  });

  const encryptRes = await LitJsSdk.encryptString(
    {
      accessControlConditions: accs,
      dataToEncrypt: 'Hello world',
    },
    devEnv.litNodeClient as unknown as ILitNodeClient
  );

  log('encryptRes:', encryptRes);

  // await 5 seconds for the encryption to be mined

  // -- Expected output:
  // {
  //   ciphertext: "pSP1Rq4xdyLBzSghZ3DtTtHp2UL7/z45U2JDOQho/WXjd2ntr4IS8BJfqJ7TC2U4CmktrvbVT3edoXJgFqsE7vy9uNrBUyUSTuUdHLfDVMIgh4a7fqMxsdQdkWZjHign3JOaVBihtOjAF5VthVena28D",
  //   dataToEncryptHash: "64ec88ca00b268e5ba1a35678a1b5316d212f4f366b2477232534a8aeca37f3c",
  // }

  // -- assertions
  if (!encryptRes.ciphertext) {
    throw new Error(`Expected "ciphertext" in encryptRes`);
  }

  if (!encryptRes.dataToEncryptHash) {
    throw new Error(`Expected "dataToEncryptHash" to in encryptRes`);
  }

  const accsResourceString =
    await LitAccessControlConditionResource.generateResourceString(
      accs,
      encryptRes.dataToEncryptHash
    );

  const pkpSessionSigs2 = await getPkpSessionSigs(devEnv, alice, [
    {
      resource: new LitAccessControlConditionResource(accsResourceString),
      ability: LitAbility.AccessControlConditionDecryption,
    },
  ]);

  // -- Decrypt the encrypted string
  const decriptedFile = await LitJsSdk.decryptToFile(
    {
      accessControlConditions: accs,
      ciphertext: encryptRes.ciphertext,
      dataToEncryptHash: encryptRes.dataToEncryptHash,
      sessionSigs: pkpSessionSigs2,
      chain: 'ethereum',
    },
    devEnv.litNodeClient as unknown as ILitNodeClient
  );

  if (blobArray.length !== decriptedFile.length) {
    throw new Error(
      `decrypted file should match the original file but received ${decriptedFile}`
    );
  }
  for (let i = 0; i < blobArray.length; i++) {
    if (blobArray[i] !== decriptedFile[i]) {
      throw new Error(`decrypted file should match the original file`);
    }
  }

  console.log('decriptedFile:', decriptedFile);
};
