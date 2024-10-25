import { z } from 'zod';

import { ChainEnumSol, ReturnValueTestSchema } from './common';

const PdaInterfaceSchema = z
  .object({
    offset: z.number(),
    fields: z.object({}).catchall(z.any()),
  })
  .strict();

export const SolAccSchema = z
  .object({
    conditionType: z.literal('solRpc').optional(),
    method: z.string(),
    params: z.array(z.string()),
    pdaParams: z.array(z.string()).optional(),
    pdaInterface: PdaInterfaceSchema,
    pdaKey: z.string(),
    chain: ChainEnumSol,
    returnValueTest: ReturnValueTestSchema,
  })
  .strict();

export type SolAcc = z.infer<typeof SolAccSchema>;
