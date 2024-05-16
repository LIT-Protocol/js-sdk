import { LitActionResource, LitPKPResource } from '@lit-protocol/auth-helpers';
import { AuthMethodScope, LIT_ENDPOINT_VERSION } from '@lit-protocol/constants';
import { log } from '@lit-protocol/misc';
import { LitAbility } from '@lit-protocol/types';
import { LIT_TESTNET } from 'local-tests/setup/tinny-config';
import { getLitActionSessionSigs } from 'local-tests/setup/session-sigs/get-lit-action-session-sigs';
import { TinnyEnvironment } from 'local-tests/setup/tinny-environment';

/**
 * Test Commands:
 * ❌ NETWORK=cayenne yarn test:local --filter=testUseCustomAuthSessionSigsToPkpSign
 * ❌ NOT AVAILABLE IN HABANERO
 * ❌ NETWORK=localchain yarn test:local --filter=testUseCustomAuthSessionSigsToPkpSign
 */
export const testUseCustomAuthSessionSigsToPkpSign = async (
  devEnv: TinnyEnvironment
) => {
  const customAuthMethod = {
    authMethodType: 854321,
    accessToken:
      'eyJhbGciOiJSUzI1NiIsImtpZCI6ImEzYjc2MmY4NzFjZGIzYmFlMDA0NGM2NDk2MjJmYzEzOTZlZGEzZTMiLCJ0eXAiOiJKV1QifQ.eyJpc3MiOiJodHRwczovL2FjY291bnRzLmdvb2dsZS5jb20iLCJhenAiOiI0OTA0MzM2ODY3MTctZDJqM2Izb2NwdTFxZGFxcWwzOGM1Z2U4NDFmdTc1cDcuYXBwcy5nb29nbGV1c2VyY29udGVudC5jb20iLCJhdWQiOiI0OTA0MzM2ODY3MTctZDJqM2Izb2NwdTFxZGFxcWwzOGM1Z2U4NDFmdTc1cDcuYXBwcy5nb29nbGV1c2VyY29udGVudC5jb20iLCJzdWIiOiIxMDgwMDQwNzA2NTkwNjExNTMwMjMiLCJoZCI6Im9idmlvdXMudGVjaG5vbG9neSIsImVtYWlsIjoicm9taWxAb2J2aW91cy50ZWNobm9sb2d5IiwiZW1haWxfdmVyaWZpZWQiOnRydWUsImF0X2hhc2giOiJUZnBXNU8yNi04TkwzTjJVZVRiTnB3IiwiaWF0IjoxNzE1NzcwMDYxLCJleHAiOjE3MTU3NzM2NjF9.QwcwAzCHBN50L6L3lrV_kZ34TbdQxvRZc4evnFGQ785fv_KX4_z7SQqdrfzgO9OVTCnX23ZYSiNwbL-KaQfqqpIo9df7ub-HCvSTytjWc651eUZwCO9iO0a23Bf077HWM_s5pAp6hh5mJT-b_GnDVgBMlSv1eL4lkgvT-bzsfC3mgEuXnNcgsd0Safpuli6nyFziABmz_so_vUpebILkelEeiBEzTqc-g8JucORUCzSHYQ7W7xyz7YDGL1EGiWXL6zd-0XFaVV4yG9JIUNrHaNrJ20QbBXIk_54ZzykZKgepWQctqYmF0oEfeWIlaVym0ERGmUPRB2rWjcgaHaaiag',
  };

  console.log('customAuthMethod:', customAuthMethod);

  const customAuthMethodOwnedPkp =
    await devEnv.contractsClient.mintWithCustomAuth({
      customAuthId: 'it-could-be-anything',
      authMethod: customAuthMethod,
      scopes: [AuthMethodScope.SignAnything],
    });

  console.log('customAuthMethodOwnedPkp:', customAuthMethodOwnedPkp);

  const litActionSessionSigs2 = await devEnv.litNodeClient.getPkpSessionSigs({
    pkpPublicKey: customAuthMethodOwnedPkp.pkp.publicKey,
    authMethods: [customAuthMethod],
    resourceAbilityRequests: [
      {
        resource: new LitPKPResource('*'),
        ability: LitAbility.PKPSigning,
      },
      {
        resource: new LitActionResource('*'),
        ability: LitAbility.LitActionExecution,
      },
    ],
    litActionCode: Buffer.from(
      `
    // Works with an AuthSig AuthMethod
    if (Lit.Auth.authMethodContexts.some(e => e.authMethodType === 1)) {
      LitActions.setResponse({ response: "true" });
    } else {
      LitActions.setResponse({ response: "false" });
    }
    `
    ).toString('base64'),
    jsParams: {
      publicKey: customAuthMethodOwnedPkp.pkp.publicKey,
      sigName: 'custom-auth-sig',
    },
  });

  console.log('litActionSessionSigs2:', litActionSessionSigs2);

  process.exit();

  const alice = await devEnv.createRandomPerson();
  const litActionSessionSigs = await getLitActionSessionSigs(devEnv, alice, [
    {
      resource: new LitPKPResource('*'),
      ability: LitAbility.PKPSigning,
    },
    {
      resource: new LitActionResource('*'),
      ability: LitAbility.LitActionExecution,
    },
  ]);

  const res = await devEnv.litNodeClient.executeJs({
    sessionSigs: litActionSessionSigs,
    code: `(async () => {
        const sigShare = await LitActions.signEcdsa({
          toSign: dataToSign,
          publicKey,
          sigName: "sig",
        });
      })();`,
    jsParams: {
      dataToSign: alice.loveLetter,
      publicKey: alice.authMethodOwnedPkp.publicKey,
    },
  });

  // -- Expected output:
  // {
  //   claims: {},
  //   signatures: {
  //     sig: {
  //       r: "6d5ce6f948ff763939c204fc0f1b750fa0267ed567ed59581082d0cbf283feef",
  //       s: "4957ece75c60388500c4b7aa38a5fbafb7c20427db181aff7806af54c16ee145",
  //       recid: 1,
  //       signature: "0x6d5ce6f948ff763939c204fc0f1b750fa0267ed567ed59581082d0cbf283feef4957ece75c60388500c4b7aa38a5fbafb7c20427db181aff7806af54c16ee1451c",
  //       publicKey: "04D10D941B04491FDC99B048E2252A69137333254C482511D6CCDD401C080AF4F51BF65D9AE2413FCE066E326D7F0CED9C139DD9BA2D1C6334FD8C14CA4DD7F3D0",
  //       dataSigned: "7D87C5EA75F7378BB701E404C50639161AF3EFF66293E9F375B5F17EB50476F4",
  //     },
  //   },
  //   decryptions: [],
  //   response: undefined,
  //   logs: "",
  // }

  // -- assertions
  if (!res.signatures.sig.r) {
    throw new Error(`Expected "r" in res.signatures.sig`);
  }
  if (!res.signatures.sig.s) {
    throw new Error(`Expected "s" in res.signatures.sig`);
  }

  if (!res.signatures.sig.dataSigned) {
    throw new Error(`Expected "dataSigned" in res.signatures.sig`);
  }

  if (!res.signatures.sig.publicKey) {
    throw new Error(`Expected "publicKey" in res.signatures.sig`);
  }

  log('✅ res:', res);
};
