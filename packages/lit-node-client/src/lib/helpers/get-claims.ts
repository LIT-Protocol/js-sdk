import { Signature } from '@lit-protocol/types';
import { ethers } from 'ethers';

/**
 * Retrieves the claims from an array of objects and organizes them into a record.
 * Each claim is associated with its corresponding signatures and derived key ID.
 *
 * @param claims - An array of objects representing the claims.
 * @returns A record where each key represents a claim, and the value is an object containing the claim's signatures and derived key ID.
 */
export const getClaims = (
  claims: any[]
): Record<string, { signatures: Signature[]; derivedKeyId: string }> => {
  const keys: string[] = Object.keys(claims[0]);
  const signatures: Record<string, Signature[]> = {};
  const claimRes: Record<
    string,
    { signatures: Signature[]; derivedKeyId: string }
  > = {};
  for (let i = 0; i < keys.length; i++) {
    const claimSet: { signature: string; derivedKeyId: string }[] = claims.map(
      (c) => c[keys[i]]
    );
    signatures[keys[i]] = [];
    claimSet.map((c) => {
      const sig = ethers.utils.splitSignature(`0x${c.signature}`);
      const convertedSig = {
        r: sig.r,
        s: sig.s,
        v: sig.v,
      };
      signatures[keys[i]].push(convertedSig);
    });

    claimRes[keys[i]] = {
      signatures: signatures[keys[i]],
      derivedKeyId: claimSet[0].derivedKeyId,
    };
  }
  return claimRes;
};
