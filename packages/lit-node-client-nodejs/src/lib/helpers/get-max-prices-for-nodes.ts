import { MaxPriceTooLow } from '@lit-protocol/constants';

interface MaxPricesForNodes {
  pricesByNodeAddress: Record<string, bigint[]>;
  userMaxPrice: bigint;
  productId: number;
  numRequiredNodes?: number;
}

/**
 * Builds an object with updated prices distributed proportionally across nodes.
 * Ensures the total cost does not exceed userMaxPrice.
 * Operates in the order of lowest priced node to highest.
 *
 * @param pricesByNodeAddress - An object where keys are node addresses and values are arrays of prices for different action types.
 * @param userMaxPrice - The maximum price the user is willing to pay to execute the request.
 * @param productId - The ID of the product to determine which price to consider.
 * @param numRequiredNodes - Optional number of nodes required to execute the action. Defaults to all nodes.
 * @returns An object with updated prices distributed proportionally.
 * @throws A MaxPriceTooLow error if the total price exceeds userMaxPrice
 */
export function getMaxPricesForNodes({
  pricesByNodeAddress,
  userMaxPrice,
  productId,
  numRequiredNodes,
}: MaxPricesForNodes): Record<string, bigint> {
  // Convert the entries to an array and sort by the selected product price (ascending)
  const sortedEntries = Object.entries(pricesByNodeAddress).sort(
    ([, pricesA], [, pricesB]) => {
      const diff = pricesA[productId] - pricesB[productId];
      if (diff > 0n) {
        return 1;
      } else if (diff < 0n) {
        return -1;
      } else {
        return 0;
      }
    }
  );

  // If we don't need all nodes to service the request, only use the cheapest `n` of them
  const nodesToConsider = numRequiredNodes
    ? sortedEntries.slice(0, numRequiredNodes)
    : sortedEntries;

  let totalBaseCost = 0n;

  // Calculate the base total cost without adjustments
  for (const [, prices] of nodesToConsider) {
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
      `Max price is too low: Minimum required price is ${totalBaseCost.toString()}.`
    );
  }

  /* If the user is willing to pay more than the nodes charge based on our current view of pricing
   * then we can provide extra margin to the maxPrice for each node -- making it less likely for
   * our request to fail if the price on some of the nodes is higher than we think it was, as long as it's not
   * drastically different than we expect it to be
   */
  // console.log('totalBaseCost:', totalBaseCost);
  // console.log('userMaxPrice:', userMaxPrice);
  const excessBalance = userMaxPrice - totalBaseCost;

  // Map matching the keys from `pricesByNodeAddress`, but w/ the per-node maxPrice computed based on `userMaxPrice`
  const maxPricesPerNode: Record<string, bigint> = {};

  for (const [address, prices] of nodesToConsider) {
    // For now, we'll distribute the remaining balance equally across nodes
    maxPricesPerNode[address] = excessBalance
      ? prices[productId] + excessBalance / BigInt(nodesToConsider.length)
      : prices[productId];
  }

  return maxPricesPerNode;
}
