import { z } from 'zod';
import { hexPrefixed, safeBigInt } from './transformers';

// Transform a number or string to a BigInt
// eg. "2" or 2 -> 2n
export const toBigInt = z
  .union([z.string(), z.number()])
  .transform((n) => safeBigInt(n));

// Transform a number/string or array of numbers/strings to an array of BigInts
// eg. "1" -> [1n]
// eg. [1, "2", 3] -> [1n, 2n, 3n]
export const toBigIntArray = z
  .union([z.string(), z.number(), z.array(z.union([z.string(), z.number()]))])
  .transform((val) => {
    if (Array.isArray(val)) {
      return val.map(safeBigInt);
    }
    return [safeBigInt(val)];
  });

// Transform a string to a hex string type
// eg. "123" -> "0x123"
export const toHexString = z.string().transform((s) => hexPrefixed(s));

// Transform a string or array of strings to an array of hex strings
// eg. undefined -> ["0x"]
// eg. "123" -> ["0x123"]
// eg. ["123", "456"] -> ["0x123", "0x456"]
export const toHexStringArray = z
  .union([z.string(), z.array(z.string()), z.undefined()])
  .transform((val) => {
    if (!val) return [hexPrefixed('')];
    if (Array.isArray(val)) {
      return val.map(hexPrefixed);
    }
    return [hexPrefixed(val)];
  });

// Transform arrays of numbers/strings to arrays of arrays of BigInts
// eg. undefined -> [[]]
// eg. [[1, "2"], ["3", 4]] -> [[1n, 2n], [3n, 4n]]
export const toBigIntMatrix = z
  .union([
    z.array(z.array(z.union([z.string(), z.number(), z.bigint()]))),
    z.undefined(),
  ])
  .transform((val) => {
    if (!val) return [[]];
    return val.map((inner) =>
      inner.map((v) => (typeof v === 'bigint' ? v : safeBigInt(v)))
    );
  });

// Transform undefined or boolean to boolean
// eg. undefined -> false
// eg. true -> true
export const toBoolean = z
  .union([z.boolean(), z.undefined()])
  .transform((val) => Boolean(val ?? false));

// Transform a number or string to a number
// eg. "2" -> 2
// eg. 2n -> 2
export const toNumber = z
  .union([z.bigint(), z.number(), z.string()])
  .transform((val) => {
    return Number(val);
  });
