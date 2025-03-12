import { beforeAll, describe, expect, test } from "bun:test";
import { networkContext, NetworkContext } from "../../../_config";
import { getNodePrices, getPriceFeedInfo } from "./priceFeedApi";

describe("priceFeedApi", () => {
  let networkCtx: NetworkContext;

  beforeAll(() => {
    networkCtx = networkContext;
  });

  test("getPriceFeedInfo should return data in the correct format", async () => {
    const priceInfo = await getPriceFeedInfo({
      networkCtx,
    });

    // Check response structure
    expect(priceInfo).toHaveProperty("epochId");
    expect(priceInfo).toHaveProperty("minNodeCount");
    expect(priceInfo).toHaveProperty("networkPrices");

    // Check that networkPrices is an array
    expect(Array.isArray(priceInfo.networkPrices)).toBe(true);

    // Check structure of first network price entry if available
    if (priceInfo.networkPrices.length > 0) {
      const firstPrice = priceInfo.networkPrices[0];
      expect(firstPrice).toHaveProperty("url");
      expect(firstPrice).toHaveProperty("prices");
      expect(typeof firstPrice.url).toBe("string");
      expect(Array.isArray(firstPrice.prices)).toBe(true);

      // Check that prices are bigints
      if (firstPrice.prices.length > 0) {
        expect(typeof firstPrice.prices[0]).toBe("bigint");
      }
    }
  });

  test("getNodePrices should return data in the correct format", async () => {
    const prices = await getNodePrices({
      networkCtx,
    });

    // Check that prices is an array
    expect(Array.isArray(prices)).toBe(true);

    // Check structure of first price entry if available
    if (prices.length > 0) {
      const firstPrice = prices[0];
      expect(firstPrice).toHaveProperty("url");
      expect(firstPrice).toHaveProperty("prices");
      expect(typeof firstPrice.url).toBe("string");
      expect(Array.isArray(firstPrice.prices)).toBe(true);

      // Check that prices are bigints
      if (firstPrice.prices.length > 0) {
        expect(typeof firstPrice.prices[0]).toBe("bigint");
      }
    }
  });
});
