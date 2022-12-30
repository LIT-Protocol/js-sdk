import {
  UnifiedAccessControlCondition as Acc,
  UnifiedAccessControlConditions as AccArray,
} from '@lit-protocol/constants';
import { AccsValidatorStatus } from '../types';
/**
 *
 * Check if each required key exists in the acc
 * and both given acc and required keys must have the same
 * length of keys
 *
 * @param acc
 * @param requiredKeys
 */
export const mustMatchRequiredKeys = (
  acc: Acc,
  requiredKeys: Array<string>
): AccsValidatorStatus => {
  if (Object.keys(acc).length !== requiredKeys.length) {
    let unknownKeys = [];

    if (Object.keys(acc).length > requiredKeys.length) {
      unknownKeys = Object.keys(acc).filter(
        (key) => !requiredKeys.includes(key)
      );
      return {
        status: 500,
        msg: `Required keys and given acc length don't match. Found unknown keys [${unknownKeys}]`,
      };
    } else {
      unknownKeys = requiredKeys.filter(
        (key) => !Object.keys(acc).includes(key)
      );

      return {
        status: 500,
        msg: `Keys are missing: [${unknownKeys}]`,
      };
    }
  }

  let missingKeyFound = null;

  requiredKeys.forEach((key: any) => {
    // each required key must exist in the given
    if (!Object.keys(acc).includes(key)) {
      missingKeyFound = key;
    }
  });

  if (missingKeyFound) {
    return { status: 500, msg: `${missingKeyFound} is missing` };
  }

  return { status: 200, msg: 'OK' };
};
