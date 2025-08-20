import { z } from 'zod';
import { DefaultNetworkConfig } from '../../../../../../../shared/interfaces/NetworkContext';
import {
  PkpIdentifierRaw,
  resolvePkpTokenId,
} from '../../../rawContractApis/permissions/utils/resolvePkpTokenId';
import { removePermittedAuthMethod } from '../../../rawContractApis/permissions/write/removePermittedAuthMethod';
import { LitTxVoid } from '../../../types';
import { ExpectedAccountOrWalletClient } from '../../../../../contract-manager/createContractsManager';

// Schema for the request
const removePermittedAuthMethodByIdentifierSchema = z.intersection(
  z.object({
    authMethodType: z.string().or(z.number()).or(z.bigint()),
    authMethodId: z.string(), // The id field from the contract
  }),
  z.union([
    z.object({ tokenId: z.string().or(z.number()).or(z.bigint()) }),
    z.object({ pubkey: z.string() }),
    z.object({ address: z.string() }),
  ])
);

type RemovePermittedAuthMethodByIdentifierRequest = z.infer<
  typeof removePermittedAuthMethodByIdentifierSchema
>;

/**
 * Removes a permitted authentication method from a PKP token using various identifier types
 * @param request - Object containing either tokenId/address/pubkey, authMethodType, and authMethodId
 * @param networkCtx - Network context for contract interactions
 * @param accountOrWalletClient - Account or wallet client for signing
 * @returns Promise resolving to transaction details
 */
export async function removePermittedAuthMethodByIdentifier(
  request: RemovePermittedAuthMethodByIdentifierRequest,
  networkCtx: DefaultNetworkConfig,
  accountOrWalletClient: ExpectedAccountOrWalletClient
): Promise<LitTxVoid> {
  const { authMethodType, authMethodId, ...identifier } = request;
  const pkpTokenId = await resolvePkpTokenId(
    identifier as PkpIdentifierRaw,
    networkCtx
  );

  // console.log('❌ AUTH METHOD TYPE:', authMethodType);
  // console.log('❌ AUTH METHOD ID:', authMethodId);
  // console.log('❌ PKP TOKEN ID:', pkpTokenId);

  return removePermittedAuthMethod(
    {
      tokenId: pkpTokenId.toString(),
      authMethodType: authMethodType.toString(),
      id: authMethodId,
    },
    networkCtx,
    accountOrWalletClient
  );
}

// Example usage
// if (import.meta.main) {
//   const networkCtx = networkContext;

//   const res = await removePermittedAuthMethodByIdentifier(
//     {
//       tokenId:
//         "76136736151863037541847315168980811654782785653773679312890341037699996601290",
//       authMethodType: 1, // AuthMethodType.EthWallet
//       authMethodId: "0x1234567890abcdef1234567890abcdef12345678",
//     },
//     networkCtx,
//     accountOrWalletClient
//   );

//   console.log("res", res);
// }
