import { z } from 'zod';

import {
  LIT_CHAINS_KEYS,
  LIT_COSMOS_CHAINS_KEYS,
  LIT_SVM_CHAINS_KEYS,
} from '@lit-protocol/constants';

export const ChainEnumAtom = z.enum(LIT_COSMOS_CHAINS_KEYS);

export const EvmChainEnum = z.enum(LIT_CHAINS_KEYS);

export const ChainEnumSol = z.enum(LIT_SVM_CHAINS_KEYS);

export const ReturnValueTestSchema = z
  .object({
    key: z.string(),
    comparator: z.enum(['contains', '=', '>', '>=', '<', '<=']),
    value: z.string(),
  })
  .strict();
