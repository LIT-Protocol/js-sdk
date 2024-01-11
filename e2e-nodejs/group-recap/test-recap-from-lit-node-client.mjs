// This test requires LOAD_ENV=false implementation at
// loader.mjs
// const loadEnv = process.env.LOAD_ENV === 'false' ? false : LITCONFIG.TEST_ENV.loadEnv;
// if (loadEnv) { ... }
// Usage: LOAD_ENV=false yarn test:e2e:nodejs --filter=test-recap-from-lit-node-client
// MINT_NEW=true yarn test:e2e:nodejs --filter=test-recap-from-lit

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

  console.log('rliTokenIdStr:', rliTokenIdStr);

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
  const sessionKeyPair = client.getSessionKey();
  const authNeededCallback = async (params) => {
    const response = await client.signSessionKey({
      sessionKey: sessionKeyPair,
      statement: params.statement,
      // authSig: globalThis.LitCI.CONTROLLER_AUTHSIG, // When this is empty or undefined, it will fail
      authMethods: [
        {
          authMethodType: 1,
          accessToken: JSON.stringify(globalThis.LitCI.CONTROLLER_AUTHSIG),
        },
      ],
      pkpPublicKey: `0x${globalThis.LitCI.AUTH_METHOD_PKP_INFO.publicKey}`,
      expiration: params.expiration,
      resources: params.resources,
      chainId: 1,
    });
    return response.authSig;
  };

  const sessionSigs = await client.getSessionSigs({
    expiration: new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString(), // 24 hours
    chain: 'ethereum',
    resourceAbilityRequests: [
      {
        resource: new LitActionResource('*'),
        ability: LitAbility.PKPSigning,
      },
    ],
    sessionKeyPair,
    authNeededCallback,
  });

  console.log('sessionSigs:', sessionSigs);

  process.exit();

  return fail(`Failed to get proof from Recap Session Capability`);
}

await testThis({ name: path.basename(import.meta.url), fn: main });
