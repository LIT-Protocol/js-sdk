import bs58 from 'bs58';
import { toHex } from 'viem';

/**
 * Converts a multihash (IPFS CIDv0) string to a hex string
 * @param multihash - The multihash string to convert
 * @returns The hex string
 *
 * @example
 * input: "QmSQDKRWEXZ9CGoucSTR11Mv6fhGqaytZ1MqrfHdkuS1Vg"
 * output: "0x12203c585c73d37158fa12f5b83f0af99d3d1a8072c9a5a6e3a289dc785b9da88687"
 */
export function ipfsCidV0ToHex(multihash: string) {
  const decoded = bs58.decode(multihash);
  return toHex(decoded);
}

// can be executed directly from the command line:
// bun run packages/networks/src/lib/networks/shared/utils/transformers/ipfsCidV0ToHex.ts
// if (import.meta.main) {
//   const multihash = 'QmSQDKRWEXZ9CGoucSTR11Mv6fhGqaytZ1MqrfHdkuS1Vg';
//   const bytes = ipfsCidV0ToHex(multihash);
//   console.log(bytes);
// }
