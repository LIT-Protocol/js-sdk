/**
 * This script is used to test the Stytch authentication method.
 *
 * Usage:
 *
 * To run the test, use one of the following commands:
 *
 * yarn test:e2e:node --filter=stytch --sms=<phone_number>
 * yarn test:e2e:node --filter=stytch --email=<email>
 * yarn test:e2e:node --filter=stytch --whatsapp=<phone_number>
 *
 * After running the test, you will receive a verification code. To authenticate, use the following command:
 *
 * yarn test:e2e:node --filter=stytch --verify=<code>
 *
 * Replace <phone_number>, <email>, and <code> with your actual data.
 *
 * Note: The environment variables STYTCH_PROJECT_ID and STYTCH_SECRET must be set.
 * You can sign up for a Stytch account at https://stytch.com/. Once you have an account,
 * you can find your project ID and secret at https://stytch.com/dashboard/api-keys.
 * See https://i.imgur.com/fR0oRGW.png for how to get these values
 * 
 */

import path from 'path';
import url from 'url';

import { success, fail, testThis } from '../../tools/scripts/utils.mjs';
import { client } from '../00-setup.mjs';
import { LitAbility, LitActionResource } from '@lit-protocol/auth-helpers';
import { LitAuthClient } from '@lit-protocol/lit-auth-client';
import { ProviderType } from '@lit-protocol/constants';
import { ethers } from 'ethers';
import * as stytch from 'stytch';
import { PKPEthersWallet } from '@lit-protocol/pkp-ethers';
import fs from 'fs';

export async function main() {
  const STYTCH_PROJECT_ID = process.env.STYTCH_PROJECT_ID || '';
  const STYTCH_SECRET = process.env.STYTCH_SECRET || '';

  if (!STYTCH_PROJECT_ID || !STYTCH_SECRET) {
    return fail('You must provide a STYTCH_PROJECT_ID and STYTCH_SECRET');
  }

  const args = process.argv.slice(2);

  const EMAIL = args.find((arg) => arg.startsWith('--email'))?.split('=')[1];
  const SMS = args.find((arg) => arg.startsWith('--sms'))?.split('=')[1];
  const WHATSAPP = args
    .find((arg) => arg.startsWith('--whatsapp'))
    ?.split('=')[1];

  const VERIFY = args.find((arg) => arg.startsWith('--verify'))?.split('=')[1];

  // ==================== Setup ====================
  const stytchClient = new stytch.Client({
    project_id: STYTCH_PROJECT_ID,
    secret: STYTCH_SECRET,
  });

  let stytchResponse;

  // ****************** vv NOTE vv ******************
  // -- The following code gets the id from the stytchResponse and replaces the "method_id" value in the file
  // so that you can authenticate without manually copying and pasting the id
  let outputString;

  //  read this file
  const thisFile = path.basename(import.meta.url);

  // get the path of this file
  const thisFilePath = path.dirname(url.fileURLToPath(import.meta.url));

  // get the content in nodejs
  const content = fs.readFileSync(`${thisFilePath}/${thisFile}`, 'utf8');
  // ****************** ^^ NOTE ^^ ******************

  if (EMAIL) {
    console.log('Sending code to email:', EMAIL);

    stytchResponse = await stytchClient.otps.email.loginOrCreate({
      email: EMAIL,
    });

    outputString = content.replace(
      /method_id: '([a-zA-Z0-9\-]+)'/,
      `method_id: "${stytchResponse.email_id}"`
    );
  }

  if (SMS) {
    console.log('Sending code to sms:', SMS);
    stytchResponse = await stytchClient.otps.sms.loginOrCreate({
      phone_number: SMS,
    });

    outputString = content.replace(
      /method_id: '([a-zA-Z0-9\-]+)'/,
      `method_id: "${stytchResponse.phone_id}"`
    );
  }

  if (WHATSAPP) {
    console.log('Sending code to whatsapp:', WHATSAPP);
    stytchResponse = await stytchClient.otps.whatsapp.loginOrCreate({
      phone_number: WHATSAPP,
    });

    outputString = content.replace(
      /method_id: '([a-zA-Z0-9\-]+)'/,
      `method_id: "${stytchResponse.phone_id}"`
    );
  }

  if (EMAIL || SMS || WHATSAPP) {
    console.log('stytchResponse:', stytchResponse);

    console.log(`Replacing method_id in this file with stytchResponse id`);

    // write the new content back to the file
    fs.writeFileSync(`${thisFilePath}/${thisFile}`, outputString, 'utf8');

    process.exit();
  }

  if (!VERIFY) {
    return fail(
      'You must provide a verification code to verify the otp using the --verify flag eg. --verify=123456'
    );
  }

  const authResponse = await stytchClient.otps.authenticate({
    method_id: 'phone-number-test-09235544-3ab8-49c5-b34c-aa71781cf554',
    code: VERIFY,
    session_duration_minutes: 60 * 24 * 7 * 7,
  });

  const sessionStatus = await stytchClient.sessions.authenticate({
    session_token: authResponse.session_token,
  });

  const litAuthClient = new LitAuthClient({
    litRelayConfig: {
      relayApiKey: '67e55044-10b1-426f-9247-bb680e5fe0c8_relayer',
    },
    version: 'V3',
    litNodeClient: client,
  });

  // -- stytch
  const authProvider = litAuthClient.initProvider(ProviderType.StytchOtp, {
    userId: sessionStatus.session.user_id,
    appId: STYTCH_PROJECT_ID,
  });
  const authMethod = await authProvider.authenticate({
    accessToken: sessionStatus.session_jwt,
  });

  let pkps = await authProvider.fetchPKPsThroughRelayer(authMethod);

  if (pkps.length <= 0) {
    await authProvider.mintPKPThroughRelayer(authMethod);
    pkps = await authProvider.fetchPKPsThroughRelayer(authMethod);
  }

  const pkp = pkps[pkps.length - 1];

  const sessionKeyPair = client.getSessionKey();

  const authNeededCallback = async (params) => {
    const response = await client.signSessionKey({
      sessionKey: sessionKeyPair,
      statement: params.statement,
      authMethods: [authMethod],
      pkpPublicKey: pkp.publicKey,
      expiration: params.expiration,
      resources: params.resources,
      chainId: 1,
    });
    return response.authSig;
  };

  const resourceAbilities = [
    {
      resource: new LitActionResource('*'),
      ability: LitAbility.PKPSigning,
    },
  ];

  // ==================== Test Logic ====================

  const sessionSigs = await client.getSessionSigs({
    chain: 'ethereum',
    expiration: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7).toISOString(),
    resourceAbilityRequests: resourceAbilities,
    sessionKey: sessionKeyPair,
    authNeededCallback,
  });

  // NOTE: you need to hash data before you send it in.
  // If you send something that isn't 32 bytes, the nodes will return an error.
  const TO_SIGN = ethers.utils.arrayify(
    ethers.utils.keccak256([1, 2, 3, 4, 5])
  );

  const pkpSignRes = await client?.pkpSign({
    toSign: TO_SIGN,
    pubKey: pkp.publicKey,
    sessionSigs: sessionSigs,
  });

  const pkpWallet = new PKPEthersWallet({
    pkpPubKey: pkp.publicKey,
    rpc: 'https://chain-rpc.litprotocol.com/http',
    controllerSessionSigs: sessionSigs,
  });

  await pkpWallet.init();

  const signature = await pkpWallet.signMessage(TO_SIGN);

  console.log('signature:', signature);

  // ==================== Post-Validation ====================

  // ==================== Success ====================
  return success(
    `it should use sessionSigs generated by eth wallet auth method to sign data
     ✓ pkpSignRes: ${JSON.stringify(pkpSignRes)}
     ✓ signature: ${signature}`
  );
}

await testThis({ name: path.basename(import.meta.url), fn: main });
