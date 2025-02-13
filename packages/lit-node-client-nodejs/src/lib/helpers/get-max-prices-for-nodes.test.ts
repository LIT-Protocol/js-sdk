import { PRODUCT_IDS } from '@lit-protocol/types';

import { getMaxPricesForNodeProduct } from './get-max-prices-for-node-product';

describe('getMaxPricesForNodes', () => {
  const nodePrices = [
    { url: 'http://localhost:3000', prices: [200n, 250n, 300n] },
    { url: 'http://localhost:2000', prices: [300n, 400n, 500n] },
    { url: 'http://localhost:1000', prices: [500n, 600n, 700n] },
  ];

  test('distributes prices correctly when userMaxPrice is sufficient', () => {
    const result = getMaxPricesForNodeProduct({
      nodePrices: nodePrices,
      userMaxPrice: 1050n,
      productId: PRODUCT_IDS.LIT_ACTION,
      numRequiredNodes: 2,
    });
    expect(result).toEqual([
      { price: 425n, url: 'http://localhost:3000' },
      { price: 625n, url: 'http://localhost:2000' },
    ]);
  });

  test('throws an error if base cost exceeds userMaxPrice', () => {
    expect(() => {
      getMaxPricesForNodeProduct({
        nodePrices: nodePrices,
        userMaxPrice: 400n,
        productId: PRODUCT_IDS.LIT_ACTION,
        numRequiredNodes: 2,
      });
    }).toThrow('Max price is too low');
  });

  test('handles exact userMaxPrice correctly', () => {
    const result = getMaxPricesForNodeProduct({
      nodePrices: nodePrices,
      userMaxPrice: 800n,
      productId: PRODUCT_IDS.LIT_ACTION,
      numRequiredNodes: 2,
    });
    expect(result).toEqual([
      { price: 300n, url: 'http://localhost:3000' },
      { price: 500n, url: 'http://localhost:2000' },
    ]);
  });

  test('uses only the requested productId for calculations', () => {
    const result = getMaxPricesForNodeProduct({
      nodePrices: nodePrices,
      userMaxPrice: 600n,
      productId: PRODUCT_IDS.DECRYPTION,
      numRequiredNodes: 2,
    });
    expect(result).toEqual([
      { price: 250n, url: 'http://localhost:3000' },
      { price: 350n, url: 'http://localhost:2000' },
    ]);
  });
});
