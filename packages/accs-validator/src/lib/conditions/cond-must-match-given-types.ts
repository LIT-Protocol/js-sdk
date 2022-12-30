import {
  UnifiedAccessControlCondition as Acc,
  UnifiedAccessControlConditions as AccArray,
} from '@lit-protocol/constants';
import { getVarType } from '@lit-protocol/misc';
import { AccsValidatorStatus } from '../types';

/**
 * Each property must match the given type in the
 * @param acc
 * @param properties
 */
export const mustMatchGivenTypes = (
  acc: Acc | any,
  properties: any,
  schemaName: string
): AccsValidatorStatus => {
  const propKeys = Object.keys(properties);
  const failedTasks: any[] = [];

  //   console.log(propKeys);

  propKeys.forEach((propKey: string, _) => {
    // console.log('propKey:', propKey);

    const prop = properties[propKey];

    const accPropKey = acc[propKey];

    // -- recursivly check sub properties
    if (prop.properties) {
      console.log('-- deeper --');
      if (propKey in acc) {
        mustMatchGivenTypes(accPropKey, prop.properties, schemaName);
      }
    }

    // -- if a type is specified, then must match
    if (prop.type) {
      const inputType = getVarType(accPropKey).toLowerCase();
      const requiredType = prop.type.toLowerCase();

      // -- cannot be empty
      if (inputType === 'undefined') {
        failedTasks.push({
          status: 500,
          msg: `key "${propKey}" is missing. Please check schema ${schemaName}`,
        });
      }

      console.log(`...checking ${propKey}: ${inputType} === ${requiredType}`);

      if (requiredType !== inputType) {
        failedTasks.push({
          status: 500,
          msg: `"${propKey}":"${accPropKey}" ${inputType} !== ${requiredType}`,
        });
      }
    }

    // -- if a list of enum is specified, then must match one of it
    else if (prop.enum) {
      const inputType = accPropKey;
      const supportedList = prop.enum;

      if (!supportedList.includes(inputType)) {
        failedTasks.push({
          status: 500,
          msg: `Cannot find ${inputType} in schema.`,
        });
      }
    }
  }); // end of forEach

  if (failedTasks.length > 0) {
    return {
      status: 500,
      msg: failedTasks.map((task) => task.msg).join(', '),
    };
  }

  return {
    status: 200,
    msg: `${Object.keys(properties).length} keys matched given types`,
  };
};
