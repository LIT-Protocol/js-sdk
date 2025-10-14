import { PRODUCT_IDS, UNSIGNED_128_MAX } from './constants';

/**
 * In the context for Lit pricing model, the U128 value is used as a default "unlimited"
 * or maximum price when a specific `userMaxPrice` is not set
 */
export const getUserMaxPrice = (params: {
  product: keyof typeof PRODUCT_IDS;
}) => {
  /** Tracks the total max price a user is willing to pay for each supported product type
   * This must be distributed across all nodes; each node will get a percentage of this price
   *
   * If the user never sets a max price, it means 'unlimited'
   */
  const defaultMaxPriceByProduct: Record<keyof typeof PRODUCT_IDS, bigint> = {
    DECRYPTION: BigInt(-1),
    SIGN: BigInt(-1),
    LIT_ACTION: BigInt(-1),
    SIGN_SESSION_KEY: BigInt(-1),
  };

  if (defaultMaxPriceByProduct[params.product] === BigInt(-1)) {
    return UNSIGNED_128_MAX;
  }

  // If the user has set a max price, return that
  return defaultMaxPriceByProduct[params.product];
};
