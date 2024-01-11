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
  LitRLIResource,
  LitActionResource,
} from '@lit-protocol/auth-helpers';

import { generateUnifiedAccsForRLIDelegation } from '@lit-protocol/access-control-conditions';

import { LitContracts } from '@lit-protocol/contracts-sdk';
import { ethers } from 'ethers';
import * as siwe from 'siwe';
import * as LitJsSdk from '@lit-protocol/lit-node-client';

export async function main() {
  // ==================== Setup ====================

  // ====================================================
  // =                    dAPP OWNER                    =
  // ====================================================

  // -- 1. dApp owner wallet
  const wallet = new ethers.Wallet(
    LITCONFIG.CONTROLLER_PRIVATE_KEY,
    new ethers.providers.JsonRpcProvider(LITCONFIG.CHRONICLE_RPC)
  );

  // -- 2. minting RLI
  let contractClient = new LitContracts({
    signer: wallet,
    debug: process.env.DEBUG === 'true' ?? LITCONFIG.TEST_ENV.debug,
    network: process.env.NETWORK ?? LITCONFIG.TEST_ENV.litNetwork,
  });

  await contractClient.connect();

  const { rliTokenIdStr } = await contractClient.mintRLI({
    requestsPerDay: 14400, // 10 request per minute
    daysUntilUTCMidnightExpiration: 2,
  });

  // console.log('rliTokenIdStr:', rliTokenIdStr);

  const client = new LitNodeClient({
    litNetwork: process.env.NETWORK ?? LITCONFIG.TEST_ENV.litNetwork,
    debug: process.env.DEBUG === 'true' ?? LITCONFIG.TEST_ENV.debug,
    minNodeCount: undefined,
    checkNodeAttestation: process.env.CHECK_SEV ?? false,
  });

  await client.connect();

  const { rliDelegationAuthSig } = await client.createRliDelegationAuthSig({
    dAppOwnerWallet: wallet,
    rliTokenId: rliTokenIdStr,
    addresses: [
      '0xBD4701851e9C9a22f448860A78872A00Da87899e',
      // '0x93E47A604BA72899a5f8dF986cF26C97AfdaE2A0',
    ],
  });

  console.log('rliDelegationAuthSig:', rliDelegationAuthSig);

  // ====================================================
  // =                     END USER                     =
  // ====================================================

  const authNeededCallback = async ({ chain, resources, expiration, uri }) => {
    const message = new siwe.SiweMessage({
      domain: 'example.com',
      address: wallet.address,
      statement: 'Sign a session key to use with Lit Protocol',
      uri,
      version: '1',
      chainId: '1',
      expirationTime: expiration,
      resources,
    });
    const toSign = message.prepareMessage();
    const signature = await wallet.signMessage(toSign);

    const authSig = {
      sig: signature,
      derivedVia: 'web3.eth.personal.sign',
      signedMessage: toSign,
      address: wallet.address,
    };

    return authSig;
  };

  const sessionSigs = await client.getSessionSigs({
    expiration: new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString(), // 24 hours
    chain: 'ethereum',
    resourceAbilityRequests: [
      {
        resource: new LitActionResource('*'),
        ability: LitAbility.RateLimitIncreaseAuth,
      },
    ],
    authNeededCallback,
  });

  console.log('sessionSigs:', sessionSigs);

  process.exit();

  // -- information dApp to publicizes
  // const siweCID = await RecapSessionCapabilityObject.strToCID(messageToSign);
  // console.log('siweCID:', siweCID);

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
