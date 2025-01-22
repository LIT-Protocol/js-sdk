import { LIT_CURVE_VALUES } from '@lit-protocol/constants';
import { EcdsaSignedMessageShareParsed, PKPSignEndpointResponse } from '@lit-protocol/types';

/**
 * Converts a snake_case string to camelCase.
 * @param s The snake_case string to convert.
 * @returns The camelCase version of the input string.
 *
 * @example
 * snakeToCamel('hello_world') // 'helloWorld'
 */
export const snakeToCamel = (s: string): string =>
  s.replace(/(_\w)/g, (m) => m[1].toUpperCase());

/**
 * Converts the keys of an object from snake_case to camelCase.
 *
 * @param obj - The object whose keys need to be converted.
 * @returns The object with keys converted to camelCase.
 */
export const convertKeysToCamelCase = (obj: { [key: string]: any }): any =>
  Object.keys(obj).reduce(
    (acc, key) => ({
      ...acc,
      [snakeToCamel(key)]: obj[key],
    }),
    {}
  );

/**
 * Removes double quotes from string values in an object.
 * @param obj - The object to clean string values from.
 * @returns A new object with string values cleaned.
 */
export const cleanStringValues = (obj: { [key: string]: any }): any =>
  Object.keys(obj).reduce(
    (acc, key) => ({
      ...acc,
      [key]:
        typeof obj[key] === 'string' ? obj[key].replace(/"/g, '') : obj[key],
    }),
    {}
  );

/**
 * Parses the PKP sign response data and transforms it into a standardised format because the raw response contains snake cases and double quotes.
 * @param responseData - The response data containing PKP sign shares.
 * @returns An array of objects with the signature data.
 */
export const parsePkpSignResponse = (
  responseData: PKPSignEndpointResponse[]
): EcdsaSignedMessageShareParsed[] => {

  const ecdsaSignedMessageShares = responseData.map(({ signatureShare }) => {

    const rawShareMessage = signatureShare.EcdsaSignedMessageShare;

    const camelCaseShare = convertKeysToCamelCase(rawShareMessage);
    const parsedShareMessage = cleanStringValues(camelCaseShare);

    // Rename `digest` to `dataSigned`
    if (parsedShareMessage.digest) {
      parsedShareMessage.dataSigned = parsedShareMessage.digest;
    }

    delete parsedShareMessage.result;

    return parsedShareMessage;
  });

  return ecdsaSignedMessageShares;
};
