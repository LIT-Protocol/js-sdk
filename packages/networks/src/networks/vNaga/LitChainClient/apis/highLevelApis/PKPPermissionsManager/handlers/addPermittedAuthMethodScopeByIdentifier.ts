import { DefaultNetworkConfig } from '../../../../../interfaces/NetworkContext';
import { z } from 'zod';
import { toBigInt } from '../../../../../../shared/utils/z-transformers';
import {
  PkpIdentifierRaw,
  resolvePkpTokenId,
} from '../../../rawContractApis/permissions/utils/resolvePkpTokenId';
import { addPermittedAuthMethodScope } from '../../../rawContractApis/permissions/write/addPermittedAuthMethodScope';
import { LitTxVoid } from '../../../types';
import { ExpectedAccountOrWalletClient } from '../../../../contract-manager/createContractsManager';

// Schema for the request
const addPermittedAuthMethodScopeByIdentifierSchema = z.intersection(
  z.object({
    authMethodType: z.string().or(z.number()).or(z.bigint()),
    authMethodId: z.string(),
    scopeId: z.string().or(z.number()).or(z.bigint()),
  }),
  z.union([
    z.object({ tokenId: z.string().or(z.number()).or(z.bigint()) }),
    z.object({ pubkey: z.string() }),
    z.object({ address: z.string() }),
  ])
);

type AddPermittedAuthMethodScopeByIdentifierRequest = z.infer<
  typeof addPermittedAuthMethodScopeByIdentifierSchema
>;

/**
 * Adds a permitted authentication method scope to a PKP token using various identifier types
 * @param request - Object containing either tokenId/address/pubkey, authMethodType, authMethodId, and scopeId
 * @param networkCtx - Network context for contract interactions
 * @param accountOrWalletClient - Account or wallet client for signing
 * @returns Promise resolving to transaction details
 */
export async function addPermittedAuthMethodScopeByIdentifier(
  request: AddPermittedAuthMethodScopeByIdentifierRequest,
  networkCtx: DefaultNetworkConfig,
  accountOrWalletClient: ExpectedAccountOrWalletClient
): Promise<LitTxVoid> {
  const { authMethodType, authMethodId, scopeId, ...identifier } = request;
  const pkpTokenId = await resolvePkpTokenId(
    identifier as PkpIdentifierRaw,
    networkCtx
  );

  return addPermittedAuthMethodScope(
    {
      tokenId: pkpTokenId.toString(),
      authMethodType: authMethodType.toString(),
      id: authMethodId,
      scopeId: scopeId.toString(),
    },
    networkCtx,
    accountOrWalletClient
  );
}

// Example usage
// if (import.meta.main) {
//   const networkCtx = networkContext;

//   const res = await addPermittedAuthMethodScopeByIdentifier(
//     {
//       tokenId: "76136736151863037541847315168980811654782785653773679312890341037699996601290",
//       authMethodType: 1, // AuthMethodType.EthWallet
//       authMethodId: "0x1234567890abcdef1234567890abcdef12345678",
//       scopeId: 1, // Example scope ID
//     },
//     networkCtx,
//     accountOrWalletClient
//   );

//   console.log("res", res);
// }
