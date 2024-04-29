import { log } from '@lit-protocol/misc';
import { BlsResponseData } from '@lit-protocol/types';

/**
 * Handles the response data from BLS  signature scheme.
 * @param responseData - The response data from BLS signature scheme.
 * @returns An array of signed data.
 * @throws Error if no data is provided.
 */
export function handleBlsResponseData(
  responseData: BlsResponseData[]
): string[] {
  if (!responseData) {
    throw new Error('[handleBlsResponseData] No data provided');
  }

  const signatureShares = responseData.map((s) => ({
    ProofOfPossession: s.signatureShare.ProofOfPossession,
  }));
  log(`[handleBlsResponseData] signatureShares:`, signatureShares);

  if (!signatureShares || signatureShares.length <= 0) {
    throw new Error('[handleBlsResponseData] No signature shares provided');
  }

  const signedDataList = responseData.map((s) => s.dataSigned);
  log(`[handleBlsResponseData] signedDataList:`, signedDataList);

  return signedDataList;
}
