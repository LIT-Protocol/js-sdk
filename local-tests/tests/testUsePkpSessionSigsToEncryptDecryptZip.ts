import { DevEnv } from 'local-tests/setup/env-setup';
import { getEoaSessionSigs } from 'local-tests/setup/session-sigs/get-eoa-session-sigs';
import * as LitJsSdk from '@lit-protocol/lit-node-client-nodejs';
import { ILitNodeClient, LitAbility } from '@lit-protocol/types';
import { AccessControlConditions } from 'local-tests/setup/accs/accs';
import { LitAccessControlConditionResource } from '@lit-protocol/auth-helpers';
import { getPkpSessionSigs } from 'local-tests/setup/session-sigs/get-pkp-session-sigs';

/**
 * Test Commands:
 * ✅ NETWORK=cayenne yarn test:local --filter=testUsePkpSessionSigsToEncryptDecryptZip
 * ✅ NETWORK=manzano yarn test:local --filter=testUsePkpSessionSigsToEncryptDecryptZip
 * ✅ NETWORK=localchain yarn test:local --filter=testUsePkpSessionSigsToEncryptDecryptZip
 */
export const testUsePkpSessionSigsToEncryptDecryptZip = async (
  devEnv: DevEnv
) => {
  const message = 'Hello world';

  // set access control conditions for encrypting and decrypting
  const accs = AccessControlConditions.getEmvBasicAccessControlConditions({
    userAddress: devEnv.hotWalletAuthMethodOwnedPkp.ethAddress,
  });

  const pkpSessionSigs = await getPkpSessionSigs(devEnv);

  const encryptRes = await LitJsSdk.zipAndEncryptString(
    {
      accessControlConditions: accs,
      chain: 'ethereum',
      sessionSigs: pkpSessionSigs,
      dataToEncrypt: message,
    },
    devEnv.litNodeClient as unknown as ILitNodeClient
  );

  console.log('encryptRes:', encryptRes);

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
    await LitAccessControlConditionResource.composeLitActionResourceString(
      accs,
      encryptRes.dataToEncryptHash
    );

  const pkpSessionSigs2 = await getPkpSessionSigs(devEnv, [
    {
      resource: new LitAccessControlConditionResource(accsResourceString),
      ability: LitAbility.AccessControlConditionDecryption,
    },
  ]);

  // -- Decrypt the encrypted string
  const decryptedZip = await LitJsSdk.decryptToZip(
    {
      accessControlConditions: accs,
      ciphertext: encryptRes.ciphertext,
      dataToEncryptHash: encryptRes.dataToEncryptHash,
      sessionSigs: pkpSessionSigs2,
      chain: 'ethereum',
    },
    devEnv.litNodeClient as unknown as ILitNodeClient
  );

  const decryptedMessage = await decryptedZip['string.txt'].async('string');

  if (message !== decryptedMessage) {
    throw new Error(
      `decryptedMessage should be ${message} but received ${decryptedMessage}`
    );
  }

  console.log('decryptedMessage:', decryptedMessage);
};
