import { DevEnv } from 'local-tests/setup/env-setup';
import { getEoaSessionSigs } from 'local-tests/setup/session-sigs/get-eoa-session-sigs';
import * as LitJsSdk from '@lit-protocol/lit-node-client-nodejs';
import { ILitNodeClient, LitAbility } from '@lit-protocol/types';
import { AccessControlConditions } from 'local-tests/setup/accs/accs';
import { LitAccessControlConditionResource } from '@lit-protocol/auth-helpers';
import { hashAccessControlConditions } from '@lit-protocol/access-control-conditions';

/**
 * Test Commands:
 * ✅ yarn test:local --filter=testUseEoaSessionSigsToEncryptDecryptString --network=cayenne --version=v0
 * ✅ yarn test:local --filter=testUseEoaSessionSigsToEncryptDecryptString --network=manzano --version=v0
 * ❌ yarn test:local --filter=testUseEoaSessionSigsToEncryptDecryptString --network=localchain --version=v0
 */
export const testUseEoaSessionSigsToEncryptDecryptString = async (
  devEnv: DevEnv
) => {
  // set access control conditions for encrypting and decrypting
  const accs = AccessControlConditions.getEmvBasicAccessControlConditions({
    userAddress: devEnv.hotWallet.address,
  });

  const eoaSessionSigs = await getEoaSessionSigs(devEnv);

  const encryptRes = await LitJsSdk.encryptString(
    {
      accessControlConditions: accs,
      chain: 'ethereum',
      sessionSigs: eoaSessionSigs,
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

  // get hash of the access control condition (needed for auth unification)
  const hashedAccs = await hashAccessControlConditions(accs);
  const hashedAccsStr = LitJsSdk.uint8arrayToString(
    new Uint8Array(hashedAccs),
    'base16'
  );

  // 4100e40fbb3720c3b61d2330a20052d97d1e40605ee610d1201bbcb59548ee00/64ec88ca00b268e5ba1a35678a1b5316d212f4f366b2477232534a8aeca37f3c
  console.log(
    '`${hashedAccsStr}/${encryptRes.dataToEncryptHash}`:',
    `${hashedAccsStr}/${encryptRes.dataToEncryptHash}`
  );

  const eoaSessionSigs2 = await getEoaSessionSigs(devEnv, [
    {
      resource: new LitAccessControlConditionResource(
        `${encryptRes.dataToEncryptHash}`
      ),
      // resource: new LitAccessControlConditionResource(
      //   `${hashedAccsStr}/${encryptRes.dataToEncryptHash}`
      // ),
      ability: LitAbility.AccessControlConditionDecryption,
    },
  ]);
  console.log('eoaSessionSigs2:', eoaSessionSigs2);

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

  console.log('decryptRes:', decryptRes);
  process.exit(0);

  if (decryptRes !== 'Hello world') {
    throw new Error(
      `Expected decryptRes to be 'Hello world' but got ${decryptRes}`
    );
  }
};
