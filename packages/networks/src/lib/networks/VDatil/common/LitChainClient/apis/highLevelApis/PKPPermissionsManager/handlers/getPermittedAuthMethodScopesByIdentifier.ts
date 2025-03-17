import { DatilContext } from 'services/lit/LitNetwork/vDatil/types';
import { logger } from 'utils/logger';
import { getPermittedAuthMethodScopes } from '../../../rawContractApis/permissions/read/getPermittedAuthMethodScopes';
import {
  PkpIdentifierRaw,
  resolvePkpTokenId,
} from '../../../rawContractApis/permissions/utils/resolvePkpTokenId';
import { datilDevNetworkContext } from 'services/lit/LitNetwork/vDatil/datil-dev/networkContext';

/**
 * Get permitted scopes for a specific authentication method of a PKP token using various identifier types
 * @param params - Parameters for the request
 * @param params.identifier - Object containing either tokenId, address, or pubkey
 * @param params.authMethodType - Type of authentication method
 * @param params.authMethodId - ID of authentication method
 * @param params.scopeId - Optional scope ID to check
 * @param networkCtx - Network context for contract interactions
 * @returns Array of boolean values indicating whether each scope is permitted
 */
export async function getPermittedAuthMethodScopesByIdentifier(
  params: {
    identifier: PkpIdentifierRaw;
    authMethodType: number;
    authMethodId: string;
    scopeId?: number;
  },
  networkCtx: DatilContext
): Promise<readonly boolean[]> {
  logger.debug({ params });

  const pkpTokenId = await resolvePkpTokenId(params.identifier, networkCtx);

  return getPermittedAuthMethodScopes(
    {
      tokenId: pkpTokenId.toString(),
      authMethodType: params.authMethodType,
      authMethodId: params.authMethodId,
      scopeId: params.scopeId,
    },
    networkCtx
  );
}

// Example usage when running as main
if (import.meta.main) {
  const networkCtx = datilDevNetworkContext;

  const res = await getPermittedAuthMethodScopesByIdentifier(
    {
      identifier: {
        // tokenId: "76136736151863037541847315168980811654782785653773679312890341037699996601290",
        // pubkey: "0x000",
        address: '0xef3eE1bD838aF5B36482FAe8a6Fc394C68d5Fa9F',
      },
      authMethodType: 1,
      authMethodId: '0x1234567890abcdef1234567890abcdef12345678',
      scopeId: 0,
    },
    networkCtx
  );
  console.log('permittedAuthMethodScopes', res);
}
