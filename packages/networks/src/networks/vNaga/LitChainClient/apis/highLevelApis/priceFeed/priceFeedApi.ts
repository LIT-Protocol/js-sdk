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

const _logger = getChildLogger({
  module: 'priceFeedApi',
});

import { NodePrices } from '@lit-protocol/types';
import { ExpectedAccountOrWalletClient } from '../../../../LitChainClient/contract-manager/createContractsManager';
import { INetworkConfig } from '../../../../interfaces/NetworkContext';
import {
  getNodesForRequest,
  PRODUCT_IDS,
} from '../../../apis/rawContractApis/pricing/getNodesForRequest';
import { getChildLogger } from '@lit-protocol/logger';

// Configuration constants
const STALE_PRICES_SECONDS = 3 * 1000; // Update prices if > X seconds old
const PRODUCT_IDS_ARRAY = Object.values(PRODUCT_IDS);

// Type for price feed information
export interface PriceFeedInfo {
  epochId: any;
  minNodeCount: any;
  networkPrices: NodePrices;
}

// Type for the parameters - now accepts any valid network config
export interface GetPriceFeedInfoParams {
  realmId?: number;
  networkCtx: INetworkConfig<any, any>;
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
  params: GetPriceFeedInfoParams,
  accountOrWalletClient: ExpectedAccountOrWalletClient
): Promise<PriceFeedInfo> {
  const { realmId = 1, networkCtx, productIds = PRODUCT_IDS_ARRAY } = params;

  // Get nodes and prices from raw contract API
  const nodesResponse = await getNodesForRequest(
    { productIds },
    networkCtx,
    accountOrWalletClient
  );

  // Extract and format the network prices
  const prices = nodesResponse.nodesAndPrices

    // @ts-ignore - this will show type error when createContractsManager is returning any (during build time)
    .map((node) => {
      return {
        url: node.validatorUrl,

        // @ts-ignore - this will show type error when createContractsManager is returning any (during build time)
        prices: node.prices.map((price) => BigInt(price)),
      };
    })

    // @ts-ignore - this will show type error when createContractsManager is returning any (during build time)
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
  params: GetPriceFeedInfoParams,
  accountOrWalletClient: ExpectedAccountOrWalletClient
): Promise<PriceFeedInfo> {
  try {
    fetchingPriceFeedInfo = fetchPriceFeedInfo(params, accountOrWalletClient);

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
  params: GetPriceFeedInfoParams,
  accountOrWalletClient: ExpectedAccountOrWalletClient
): Promise<PriceFeedInfo> {
  // If there's a local promise, an update is in progress; wait for that
  if (fetchingPriceFeedInfo) {
    _logger.info(
      '💲 Local promise is already fetching price feed info. Returning that instead.'
    );
    return fetchingPriceFeedInfo;
  }

  // If we have updated prices in the last few seconds, return our current prices
  if (
    priceFeedInfo &&
    Date.now() - lastUpdatedTimestamp < STALE_PRICES_SECONDS
  ) {
    _logger.info(
      `💲 Returning stale price feed info. Remaining stale time: ${
        STALE_PRICES_SECONDS - (Date.now() - lastUpdatedTimestamp)
      }ms`
    );
    return priceFeedInfo;
  }
  _logger.info('💲 Fetching new price feed info');
  // Fetch new prices, update local cache values, and return them
  return fetchPriceFeedInfoWithLocalPromise(params, accountOrWalletClient);
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
  params: GetPriceFeedInfoParams,
  accountOrWalletClient: ExpectedAccountOrWalletClient
): Promise<NodePrices> {
  const priceInfo = await getPriceFeedInfo(params, accountOrWalletClient);
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
