import { getEoaSessionSigs } from 'local-tests/setup/session-sigs/get-eoa-session-sigs';
import * as LitJsSdk from '@lit-protocol/lit-node-client-nodejs';
import { ILitNodeClient, LitAbility, SolanaAuthSig } from '@lit-protocol/types';
import { AccessControlConditions } from 'local-tests/setup/accs/accs';
import { LitAccessControlConditionResource } from '@lit-protocol/auth-helpers';
import { TinnyEnvironment } from 'local-tests/setup/tinny-environment';
import { log } from '@lit-protocol/misc';

/**
 * Test Commands:
 * ✅ NETWORK=cayenne yarn test:local --filter=testSolAuthSigToEncryptDecryptString
 * ✅ NETWORK=manzano yarn test:local --filter=testSolAuthSigToEncryptDecryptString
 * ✅ NETWORK=localchain yarn test:local --filter=testSolAuthSigToEncryptDecryptString
 */
export const testSolAuthSigToEncryptDecryptString = async (
  devEnv: TinnyEnvironment
) => {
  const accs = AccessControlConditions.getSolBasicAccessControlConditions({
    userAddress: devEnv.bareSolAuthSig.address,
  });

  const encryptRes = await LitJsSdk.encryptString(
    {
      solRpcConditions: accs,
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
  const decryptRes = await LitJsSdk.decryptToString(
    {
      solRpcConditions: accs,
      ciphertext: encryptRes.ciphertext,
      dataToEncryptHash: encryptRes.dataToEncryptHash,
      authSig: devEnv.bareSolAuthSig,
      chain: 'solana',
    },
    devEnv.litNodeClient as unknown as ILitNodeClient
  );

  if (decryptRes !== 'Hello world') {
    throw new Error(
      `Expected decryptRes to be 'Hello world' but got ${decryptRes}`
    );
  }

  console.log('✅ decryptRes:', decryptRes);
};
