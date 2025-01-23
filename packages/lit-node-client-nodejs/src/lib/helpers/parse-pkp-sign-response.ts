import {
  EcdsaSignedMessageShareParsed,
  PKPSignEndpointResponse,
} from '@lit-protocol/types';

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

    // Determine if the object is lifted or contains a nested structure
    // Example scenarios this logic handles:
    // 1. If `signatureShare` is nested (e.g., { EcdsaSignedMessageShare: { ... } }), 
    //    it will extract the nested object (i.e., the value of `EcdsaSignedMessageShare`).
    //    NOTE: against `f8047310fd4ac97ac01ff07a7cd1213808a3396e` in this case 
    // 2. If `signatureShare` is directly lifted (e.g., { digest: "...", result: "...", share_id: "..." }),
    //    it will treat `signatureShare` itself as the resolved object.
    //    NOTE: against `60318791258d273df8209b912b386680d25d0df3` in this case 
    // 3. If `signatureShare` is null, not an object, or does not match expected patterns, 
    //    it will throw an error later for invalid structure.
    const resolvedShare =
      typeof signatureShare === "object" &&
        !Array.isArray(signatureShare) &&
        Object.keys(signatureShare).length === 1 &&
        typeof signatureShare[Object.keys(signatureShare)[0] as keyof typeof signatureShare] === "object"
        ? signatureShare[Object.keys(signatureShare)[0] as keyof typeof signatureShare]
        : signatureShare;

    if (!resolvedShare || typeof resolvedShare !== "object") {
      throw new Error("Invalid signatureShare structure.");
    }

    const camelCaseShare = convertKeysToCamelCase(resolvedShare);
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
