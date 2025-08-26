import {
  getUserMaxPrice,
  PRODUCT_IDS,
  UNSIGNED_128_MAX,
} from './getUserMaxPrice';

describe('getUserMaxPrice', () => {
  const expectedMaxPrice = UNSIGNED_128_MAX;

  it('should return the rust U128 max price for DECRYPTION product', () => {
    expect(getUserMaxPrice({ product: 'DECRYPTION' })).toBe(expectedMaxPrice);
  });

  it('should return the rust U128 max price for SIGN product', () => {
    expect(getUserMaxPrice({ product: 'SIGN' })).toBe(expectedMaxPrice);
  });

  it('should return the rust U128 max price for LIT_ACTION product', () => {
    expect(getUserMaxPrice({ product: 'LIT_ACTION' })).toBe(expectedMaxPrice);
  });

  // Test with values from PRODUCT_IDS to ensure they are correctly handled
  it('should return the rust U128 max price when using PRODUCT_IDS.DECRYPTION', () => {
    const productKey = Object.keys(PRODUCT_IDS).find(
      (key) =>
        PRODUCT_IDS[key as keyof typeof PRODUCT_IDS] === PRODUCT_IDS.DECRYPTION
    ) as keyof typeof PRODUCT_IDS;
    expect(getUserMaxPrice({ product: productKey })).toBe(expectedMaxPrice);
  });

  it('should return the rust U128 max price when using PRODUCT_IDS.SIGN', () => {
    const productKey = Object.keys(PRODUCT_IDS).find(
      (key) => PRODUCT_IDS[key as keyof typeof PRODUCT_IDS] === PRODUCT_IDS.SIGN
    ) as keyof typeof PRODUCT_IDS;
    expect(getUserMaxPrice({ product: productKey })).toBe(expectedMaxPrice);
  });

  it('should return the rust U128 max price when using PRODUCT_IDS.LIT_ACTION', () => {
    const productKey = Object.keys(PRODUCT_IDS).find(
      (key) =>
        PRODUCT_IDS[key as keyof typeof PRODUCT_IDS] === PRODUCT_IDS.LIT_ACTION
    ) as keyof typeof PRODUCT_IDS;
    expect(getUserMaxPrice({ product: productKey })).toBe(expectedMaxPrice);
  });
});
