// import * as util from 'node:util'; // For inspecting bigInt payloads for pricing data

import { HTTP, HTTPS, PRODUCT_IDS } from '@lit-protocol/constants';
import {
  LIT_NETWORKS_KEYS,
  LitContractContext,
  LitContractResolverContext,
} from '@lit-protocol/types';

import { LitContracts } from './contracts-sdk';

import type { ValidatorWithPrices } from './types';

type GetPriceFeedInfoArgs = Parameters<typeof LitContracts.getPriceFeedInfo>;
type PriceFeedInfo = Awaited<ReturnType<typeof fetchPriceFeedInfo>>;

const STALE_PRICES_SECONDS = 3 * 1000; // Update prices if > X seconds old
const PRODUCT_IDS_ARRAY = Object.values(PRODUCT_IDS);

let priceFeedInfo: PriceFeedInfo | null = null;
let fetchingPriceFeedInfo: null | Promise<PriceFeedInfo> = null;
let lastUpdatedTimestamp = 0;

async function fetchPriceFeedInfo({
  realmId,
  litNetwork,
  networkContext,
  rpcUrl,
  nodeProtocol,
}: {
  realmId: number;
  litNetwork: LIT_NETWORKS_KEYS;
  networkContext?: LitContractContext | LitContractResolverContext;
  rpcUrl?: string;
  nodeProtocol?: typeof HTTP | typeof HTTPS | null;
}) {
  const priceFeedContract = await LitContracts.getPriceFeedContract(
    litNetwork,
    networkContext,
    rpcUrl
  );

  const nodesForRequest = await priceFeedContract['getNodesForRequest'](
    realmId,
    PRODUCT_IDS_ARRAY
  );

  const epochId: number[] = nodesForRequest[0].toNumber();
  const minNodeCount: number[] = nodesForRequest[1].toNumber();
  const nodesAndPrices: ValidatorWithPrices[] = nodesForRequest[2];

  const networkUrls = LitContracts.generateValidatorURLs({
    activeValidatorStructs: nodesAndPrices.map(({ validator }) => validator),
    litNetwork,
    nodeProtocol,
  });

  const prices = networkUrls
    .reduce<{ url: string; prices: bigint[] }[]>((acc, network, index) => {
      acc.push({
        url: network,
        prices: nodesAndPrices[index].prices.map((ethersPrice) =>
          ethersPrice.toBigInt()
        ),
      });
      return acc;
    }, [])
    .sort(({ prices: pricesA }, { prices: pricesB }) => {
      // Sort by any price since the cheapest for _any_ product will be the cheapest for _all_ products
      const diff = pricesA[0] - pricesB[0];
      if (diff > 0n) {
        return 1;
      } else if (diff < 0n) {
        return -1;
      } else {
        return 0;
      }
    });

  // console.log(
  //   'getPriceFeedInfo()',
  //   util.inspect(
  //     {
  //       epochId,
  //       minNodeCount,
  //       networkPrices: {
  //         mapByAddress: networkPriceMap,
  //       },
  //     },
  //     { depth: 4 }
  //   )
  // );

  return {
    epochId,
    minNodeCount,
    networkPrices: prices,
  };
}

async function fetchPriceFeedInfoWithLocalPromise(
  ...params: GetPriceFeedInfoArgs
): Promise<PriceFeedInfo> {
  try {
    fetchingPriceFeedInfo = fetchPriceFeedInfo(...params);

    priceFeedInfo = await fetchingPriceFeedInfo;
    lastUpdatedTimestamp = Date.now();

    return priceFeedInfo;
  } finally {
    fetchingPriceFeedInfo = null;
  }
}

export async function getPriceFeedInfo(...params: GetPriceFeedInfoArgs) {
  // If there's a local promise, an update is in progress; wait for that
  if (fetchingPriceFeedInfo) {
    return fetchingPriceFeedInfo;
  }

  // If we have updated prices in the last 2 seconds, return our current prices
  if (
    priceFeedInfo &&
    Date.now() - lastUpdatedTimestamp < STALE_PRICES_SECONDS
  ) {
    return priceFeedInfo;
  }

  // If we get here, we've got prices that are at least 2 seconds out-of-date.
  // Fetch the new ones, update local cache values, and return them
  return fetchPriceFeedInfoWithLocalPromise(...params);
}

export async function getNodePrices(
  ...params: GetPriceFeedInfoArgs
): Promise<PriceFeedInfo['networkPrices']> {
  const priceInfo = await getPriceFeedInfo(...params);

  return priceInfo.networkPrices;
}
