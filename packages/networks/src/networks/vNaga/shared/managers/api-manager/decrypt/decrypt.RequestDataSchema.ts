import { z } from 'zod';
import { MultipleAccessControlConditionsSchema } from '@lit-protocol/access-control-conditions-schemas';
import { AuthSigSchema } from '@lit-protocol/schemas';
import { FormattedMultipleAccs } from '@lit-protocol/types';
import { getFormattedAccessControlConditions } from '@lit-protocol/access-control-conditions';

export const DecryptRequestDataSchema =
  MultipleAccessControlConditionsSchema.extend({
    ciphertext: z.string(),
    dataToEncryptHash: z.string(),
    authSig: AuthSigSchema,
    chain: z.string(),
  }).transform((data) => {
    const {
      formattedAccessControlConditions,
      formattedEVMContractConditions,
      formattedSolRpcConditions,
      formattedUnifiedAccessControlConditions,
    }: FormattedMultipleAccs = getFormattedAccessControlConditions(data);

    return {
      ...data,
      accessControlConditions: formattedAccessControlConditions,
      evmContractConditions: formattedEVMContractConditions,
      solRpcConditions: formattedSolRpcConditions,
      unifiedAccessControlConditions: formattedUnifiedAccessControlConditions,
    };
  });
