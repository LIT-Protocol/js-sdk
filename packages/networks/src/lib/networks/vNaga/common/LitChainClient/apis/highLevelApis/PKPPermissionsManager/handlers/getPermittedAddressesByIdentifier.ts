import { logger } from '../../../../../../../shared/logger';
import { NagaContext } from '../../../../../../types';
import { getPermittedAddresses } from '../../../rawContractApis/permissions/read/getPermittedAddresses';
import {
  PkpIdentifierRaw,
  resolvePkpTokenId,
} from '../../../rawContractApis/permissions/utils/resolvePkpTokenId';

/**
 * Get permitted addresses for a PKP token using various identifier types
 * @param identifier - Object containing either tokenId, address, or pubkey
 * @param networkCtx - Network context for contract interactions
 * @returns Array of permitted addresses for the PKP token
 */
export async function getPermittedAddressesByIdentifier(
  identifier: PkpIdentifierRaw,
  networkCtx: NagaContext
): Promise<readonly `0x${string}`[]> {
  logger.debug({ identifier });

  const pkpTokenId = await resolvePkpTokenId(identifier, networkCtx);
  return getPermittedAddresses({ tokenId: pkpTokenId.toString() }, networkCtx);
}

// Example usage when running as main
// if (import.meta.main) {
//   const networkCtx = networkContext;

//   const res = await getPermittedAddressesByIdentifier(
//     {
//       // tokenId: "76136736151863037541847315168980811654782785653773679312890341037699996601290",
//       // pubkey: "0x000",
//       address: "0xef3eE1bD838aF5B36482FAe8a6Fc394C68d5Fa9F",
//     },
//     networkCtx
//   );
//   console.log("permittedAddresses", res);
// }
