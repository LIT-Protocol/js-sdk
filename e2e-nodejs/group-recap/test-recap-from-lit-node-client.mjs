// This test requires LOAD_ENV=false implementation at
// loader.mjs
// const loadEnv = process.env.LOAD_ENV === 'false' ? false : LITCONFIG.TEST_ENV.loadEnv;
// if (loadEnv) { ... }
// Usage: LOAD_ENV=false yarn test:e2e:nodejs --filter=test-recap-from-lit-node-client

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
} from '@lit-protocol/auth-helpers';

import { generateUnifiedAccsForRLIDelegation } from '@lit-protocol/access-control-conditions';

import { LitContracts } from '@lit-protocol/contracts-sdk';
import { ethers } from 'ethers';
import * as siwe from 'siwe';
import * as LitJsSdk from '@lit-protocol/lit-node-client';

export async function main() {
  // ==================== Setup ====================

  // -- 1. dApp owner wallet
  const wallet = new ethers.Wallet(
    LITCONFIG.CONTROLLER_PRIVATE_KEY,
    new ethers.providers.JsonRpcProvider(LITCONFIG.CHRONICLE_RPC)
  );

  // -- 2. minting RLI
  // let contractClient = new LitContracts({
  //   signer: wallet,
  //   debug: process.env.DEBUG === 'true' ?? LITCONFIG.TEST_ENV.debug,
  //   network: process.env.NETWORK ?? LITCONFIG.TEST_ENV.litNetwork,
  // });

  // await contractClient.connect();

  // const { rliTokenIdStr } = await contractClient.mintRLI({
  //   requestsPerDay: 14400, // 10 request per minute
  //   daysUntilUTCMidnightExpiration: 2,
  // });

  // console.log('rliTokenIdStr:', rliTokenIdStr);

  // -- 4. by setting unified access control conditions
  const unifiedAccsHash = await generateUnifiedAccsForRLIDelegation([
    '0xBD4701851e9C9a22f448860A78872A00Da87899e',
    '0x93E47A604BA72899a5f8dF986cF26C97AfdaE2A0',
  ]);

  console.log('unifiedAccsHash:', unifiedAccsHash);

  process.exit();

  // -- 5. get authSig from dApp owner
  const address = ethers.utils.getAddress(await wallet.getAddress());
  const domain = 'localhost';
  const origin = 'https://localhost/login';
  const statement =
    'This is a test statement.  You can put anything you want here.';
  const siweMessage = new siwe.SiweMessage({
    domain,
    address: address,
    statement,
    uri: origin,
    version: '1',
    chainId: 1,
    expirationTime: new Date(Date.now() + 1000 * 60 * 7).toISOString(),
  });
  const messageToSign = siweMessage.prepareMessage();

  const signature = await wallet.signMessage(messageToSign);

  const authSig = {
    sig: signature,
    derivedVia: 'web3.eth.personal.sign',
    signedMessage: messageToSign,
    address: address,
  };

  console.log('5. authSig:', authSig);

  // -- set access control conditions

  // -- set abilities
  // const getHash = ();

  // -- mint a Rate Limit NFT
  // LIT Relying Party (RP)
  // Resource: "lit-ratelimitincrease://${RLI_TOKEN_ID}"

  // - old
  // const att = {
  //   someResource: {
  //     [`lit-ratelimitincrease://${rliTokenIdStr}`]: [
  //       { accessControlConditions: 'hashOfAccs' },
  //     ],
  //   },
  // };

  // - new
  // const att = {
  //   [`lit-ratelimitincrease://${rliTokenIdStr}`]: [
  //     { accessControlConditions: 'hashOfAccs' },
  //   ],
  // };

  // const path = '/bglyaysu8rvblxlk7x0ksn';

  // let resourceId = {
  //   baseUrl: 'my-dynamic-content-server.com',
  //   path,
  //   orgId: '',
  //   role: '',
  //   extraData: '',
  // };

  // let hashedResourceId = await hashResourceIdForSigning(resourceId);

  // const litResource = new LitAccessControlConditionResource(hashedResourceId);
  // const litResources = [litResource];

  // const recapObject =
  //   await LitNodeClient.generateSessionCapabilityObjectWithWildcards(
  //     litResources,
  //     mockAuthSig
  //   );

  // const expectedResult = 'QmQiy7M88uboUkSF68Hv73NWL8dnrbMNZmbstVVi3UVrgM';

  // ==================== Test Logic ====================
  // if (recapObject.proofs[0] !== expectedResult) {
  //   return fail(
  //     `Failed to get proof from Recap Session Capability, it should be ${expectedResult} but is ${recapObject.proofs[0]}`
  //   );
  // }

  // -- get session sigs
  // const sessionSigs =

  // -- Application developer (Wallet A) and delegates RLI to your end users

  // -- Wallet A: a wallet that has a minted with a rate limit increase

  // -- Wallet B: Doesn't have that NFT
  // Wallet A delegates to Wallet B

  // -- Check if rate limited.
  // mints a rate limit NFT

  // -- The maximum request without a Rate Limit NFT is 3

  // ==================== Post-Validation ====================
  // if (proof === expectedResult) {
  //   return success(
  //     `Recap Session Capability has proof at index 0 of ${expectedResult}`
  //   );
  // }

  return fail(`Failed to get proof from Recap Session Capability`);
}

await testThis({ name: path.basename(import.meta.url), fn: main });
