import { pino } from 'pino';

const logger = pino({ level: 'info', name: 'parseAsJsonOrString' });

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
