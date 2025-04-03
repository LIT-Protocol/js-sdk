import { Hex } from '@lit-protocol/types';

/**
 *
 * Convert number to hex
 * @param { number } v
 * @return { string } hex value prefixed with 0x
 */
export const numberToHex = (v: number): Hex => {
  return `0x${v.toString(16)}`;
};

/**
 * Adds a '0x' prefix to a string if it doesn't already have one.
 * @param str - The input string.
 * @returns The input string with a '0x' prefix.
 */
export const hexPrefixed = (str: string): Hex => {
  if (str.startsWith('0x')) {
    return str as Hex;
  }

  return ('0x' + str) as Hex;
};

/**
 * Removes the '0x' prefix from a hexadecimal string if it exists.
 *
 * @param str - The input string.
 * @returns The input string with the '0x' prefix removed, if present.
 */
export const removeHexPrefix = (str: string) => {
  if (str.startsWith('0x')) {
    return str.slice(2);
  }

  return str;
};
