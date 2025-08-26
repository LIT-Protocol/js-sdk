import {
  validateAccessControlConditions,
  validateAccessControlConditionsSchema,
  validateEVMContractConditionsSchema,
  validateSolRpcConditionsSchema,
  validateUnifiedAccessControlConditionsSchema,
} from '@lit-protocol/schemas';

// Re-export validation functions from schemas package
// This breaks the circular dependency by having access-control-conditions only depend on schemas

/**
 * Validates Multiple access control conditions schema
 * @param { MultipleAccessControlConditions } accs
 */
export { validateAccessControlConditions };

/**
 * Validates EVM basic access control conditions schema
 * @param { AccessControlConditions } accs
 */
export { validateAccessControlConditionsSchema };

/**
 * Validates EVM contract access control conditions schema
 * @param { EvmContractConditions } accs
 */
export { validateEVMContractConditionsSchema };

/**
 * Validates Sol access control conditions schema
 * @param { SolRpcConditions } accs
 */
export { validateSolRpcConditionsSchema };

/**
 * Validates unified access control conditions schema
 * @param { UnifiedAccessControlConditions } accs
 */
export { validateUnifiedAccessControlConditionsSchema };