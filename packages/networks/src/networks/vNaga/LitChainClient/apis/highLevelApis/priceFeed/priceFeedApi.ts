/**
 * This module provides a high-level interface for obtaining price feed information
 * from the Lit Network. It includes features such as:
 * - Caching price information to reduce contract calls
 * - rAutomatic efreshing of stale data
 * - Sorting of validators by price
 *
 * Usage:
 * ```typescript
 * import { getPriceFeedInfo, getNodePrices } from './priceFeedApi';
 *
 * // Get complete price feed information
 * const priceInfo = await getPriceFeedInfo({
 *   realmId: 1,
 *   networkCtx: myNetworkContext
 * });
 *
 * // Get just the node prices sorted by cheapest first
 * const prices = await getNodePrices({
 *   realmId: 1,
 *   networkCtx: myNetworkContext
 * });
 * ```
 */

import { NagaContext } from '../../../../../types';
import {
  getNodesForRequest,
  PRODUCT_IDS,
} from '../../../apis/rawContractApis/pricing/getNodesForRequest';

// Configuration constants
const STALE_PRICES_SECONDS = 3 * 1000; // Update prices if > X seconds old
const PRODUCT_IDS_ARRAY = Object.values(PRODUCT_IDS);

// Type for price feed information
export interface PriceFeedInfo {
  epochId: any;
  minNodeCount: any;
  networkPrices: {
    url: string;
    prices: bigint[];
  }[];
}

// Type for the parameters
export interface GetPriceFeedInfoParams {
  realmId?: number;
  networkCtx: NagaContext;
  productIds?: bigint[];
}

// Caching variables
let priceFeedInfo: PriceFeedInfo | null = null;
let fetchingPriceFeedInfo: null | Promise<PriceFeedInfo> = null;
let lastUpdatedTimestamp = 0;

/**
 * Fetches price feed information directly from the blockchain
 *
 * @param params - Parameters for fetching price feed information
 * @returns The price feed information including epoch ID, minimum node count, and sorted network prices
 */
async function fetchPriceFeedInfo(
  params: GetPriceFeedInfoParams
): Promise<PriceFeedInfo> {
  const { realmId = 1, networkCtx, productIds = PRODUCT_IDS_ARRAY } = params;

  // Get nodes and prices from raw contract API
  const nodesResponse = await getNodesForRequest({ productIds }, networkCtx);

  // Extract and format the network prices
  const prices = nodesResponse.nodesAndPrices
    .map((node) => {
      return {
        url: node.validatorUrl,
        prices: node.prices.map((price) => BigInt(price)),
      };
    })
    .sort(({ prices: pricesA }, { prices: pricesB }) => {
      // Sort by first price since the cheapest for any product will often be cheapest for all
      const diff = Number(pricesA[0] - pricesB[0]);
      return diff;
    });

  return {
    epochId: nodesResponse.epochId,
    minNodeCount: nodesResponse.minNodeCount,
    networkPrices: prices,
  };
}

/**
 * Fetches price feed information with local promise tracking
 * to prevent duplicate concurrent requests
 *
 * @param params - Parameters for fetching price feed information
 * @returns The price feed information
 */
async function fetchPriceFeedInfoWithLocalPromise(
  params: GetPriceFeedInfoParams
): Promise<PriceFeedInfo> {
  try {
    fetchingPriceFeedInfo = fetchPriceFeedInfo(params);

    priceFeedInfo = await fetchingPriceFeedInfo;
    lastUpdatedTimestamp = Date.now();

    return priceFeedInfo;
  } finally {
    fetchingPriceFeedInfo = null;
  }
}

/**
 * Gets price feed information with caching to reduce blockchain calls
 *
 * @param params - Parameters for fetching price feed information
 * @returns The price feed information including epoch ID, minimum node count, and sorted network prices
 * @example
 * {
  epochId: 15n,
  minNodeCount: 2n,
  networkPrices: [
    {
      url: "http://127.0.0.1:7470",
      prices: [ 10000000000000000n, 10000000000000000n, 10000000000000000n ],
    }, {
      url: "http://127.0.0.1:7471",
      prices: [ 10000000000000000n, 10000000000000000n, 10000000000000000n ],
    }, {
      url: "http://127.0.0.1:7472",
      prices: [ 10000000000000000n, 10000000000000000n, 10000000000000000n ],
    }
  ],
}
 */
export async function getPriceFeedInfo(
  params: GetPriceFeedInfoParams
): Promise<PriceFeedInfo> {
  // If there's a local promise, an update is in progress; wait for that
  if (fetchingPriceFeedInfo) {
    return fetchingPriceFeedInfo;
  }

  // If we have updated prices in the last few seconds, return our current prices
  if (
    priceFeedInfo &&
    Date.now() - lastUpdatedTimestamp < STALE_PRICES_SECONDS
  ) {
    return priceFeedInfo;
  }

  // Fetch new prices, update local cache values, and return them
  return fetchPriceFeedInfoWithLocalPromise(params);
}

/**
 * Gets just the node prices sorted by cheapest first
 *
 * @param params - Parameters for fetching price feed information
 * @returns Array of network prices sorted by cheapest first
 * @example
 * [
  {
    url: "http://127.0.0.1:7470",
    prices: [ 10000000000000000n, 10000000000000000n, 10000000000000000n ],
  }, {
    url: "http://127.0.0.1:7471",
    prices: [ 10000000000000000n, 10000000000000000n, 10000000000000000n ],
  }, {
    url: "http://127.0.0.1:7472",
    prices: [ 10000000000000000n, 10000000000000000n, 10000000000000000n ],
  }
]
 */
export async function getNodePrices(
  params: GetPriceFeedInfoParams
): Promise<PriceFeedInfo['networkPrices']> {
  const priceInfo = await getPriceFeedInfo(params);
  return priceInfo.networkPrices;
}

// if (import.meta.main) {
//   // Get complete price feed information
//   const priceInfo = await getPriceFeedInfo({
//     realmId: 1,
//     networkCtx: networkContext,
//   });

//   // Get just the node prices sorted by cheapest first
//   const prices = await getNodePrices({
//     realmId: 1,
//     networkCtx: networkContext,
//   });

//   console.log('priceInfo', priceInfo);
//   console.log('prices', prices);
// }
