// This file is a WIP test demo for auth unification. In this change, the only time we will create an authSig is to use it to generate session sigs
// client side. Anything server side, we will no longer accpet authSig.

import { LitContractContext } from '@lit-protocol/types';
import { networkContext } from '../network-context';
import {
  LitNodeClient,
  uint8arrayFromString,
  uint8arrayToString,
} from '@lit-protocol/lit-node-client';
import { ethers } from 'ethers';
import { AuthMethodScope, AuthMethodType } from '@lit-protocol/constants';
import { getHotWalletAuthSig } from './utils/get-hot-wallet-authsig';
import { LitContracts } from '@lit-protocol/contracts-sdk';
import {
  LitAbility,
  LitActionResource,
  LitAuthResource,
  LitPKPResource,
} from '@lit-protocol/auth-helpers';
import { getAuthNeededCallback } from './utils/auth-needed-callback';
import fs from 'fs';
import { PKPEthersWallet, ethRequestHandler } from '@lit-protocol/pkp-ethers';
// console.log("sessionSigSignedMessage:", JSON.parse(sessionSigSignedMessage));

// process.exit();

// ----- Test Configuration -----
const PRIVATE_KEY =
  '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80';
const LIT_RPC_URL = 'http://127.0.0.1:8545';

const BOOTSTRAP_URLS = [
  'http://127.0.0.1:7470',
  'http://127.0.0.1:7471',
  'http://127.0.0.1:7472',
];

// ----- Command to test this script -----
// bun ./e2e-nodejs/group-auth-unification/test-auth-unification.ts

// ----- Test Script -----

// -- Setup Lit Node Client
const litNodeClient = new LitNodeClient({
  litNetwork: 'custom',
  bootstrapUrls: BOOTSTRAP_URLS,
  rpcUrl: LIT_RPC_URL,
  debug: true,
  checkNodeAttestation: false, // disable node attestation check for local testing
  contractContext: networkContext as unknown as LitContractContext,
});

await litNodeClient.connect();

// -- Setup EOA Wallet using private key, and connects to LIT RPC URL
const provider = new ethers.providers.JsonRpcProvider(LIT_RPC_URL);
const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
console.log(`wallet address: ${await wallet.getAddress()}`);

// -- Get nonce from lit node
const nonce = await litNodeClient.getLatestBlockhash();

// -- Get authSig,
const hotWalletAuthSig = await getHotWalletAuthSig(wallet, nonce);
console.log('hotWalletAuthSig:', hotWalletAuthSig);

// --- Craft an authMethod from the authSig for the eth wallet auth method. For eth wallet auth method type, the access token is the authSig. This is different than the other auth methods where the access token might be a google, discord or other auth provider token.
const hotWalletAuthMethod = {
  authMethodType: AuthMethodType.EthWallet,
  accessToken: JSON.stringify(hotWalletAuthSig),
};

console.log('hotWalletAuthMethod:', hotWalletAuthMethod);

// --- Setup contracts-sdk client
const contractsClient = new LitContracts({
  signer: wallet,
  debug: false,
  rpc: LIT_RPC_URL, // anvil rpc
  customContext: networkContext as unknown as LitContractContext,
});

await contractsClient.connect();

// (assert) check if contracts-sdk is connected
if (!contractsClient.connected) {
  console.error('❌ contractsClient not connected');
  process.exit();
}
console.log('✅ contractsClient connected');

// -- Mint a PKP using the hot wallet auth method.
const mintResFromHotWallet = await contractsClient.mintWithAuth({
  authMethod: hotWalletAuthMethod,
  scopes: [AuthMethodScope.SignAnything],
});

let { pkp: hotWalletOwnedPkp } = mintResFromHotWallet;
hotWalletOwnedPkp.publicKey = hotWalletOwnedPkp.publicKey.startsWith('0x')
  ? hotWalletOwnedPkp.publicKey
  : '0x' + hotWalletOwnedPkp.publicKey;

console.log('✅ hotWalletOwnedPkp:', hotWalletOwnedPkp);

const resourceAbilityRequests = [
  {
    resource: new LitPKPResource('*'),
    ability: LitAbility.PKPSigning,
  },
  {
    resource: new LitAuthResource('*'),
    ability: LitAbility.RateLimitIncreaseAuth,

    // -- not neccessary for this test
    // data: {
    //   "auth_context": {
    //     "actionIpfsIds": [
    //       "QmNZQXmY2VijUPfNrkC6zWykBnEniDouAeUpFi9r6aaqNz"
    //     ],
    //     "authMethodContexts": [
    //       {
    //         "appId": "lit",
    //         "authMethodType": 1,
    //         "expiration": 1712624807,
    //         "usedForSignSessionKeyRequest": true,
    //         "userId": "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266"
    //       }
    //     ],
    //     "authSigAddress": null,
    //     "resources": []
    //   }
    // }
  },
];

const authNeededCallback = getAuthNeededCallback({
  litNodeClient,
  authMethod: hotWalletAuthMethod,
  pkpPublickey: hotWalletOwnedPkp.publicKey,
  VALID_LIT_ACTION_CODE: true,
});

console.log('✅ authNeededCallback:', authNeededCallback);

const sessionSigs = await litNodeClient.getSessionSigs({
  chain: 'ethereum',
  expiration: new Date(Date.now() + 60_000 * 60).toISOString(),
  resourceAbilityRequests,
  authNeededCallback: authNeededCallback as any,
  // capabilities: [],
});

console.log("✅ sessionSigs:", sessionSigs);
process.exit();
const TO_SIGN = ethers.utils.arrayify(ethers.utils.keccak256([1, 2, 3, 4, 5]));

const pkpSign = await litNodeClient.pkpSign({
  toSign: TO_SIGN,
  pubKey: hotWalletOwnedPkp.publicKey,
  // authMethods: [hotWalletAuthMethod],
  sessionSigs: sessionSigs,
})

console.log("✅ pkpSign:", pkpSign);

process.exit();
// const singleSessionSig = sessionSigs[BOOTSTRAP_URLS[0]];

// // write that to data/sdk-output-data-session-sig.ts
// fs.writeFileSync(
//   'e2e-nodejs/group-auth-unification/data/sdk-output-session-sig.ts',
//   `export const __dataSessionSig = ${JSON.stringify(
//     singleSessionSig,
//     null,
//     2
//   )};`
// );

// -- Tests the session sig to do pkp signing
const pkpEthersWallet = new PKPEthersWallet({
  authContext: {
    client: litNodeClient,
    getSessionSigsProps: {
      chain: 'ethereum',
      expiration: new Date(Date.now() + 60_000 * 60).toISOString(),
      resourceAbilityRequests,
      authNeededCallback: authNeededCallback as any,
      // capabilities: [],
    },
    authMethods: [
      hotWalletAuthMethod
    ]
  },
  pkpPubKey: hotWalletOwnedPkp.publicKey,
  rpc: LIT_RPC_URL,
  litNetwork: 'custom',
});

await pkpEthersWallet.init();
console.log('✅ pkpEthersWallet initialized');

// ==================== Test Logic ====================
// Message to sign
const message = 'Hello world';
const hexMsg = ethers.utils.hexlify(ethers.utils.toUtf8Bytes(message));

// eth_sign parameters
// DATA, 20 Bytes - address
// DATA, N Bytes - message to sign
// Reference: https://ethereum.github.io/execution-apis/api-documentation/#eth_sign
const signature = await ethRequestHandler({
  signer: pkpEthersWallet,
  payload: {
    method: 'eth_sign',
    params: [pkpEthersWallet.address, hexMsg],
  },
});

const recoveredAddr = ethers.utils.verifyMessage(message, signature);

if (signature.length !== 132) {
  throw new Error('signature should be 132 characters long');
}

console.log("pkpEthersWallet.address:", pkpEthersWallet.address);
console.log("recoveredAddr:", recoveredAddr);


process.exit();

// -- Test the session sigs
// THIS WILL FAIL, BECAUSE OF:
// "Invalid Capability object in SIWE resource ReCap
// NOTE: We need the correct resource ability request to use executeJs, and the error message should tell you so.

// requires lit action resource
// try {
//   await litNodeClient.executeJs({
//     sessionSigs: sessionSigs,
//     debug: true,
//     code: `(async() => {
//       console.log("Testing");
//     })();`,
//     jsParams: {},
//   })
// } catch (e) {
//   // -- asert error message
//   if (e.message.includes("Invalid Capability object in SIWE resource ReCap")) {
//     console.log(`✅ Error message "${e.message}" is expected`);
//     console.log(e);
//   } else {
//     console.error(`❌ Error message "${e.message}" is not expected`);
//   }
// }
// process.exit();
// -- In order to execute Lit Action, either the owner of the PKP or the PKP itself must have credits to execute the Lit action.

// -- Mint a capacity credits token
const { capacityTokenIdStr } = await contractsClient.mintCapacityCreditsNFT({
  requestsPerDay: 14400, // 10 request per minute
  daysUntilUTCMidnightExpiration: 2,
});

console.log('✅ capacityTokenIdStr:', capacityTokenIdStr);

// -- Create a capacity delegation auth sig for the capacity
const { capacityDelegationAuthSig } =
  await litNodeClient.createCapacityDelegationAuthSig({
    uses: '1',
    dAppOwnerWallet: wallet,
    capacityTokenId: capacityTokenIdStr,

    // we can remove this as we have a fix that we don't need to pass the delegateeAddresses
    delegateeAddresses: [wallet.address],
  });

console.log('✅ capacityDelegationAuthSig:', capacityDelegationAuthSig);

// -- Now we generate a new session sigs with the capacity delegation auth sig
const sessionSigsForCapacity = await litNodeClient.getSessionSigs({
  pkpPublicKey: hotWalletOwnedPkp.publicKey,
  chain: 'ethereum',
  expiration: new Date(Date.now() + 60_000 * 60).toISOString(),
  resourceAbilityRequests,
  authNeededCallback: authNeededCallback as any,
  capabilities: [capacityDelegationAuthSig],
});

console.log('✅ sessionSigsForCapacity:', sessionSigsForCapacity);
process.exit();
// -- Note: Perhaps we want to have the ability to deserialize the signedMessage to see
// the list of capabilities that are being requested.

try {
  await litNodeClient.executeJs({
    sessionSigs: sessionSigsForCapacity,
    debug: true,
    code: `(async() => {
      console.log("Testing");
    })();`,
    jsParams: {},
  });
} catch (e) {
  console.log(e);
}

process.exit();
