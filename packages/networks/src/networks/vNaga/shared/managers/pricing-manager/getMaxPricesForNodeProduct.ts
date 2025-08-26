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
  // If we don't need all nodes to service the request, only use the cheapest `n` of them
  const nodesToConsider = numRequiredNodes
    ? nodePrices.slice(0, numRequiredNodes)
    : nodePrices;

  let totalBaseCost = 0n;

  // Calculate the base total cost without adjustments
  for (const { prices } of nodesToConsider) {
    totalBaseCost += prices[productId];
  }

  // Verify that we have a high enough userMaxPrice to fulfill the request
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
  const excessBalance = userMaxPrice - totalBaseCost;

  // Map matching the keys from `nodePrices`, but w/ the per-node maxPrice computed based on `userMaxPrice`
  const maxPricesPerNode: { url: string; price: bigint }[] = [];

  for (const { url, prices } of nodesToConsider) {
    // For now, we'll distribute the remaining balance equally across nodes
    maxPricesPerNode.push({
      url,
      price: excessBalance
        ? prices[productId] + excessBalance / BigInt(nodesToConsider.length)
        : prices[productId],
    });
  }

  return maxPricesPerNode;
}
