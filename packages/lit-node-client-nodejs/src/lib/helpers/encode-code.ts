import {
  uint8arrayFromString,
  uint8arrayToString,
} from '@lit-protocol/uint8arrays';

/**
 * Encodes the given code string into base64 format.
 *
 * @param code - The code string to be encoded.
 * @returns The encoded code string in base64 format.
 */
export const encodeCode = (code: string) => {
  const _uint8Array = uint8arrayFromString(code, 'utf8');
  const encodedJs = uint8arrayToString(_uint8Array, 'base64');

  return encodedJs;
};
