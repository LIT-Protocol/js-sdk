import { applyTransformations, cleanStringValues } from '@lit-protocol/misc';
import { ClaimsList, ExecuteJsValueResponse } from '@lit-protocol/types';

/**
 * Retrieves a list of claims from the provided response data.
 * @param responseData The response data containing the claims.
 * @returns An array of claims.
 */
export const getClaimsList = (
  responseData: ExecuteJsValueResponse[]
): ClaimsList => {
  const claimsList = responseData
    .map((rd) => applyTransformations(rd.claimData, [cleanStringValues]))
    .filter((item) => item !== null);

  return claimsList as unknown as ClaimsList;
};
