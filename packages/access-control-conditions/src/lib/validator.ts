import {
  EvmBasicConditionsSchema,
  EvmContractConditionsSchema,
  MultipleAccessControlConditionsSchema,
  SolRpcConditionsSchema,
  UnifiedConditionsSchema,
} from '@lit-protocol/access-control-conditions-schemas';
import { applySchemaWithValidation } from '@lit-protocol/schemas';
import {
  AccessControlConditions,
  EvmContractConditions,
  MultipleAccessControlConditions,
  SolRpcConditions,
  UnifiedAccessControlConditions,
} from '@lit-protocol/types';

/**
 * Validates Multiple access control conditions schema
 * @param { MultipleAccessControlConditions } accs
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
 * @param { AccessControlConditions } accs
 */
export const validateAccessControlConditionsSchema = async (
  accs: AccessControlConditions
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
 * @param { EvmContractConditions } accs
 */
export const validateEVMContractConditionsSchema = async (
  accs: EvmContractConditions
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
 * @param { SolRpcConditions } accs
 */
export const validateSolRpcConditionsSchema = async (
  accs: SolRpcConditions
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
 * @param { UnifiedAccessControlConditions } accs
 */
export const validateUnifiedAccessControlConditionsSchema = async (
  accs: UnifiedAccessControlConditions
): Promise<true> => {
  applySchemaWithValidation(
    'validateUnifiedAccessControlConditionsSchema',
    accs,
    UnifiedConditionsSchema
  );

  return true;
};
