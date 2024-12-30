import { ethers } from 'ethers';

import { createSiweMessageWithRecaps, generateAuthSig, LitPKPResource } from '@lit-protocol/auth-helpers';
import { LIT_ABILITY } from '@lit-protocol/constants';
import { log } from '@lit-protocol/misc';
import { AuthCallbackParams, AuthSig } from '@lit-protocol/types';
import { TinnyEnvironment } from 'local-tests/setup/tinny-environment';

/**
 * Test Commands:
 * ✅ NETWORK=datil-dev yarn test:local --filter=testUseEoaAuthContextToPkpSign
 * ✅ NETWORK=datil-test yarn test:local --filter=testUseEoaAuthContextToPkpSign
 * ✅ NETWORK=custom yarn test:local --filter=testUseEoaAuthContextToPkpSign
 */
export const testUseEoaAuthContextToPkpSign = async (
  devEnv: TinnyEnvironment
) => {
  const alice = await devEnv.createRandomPerson();

  const ONE_MINUTE = 1 * 60 * 1000;
  const expiration = new Date(Date.now() + ONE_MINUTE).toISOString();
  const resourceAbilityRequests = [
    {
      resource: new LitPKPResource('*'),
      ability: LIT_ABILITY.PKPSigning,
    },
  ];
  const litNodeClient = alice.envConfig.litNodeClient;

  litNodeClient.setAuthContext({
    getSessionSigsProps: {
      chain: 'ethereum',
      resourceAbilityRequests,
      expiration,
      authNeededCallback: async function (
        params: AuthCallbackParams
      ): Promise<AuthSig> {
        const toSign = await createSiweMessageWithRecaps({
          uri: params.uri,
          expiration: params.expiration,
          resources: params.resourceAbilityRequests,
          walletAddress: alice.wallet.address,
          nonce: await litNodeClient.getLatestBlockhash(),
          litNodeClient: devEnv.litNodeClient,
        });

        const authSig = await generateAuthSig({
          signer: alice.wallet,
          toSign,
        });

        return authSig;
      },
    },
  });

  const runWithAuthContext = await litNodeClient.pkpSign({
    toSign: alice.loveLetter,
    pubKey: alice.pkp.publicKey,
  });

  devEnv.releasePrivateKeyFromUser(alice);

  // Expected output:
  // {
  //   r: "25fc0d2fecde8ed801e9fee5ad26f2cf61d82e6f45c8ad1ad1e4798d3b747fd9",
  //   s: "549fe745b4a09536e6e7108d814cf7e44b93f1d73c41931b8d57d1b101833214",
  //   recid: 1,
  //   signature: "0x25fc0d2fecde8ed801e9fee5ad26f2cf61d82e6f45c8ad1ad1e4798d3b747fd9549fe745b4a09536e6e7108d814cf7e44b93f1d73c41931b8d57d1b1018332141c",
  //   publicKey: "04A3CD53CCF63597D3FFCD1DF1E8236F642C7DF8196F532C8104625635DC55A1EE59ABD2959077432FF635DF2CED36CC153050902B71291C4D4867E7DAAF964049",
  //   dataSigned: "7D87C5EA75F7378BB701E404C50639161AF3EFF66293E9F375B5F17EB50476F4",
  // }

  // -- assertions
  // r, s, dataSigned, and public key should be present
  if (!runWithAuthContext.r) {
    throw new Error(`Expected "r" in runWithAuthContext`);
  }
  if (!runWithAuthContext.s) {
    throw new Error(`Expected "s" in runWithAuthContext`);
  }
  if (!runWithAuthContext.dataSigned) {
    throw new Error(`Expected "dataSigned" in runWithAuthContext`);
  }
  if (!runWithAuthContext.publicKey) {
    throw new Error(`Expected "publicKey" in runWithAuthContext`);
  }

  // signature must start with 0x
  if (!runWithAuthContext.signature.startsWith('0x')) {
    throw new Error(`Expected "signature" to start with 0x`);
  }

  // recid must be parseable as a number
  if (isNaN(runWithAuthContext.recid)) {
    throw new Error(`Expected "recid" to be parseable as a number`);
  }

  const signature = ethers.utils.joinSignature({
    r: '0x' + runWithAuthContext.r,
    s: '0x' + runWithAuthContext.s,
    recoveryParam: runWithAuthContext.recid,
  });
  const recoveredPubKey = ethers.utils.recoverPublicKey(
    alice.loveLetter,
    signature
  );
  if (recoveredPubKey !== `0x${runWithAuthContext.publicKey.toLowerCase()}`) {
    throw new Error(
      `Expected recovered public key to match runWithAuthContext.publicKey`
    );
  }
  if (recoveredPubKey !== `0x${alice.pkp.publicKey.toLowerCase()}`) {
    throw new Error(
      `Expected recovered public key to match alice.pkp.publicKey`
    );
  }

  log('✅ testUseEoaAuthContextToPkpSign');
};
