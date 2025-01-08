import { PRODUCT_IDS } from '@lit-protocol/constants';

import { getMaxPricesForNodes } from './get-max-prices-for-nodes';

describe('getMaxPricesForNodes', () => {
  const pricesByNodeAddress = {
    node1: [50, 60, 70],
    node2: [30, 40, 50],
    node3: [20, 25, 30],
  };

  test('distributes prices correctly when userMaxPrice is sufficient', () => {
    const result = getMaxPricesForNodes(
      pricesByNodeAddress,
      105,
      PRODUCT_IDS.LA,
      2
    );
    expect(result).toEqual({
      node3: 42.5,
      node2: 62.5,
    });
  });

  test('throws an error if base cost exceeds userMaxPrice', () => {
    expect(() => {
      getMaxPricesForNodes(pricesByNodeAddress, 40, PRODUCT_IDS.LA, 2);
    }).toThrow('Max price is too low');
  });

  test('handles exact userMaxPrice correctly', () => {
    const result = getMaxPricesForNodes(
      pricesByNodeAddress,
      80,
      PRODUCT_IDS.LA,
      2
    );
    expect(result).toEqual({
      node3: 30,
      node2: 50,
    });
  });

  test('uses only the requested productId for calculations', () => {
    const result = getMaxPricesForNodes(
      pricesByNodeAddress,
      60,
      PRODUCT_IDS.DECRYPTION,
      2
    );
    expect(result).toEqual({
      node3: 25,
      node2: 35,
    });
  });
});
