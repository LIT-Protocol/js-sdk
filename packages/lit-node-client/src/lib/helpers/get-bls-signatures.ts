import { BlsResponseData, BlsSignatureShare } from '@lit-protocol/types';

/**
 * Get the BLS signatures from the response data.
 * @param responseData - The response data from BLS signature scheme.
 * @returns An array of BLS signatures.
 * @throws Error if no data is provided.
 */
export function getBlsSignatures(
  responseData: BlsResponseData[]
): BlsSignatureShare[] {
  if (!responseData) {
    throw new Error('[getBlsSignatures] No data provided');
  }

  const signatureShares = responseData.map((s) => ({
    ProofOfPossession: {
      identifier: s.signatureShare.ProofOfPossession.identifier,
      value: s.signatureShare.ProofOfPossession.value,
    },
  }));

  if (!signatureShares || signatureShares.length <= 0) {
    throw new Error('[getBlsSignatures] No signature shares provided');
  }

  return signatureShares;
}
