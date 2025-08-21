import { z } from 'zod';
import { DefaultNetworkConfig } from '../../../../../../../shared/interfaces/NetworkContext';
import { ScopeStringSchema } from '../../../../schemas/shared/ScopeSchema';
import {
  PkpIdentifierRaw,
  resolvePkpTokenId,
} from '../../../rawContractApis/permissions/utils/resolvePkpTokenId';
import { addPermittedAuthMethod } from '../../../rawContractApis/permissions/write/addPermittedAuthMethod';
import { LitTxVoid } from '../../../types';
import { ExpectedAccountOrWalletClient } from '../../../../../contract-manager/createContractsManager';

// Schema for the request
const addPermittedAuthMethodByIdentifierSchema = z.intersection(
  z.object({
    authMethodType: z.string().or(z.number()).or(z.bigint()),
    authMethodId: z.string(),
    userPubkey: z.string(),
    scopes: z.array(ScopeStringSchema),
  }),
  z.union([
    z.object({ tokenId: z.string().or(z.number()).or(z.bigint()) }),
    z.object({ pubkey: z.string() }),
    z.object({ address: z.string() }),
  ])
);

type AddPermittedAuthMethodByIdentifierRequest = z.infer<
  typeof addPermittedAuthMethodByIdentifierSchema
>;

/**
 * Adds a permitted authentication method to a PKP token using various identifier types
 * @param request - Object containing either tokenId/address/pubkey, authMethodType, authMethodId, userPubkey, and scopes
 * @param networkCtx - Network context for contract interactions
 * @param accountOrWalletClient - Account or wallet client for signing
 * @returns Promise resolving to transaction details
 */
export async function addPermittedAuthMethodByIdentifier(
  request: AddPermittedAuthMethodByIdentifierRequest,
  networkCtx: DefaultNetworkConfig,
  accountOrWalletClient: ExpectedAccountOrWalletClient
): Promise<LitTxVoid> {
  const { authMethodType, authMethodId, userPubkey, scopes, ...identifier } =
    request;
  const pkpTokenId = await resolvePkpTokenId(
    identifier as PkpIdentifierRaw,
    networkCtx
  );

  return addPermittedAuthMethod(
    {
      tokenId: pkpTokenId.toString(),
      authMethodType: authMethodType.toString(),
      id: authMethodId,
      userPubkey,
      scopes,
    },
    networkCtx,
    accountOrWalletClient
  );
}

// Example usage
// if (import.meta.main) {
//   const networkCtx = networkContext;

//   const res = await addPermittedAuthMethodByIdentifier(
//     {
//       tokenId:
//         "76136736151863037541847315168980811654782785653773679312890341037699996601290",
//       authMethodType: 1, // AuthMethodType.EthWallet
//       authMethodId: "0x1234567890abcdef1234567890abcdef12345678",
//       userPubkey: "0x04abcdef...",
//       scopes: ["sign-anything"],
//     },
//     networkCtx,
//     accountOrWalletClient
//   );

//   console.log("res", res);
// }
