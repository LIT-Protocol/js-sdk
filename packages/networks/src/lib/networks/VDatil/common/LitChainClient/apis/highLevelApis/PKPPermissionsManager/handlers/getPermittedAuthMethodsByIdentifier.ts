import { DatilContext } from '../../../../../../types';
import { logger } from '@lit-protocol/logger';
import {
  AuthMethod,
  getPermittedAuthMethods,
} from '../../../rawContractApis/permissions/read/getPermittedAuthMethods';
import {
  PkpIdentifierRaw,
  resolvePkpTokenId,
} from '../../../rawContractApis/permissions/utils/resolvePkpTokenId';
import { datilDevNetworkContext } from '../../../../../../datil-dev/networkContext';

/**
 * Get permitted authentication methods for a PKP token using various identifier types
 * @param identifier - Object containing either tokenId, address, or pubkey
 * @param networkCtx - Network context for contract interactions
 * @returns Array of permitted authentication methods for the PKP token
 */
export async function getPermittedAuthMethodsByIdentifier(
  identifier: PkpIdentifierRaw,
  networkCtx: DatilContext
): Promise<readonly AuthMethod[]> {
  logger.debug({ identifier });

  const pkpTokenId = await resolvePkpTokenId(identifier, networkCtx);
  return getPermittedAuthMethods(
    { tokenId: pkpTokenId.toString() },
    networkCtx
  );
}

// // Example usage when running as main
// if (import.meta.main) {
//   const networkCtx = datilDevNetworkContext;

//   const res = await getPermittedAuthMethodsByIdentifier(
//     {
//       // tokenId: "76136736151863037541847315168980811654782785653773679312890341037699996601290",
//       // pubkey: "0x000",
//       address: '0xef3eE1bD838aF5B36482FAe8a6Fc394C68d5Fa9F',
//     },
//     networkCtx
//   );
//   console.log('permittedAuthMethods', res);
// }
