import { z } from 'zod';

/**
 * @example
 * const obj = ['a', 'b', 'c']
 * ObjectMapFromArray(obj) // { a: 'a', b: 'b', c: 'c' }
 */
const ObjectMapFromArray = <T extends readonly string[]>(arr: T) => {
  return arr.reduce(
    (acc, scope) => ({ ...acc, [scope]: scope }),
    {} as { [K in T[number]]: K }
  );
};

// ----- AUTH RESOURCE TYPES
export const AUTH_RESOURCE_TYPES_VALUES = [
  'pkp-signing',
  'lit-action-execution',
  'rate-limit-increase-auth',
  'access-control-condition-signing',
  'access-control-condition-decryption',
] as const;

export const AUTH_RESOURCE_TYPES = ObjectMapFromArray(AUTH_RESOURCE_TYPES_VALUES);
export const AUTH_RESOURCE_TYPES_SCHEMA = z.enum(AUTH_RESOURCE_TYPES_VALUES);
export type AuthResourceTypes = z.infer<typeof AUTH_RESOURCE_TYPES_SCHEMA>;