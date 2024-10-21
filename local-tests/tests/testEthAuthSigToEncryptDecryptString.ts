import { ILitNodeClient } from '@lit-protocol/types';
import { AccessControlConditions } from 'local-tests/setup/accs/accs';
import { TinnyEnvironment } from 'local-tests/setup/tinny-environment';
import { log } from '@lit-protocol/misc';
import { encryptString, decryptToString } from '@lit-protocol/encryption';
import { CENTRALISATION_BY_NETWORK } from '@lit-protocol/constants';

/**
 * Test Commands:
 * ✅ NETWORK=datil-dev yarn test:local --filter=testEthAuthSigToEncryptDecryptString
 * ✅ NETWORK=datil-test yarn test:local --filter=testEthAuthSigToEncryptDecryptString
 * ✅ NETWORK=custom yarn test:local --filter=testEthAuthSigToEncryptDecryptString
 */
export const testEthAuthSigToEncryptDecryptString = async (
  devEnv: TinnyEnvironment
) => {
  const alice = await devEnv.createRandomPerson();

  if (CENTRALISATION_BY_NETWORK[devEnv.network] === 'decentralised') {
    // The capacity credits NFT owner automatically uses the capacity credits
    // to pay for the encryption
    await alice.mintCapacityCreditsNFT();
  }

  const accs = AccessControlConditions.getEmvBasicAccessControlConditions({
    userAddress: alice.authSig.address,
  });

  const encryptRes = await encryptString(
    {
      accessControlConditions: accs,
      dataToEncrypt: 'Hello world',
    },
    devEnv.litNodeClient as unknown as ILitNodeClient
  );

  log('encryptRes:', encryptRes);

  // await 5 seconds for the encryption to be mined

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
  const decryptRes = await decryptToString(
    {
      accessControlConditions: accs,
      ciphertext: encryptRes.ciphertext,
      dataToEncryptHash: encryptRes.dataToEncryptHash,
      authSig: alice.authSig,
      chain: 'ethereum',
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
