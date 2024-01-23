import { JSONSchemaType } from 'ajv';

import { LIT_ERROR } from '@lit-protocol/constants';
import { throwError } from '@lit-protocol/misc';
import { ConditionType } from '@lit-protocol/types';

export const SCHEMAS: { [K in ConditionType]: JSONSchemaType<any> } = {
  cosmos: require('./LPACC_ATOM.json'),
  evmBasic: require('./LPACC_EVM_BASIC.json'),
  evmContract: require('./LPACC_EVM_CONTRACT.json'),
  solRpc: require('./LPACC_SOL.json'),
};

export const getSchema = (
  conditionType: ConditionType
): JSONSchemaType<any> => {
  const schema = SCHEMAS[conditionType];

  if (!schema) {
    return throwError({
      message: `No schema found for condition type ${conditionType}`,
      errorKind: LIT_ERROR.INVALID_ARGUMENT_EXCEPTION.kind,
      errorCode: LIT_ERROR.INVALID_ARGUMENT_EXCEPTION.name,
    });
  }

  return schema;
};
