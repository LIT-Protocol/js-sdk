import {
  LitAuthClient,
  StytchOtpProvider,
} from "@lit-protocol/lit-auth-client/src/index.js";
import prompts from "prompts";
import * as stytch from "stytch";
import { LitNodeClientNodeJs } from "@lit-protocol/lit-node-client-nodejs";
import { ProviderType } from "@lit-protocol/constants";
import dotenv from 'dotenv';
dotenv.config();

/**
 * Should be defined in your local environment before running
 * see here: https://stytch.com/docs for setting up your stytch project
 */
const STYTCH_PROJECT_ID: string | undefined = process.env.STYTCH_PROJECT_ID;
const STYTCH_SECRET: string | undefined = process.env.STYTCH_SECRET;
const LIT_RELAY_API_KEY: string | undefined = process.env.LIT_RELAY_API_KEY;

let authPhoneMethod: Object;
let authMethod: Object;

if (!STYTCH_PROJECT_ID || !STYTCH_SECRET) {
  throw Error("Could not find stytch project secret or id in environment");
}

if (process.argv.length < 3) {
  throw Error("Please provide either --lookup or --claim flag");
}

const client = new stytch.Client({
  project_id: STYTCH_PROJECT_ID,
  secret: STYTCH_SECRET,
});

/**
 * Email auth with STYTCH
 */
const emailResponse = await prompts({
  type: "text",
  name: "email",
  message: "Enter your email:",
});

const stytchResponse = await client.otps.email.loginOrCreate({
  email: emailResponse.email,
});

const otpResponse = await prompts({
  type: "text",
  name: "code",
  message: "Enter the code sent to your email:",
});

const authResponse = await client.otps.authenticate({
  method_id: stytchResponse.email_id,
  code: otpResponse.code,
  session_duration_minutes: 60 * 24 * 7,
});

const sessionStatus = await client.sessions.authenticate({
  session_token: authResponse.session_token,
});

const litNodeClient = new LitNodeClientNodeJs({
  litNetwork: "cayenne",
  debug: false,
});

await litNodeClient.connect();

const authClient = new LitAuthClient({
  litRelayConfig: {
    relayApiKey: LIT_RELAY_API_KEY,
  },
  litNodeClient,
});

const session = authClient.initProvider<StytchOtpProvider>(
  ProviderType.StytchOtp,
  {
    userId: sessionStatus.session.user_id,
    appId: STYTCH_PROJECT_ID,
  }
);

authMethod = await session.authenticate({
  accessToken: sessionStatus.session_jwt,
});

/**
 * Phone auth with Stytch
 */
const phoneResponse = await prompts({
  type: "text",
  name: "phone",
  message: "Enter your phone number, make sure to include the country code (+1 for US):",
});

const stytchphoneResponse = await client.otps.sms.loginOrCreate({
  phone_number: phoneResponse.phone,
});

const otpPhoneResponse = await prompts({
  type: "text",
  name: "code",
  message: "Enter the code sent to your phone number:",
});

const authPhoneResponse = await client.otps.authenticate({
  method_id: stytchphoneResponse.phone_id,
  code: otpPhoneResponse.code,
  session_duration_minutes: 60 * 24 * 7,
});

const sessionPhoneStatus = await client.sessions.authenticate({
  session_token: authPhoneResponse.session_token,
});

const phoneSession = authClient.initProvider<StytchOtpProvider>(
  ProviderType.StytchOtp,
  {
    userId: sessionPhoneStatus.session.user_id,
    appId: STYTCH_PROJECT_ID,
  }
);

authPhoneMethod = await phoneSession.authenticate({
  accessToken: sessionPhoneStatus.session_jwt,
});


/**
 * Lit Actions code to run after both auth methods have been accepted
 */

if (process.argv.length >= 3 && process.argv[2] === "--mfa") {
  
// this code will be run on the node
const litActionCode = `
const go = async () => {
  Lit.Actions.setResponse({response: JSON.stringify({"Lit.Auth": Lit.Auth})})
};

go();
`;

// you need an AuthSig to auth with the nodes
// normally you would obtain an AuthSig by calling LitJsSdk.checkAndSignAuthMessage({chain})
const authSig = {
  sig: "0x2bdede6164f56a601fc17a8a78327d28b54e87cf3fa20373fca1d73b804566736d76efe2dd79a4627870a50e66e1a9050ca333b6f98d9415d8bca424980611ca1c",
  derivedVia: "web3.eth.personal.sign",
  signedMessage:
    "localhost wants you to sign in with your Ethereum account:\n0x9D1a5EC58232A894eBFcB5e466E3075b23101B89\n\nThis is a key for Partiful\n\nURI: https://localhost/login\nVersion: 1\nChain ID: 1\nNonce: 1LF00rraLO4f7ZSIt\nIssued At: 2022-06-03T05:59:09.959Z",
  address: "0x9D1a5EC58232A894eBFcB5e466E3075b23101B89",
};

const runLitAction = async () => {
  try {
    const results = await litNodeClient.executeJs({
      code: litActionCode,
      authSig,
      authMethods: [
        authMethod,
        authPhoneMethod
        
      ],
      // all jsParams can be used anywhere in your litActionCode
      jsParams: {
        // this is the string "Hello World" for testing
      },
    });
    console.log("results: ", JSON.stringify(results.response, null, 2));
  } catch (e) {
      console.log(e);
  }
};

runLitAction();
}


// const publicKey = await session.computPublicKeyFromAuthMethod(authMethod);
// console.log("local public key computed: ", publicKey);

// if (process.argv.length >= 3 && process.argv[2] === "--claim") {
//   let claimResp = await session.claimKeyId({
//     authMethod,
//   });
//   console.log("claim response public key: ", claimResp.pubkey);
// } else if (process.argv.length >= 3 && process.argv[2] === "--lookup") {
//   const pkpInfo = await session.fetchPKPsThroughRelayer(authMethod);
//   console.log(pkpInfo);
// }
