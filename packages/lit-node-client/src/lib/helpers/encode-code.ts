/**
 * Encodes the given code string into base64 format.
 *
 * @param code - The code string to be encoded.
 * @returns The encoded code string in base64 format.
 */
export const encodeCode = (code: string) => {
  return Buffer.from(code, 'utf8').toString('base64');
};
