import { z } from 'zod';
import { logger } from '../../../../../../shared/logger';
import { isIpfsCidV0 } from '../../../../../../shared/utils/z-validate';
import { DefaultNetworkConfig } from '../../../../../interfaces/NetworkContext';
import { isPermittedAction } from '../../../rawContractApis/permissions/read/isPermittedAction';
import {
  PkpIdentifierRaw,
  resolvePkpTokenId,
} from '../../../rawContractApis/permissions/utils/resolvePkpTokenId';
import { ExpectedAccountOrWalletClient } from '@vNaga/LitChainClient/contract-manager/createContractsManager';

// Schema for validating the request parameters
const isPermittedActionByIdentifierSchema = z.intersection(
  z.object({
    ipfsId: isIpfsCidV0,
  }),
  z.union([
    z.object({ tokenId: z.string().or(z.number()).or(z.bigint()) }),
    z.object({ pubkey: z.string() }),
    z.object({ address: z.string() }),
  ])
);

type IsPermittedActionByIdentifierRequest = z.infer<
  typeof isPermittedActionByIdentifierSchema
>;

/**
 * Check if an action is permitted for a PKP token using various identifier types
 * @param request - Object containing either tokenId/address/pubkey and ipfsId
 * @param networkCtx - Network context for contract interactions
 * @returns Promise resolving to boolean indicating if the action is permitted
 */
export async function isPermittedActionByIdentifier(
  request: IsPermittedActionByIdentifierRequest,
  networkCtx: DefaultNetworkConfig,
  accountOrWalletClient: ExpectedAccountOrWalletClient
): Promise<boolean> {
  logger.debug({ request });

  const { ipfsId, ...identifier } = request;
  const pkpTokenId = await resolvePkpTokenId(
    identifier as PkpIdentifierRaw,
    networkCtx,
    accountOrWalletClient
  );

  return isPermittedAction(
    {
      tokenId: pkpTokenId.toString(),
      ipfsId,
    },
    networkCtx,
    accountOrWalletClient
  );
}

// Example usage when running as main
// if (import.meta.main) {
//   const networkCtx = networkContext;

//   const res = await isPermittedActionByIdentifier(
//     {
//       tokenId:
//         "76136736151863037541847315168980811654782785653773679312890341037699996601290",
//       // pubkey: "0x000",
//       // address: "0xef3eE1bD838aF5B36482FAe8a6Fc394C68d5Fa9F",
//       ipfsId: "QmS4ghgMgPXR6fYW5tP4Y8Q22hF57kFnUJ9y4DgUJz1234",
//     },
//     networkCtx
//   );
//   console.log("Is action permitted:", res);
// }
