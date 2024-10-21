import { z } from 'zod';

export const AccsOperatorParamsSchema = z.object({
  operator: z.string(),
});
