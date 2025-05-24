import { ExpectedAccountOrWalletClient } from '../../../../contract-manager/createContractsManager';
import { logger } from '../../../../../../shared/logger';
import { DefaultNetworkConfig } from '../../../../../interfaces/NetworkContext';
import { getPermittedActions } from '../../../rawContractApis/permissions/read/getPermittedActions';
import { getPermittedAddresses } from '../../../rawContractApis/permissions/read/getPermittedAddresses';
import {
  AuthMethod,
  getPermittedAuthMethods,
} from '../../../rawContractApis/permissions/read/getPermittedAuthMethods';
import {
  PkpIdentifierRaw,
  resolvePkpTokenId,
} from '../../../rawContractApis/permissions/utils/resolvePkpTokenId';
import { getPermittedAuthMethodScopes } from '../../../rawContractApis/permissions/read/getPermittedAuthMethodScopes';

export interface PermissionsContext {
  actions: readonly `0x${string}`[];
  addresses: readonly `0x${string}`[];
  authMethods: readonly AuthMethod[];
  scopes: readonly boolean[];
  isActionPermitted: (ipfsId: `0x${string}`) => boolean;
  isAddressPermitted: (address: `0x${string}`) => boolean;
  isAuthMethodPermitted: (
    authMethodType: number,
    authMethodId: string
  ) => boolean;
}

/**
 * Fetches and returns the current permissions context for a PKP
 * @param identifier - Any valid PKP identifier (tokenId, pubkey, or address)
 * @param networkCtx - Network context
 */
export async function getPermissionsContext(
  identifier: PkpIdentifierRaw,
  networkCtx: DefaultNetworkConfig,
  accountOrWalletClient: ExpectedAccountOrWalletClient
): Promise<PermissionsContext> {
  // Resolve the identifier to a tokenId
  const tokenId = (await resolvePkpTokenId(identifier, networkCtx)).toString();
  logger.debug({ identifier, tokenId }, 'Loading permissions');

  // Fetch all permissions in parallel
  const [actions, addresses, authMethods] = await Promise.all([
    getPermittedActions({ tokenId }, networkCtx, accountOrWalletClient),
    getPermittedAddresses({ tokenId }, networkCtx, accountOrWalletClient),
    getPermittedAuthMethods({ tokenId }, networkCtx, accountOrWalletClient),
  ]);

  // for each auth method, get the scopes
  const scopes = await Promise.all(
    authMethods.map((authData) =>
      getPermittedAuthMethodScopes(
        {
          authMethodType: authData.authMethodType,
          authMethodId: authData.id,
          tokenId: tokenId,
        },
        networkCtx,
        accountOrWalletClient
      )
    )
  );

  logger.debug(
    {
      identifier,
      tokenId,
      actionCount: actions.length,
      addressCount: addresses.length,
      authMethodCount: authMethods.length,
    },
    'Permissions loaded'
  );

  return {
    actions,
    addresses,
    authMethods,
    scopes: scopes.flat(),
    isActionPermitted: (ipfsId: `0x${string}`) => actions.includes(ipfsId),
    isAddressPermitted: (address: `0x${string}`) =>
      addresses.some((addr) => addr.toLowerCase() === address.toLowerCase()),
    isAuthMethodPermitted: (authMethodType: number, authMethodId: string) =>
      authMethods.some(
        (method) =>
          method.authMethodType === BigInt(authMethodType) &&
          method.id.toLowerCase() === authMethodId.toLowerCase()
      ),
  };
}

// Example usage
// if (import.meta.main) {
// const networkCtx = networkContext;
// async function example() {
//   // Can use any of these identifiers:
//   const ctx = await getPermissionsContext(
//     {
//       tokenId:
//         "76136736151863037541847315168980811654782785653773679312890341037699996601290",
//     },
//     networkCtx
//   );
//   // Check current permissions
//   const isActionAllowed = ctx.isActionPermitted("0x1234..." as `0x${string}`);
//   const isAddressAllowed = ctx.isAddressPermitted(
//     "0x5678..." as `0x${string}`
//   );
//   const isAuthMethodAllowed = ctx.isAuthMethodPermitted(
//     1, // AuthMethodType.EthWallet
//     "0x1234567890abcdef1234567890abcdef12345678"
//   );
//   console.log("Action permitted:", isActionAllowed);
//   console.log("Address permitted:", isAddressAllowed);
//   console.log("Auth method permitted:", isAuthMethodAllowed);
//   console.log("All permitted actions:", ctx.actions);
//   console.log("All permitted addresses:", ctx.addresses);
//   console.log("All permitted auth methods:", ctx.authMethods);
// }
// example().catch(console.error);
// }
