import {
  applyTransformations,
  cleanArrayValues,
  cleanStringValues,
  convertKeysToCamelCase,
  convertNumberArraysToUint8Arrays,
  hexifyStringValues,
} from '@lit-protocol/crypto';
import { PKPSignEndpointResponse, PKPSignEndpointSharesParsed } from '../types';

/**
 * Parses the PKP sign response data and transforms it into a standardised format because the raw response contains snake cases and double quotes.
 * @param responseData - The response data containing PKP sign shares.
 * @returns An array of objects with the signature data.
 */
export const parsePkpSignResponse = (
  responseData: PKPSignEndpointResponse[]
): PKPSignEndpointSharesParsed[] => {
  const parsedSignatureShares = responseData.map<PKPSignEndpointSharesParsed>(
    ({ signatureShare }) => {
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
        typeof signatureShare === 'object' &&
        !Array.isArray(signatureShare) &&
        Object.keys(signatureShare).length === 1 &&
        typeof signatureShare[
          Object.keys(signatureShare)[0] as keyof typeof signatureShare
        ] === 'object'
          ? signatureShare[
              Object.keys(signatureShare)[0] as keyof typeof signatureShare
            ]
          : signatureShare;

      if (!resolvedShare || typeof resolvedShare !== 'object') {
        throw new Error('Invalid signatureShare structure.');
      }

      const transformations = [
        convertKeysToCamelCase,
        cleanArrayValues,
        convertNumberArraysToUint8Arrays,
        cleanStringValues,
        hexifyStringValues,
      ];
      const parsedShare = applyTransformations(resolvedShare, transformations);

      // Frost has `message`, Ecdsa has `digest`. Copy both to `dataSigned`
      if (parsedShare['digest'] || parsedShare['message']) {
        parsedShare['dataSigned'] =
          parsedShare['digest'] || parsedShare['message'];
      }

      delete parsedShare['result'];

      return parsedShare as unknown as PKPSignEndpointSharesParsed;
    }
  );

  return parsedSignatureShares;
};
