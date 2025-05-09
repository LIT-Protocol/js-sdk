import { toHexString } from '../../../../shared/utils/z-transformers';
import { z } from 'zod';

export const SignatureDataSchema = z.object({
  r: toHexString,
  s: toHexString,
  v: z.number(),
});
