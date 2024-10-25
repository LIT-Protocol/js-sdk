import { z } from 'zod';

import { EvmChainEnum, ReturnValueTestSchema } from './common';

const FunctionAbiInputSchema = z
  .object({
    name: z.string(),
    type: z.string(),
    internalType: z.string().optional(),
  })
  .strict();

const FunctionAbiOutputSchema = z
  .object({
    name: z.string(),
    type: z.string(),
    internalType: z.string().optional(),
  })
  .strict();

const FunctionAbiSchema = z
  .object({
    name: z.string(),
    type: z.string().optional(),
    stateMutability: z.string(),
    constant: z.boolean().optional(),
    inputs: z.array(FunctionAbiInputSchema),
    outputs: z.array(FunctionAbiOutputSchema),
  })
  .strict();

export const EvmContractAccSchema = z
  .object({
    conditionType: z.literal('evmContract').optional(),
    contractAddress: z.string(),
    chain: EvmChainEnum,
    functionName: z.string(),
    functionParams: z.array(z.string()),
    functionAbi: FunctionAbiSchema,
    returnValueTest: ReturnValueTestSchema,
  })
  .strict();

export type EvmContractAcc = z.infer<typeof EvmContractAccSchema>;
