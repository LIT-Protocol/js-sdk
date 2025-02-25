import { z } from 'zod';

export const OperatorAccSchema = z
  .object({
    operator: z.enum(['and', 'or'] as const),
  })
  .strict();

export type OperatorAcc = z.infer<typeof OperatorAccSchema>;
