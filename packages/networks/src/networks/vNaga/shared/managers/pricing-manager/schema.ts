import { z } from 'zod';
import { getUserMaxPrice } from './getUserMaxPrice';
import { PRODUCT_IDS } from './constants';
import { PRODUCT_ID_VALUES } from '@lit-protocol/constants';

export const PricingContextSchema = z
  .object({
    product: z.enum(['DECRYPTION', 'SIGN', 'LIT_ACTION', 'SIGN_SESSION_KEY']),
    userMaxPrice: z.bigint().optional(),
    nodePrices: z.array(
      z.object({ url: z.string(), prices: z.array(z.bigint()) })
    ),
    threshold: z.number(),
  })
  .transform(({ product, userMaxPrice, nodePrices, threshold }) => {
    const _userMaxPrice =
      userMaxPrice ??
      getUserMaxPrice({
        product: product,
      });

    return {
      product: {
        id: Number(PRODUCT_IDS[product]) as PRODUCT_ID_VALUES,
        name: product,
      },
      userMaxPrice: _userMaxPrice,

      // This aligns the Zod-inferred type with the function signature, removes the optionality error, and lets you drop the @ts-ignore/cast.
      nodePrices: nodePrices as { url: string; prices: bigint[] }[],
      threshold,
    };
  });

export type PricingContext = z.infer<typeof PricingContextSchema>;
