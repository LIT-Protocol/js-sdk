import { getEoaSessionSigs } from 'local-tests/setup/session-sigs/get-eoa-session-sigs';
import { LIT_ABILITY } from '@lit-protocol/constants';
import { ILitNodeClient } from '@lit-protocol/types';
import { AccessControlConditions } from 'local-tests/setup/accs/accs';
import { LitAccessControlConditionResource } from '@lit-protocol/auth-helpers';
import {
  encryptUint8Array,
  decryptToUint8Array,
} from '@lit-protocol/encryption';
import {
  uint8arrayFromString,
  uint8arrayToString,
} from '@lit-protocol/uint8arrays';
import { TinnyEnvironment } from 'local-tests/setup/tinny-environment';
import { log } from '@lit-protocol/misc';

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
  const accs = AccessControlConditions.getEmvBasicAccessControlConditions({
    userAddress: alice.wallet.address,
  });

  const message = 'Hello world';
  const messageToEncrypt = uint8arrayFromString(message, 'utf8');

  const encryptRes = await encryptUint8Array(
    {
      accessControlConditions: accs,
      dataToEncrypt: messageToEncrypt,
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

  const eoaSessionSigs2 = await getEoaSessionSigs(devEnv, alice, [
    {
      resource: new LitAccessControlConditionResource(accsResourceString),
      ability: LIT_ABILITY.AccessControlConditionDecryption,
    },
  ]);

  // -- Decrypt the encrypted string
  const decryptRes = await decryptToUint8Array(
    {
      accessControlConditions: accs,
      ciphertext: encryptRes.ciphertext,
      dataToEncryptHash: encryptRes.dataToEncryptHash,
      sessionSigs: eoaSessionSigs2,
      chain: 'ethereum',
    },
    devEnv.litNodeClient as unknown as ILitNodeClient
  );
  const decryptResString = uint8arrayToString(decryptRes, 'utf8');

  devEnv.releasePrivateKeyFromUser(alice);

  if (decryptResString !== message) {
    throw new Error(
      `Expected decryptRes to be 'Hello world' but got ${decryptRes}`
    );
  }
};
