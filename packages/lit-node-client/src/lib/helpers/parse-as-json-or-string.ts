import { getChildLogger } from '@lit-protocol/logger';

const logger = getChildLogger({ module: 'parseAsJsonOrString' });

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
    logger.info(
      '[parseResponses] Error parsing response as json.  Swallowing and returning as string.',
      responseString
    );
    return responseString;
  }
};
