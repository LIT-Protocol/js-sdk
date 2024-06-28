import { LogLevel } from '@lit-protocol/constants';
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
    log(
      LogLevel.INFO,
      '[parseResponses] Error parsing response as json.  Swallowing and returning as string.',
      responseString
    );
    return responseString;
  }
};
