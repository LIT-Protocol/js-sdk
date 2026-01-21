import { z } from 'zod';
import { MultipleAccessControlConditionsSchema } from '@lit-protocol/access-control-conditions-schemas';
import { AuthSigSchema } from '@lit-protocol/schemas';
import { KEY_SET_IDENTIFIERS } from '@lit-protocol/constants';
import { FormattedMultipleAccs } from '@lit-protocol/types';
import { getFormattedAccessControlConditions } from '@lit-protocol/access-control-conditions';

export const DecryptRequestDataSchema =
  MultipleAccessControlConditionsSchema.extend({
    ciphertext: z.string(),
    dataToEncryptHash: z.string(),
    authSig: AuthSigSchema,
    chain: z.string(),
    keySetIdentifier: z
      .enum([KEY_SET_IDENTIFIERS.DATIL, KEY_SET_IDENTIFIERS.NAGA_KEYSET1])
      .optional(),
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
