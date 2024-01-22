import { JSONSchemaType } from 'ajv';

import {
  ConditionType,
} from '@lit-protocol/types';

export const SCHEMAS: { [K in ConditionType]: JSONSchemaType<any> } = {
  'cosmos': require('./LPACC_ATOM.json'),
  'evmBasic': require('./LPACC_EVM_BASIC.json'),
  'evmContract': require('./LPACC_EVM_CONTRACT.json'),
  'solRpc': require('./LPACC_SOL.json'),
};
