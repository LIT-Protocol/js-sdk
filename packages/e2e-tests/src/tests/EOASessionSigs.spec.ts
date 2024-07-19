import { expect, jest, test } from '@jest/globals';
import { TinnyEnvironment } from '../../setup/tinny-environment';
import { getEoaSessionSigs } from './../../setup/session-sigs/get-eoa-session-sigs';
import { AccessControlConditions } from './../../setup/accs/accs';
import { ILitNodeClient, LitAbility } from '@lit-protocol/types';
import * as LitJsSdk from '@lit-protocol/lit-node-client-nodejs';
import { LitAccessControlConditionResource } from '@lit-protocol/auth-helpers';

try {
  jest.setTimeout(60000);
} catch (e) {
  // ... continue execution
}

describe('EOASessionSignatures', () => {
  let devEnv: TinnyEnvironment;
  beforeAll(async () => {
    devEnv = new TinnyEnvironment();
    await devEnv.init();
  });
  it('ExecuteJsSigning', async () => {
    const alice = await devEnv.createRandomPerson();

    const eoaSessionSigs = await getEoaSessionSigs(devEnv, alice);

    const res = await devEnv.litNodeClient?.executeJs({
      sessionSigs: eoaSessionSigs,
      code: `(async () => {
            const sigShare = await LitActions.signEcdsa({
              toSign: dataToSign,
              publicKey,
              sigName: "sig",
            });
          })();`,
      jsParams: {
        dataToSign: alice.loveLetter,
        publicKey: alice.pkp?.publicKey,
      },
    });

    devEnv.releasePrivateKeyFromUser(alice);

    // -- Expected output:
    // {
    //   claims: {},
    //   signatures: {
    //     sig: {
    //       r: "63311a761842b41686875862a3fb09975c838afff6ae11c5c3940da458dffe79",
    //       s: "1c25f352b4a8bf15510cecbee4e798270cdf68c45a26cf93dc32d6e03dfc720a",
    //       recid: 0,
    //       signature: "0x63311a761842b41686875862a3fb09975c838afff6ae11c5c3940da458dffe791c25f352b4a8bf15510cecbee4e798270cdf68c45a26cf93dc32d6e03dfc720a1b",
    //       publicKey: "0423F38A7663289FC58841B5F8E068FA43106BC7DDEE38D1F2542C03ABEC45B6733BE2D85A703C7B238865E45DF2175DD2A1736C56F2BAD0A965837F64BB21FB03",
    //       dataSigned: "7D87C5EA75F7378BB701E404C50639161AF3EFF66293E9F375B5F17EB50476F4",
    //     },
    //   }

    // -- assertions
    expect(res?.signatures.sig.r).toBeDefined();

    expect(res?.signatures.sig.s).toBeDefined();

    if (!res?.signatures.sig.dataSigned) {
      throw new Error(`Expected "dataSigned" in res.signatures.sig`);
    }

    if (!res?.signatures.sig.publicKey) {
      throw new Error(`Expected "publicKey" in res.signatures.sig`);
    }
  });
  it('ExecuteJsJsonResponse', async () => {
    const alice = await devEnv.createRandomPerson();

    const eoaSessionSigs = await getEoaSessionSigs(devEnv, alice);

    const res = await devEnv.litNodeClient?.executeJs({
      sessionSigs: eoaSessionSigs,
      code: `(async () => {
        console.log('hello world')

        LitActions.setResponse({
            response: JSON.stringify({hello: 'world'})
        });

        })();`,
    });

    devEnv.releasePrivateKeyFromUser(alice);

    // Expected output:
    // {
    //   success: true,
    //   signedData: {},
    //   decryptedData: {},
    //   claimData: {},
    //   response: "{\"hello\":\"world\"}",
    //   logs: "hello world\n",
    // }

    // -- assertions
    expect(res?.response).toBeDefined();
    expect(res?.logs).toBeDefined();
    expect(res?.logs.includes('hello world')).toBeTruthy();
    expect(res?.success).toBeTruthy();
  });

  it('DecryptString', async () => {
    const alice = await devEnv.createRandomPerson();
    // set access control conditions for encrypting and decrypting
    const accs = AccessControlConditions.getEmvBasicAccessControlConditions({
      userAddress: alice.wallet.address,
    });

    const encryptRes = await LitJsSdk.encryptString(
      {
        accessControlConditions: accs,
        dataToEncrypt: 'Hello world',
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

    const eoaSessionSigs2 = await getEoaSessionSigs(devEnv, alice, [
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
        sessionSigs: eoaSessionSigs2,
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
  });
});
