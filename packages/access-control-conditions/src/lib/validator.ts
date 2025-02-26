import { fromError, isZodErrorLike } from 'zod-validation-error';

import {
  EvmBasicConditionsSchema,
  EvmContractConditionsSchema,
  MultipleAccessControlConditionsSchema,
  SolRpcConditionsSchema,
  UnifiedConditionsSchema,
} from '@lit-protocol/access-control-conditions-schemas';
import { InvalidArgumentException } from '@lit-protocol/constants';
import {
  AccessControlConditions,
  EvmContractConditions,
  MultipleAccessControlConditions,
  SolRpcConditions,
  UnifiedAccessControlConditions,
} from '@lit-protocol/types';

function formatZodError(accs: unknown, e: unknown): never {
  throw new InvalidArgumentException(
    {
      info: {
        accs,
      },
      cause: isZodErrorLike(e) ? fromError(e) : e,
    },
    'Invalid access control conditions. Check error cause for more details.'
  );
}

async function validateSchema<T>(
  accs: T,
  schema: { parse: (arg: unknown) => void }
): Promise<true> {
  try {
    schema.parse(accs);
  } catch (e) {
    formatZodError(accs, e);
  }
  return true;
}

/**
 * Validates Multiple access control conditions schema
 * @param { MultipleAccessControlConditions } accs
 */
export const validateAccessControlConditions = async (
  accs: MultipleAccessControlConditions
): Promise<true> => {
  return validateSchema(accs, MultipleAccessControlConditionsSchema);
};

/**
 * Validates EVM basic access control conditions schema
 * @param { AccessControlConditions } accs
 */
export const validateAccessControlConditionsSchema = async (
  accs: AccessControlConditions
): Promise<true> => {
  return validateSchema(accs, EvmBasicConditionsSchema);
};

/**
 * Validates EVM contract access control conditions schema
 * @param { EvmContractConditions } accs
 */
export const validateEVMContractConditionsSchema = async (
  accs: EvmContractConditions
): Promise<true> => {
  return validateSchema(accs, EvmContractConditionsSchema);
};

/**
 * Validates Sol access control conditions schema
 * @param { SolRpcConditions } accs
 */
export const validateSolRpcConditionsSchema = async (
  accs: SolRpcConditions
): Promise<true> => {
  return validateSchema(accs, SolRpcConditionsSchema);
};

/**
 * Validates unified access control conditions schema
 * @param { UnifiedAccessControlConditions } accs
 */
export const validateUnifiedAccessControlConditionsSchema = async (
  accs: UnifiedAccessControlConditions
): Promise<true> => {
  return validateSchema(accs, UnifiedConditionsSchema);
};
