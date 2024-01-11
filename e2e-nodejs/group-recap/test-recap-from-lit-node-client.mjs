// This test requires LOAD_ENV=false implementation at
// loader.mjs
// const loadEnv = process.env.LOAD_ENV === 'false' ? false : LITCONFIG.TEST_ENV.loadEnv;
// if (loadEnv) { ... }
// Usage: LOAD_ENV=false yarn test:e2e:nodejs --filter=test-recap-from-lit-node-client
// NETWORK=manzano MINT_NEW=true yarn test:e2e:nodejs --filter=test-recap-from-lit
import path from 'path';
import { success, fail, testThis } from '../../tools/scripts/utils.mjs';
import LITCONFIG from '../../lit.config.json' assert { type: 'json' };
// import { client } from '../00-setup.mjs';
import { RecapSessionCapabilityObject } from '@lit-protocol/auth-helpers';
import { LitNodeClient } from '@lit-protocol/lit-node-client';
import {
  hashResourceIdForSigning,
  hashUnifiedAccessControlConditions,
} from '@lit-protocol/access-control-conditions';
import {
  LitAbility,
  LitAccessControlConditionResource,
  LitRLIResource,
  LitActionResource,
} from '@lit-protocol/auth-helpers';

import { generateUnifiedAccsForRLIDelegation } from '@lit-protocol/access-control-conditions';

import { LitContracts } from '@lit-protocol/contracts-sdk';
import { ethers } from 'ethers';
import * as siwe from 'siwe';
import * as LitJsSdk from '@lit-protocol/lit-node-client';

// const getStandardAuthSigh = async (wallet) => {
//   const address = wallet.address;

//   // siwe message
//   const domain = 'localhost';
//   const origin = 'https://localhost/login';
//   const statement =
//     'This is a test statement.  You can put anything you want here.';
//   const siweMessage = new siwe.SiweMessage({
//     domain,
//     address: address,
//     statement,
//     uri: origin,
//     version: '1',
//     chainId: 1,
//     expirationTime: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
//   });
//   const messageToSign = siweMessage.prepareMessage();

//   const signature = await wallet.signMessage(messageToSign);

//   return {
//     sig: signature,
//     derivedVia: 'web3.eth.personal.sign',
//     signedMessage: messageToSign,
//     address: address,
//   };
// };

export async function main() {
  if (process.env.LOAD_ENV === 'false') {
    console.log('❗️ This test cannot be run with LOAD_ENV=false');
    process.exit();
  }

  // ==================== Setup ====================
  const delegatedWalletA = globalThis.LitCI.wallet;
  const delegatedWalletA_address = globalThis.LitCI.wallet.address;
  const delegateWalletA_authSig = globalThis.LitCI.CONTROLLER_AUTHSIG;
  const delegatedWalletA_pkpPublicKey = globalThis.LitCI.PKP_INFO.publicKey;

  console.log('delegateWalletA_authSig:', delegateWalletA_authSig);
  console.log('delegatedWalletA_address:', delegatedWalletA_address);
  console.log('delegatedWalletA_pkpPublicKey:', delegatedWalletA_pkpPublicKey);

  const delegatedWalletB = new ethers.Wallet.createRandom();
  const delegatedWalletB_address = delegatedWalletB.address;

  const rliTokenIdMock = '41';
  // const delegateWalletB_authSig = await getStandardAuthSigh(delegatedWalletB);
  // console.log('delegatedWalletB_address:', delegatedWalletB_address);

  // ====================================================
  // =                    dAPP OWNER                    =
  // ====================================================
  // -- 1. dApp owner wallet
  // const wallet = new ethers.Wallet(
  //   LITCONFIG.CONTROLLER_PRIVATE_KEY,
  //   new ethers.providers.JsonRpcProvider(LITCONFIG.CHRONICLE_RPC)
  // );

  // -- 2. minting RLI
  let contractClient = new LitContracts({
    signer: delegatedWalletA,
    debug: process.env.DEBUG === 'true' ?? LITCONFIG.TEST_ENV.debug,
    network: process.env.NETWORK ?? LITCONFIG.TEST_ENV.litNetwork,
  });

  await contractClient.connect();

  // const { rliTokenIdStr } = await contractClient.mintRLI({
  //   requestsPerDay: 14400, // 10 request per minute
  //   daysUntilUTCMidnightExpiration: 2,
  // });

  // console.log('rliTokenIdStr:', rliTokenIdStr);

  const client = new LitNodeClient({
    litNetwork: process.env.NETWORK ?? LITCONFIG.TEST_ENV.litNetwork,
    debug: process.env.DEBUG === 'true' ?? LITCONFIG.TEST_ENV.debug,
    minNodeCount: undefined,
    checkNodeAttestation: process.env.CHECK_SEV ?? false,
  });

  await client.connect();

  const { rliDelegationAuthSig, litResource } =
    await client.createRliDelegationAuthSig({
      dAppOwnerWallet: delegatedWalletA,
      // rliTokenId: rliTokenIdStr,
      rliTokenId: rliTokenIdMock,
      addresses: [delegatedWalletA_address, delegatedWalletB_address],
    });

  console.log('rliDelegationAuthSig:', rliDelegationAuthSig);

  // ====================================================
  // =                     END USER                     =
  // ====================================================
  // const sessionKeyPair = client.getSessionKey();

  const authNeededCallback = async ({ resources, expiration, uri }) => {
    console.log('XX resources:', resources);
    console.log('XX expiration:', expiration);
    console.log('XX uri:', uri);

    const message = new siwe.SiweMessage({
      domain: 'example.com',
      address: delegatedWalletA_address,
      statement: 'Sign a session key to use with Lit Protocol',
      uri,
      version: '1',
      chainId: '1',
      expirationTime: expiration,
      resources,
    });
    const toSign = message.prepareMessage();
    const signature = await delegatedWalletA.signMessage(toSign);

    const authSig = {
      sig: signature,
      derivedVia: 'web3.eth.personal.sign',
      signedMessage: toSign,
      address: delegatedWalletA_address,
    };

    return authSig;
  };

  const sessionSigs = await client.getSessionSigs({
    expiration: new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString(), // 24 hours
    chain: 'ethereum',
    resourceAbilityRequests: [
      {
        resource: new LitRLIResource(rliTokenIdMock),
        ability: LitAbility.RateLimitIncreaseAuth,
      },
    ],
    authNeededCallback,
    rliDelegationAuthSig,
  });

  console.log('sessionSigs:', sessionSigs);

  // process.exit();

  // -- now try to run lit action
  // errConstructorFunc {
  //   message: "auth_sig passed is invalid or couldn't be verified",
  //   errorCode: 'NodeInvalidAuthSig',
  //   errorKind: 'Validation',
  //   status: 401,
  //   details: [
  //     'validation error: Invalid URI for top level auth sig: lit:session:b27d3888442ea04e9f87d17272710942bbeb30fd344b18c66ece95affd29cce0'
  //   ]
  // }
  const res = await client.executeJs({
    // authSig: delegateWalletA_authSig,
    sessionSigs: sessionSigs,
    code: `(async () => {
      const sigShare = await LitActions.signEcdsa({
        toSign: dataToSign,
        publicKey,
        sigName: "sig",
      });
    })();`,
    authMethods: [],
    jsParams: {
      dataToSign: ethers.utils.arrayify(
        ethers.utils.keccak256([1, 2, 3, 4, 5])
      ),
      publicKey: delegatedWalletA_pkpPublicKey,
    },
  });

  console.log('res:', res);

  process.exit();

  return fail(`Failed to get proof from Recap Session Capability`);
}

await testThis({ name: path.basename(import.meta.url), fn: main });
