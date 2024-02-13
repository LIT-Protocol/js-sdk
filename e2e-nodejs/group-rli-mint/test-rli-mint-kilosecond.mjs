// Usage:
// DEBUG=true NETWORK=manzano yarn test:e2e:nodejs --filter=test-rli-mint-kilosecond.mjs
import path from 'path';
import { success, fail, testThis } from '../../tools/scripts/utils.mjs';
import LITCONFIG from '../../lit.config.json' assert { type: 'json' };
import { LitContracts } from '@lit-protocol/contracts-sdk';
import { ethers } from 'ethers';

export async function main() {
  if (process.env.LOAD_ENV === 'false') {
    console.log('❗️ This test cannot be run with LOAD_ENV=false');
    process.exit();
  }
  // ==================== Setup ====================
  const REQUESTS_PER_KILLOSECOND = 1000;

  // 5% of the expected upper bound
  const EXPECTED_UPPER_BOUND = REQUESTS_PER_KILLOSECOND * 1.05;

  let contractClient = new LitContracts({
    signer: new ethers.Wallet(
      LITCONFIG.CONTROLLER_PRIVATE_KEY,
      new ethers.providers.JsonRpcProvider(LITCONFIG.CHRONICLE_RPC)
    ),
    debug: process.env.DEBUG === 'true' ?? LITCONFIG.TEST_ENV.debug,
    network: process.env.NETWORK ?? LITCONFIG.TEST_ENV.litNetwork,
  });

  await contractClient.connect();

  // ==================== Test Logic ====================
  // -- mint new Capacity Credits NFT
  const { capacityTokenIdStr } = await contractClient.mintCapacityCreditsNFT({
    requestsPerKilosecond: REQUESTS_PER_KILLOSECOND,
    daysUntilUTCMidnightExpiration: 1,
  });

  const rateLimit = await contractClient.rateLimitNftContract.read.capacity(
    capacityTokenIdStr
  );

  const requestsPerKilosecond = rateLimit.requestsPerKilosecond.toNumber();

  console.log('capacityTokenIdStr:', capacityTokenIdStr);
  console.log('requestsPerKilosecond:', requestsPerKilosecond);
  console.log('EXPECTED_UPPER_BOUND:', EXPECTED_UPPER_BOUND);

  // ==================== Post-Validation ====================
  if (requestsPerKilosecond <= EXPECTED_UPPER_BOUND) {
    return success(
      `Successfully minted a capacity credits nft with id: ${capacityTokenIdStr} and rate limit: ${requestsPerKilosecond} which is less than or equal to the expected upper bound: ${EXPECTED_UPPER_BOUND}`
    );
  }

  return fail(
    `Failed to mint a capacity credits nft with id: ${capacityTokenIdStr} and rate limit: ${requestsPerKilosecond} which is greater than the expected upper bound: ${EXPECTED_UPPER_BOUND}`
  );
}

await testThis({ name: path.basename(import.meta.url), fn: main });
