import { LIT_TESTNET } from 'local-tests/setup/tinny';
import * as LitJsSdk from '@lit-protocol/lit-node-client-nodejs';
import { ILitNodeClient, LitAbility } from '@lit-protocol/types';
import { AccessControlConditions } from 'local-tests/setup/accs/accs';
import { LitAccessControlConditionResource } from '@lit-protocol/auth-helpers';
import { getLitActionSessionSigs } from 'local-tests/setup/session-sigs/get-lit-action-session-sigs';
import { TinnyEnvironment } from 'local-tests/setup/tinny';

/**
 * Test Commands:
 * ❌ NOT AVAILABLE IN CAYENNE
 * ❌ NOT AVAILABLE IN MANZANO
 * ✅ NETWORK=localchain yarn test:local --filter=testUseValidLitActionCodeGeneratedSessionSigsToEncryptDecryptString
 *
 */
export const testUseValidLitActionCodeGeneratedSessionSigsToEncryptDecryptString =
  async (devEnv: TinnyEnvironment) => {
    devEnv.setUnavailable(LIT_TESTNET.CAYENNE);
    devEnv.setUnavailable(LIT_TESTNET.MANZANO);

    const alice = await devEnv.createRandomPerson();
    // set access control conditions for encrypting and decrypting
    const accs = AccessControlConditions.getEmvBasicAccessControlConditions({
      userAddress: alice.authMethodOwnedPkp.ethAddress,
    });

    const litActionSessionSigs = await getLitActionSessionSigs(devEnv, alice);

    const encryptRes = await LitJsSdk.encryptString(
      {
        accessControlConditions: accs,
        chain: 'ethereum',
        sessionSigs: litActionSessionSigs,
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
      await LitAccessControlConditionResource.composeLitActionResourceString(
        accs,
        encryptRes.dataToEncryptHash
      );

    const litActionSessionSigs2 = await getLitActionSessionSigs(devEnv, alice, [
      {
        resource: new LitAccessControlConditionResource(accsResourceString),
        ability: LitAbility.AccessControlConditionDecryption,
      },
    ]);

    // -- Decrypt the encrypted string
    const decryptRes = await LitJsSdk.decryptToString(
      {
        accessControlConditions: accs,
        ciphertext: encryptRes.ciphertext,
        dataToEncryptHash: encryptRes.dataToEncryptHash,
        sessionSigs: litActionSessionSigs2,
        chain: 'ethereum',
      },
      devEnv.litNodeClient as unknown as ILitNodeClient
    );

    if (decryptRes !== 'Hello world') {
      throw new Error(
        `Expected decryptRes to be 'Hello world' but got ${decryptRes}`
      );
    }
  };
