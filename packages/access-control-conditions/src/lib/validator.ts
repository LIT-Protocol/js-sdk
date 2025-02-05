import { JSONSchemaType } from 'ajv';

import { loadSchema } from '@lit-protocol/accs-schemas';
import { InvalidArgumentException } from '@lit-protocol/constants';
import { checkSchema } from '@lit-protocol/misc';
import {
  AccessControlConditions,
  ConditionType,
  EvmContractConditions,
  MultipleAccessControlConditions,
  SolRpcConditions,
  UnifiedAccessControlConditions,
} from '@lit-protocol/types';

const SCHEMA_NAME_MAP: { [K in ConditionType]: string } = {
  cosmos: 'LPACC_ATOM',
  evmBasic: 'LPACC_EVM_BASIC',
  evmContract: 'LPACC_EVM_CONTRACT',
  solRpc: 'LPACC_SOL',
};

async function getSchema<T>(
  accType: ConditionType
): Promise<JSONSchemaType<T>> {
  try {
    const schemaName = SCHEMA_NAME_MAP[accType];
    return loadSchema(schemaName) as Promise<JSONSchemaType<T>>;
  } catch (err) {
    throw new InvalidArgumentException(
      {
        info: {
          accType,
        },
      },
      `No schema found for condition type %s`,
      accType
    );
  }
}

/**
 * CHANGE: This function should be removed in favor of {@link validateAccessControlConditionsSchema}.
 * However, since `MultipleAccessControlConditions` is deeply intertwined with other types,
 * we will revisit this later. At the moment, the `lit-core` will be using this function.
 */
export const validateAccessControlConditions = async (
  params: MultipleAccessControlConditions
): Promise<boolean> => {
  // ========== Prepare Params ==========
  const {
    accessControlConditions,
    evmContractConditions,
    solRpcConditions,
    unifiedAccessControlConditions,
  } = params;

  if (accessControlConditions) {
    await validateAccessControlConditionsSchema(accessControlConditions);
  } else if (evmContractConditions) {
    await validateEVMContractConditionsSchema(evmContractConditions);
  } else if (solRpcConditions) {
    await validateSolRpcConditionsSchema(solRpcConditions);
  } else if (unifiedAccessControlConditions) {
    await validateUnifiedAccessControlConditionsSchema(
      unifiedAccessControlConditions
    );
  }

  return true;
};

/**
 * Validates EVM basic access control conditions schema
 * @param { AccessControlConditions } accs
 */
export const validateAccessControlConditionsSchema = async (
  accs: AccessControlConditions
): Promise<boolean> => {
  for (const acc of accs) {
    // conditions can be nested to make boolean expressions
    if (Array.isArray(acc)) {
      await validateAccessControlConditionsSchema(acc);
      continue;
    }

    if ('operator' in acc) {
      // condition is operator, skip
      continue;
    }

    checkSchema(
      acc,
      await getSchema('evmBasic'),
      'accessControlConditions',
      'validateAccessControlConditionsSchema'
    );
  }

  return true;
};

/**
 * Validates EVM contract access control conditions schema
 * @param { EvmContractConditions } accs
 */
export const validateEVMContractConditionsSchema = async (
  accs: EvmContractConditions
): Promise<boolean> => {
  for (const acc of accs) {
    // conditions can be nested to make boolean expressions
    if (Array.isArray(acc)) {
      await validateEVMContractConditionsSchema(acc);
      continue;
    }

    if ('operator' in acc) {
      // condition is operator, skip
      continue;
    }

    checkSchema(
      acc,
      await getSchema('evmContract'),
      'evmContractConditions',
      'validateEVMContractConditionsSchema'
    );
  }

  return true;
};

/**
 * Validates Sol access control conditions schema
 * @param { SolRpcConditions } accs
 */
export const validateSolRpcConditionsSchema = async (
  accs: SolRpcConditions
): Promise<boolean> => {
  for (const acc of accs) {
    // conditions can be nested to make boolean expressions
    if (Array.isArray(acc)) {
      await validateSolRpcConditionsSchema(acc);
      continue;
    }

    if ('operator' in acc) {
      // condition is operator, skip
      continue;
    }

    checkSchema(
      acc,
      await getSchema('solRpc'),
      'solRpcConditions',
      'validateSolRpcConditionsSchema'
    );
  }

  return true;
};

/**
 * Validates unified access control conditions schema
 * @param { UnifiedAccessControlConditions } accs
 */
export const validateUnifiedAccessControlConditionsSchema = async (
  accs: UnifiedAccessControlConditions
): Promise<boolean> => {
  for (const acc of accs) {
    // conditions can be nested to make boolean expressions
    if (Array.isArray(acc)) {
      await validateUnifiedAccessControlConditionsSchema(acc);
      continue;
    }

    if ('operator' in acc) {
      // condition is operator, skip
      continue;
    }

    let schema: JSONSchemaType<any> | undefined;
    switch (acc.conditionType) {
      case 'evmBasic':
        schema = await getSchema('evmBasic');
        break;
      case 'evmContract':
        schema = await getSchema('evmContract');
        break;
      case 'solRpc':
        schema = await getSchema('solRpc');
        break;
      case 'cosmos':
        schema = await getSchema('cosmos');
        break;
    }
    if (schema) {
      checkSchema(
        acc,
        schema,
        'accessControlConditions',
        'validateUnifiedAccessControlConditionsSchema'
      );
    } else {
      throw new InvalidArgumentException(
        {
          info: {
            acc,
          },
        },
        `Missing schema to validate condition type %s`,
        acc.conditionType
      );
    }
  }

  return true;
};
