import bs58 from 'bs58';
import { fromHex } from 'viem';
import { logger } from '../../../../../../shared/logger';
import { DefaultNetworkConfig } from '../../../../../interfaces/NetworkContext';
import { ExpectedAccountOrWalletClient } from '../../../../contract-manager/createContractsManager';
import { getPermittedActions } from '../../../rawContractApis/permissions/read/getPermittedActions';
import { getPermittedAddresses } from '../../../rawContractApis/permissions/read/getPermittedAddresses';
import {
  AuthMethod as BaseAuthMethod,
  getPermittedAuthMethods,
} from '../../../rawContractApis/permissions/read/getPermittedAuthMethods';
import { getPermittedAuthMethodScopes } from '../../../rawContractApis/permissions/read/getPermittedAuthMethodScopes';
import {
  PkpIdentifierRaw,
  resolvePkpTokenId,
} from '../../../rawContractApis/permissions/utils/resolvePkpTokenId';
// Extend the base AuthMethod to include scopes
export interface AuthMethod extends BaseAuthMethod {
  scopes: readonly string[];
}

export interface PermissionsContext {
  actions: readonly `0x${string}`[];
  addresses: readonly `0x${string}`[];
  authMethods: readonly AuthMethod[];
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

  // When you get the bytes from the smart contract (as hex string)
  // const hexBytes =
  //   '0x1220e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855'; // example

  // // Remove the '0x' prefix and convert hex to bytes
  // const bytes = Buffer.from(hexBytes.slice(2), 'hex');

  // // Encode to base58 to get the readable IPFS CID
  // const ipfsCid = bs58.encode(bytes);
  // console.log(ipfsCid); // QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG (example)

  // convert actions to ipfsIds
  const ipfsIds = actions.map((hexedAction) => {
    return bs58.encode(fromHex(hexedAction, 'bytes'));
  });

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

  // Create reverse mapping from index to scope name
  const SCOPE_NAMES = [
    'no-permissions',
    'sign-anything',
    'personal-sign',
  ] as const;

  // Transform boolean scope array to meaningful scope names
  const transformScopes = (
    scopeArray: readonly boolean[]
  ): readonly string[] => {
    const result: string[] = [];
    scopeArray.forEach((isEnabled, index) => {
      if (isEnabled && index < SCOPE_NAMES.length) {
        result.push(SCOPE_NAMES[index]);
      }
    });
    return result;
  };

  // Create auth methods with embedded scopes
  const authMethodsWithScopes: AuthMethod[] = authMethods.map(
    (authMethod, index) => ({
      ...authMethod,
      scopes: transformScopes(scopes[index]),
    })
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
    actions: ipfsIds as `0x${string}`[],
    addresses,
    authMethods: authMethodsWithScopes,
    isActionPermitted: (ipfsId: `0x${string}`) => actions.includes(ipfsId),
    isAddressPermitted: (address: `0x${string}`) =>
      addresses.some((addr) => addr.toLowerCase() === address.toLowerCase()),
    isAuthMethodPermitted: (authMethodType: number, authMethodId: string) =>
      authMethodsWithScopes.some(
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
//
//   // Access meaningful scope names for each auth method
//   ctx.authMethods.forEach((authMethod) => {
//     console.log(`Auth method ${authMethod.id} scopes:`, authMethod.scopes);
//     // Example output: ['sign-anything', 'personal-sign'] instead of [false, true, true]
//   });
//
//   // Find specific auth method and check if it has certain permissions
//   const specificAuthMethod = ctx.authMethods.find(
//     (method) => method.id === "0x1234..."
//   );
//   if (specificAuthMethod) {
//     console.log("Specific auth method scopes:", specificAuthMethod.scopes);
//     const canSignAnything = specificAuthMethod.scopes.includes('sign-anything');
//     const canPersonalSign = specificAuthMethod.scopes.includes('personal-sign');
//     console.log("Can sign anything:", canSignAnything);
//     console.log("Can personal sign:", canPersonalSign);
//   }
// }
// example().catch(console.error);
// }
