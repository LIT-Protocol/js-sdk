import { z } from 'zod';
import { getUserMaxPrice } from './getUserMaxPrice';
import { PRODUCT_IDS } from './pricing.constants';

export const PricingContextSchema = z
  .object({
    product: z.enum(['DECRYPTION', 'SIGN', 'LIT_ACTION']),
    userMaxPrice: z.bigint().optional(),
    nodePrices: z.array(
      z.object({ url: z.string(), prices: z.array(z.bigint()) })
    ),
    threshold: z.number(),
  })
  .transform(({ product, userMaxPrice, nodePrices, threshold }) => {
    return {
      product: {
        id: PRODUCT_IDS[product],
        name: product,
      },
      userMaxPrice:
        userMaxPrice ??
        getUserMaxPrice({
          product: product,
        }),
      nodePrices,
      threshold,
    };
  });

export type PricingContext = z.infer<typeof PricingContextSchema>;
