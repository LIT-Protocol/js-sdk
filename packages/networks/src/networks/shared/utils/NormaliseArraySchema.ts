import { z } from 'zod';

/**
 * Converts an ArrayLike object to a regular array.
 * Context: the nodes will only accept a normal array type as a paramater due to serizalization issues with Uint8Array type. this loop below is to normalize the message to a basic array.
 */
export const NormaliseArraySchema = z
  .any()
  .refine(
    (val) =>
      typeof val?.length === 'number' &&
      typeof val[Symbol.iterator] === 'function',
    {
      message: 'Expected an ArrayLike object',
    }
  )
  .transform((val) => Array.from(new Uint8Array(val)));
