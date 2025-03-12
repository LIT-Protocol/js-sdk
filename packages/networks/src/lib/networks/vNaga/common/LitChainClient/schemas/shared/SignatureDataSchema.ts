import { z } from 'zod';
import { toHexString } from '../../../../../shared/utils/z-transformers';

export const SignatureDataSchema = z.object({
  r: toHexString,
  s: toHexString,
  v: z.number(),
});
