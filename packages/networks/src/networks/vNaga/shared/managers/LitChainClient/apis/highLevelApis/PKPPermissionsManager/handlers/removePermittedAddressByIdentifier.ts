import { z } from 'zod';
import { DefaultNetworkConfig } from '../../../../../../../shared/interfaces/NetworkContext';
import {
  PkpIdentifierRaw,
  resolvePkpTokenId,
} from '../../../rawContractApis/permissions/utils/resolvePkpTokenId';
import { removePermittedAddress } from '../../../rawContractApis/permissions/write/removePermittedAddress';
import { LitTxVoid } from '../../../types';
import { ExpectedAccountOrWalletClient } from '../../../../../contract-manager/createContractsManager';

// Schema for the request
const removePermittedAddressByIdentifierSchema = z.intersection(
  z.object({
    targetAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/),
  }),
  z.union([
    z.object({ tokenId: z.string().or(z.number()).or(z.bigint()) }),
    z.object({ pubkey: z.string() }),
    z.object({ address: z.string() }),
  ])
);

type RemovePermittedAddressByIdentifierRequest = z.infer<
  typeof removePermittedAddressByIdentifierSchema
>;

/**
 * Removes a permitted address from a PKP token using various identifier types
 * @param request - Object containing either tokenId/address/pubkey and targetAddress
 * @param networkCtx - Network context for contract interactions
 * @returns Promise resolving to transaction details
 */
export async function removePermittedAddressByIdentifier(
  request: RemovePermittedAddressByIdentifierRequest,
  networkCtx: DefaultNetworkConfig,
  accountOrWalletClient: ExpectedAccountOrWalletClient
): Promise<LitTxVoid> {
  const { targetAddress, ...identifier } = request;
  const pkpTokenId = await resolvePkpTokenId(
    identifier as PkpIdentifierRaw,
    networkCtx
  );

  console.log('❌ TARGET ADDRESS:', targetAddress);
  console.log('❌ PKP TOKEN ID:', pkpTokenId);

  return removePermittedAddress(
    {
      tokenId: pkpTokenId.toString(),
      address: targetAddress,
    },
    networkCtx,
    accountOrWalletClient
  );
}

// Example usage
// if (import.meta.main) {
//   const networkCtx = networkContext;

//   const res = await removePermittedAddressByIdentifier(
//     {
//       tokenId:
//         "76136736151863037541847315168980811654782785653773679312890341037699996601290",
//       targetAddress: "0x1234567890123456789012345678901234567890",
//     },
//     networkCtx
//   );

//   console.log("res", res);
// }
