import { logger } from '@lit-protocol/logger';

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
    logger.warn({
      function: 'parseAsJsonOrString',
      msg: 'Error parsing response as json. Swallowing and returning as string.',
      responseString,
    });
    return responseString;
  }
};
