import { PRODUCT_IDS } from '@lit-protocol/constants';

import { getMaxPricesForNodes } from './get-max-prices-for-nodes';

describe('getMaxPricesForNodes', () => {
  const pricesByNodeAddress = {
    node1: [500n, 600n, 700n],
    node2: [300n, 400n, 500n],
    node3: [200n, 250n, 300n],
  };

  test('distributes prices correctly when userMaxPrice is sufficient', () => {
    const result = getMaxPricesForNodes({
      pricesByNodeAddress: pricesByNodeAddress,
      userMaxPrice: 1050n,
      productId: PRODUCT_IDS.LA,
      numRequiredNodes: 2,
    });
    expect(result).toEqual({
      node3: 425n,
      node2: 625n,
    });
  });

  test('throws an error if base cost exceeds userMaxPrice', () => {
    expect(() => {
      getMaxPricesForNodes({
        pricesByNodeAddress: pricesByNodeAddress,
        userMaxPrice: 400n,
        productId: PRODUCT_IDS.LA,
        numRequiredNodes: 2,
      });
    }).toThrow('Max price is too low');
  });

  test('handles exact userMaxPrice correctly', () => {
    const result = getMaxPricesForNodes({
      pricesByNodeAddress: pricesByNodeAddress,
      userMaxPrice: 800n,
      productId: PRODUCT_IDS.LA,
      numRequiredNodes: 2,
    });
    expect(result).toEqual({
      node3: 300n,
      node2: 500n,
    });
  });

  test('uses only the requested productId for calculations', () => {
    const result = getMaxPricesForNodes({
      pricesByNodeAddress: pricesByNodeAddress,
      userMaxPrice: 600n,
      productId: PRODUCT_IDS.DECRYPTION,
      numRequiredNodes: 2,
    });
    expect(result).toEqual({
      node3: 250n,
      node2: 350n,
    });
  });
});
