import * as LitJsSdk from '@lit-protocol/lit-node-client-nodejs';
import { ILitNodeClient } from '@lit-protocol/types';
import { AccessControlConditions } from 'local-tests/setup/accs/accs';
import { LIT_TESTNET } from 'local-tests/setup/tinny-config';
import { TinnyEnvironment } from 'local-tests/setup/tinny-environment';

/**
 * Test Commands:
 * ❌ NETWORK=cayenne yarn test:local --filter=testCosmosAuthSigToEncryptDecryptString
 * ❌ NETWORK=manzano yarn test:local --filter=testCosmosAuthSigToEncryptDecryptString
 * ❌ NETWORK=localchain yarn test:local --filter=testCosmosAuthSigToEncryptDecryptString
 * ❌ NETWORK=datil-dev yarn test:local --filter=testCosmosAuthSigToEncryptDecryptString
 */
export const testCosmosAuthSigToEncryptDecryptString = async (
  devEnv: TinnyEnvironment
) => {
  console.log('❌❌ THIS IS A KNOWN FAILING TEST, PLEASE IGNORE FOR NOW. ❌❌');

  devEnv.setUnavailable(LIT_TESTNET.CAYENNE);
  devEnv.setUnavailable(LIT_TESTNET.LOCALCHAIN);
  devEnv.setUnavailable(LIT_TESTNET.MANZANO);
  devEnv.setUnavailable(LIT_TESTNET.DATIL_DEV);

  const accs = AccessControlConditions.getCosmosBasicAccessControlConditions({
    userAddress: devEnv.bareCosmosAuthSig.address,
  });

  const encryptRes = await LitJsSdk.encryptString(
    {
      unifiedAccessControlConditions: accs,
      dataToEncrypt: 'Hello world',
    },
    devEnv.litNodeClient as unknown as ILitNodeClient
  );

  console.log('encryptRes:', encryptRes);

  // -- Expected output:´
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

  // -- Decrypt the encrypted string
  try {
    const decryptRes = await LitJsSdk.decryptToString(
      {
        unifiedAccessControlConditions: accs,
        ciphertext: encryptRes.ciphertext,
        dataToEncryptHash: encryptRes.dataToEncryptHash,
        authSig: devEnv.bareCosmosAuthSig,
        chain: 'cosmos',
      },
      devEnv.litNodeClient as unknown as ILitNodeClient
    );
    console.log('decryptRes:', decryptRes);

    if (decryptRes !== 'Hello world') {
      throw new Error(
        `Expected decryptRes to be 'Hello world' but got ${decryptRes}`
      );
    }

    console.log('✅ decryptRes:', decryptRes);
  } catch (e) {
    console.log('❌ ERROR:', e);
  }
};
