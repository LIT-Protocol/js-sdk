import { LIT_ABILITY } from '@lit-protocol/constants';
import { ILitNodeClient } from '@lit-protocol/types';
import { LitAccessControlConditionResource } from '@lit-protocol/auth-helpers';
import {
  encryptUint8Array,
  decryptToUint8Array,
} from '@lit-protocol/encryption';

import { AccessControlConditions } from 'local-tests/setup/accs/accs';
import { getEoaAuthContext } from 'local-tests/setup/session-sigs/get-eoa-session-sigs';
import { TinnyEnvironment } from 'local-tests/setup/tinny-environment';

/**
 * Test Commands:
 * ✅ NETWORK=datil-dev yarn test:local --filter=testUseEoaSessionSigsToEncryptDecryptUint8Array
 * ✅ NETWORK=datil-test yarn test:local --filter=testUseEoaSessionSigsToEncryptDecryptUint8Array
 * ✅ NETWORK=custom yarn test:local --filter=testUseEoaSessionSigsToEncryptDecryptUint8Array
 */
export const testUseEoaSessionSigsToEncryptDecryptUint8Array = async (
  devEnv: TinnyEnvironment
) => {
  const alice = await devEnv.createRandomPerson();
  // set access control conditions for encrypting and decrypting
  const accs = AccessControlConditions.getEvmBasicAccessControlConditions({
    userAddress: alice.wallet.address,
  });

  const message = 'Hello world';
  const messageToEncrypt = Buffer.from(message, 'utf8');

  const encryptRes = await encryptUint8Array(
    {
      accessControlConditions: accs,
      dataToEncrypt: messageToEncrypt,
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
    await LitAccessControlConditionResource.generateResourceString(
      accs,
      encryptRes.dataToEncryptHash
    );

  // -- Decrypt the encrypted string
  const decryptRes = await decryptToUint8Array(
    {
      accessControlConditions: accs,
      ciphertext: encryptRes.ciphertext,
      dataToEncryptHash: encryptRes.dataToEncryptHash,
      authContext: getEoaAuthContext(devEnv, alice, [
        {
          resource: new LitAccessControlConditionResource(accsResourceString),
          ability: LIT_ABILITY.AccessControlConditionDecryption,
        },
      ]),
      chain: 'ethereum',
    },
    devEnv.litNodeClient as unknown as ILitNodeClient
  );
  const decryptResString = Buffer.from(decryptRes).toString('utf8');

  devEnv.releasePrivateKeyFromUser(alice);

  if (decryptResString !== message) {
    throw new Error(
      `Expected decryptRes to be 'Hello world' but got ${decryptRes}`
    );
  }
};
