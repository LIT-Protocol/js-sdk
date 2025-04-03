import { ClaimsList, NodeShare } from '@lit-protocol/types';

/**
 * Retrieves a list of claims from the provided response data.
 * @param responseData The response data containing the claims.
 * @returns An array of claims.
 */
export const getClaimsList = (responseData: NodeShare[]): ClaimsList => {
  const claimsList = responseData
    .map((r) => {
      const { claimData } = r;
      if (claimData) {
        for (const key of Object.keys(claimData)) {
          for (const subkey of Object.keys(claimData[key])) {
            if (typeof claimData[key][subkey] == 'string') {
              claimData[key][subkey] = claimData[key][subkey].replaceAll(
                '"',
                ''
              );
            }
          }
        }
        return claimData;
      }
      return null;
    })
    .filter((item) => item !== null);

  return claimsList as unknown as ClaimsList;
};
