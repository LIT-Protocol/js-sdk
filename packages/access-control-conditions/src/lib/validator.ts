import { JSONSchemaType } from 'ajv';
import { LIT_ERROR } from '@lit-protocol/constants';
import {
  AccessControlConditions,
  EvmContractConditions,
  SolRpcConditions,
  UnifiedAccessControlConditions,
} from '@lit-protocol/types';
import { checkSchema, throwError } from '@lit-protocol/misc';
import { getSchema } from '@lit-protocol/encryption';

/**
 * Validates EVM basic access control conditions schema
 * @param { AccessControlConditions } accs
 */
export const validateAccessControlConditionsSchema = (
  accs: AccessControlConditions
): boolean => {
  accs.forEach((acc) => {
    // conditions can be nested to make boolean expressions
    if (Array.isArray(acc)) {
      validateAccessControlConditionsSchema(acc);
      return;
    }

    if ('operator' in acc) {
      // condition is operator, skip
      return;
    }

    checkSchema(
      acc,
      getSchema('evmBasic'),
      'accessControlConditions',
      'validateAccessControlConditionsSchema'
    );
  });

  return true;
};

/**
 * Validates EVM contract access control conditions schema
 * @param { EvmContractConditions } accs
 */
export const validateEVMContractConditionsSchema = (
  accs: EvmContractConditions
): boolean => {
  accs.forEach((acc) => {
    // conditions can be nested to make boolean expressions
    if (Array.isArray(acc)) {
      validateEVMContractConditionsSchema(acc);
      return;
    }

    if ('operator' in acc) {
      // condition is operator, skip
      return;
    }

    checkSchema(
      acc,
      getSchema('evmContract'),
      'evmContractConditions',
      'validateEVMContractConditionsSchema'
    );
  });

  return true;
};

/**
 * Validates Sol access control conditions schema
 * @param { SolRpcConditions } accs
 */
export const validateSolRpcConditionsSchema = (
  accs: SolRpcConditions
): boolean => {
  accs.forEach((acc) => {
    // conditions can be nested to make boolean expressions
    if (Array.isArray(acc)) {
      validateSolRpcConditionsSchema(acc);
      return;
    }

    if ('operator' in acc) {
      // condition is operator, skip
      return;
    }

    checkSchema(
      acc,
      getSchema('solRpc'),
      'solRpcConditions',
      'validateSolRpcConditionsSchema'
    );
  });

  return true;
};

/**
 * Validates unified access control conditions schema
 * @param { UnifiedAccessControlConditions } accs
 */
export const validateUnifiedAccessControlConditionsSchema = (
  accs: UnifiedAccessControlConditions
): boolean => {
  accs.forEach((acc) => {
    // conditions can be nested to make boolean expressions
    if (Array.isArray(acc)) {
      validateUnifiedAccessControlConditionsSchema(acc);
      return;
    }

    if ('operator' in acc) {
      // condition is operator, skip
      return;
    }

    let schema: JSONSchemaType<any> | undefined;
    switch (acc.conditionType) {
      case 'evmBasic':
        schema = getSchema('evmBasic');
        break;
      case 'evmContract':
        schema = getSchema('evmContract');
        break;
      case 'solRpc':
        schema = getSchema('solRpc');
        break;
      case 'cosmos':
        schema = getSchema('cosmos');
        break;
    }
    if (schema) {
      checkSchema(
        acc,
        schema,
        'accessControlConditions',
        'validateUnifiedAccessControlConditionsSchema'
      );
    }

    throwError({
      message: `No schema found for condition type ${acc.conditionType}`,
      errorKind: LIT_ERROR.INVALID_ARGUMENT_EXCEPTION.kind,
      errorCode: LIT_ERROR.INVALID_ARGUMENT_EXCEPTION.name,
    });
  });

  return true;
};
