import {
  UnifiedAccessControlCondition as Acc,
  UnifiedAccessControlConditions as AccArray,
} from '@lit-protocol/constants';
import { getVarType } from '@lit-protocol/misc';
import { mustMatchGivenTypes } from './conditions/cond-must-match-given-types';
import { mustMatchRequiredKeys } from './conditions/cond-must-match-required-keys';
import {
  AccsSchema,
  AccsValidateFailed,
  AccsValidatePassed,
  AccsValidatorStatus,
} from './types';
import { asyncForEach } from './util-async-foreach';

// ----------------------------------------
//          Add new schemas here
// ----------------------------------------
export const SCHEMAS = [
  import('./schemas/LPACC_EVM_BASIC.json'),
  import('./schemas/LPACC_EVM_CONTRACT.json'),
  import('./schemas/LPACC_SOL.json'),
  import('./schemas/LPACC_ATOM.json'),
];
// ---------------------------
//          Exports
// ---------------------------

/**
 *
 * This function checks which schema if the given SINGLE object of acc belongs to
 *
 * @param { Acc } acc
 */
export const getSchema = async (acc: Acc) => {
  const schemas: Array<AccsSchema> = [];

  await SCHEMAS.forEach(async (schema) => {
    const schemaJson = await schema;
    schemas.push(schemaJson);
  });

  let schema: AccsSchema = {} as AccsSchema;
  let filteredSchemas: Array<AccsSchema> = [];

  // -- in each schema, filter only if the "properties.chain.enum" key contains the same keys as the given acc
  filteredSchemas = schemas.filter((schema: AccsSchema) => {
    // -- this will ignore 'operator' acc type
    // console.log(schema);
    if ('chain' in acc) {
      return schema.properties.chain.enum.includes(acc.chain);
    }
  });

  // -- a single acc should only belong to one schema
  if (filteredSchemas.length === 1) {
    schema = filteredSchemas[0];
  }

  if (filteredSchemas.length > 1) {
    // it could be a "evm_basic" or "evm_contract" schema

    // -- if the given acc has "standardContractType" key, it belongs to "evm_basic" schema
    if (Object.keys(acc).includes('standardContractType')) {
      schema = schemas.find((schema: AccsSchema) =>
        schema.required.includes('standardContractType')
      ) as AccsSchema;
    }

    // -- if the given acc has "standardContractType" key, it belongs to "evm_contract" schema
    if (Object.keys(acc).includes('functionAbi')) {
      schema = schemas.find((schema: AccsSchema) =>
        schema.required.includes('functionAbi')
      ) as AccsSchema;
    }
  }

  return schema;
};

/**
 * Validate the given access control condition
 */
export const validate = async (
  accs: AccArray
): Promise<AccsValidatePassed | AccsValidateFailed> => {
  // -- check if arg is provided
  if (!accs) {
    return { status: 500, msg: 'No access control condition found' };
  }

  // -- setup an empty array to store results
  // let result = [...new Array(accs.length)];
  const validSchemas: Array<string> = [];
  const failedRequiredKeys: Array<AccsValidatorStatus> = [];
  const failedGivenTypes: Array<AccsValidatorStatus> = [];

  // -- for each object in the array, check which schema it belongs to
  await asyncForEach([...accs], async (acc: Acc, index: number) => {
    // -- skip to next acc if it's a operator
    if ('operator' in acc) return;

    // -- pick the correct schema
    const schema = await getSchema(acc);

    // -- if the given acc is an array, recursively call this function
    if (getVarType(acc) === 'array') {
      validate(acc as unknown as AccArray);
    } else {
      console.log(`...checking ${acc.chain} on ${schema.title} schema`);

      const res = mustMatchRequiredKeys(acc, schema.required);

      if (res.status === 500) {
        failedRequiredKeys.push(res);
      }

      const res2 = mustMatchGivenTypes(acc, schema.properties, schema.title);

      if (res2.status === 500) {
        failedGivenTypes.push(res2);
      }

      if (!validSchemas.includes(schema.title)) {
        validSchemas.push(schema.title);
      }
    }
  });

  console.log('Failed Tasks:', failedRequiredKeys);
  console.log('Failed Tasks:', failedGivenTypes);

  // -- if there are failed tasks, return the error
  if (failedRequiredKeys.length > 0 || failedGivenTypes.length > 0) {
    return { status: 500, msg: `${failedRequiredKeys.map((task) => task.msg).join(', ')}\n${failedGivenTypes.map((task) => task.msg).join('\n')}` };
  }

  return {
    status: 200,
    msg: `Access control condition is valid`,
    data: validSchemas,
  } as AccsValidatePassed;
};
