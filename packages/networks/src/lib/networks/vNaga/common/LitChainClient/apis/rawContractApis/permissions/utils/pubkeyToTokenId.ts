import { hexToBigInt, keccak256, toBytes } from "viem";

/**
 * Convert a public key to a token ID
 * @param pubkey - The public key to convert
 * @returns The token ID
 *
 * NOTE: code converted from:
 * https://github.com/LIT-Protocol/lit-assets/blob/167d6908acc09c0aebdb6909f703b83921da4400/rust/lit-node/lit-node/src/utils/web.rs#L788-L802
 */
export function pubkeyToTokenId(pubkey: string): bigint {
  let pubkeyBytes: Uint8Array;
  try {
    pubkeyBytes = toBytes(pubkey);
  } catch (e) {
    throw new Error(
      `Conversion error: ${e instanceof Error ? e.message : String(e)}`
    );
  }

  if (pubkeyBytes.length !== 65) {
    throw new Error(
      `Invalid pubkey length. Expected 65 bytes, got ${pubkeyBytes.length}`
    );
  }

  // this is what the original code did, but it returns a hex string instead of a bigint
  // const tokenId = toHex(keccak256(pubkeyBytes));
  const tokenId = hexToBigInt(keccak256(pubkeyBytes));
  return tokenId;
}
