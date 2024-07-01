import { LIT_TESTNET } from 'local-tests/setup/tinny-config';
import * as LitJsSdk from '@lit-protocol/lit-node-client-nodejs';
import { ILitNodeClient, LitAbility } from '@lit-protocol/types';
import { AccessControlConditions } from 'local-tests/setup/accs/accs';
import {
  LitAccessControlConditionResource,
  LitActionResource,
} from '@lit-protocol/auth-helpers';
import { getLitActionSessionSigs } from 'local-tests/setup/session-sigs/get-lit-action-session-sigs';
import { TinnyEnvironment } from 'local-tests/setup/tinny-environment';
import { log } from '@lit-protocol/misc';
import * as accessControlConditions from '@lit-protocol/access-control-conditions';

/**
 * Test Commands:
 * ✅ NETWORK=cayenne yarn test:local --filter=testUseValidLitActionCodeGeneratedSessionSigsToEncryptDecryptString
 * ❌ NOT AVAILABLE IN MANZANO
 * ✅ NETWORK=localchain yarn test:local --filter=testUseValidLitActionCodeGeneratedSessionSigsToEncryptDecryptString
 *
 */
export const testExecutJsDecryptAndCombine = async (
  devEnv: TinnyEnvironment
) => {
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
      dataToEncrypt: 'Hello world',
    },
    devEnv.litNodeClient as unknown as ILitNodeClient
  );

  log('encryptRes:', encryptRes);

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

  const res = await devEnv.litNodeClient.executeJs({
    sessionSigs: litActionSessionSigs,
    code: `(async () => {
        const resp = await Lit.Actions.decryptAndCombine({
          accessControlConditions,
          ciphertext,
          dataToEncryptHash,
          authSig: null,
          chain: 'ethereum',
        });
        Lit.Actions.setResponse({
            response: resp
        });
      })();`,
    jsParams: {
      accessControlConditions: accs,
      dataToEncryptHash: encryptRes.dataToEncryptHash,
      ciphertext: encryptRes.ciphertext,
    },
  });

  devEnv.releasePrivateKeyFromUser(alice);

  if (res.response !== 'Hello world') {
    throw new Error('content does not match what was expected');
  }
};
