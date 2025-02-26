import { LIT_ABILITY } from '@lit-protocol/constants';
import { encryptString, decryptToString } from '@lit-protocol/encryption';
import { ILitNodeClient } from '@lit-protocol/types';

import { AccessControlConditions } from 'local-tests/setup/accs/accs';
import { LitAccessControlConditionResource } from '@lit-protocol/auth-helpers';
import { getLitActionAuthContext } from 'local-tests/setup/session-sigs/get-lit-action-session-sigs';
import { TinnyEnvironment } from 'local-tests/setup/tinny-environment';

/**
 * Test Commands:
 * ✅ NETWORK=datil-dev yarn test:local --filter=testUseValidLitActionCodeGeneratedSessionSigsToEncryptDecryptString
 * ✅ NETWORK=custom yarn test:local --filter=testUseValidLitActionCodeGeneratedSessionSigsToEncryptDecryptString
 *
 */
export const testUseValidLitActionCodeGeneratedSessionSigsToEncryptDecryptString =
  async (devEnv: TinnyEnvironment) => {
    const alice = await devEnv.createRandomPerson();
    // set access control conditions for encrypting and decrypting
    const accs = AccessControlConditions.getEvmBasicAccessControlConditions({
      userAddress: alice.authMethodOwnedPkp.ethAddress,
    });

    const encryptRes = await encryptString(
      {
        accessControlConditions: accs,
        dataToEncrypt: 'Hello world',
      },
      devEnv.litNodeClient as unknown as ILitNodeClient
    );

    console.log('encryptRes:', encryptRes);

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
    const decryptRes = await decryptToString(
      {
        accessControlConditions: accs,
        ciphertext: encryptRes.ciphertext,
        dataToEncryptHash: encryptRes.dataToEncryptHash,
        authContext: getLitActionAuthContext(devEnv, alice, [
          {
            resource: new LitAccessControlConditionResource(accsResourceString),
            ability: LIT_ABILITY.AccessControlConditionDecryption,
          },
        ]),
        chain: 'ethereum',
      },
      devEnv.litNodeClient as unknown as ILitNodeClient
    );

    devEnv.releasePrivateKeyFromUser(alice);

    if (decryptRes !== 'Hello world') {
      throw new Error(
        `Expected decryptRes to be 'Hello world' but got ${decryptRes}`
      );
    }
  };
