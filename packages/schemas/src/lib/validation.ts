import { z } from 'zod';
import { fromError, isZodErrorLike } from 'zod-validation-error';
import { InvalidArgumentException } from '@lit-protocol/constants';
import {
  EvmBasicConditionsSchema,
  EvmContractConditionsSchema,
  MultipleAccessControlConditionsSchema,
  SolRpcConditionsSchema,
  UnifiedConditionsSchema,
  type EvmBasicCondition,
  type EvmContractCondition,
  type SolRpcCondition,
  type UnifiedAccessControlCondition,
  type MultipleAccessControlConditions,
} from '@lit-protocol/access-control-conditions-schemas';

export function throwFailedValidation(
  functionName: string,
  params: unknown,
  e: unknown
): never {
  throw new InvalidArgumentException(
    {
      info: {
        params,
        function: functionName,
      },
      cause: isZodErrorLike(e) ? fromError(e) : e,
    },
    `Invalid params for ${functionName}. Check error for details.`
  );
}

export function applySchemaWithValidation<T>(
  functionName: string,
  params: T,
  schema: z.ZodType<T>
): T {
  try {
    return schema.parse(params);
  } catch (e) {
    throwFailedValidation(functionName, params, e);
  }
}

// Local type definitions to avoid circular dependency with types package
// Access control condition validation functions
// These are exported so access-control-conditions package can use them without importing schemas directly
// This is a workaround to avoid circular dependency

/**
 * Validates Multiple access control conditions schema
 */
export const validateAccessControlConditions = async (
  accs: MultipleAccessControlConditions
): Promise<true> => {
  applySchemaWithValidation(
    'validateAccessControlConditions',
    accs,
    MultipleAccessControlConditionsSchema
  );
  return true;
};

/**
 * Validates EVM basic access control conditions schema
 */
export const validateAccessControlConditionsSchema = async (
  accs: EvmBasicCondition[]
): Promise<true> => {
  applySchemaWithValidation(
    'validateAccessControlConditionsSchema',
    accs,
    EvmBasicConditionsSchema
  );
  return true;
};

/**
 * Validates EVM contract access control conditions schema
 */
export const validateEVMContractConditionsSchema = async (
  accs: EvmContractCondition[]
): Promise<true> => {
  applySchemaWithValidation(
    'validateEVMContractConditionsSchema',
    accs,
    EvmContractConditionsSchema
  );
  return true;
};

/**
 * Validates Sol access control conditions schema
 */
export const validateSolRpcConditionsSchema = async (
  accs: SolRpcCondition[]
): Promise<true> => {
  applySchemaWithValidation(
    'validateSolRpcConditionsSchema',
    accs,
    SolRpcConditionsSchema
  );
  return true;
};

/**
 * Validates unified access control conditions schema
 */
export const validateUnifiedAccessControlConditionsSchema = async (
  accs: UnifiedAccessControlCondition
): Promise<true> => {
  applySchemaWithValidation(
    'validateUnifiedAccessControlConditionsSchema',
    accs,
    UnifiedConditionsSchema
  );
  return true;
};
