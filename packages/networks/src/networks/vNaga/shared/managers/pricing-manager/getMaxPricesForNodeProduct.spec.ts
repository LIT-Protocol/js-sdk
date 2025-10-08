import { PRODUCT_IDS } from '@lit-protocol/constants';

import { getMaxPricesForNodeProduct } from './getMaxPricesForNodeProduct';

describe('getMaxPricesForNodeProduct', () => {
  it('uses the requested product column when ranking nodes', () => {
    const nodePrices = [
      {
        url: 'https://node-a',
        prices: [80n, 5n, 9n, 30n],
      },
      {
        url: 'https://node-b',
        prices: [70n, 4n, 8n, 10n],
      },
      {
        url: 'https://node-c',
        prices: [60n, 3n, 7n, 20n],
      },
    ];

    // Log the incoming order to show the encryption column is already sorted lowest-first.
    console.log(
      'incoming order',
      nodePrices.map(({ url, prices }) => ({
        url,
        decryptionPrice: prices[PRODUCT_IDS.DECRYPTION],
        signPrice: prices[PRODUCT_IDS.SIGN],
        litActionPrice: prices[PRODUCT_IDS.LIT_ACTION],
        signSessionKeyPrice: prices[PRODUCT_IDS.SIGN_SESSION_KEY],
      }))
    );

    // Call the helper exactly like the SDK does: ask for SIGN_SESSION_KEY prices,
    // pass the raw price feed output, and cap the request at two nodes.
    const result = getMaxPricesForNodeProduct({
      nodePrices,
      userMaxPrice: 100n,
      productId: PRODUCT_IDS.SIGN_SESSION_KEY,
      numRequiredNodes: 2,
    });

    console.log(
      'selected nodes',
      result.map(({ url, price }) => ({ url, price }))
    );

    // After sorting the nodes by the session-key column, the helper should
    // return node-b (10) and node-c (20) even though the original array was
    // ordered by the decryption price column.
    expect(result).toHaveLength(2);
    expect(result[0].url).toBe('https://node-b');
    expect(result[1].url).toBe('https://node-c');

    // Base prices are taken from the SIGN_SESSION_KEY column (10 and 20)
    // with the excess (100 - 30 = 70) split evenly.
    expect(result[0].price).toBe(10n + 35n);
    expect(result[1].price).toBe(20n + 35n);
  });
});
