import { z } from 'zod';

import { ChainEnumAtom, ReturnValueTestSchema } from './common';

export const AtomAccSchema = z
  .object({
    conditionType: z.literal('cosmos').optional(),
    path: z.string(),
    chain: ChainEnumAtom,
    method: z.string().optional(),
    parameters: z.array(z.string()).optional(),
    returnValueTest: ReturnValueTestSchema,
  })
  .strict();

export type AtomAcc = z.infer<typeof AtomAccSchema>;
