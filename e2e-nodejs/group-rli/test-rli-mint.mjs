// Usage:
// DEBUG=true NETWORK=habanero MINT_NEW=true yarn test:e2e:nodejs --filter=test-rli-from-lit-node-client-diff-delegatee.mjs
import path from 'path';
import { success, fail, testThis } from '../../tools/scripts/utils.mjs';
import LITCONFIG from '../../lit.config.json' assert { type: 'json' };
import { LitNodeClient } from '@lit-protocol/lit-node-client';
import { LitAbility, LitActionResource } from '@lit-protocol/auth-helpers';

import { LitContracts } from '@lit-protocol/contracts-sdk';
import { ethers } from 'ethers';
import * as siwe from 'siwe';

export async function main() {
  if (process.env.LOAD_ENV === 'false') {
    console.log('❗️ This test cannot be run with LOAD_ENV=false');
    process.exit();
  }

  // ==================== Setup ====================

  let contractClient = new LitContracts({
    signer: new ethers.Wallet(
      LITCONFIG.CONTROLLER_PRIVATE_KEY,
      new ethers.providers.JsonRpcProvider(LITCONFIG.CHRONICLE_RPC)
    ),
    debug: process.env.DEBUG === 'true' ?? LITCONFIG.TEST_ENV.debug,
    network: process.env.NETWORK ?? LITCONFIG.TEST_ENV.litNetwork,
  });

  await contractClient.connect();

  // -- mint new Capacity Credits NFT
  const { capacityTokenIdStr } = await contractClient.mintCapacityCreditsNFT({
    requestsPerKilosecond: 999,
    daysUntilUTCMidnightExpiration: 1,
  });

  const rateLimit = await contractClient.rateLimitNftContract.read.capacity(
    capacityTokenIdStr
  );

  const requestsPerKilosecond = rateLimit.requestsPerKilosecond.toNumber();

  console.log('capacityTokenIdStr:', capacityTokenIdStr);
  console.log('requestsPerKilosecond:', requestsPerKilosecond);

  if (capacityTokenIdStr) {
    return success('Successfully minted a capacity credits nft');
  }

  return fail(`Failed to get proof from Recap Session Capability`);
}

await testThis({ name: path.basename(import.meta.url), fn: main });
