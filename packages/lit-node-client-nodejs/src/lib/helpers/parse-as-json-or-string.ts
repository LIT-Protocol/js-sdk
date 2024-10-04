import { log } from '@lit-protocol/misc';

/**
 * Parses a response string into a JS object.
 *
 * @param responseString - The response string to parse.
 * @returns The parsed response object.
 */
export const parseAsJsonOrString = (
  responseString: string
): object | string => {
  try {
    return JSON.parse(responseString);
  } catch (e) {
    return responseString;
  }
};
