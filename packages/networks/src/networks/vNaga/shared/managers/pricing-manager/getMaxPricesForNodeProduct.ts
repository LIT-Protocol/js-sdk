import { MaxPriceTooLow, PRODUCT_ID_VALUES } from '@lit-protocol/constants';

/**
 * @deprecated - use the one in the type package
 */
export interface MaxPricesForNodes {
  nodePrices: { url: string; prices: bigint[] }[];
  userMaxPrice: bigint;
  productId: PRODUCT_ID_VALUES;
  numRequiredNodes?: number;
}

/**
 * Builds an object with updated prices distributed proportionally across nodes.
 * Ensures the total cost does not exceed userMaxPrice.
 * Operates in the order of lowest priced node to highest.
 *
 * Example:
 * - Selected nodes have SIGN_SESSION_KEY prices of 10 and 20.
 * - `userMaxPrice` is 100.
 * - Base total = 10 + 20 = 30.
 * - Excess = 100 - 30 = 70.
 * - Each node receives 70 / 2 = 35 extra budget, yielding 45 and 55.
 *
 * @param nodePrices - An object where keys are node addresses and values are arrays of prices for different action types.
 * @param userMaxPrice - The maximum price the user is willing to pay to execute the request.
 * @param productId - The ID of the product to determine which price to consider.
 * @param numRequiredNodes - Optional number of nodes required to execute the action. Defaults to all nodes.
 * @returns An object with updated prices distributed proportionally.
 * @throws A MaxPriceTooLow error if the total price exceeds userMaxPrice
 */
export function getMaxPricesForNodeProduct({
  nodePrices,
  userMaxPrice,
  productId,
  numRequiredNodes,
}: MaxPricesForNodes): { url: string; price: bigint }[] {
  // Always evaluate pricing using the product-specific column so we truly pick
  // the cheapest validators for that product (the upstream feed is sorted by
  // prices[0]/decryption price only).
  const sortedNodes = [...nodePrices].sort((a, b) => {
    const priceA = a.prices[productId];
    const priceB = b.prices[productId];

    if (priceA === priceB) {
      return 0;
    }

    return priceA < priceB ? -1 : 1;
  });

  // If we don't need all nodes to service the request, only use the cheapest `n` of them
  const nodesToConsider = numRequiredNodes
    ? sortedNodes.slice(0, numRequiredNodes)
    : sortedNodes;

  // Sum the unadjusted cost for the nodes we plan to use.
  let totalBaseCost = 0n;
  for (const { prices } of nodesToConsider) {
    // Example: base total accumulates 10 + 20 = 30 for the two cheapest nodes.
    totalBaseCost += prices[productId];
  }

  // Refuse to proceed if the caller's budget cannot even cover the base cost.
  if (totalBaseCost > userMaxPrice) {
    throw new MaxPriceTooLow(
      {
        info: {
          totalBaseCost: totalBaseCost.toString(),
          userMaxPrice: userMaxPrice.toString(),
        },
      },
      `Max price is too low: Minimum required price is ${totalBaseCost.toString()}, got ${userMaxPrice.toString()}.`
    );
  }

  /* If the user is willing to pay more than the nodes charge based on our current view of pricing
   * then we can provide extra margin to the maxPrice for each node -- making it less likely for
   * our request to fail if the price on some of the nodes is higher than we think it was, as long as it's not
   * drastically different than we expect it to be
   */
  // Any remaining budget is spread across the participating nodes to
  // provide cushion for minor pricing fluctuations. Example: 100 - 30 = 70.
  const excessBalance = userMaxPrice - totalBaseCost;

  // Map matching the keys from `nodePrices`, but w/ the per-node maxPrice computed based on `userMaxPrice`
  const maxPricesPerNode: { url: string; price: bigint }[] = [];

  for (const { url, prices } of nodesToConsider) {
    // Distribute the remaining budget evenly across nodes to form the max price.
    // Example: each node receives 70 / 2 = 35, becoming 10+35 and 20+35.
    maxPricesPerNode.push({
      url,
      price: excessBalance
        ? prices[productId] + excessBalance / BigInt(nodesToConsider.length)
        : prices[productId],
    });
  }

  return maxPricesPerNode;
}
