import { z } from 'zod';

import { EvmChainEnum, ReturnValueTestSchema } from './common';

const StandardContractTypeEnum = z.enum([
  '',
  'ERC20',
  'ERC721',
  'ERC721MetadataName',
  'ERC1155',
  'CASK',
  'Creaton',
  'POAP',
  'timestamp',
  'MolochDAOv2.1',
  'ProofOfHumanity',
  'SIWE',
  'PKPPermissions',
  'LitAction',
]);

export const EvmBasicAccSchema = z
  .object({
    conditionType: z.literal('evmBasic').optional(),
    contractAddress: z.string(),
    chain: EvmChainEnum,
    standardContractType: StandardContractTypeEnum,
    method: z.string(),
    parameters: z.array(z.string()),
    returnValueTest: ReturnValueTestSchema.omit({ key: true }),
  })
  .strict();

export type EvmBasicAcc = z.infer<typeof EvmBasicAccSchema>;
