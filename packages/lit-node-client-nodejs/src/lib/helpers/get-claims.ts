import { ethers } from 'ethers';

import { ClaimsList, Signature } from '@lit-protocol/types';

/**
 * Retrieves the claims from an array of objects and organizes them into a record.
 * Each claim is associated with its corresponding signatures and derived key ID.
 *
 * @param claims - An array of objects representing the claims.
 * @returns A record where each key represents a claim, and the value is an object containing the claim's signatures and derived key ID.
 */
export const getClaims = (
  claims: ClaimsList
): Record<string, { signatures: Signature[]; derivedKeyId: string }> => {
  const keys: string[] = Object.keys(claims[0]);
  const signatures: Record<string, Signature[]> = {};
  const claimRes: Record<
    string,
    { signatures: Signature[]; derivedKeyId: string }
  > = {};

  for (const key of keys) {
    const claimSet: { signature: string; derivedKeyId: string }[] = claims.map(
      (c) => c[key]
    );
    signatures[key] = [];
    claimSet.map((c) => {
      const sig = ethers.utils.splitSignature(`0x${c.signature}`);
      const convertedSig = {
        r: sig.r,
        s: sig.s,
        v: sig.v,
      };
      signatures[key].push(convertedSig);
    });

    claimRes[key] = {
      signatures: signatures[key],
      derivedKeyId: claimSet[0].derivedKeyId,
    };
  }

  return claimRes;
};
