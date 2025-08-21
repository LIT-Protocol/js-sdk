// import { networkContext } from "../../../_config";
import { z } from 'zod';
import { logger } from '../../../../../../../../shared/logger';
import { toBigInt } from '../../../../../../../../shared/utils/z-transformers';
import { DefaultNetworkConfig } from '../../../../../../../shared/interfaces/NetworkContext';
import {
  createContractsManager,
  ExpectedAccountOrWalletClient,
} from '../../../../../contract-manager/createContractsManager';

const getPermittedAddressesSchema = z.object({
  tokenId: toBigInt,
});

type GetPermittedAddressesRequest = z.input<typeof getPermittedAddressesSchema>;

/**
 * Get permitted addresses for a PKP token
 * @param request - Object containing tokenId
 * @param networkCtx - Network context for contract interactions
 * @returns Array of permitted addresses for the PKP token
 */
export async function getPermittedAddresses(
  request: GetPermittedAddressesRequest,
  networkCtx: DefaultNetworkConfig,
  accountOrWalletClient: ExpectedAccountOrWalletClient
): Promise<readonly `0x${string}`[]> {
  const validatedRequest = getPermittedAddressesSchema.parse(request);
  logger.debug({ validatedRequest });

  const { pkpPermissionsContract } = createContractsManager(
    networkCtx,
    accountOrWalletClient
  );
  const res = await pkpPermissionsContract.read.getPermittedAddresses([
    validatedRequest.tokenId,
  ]);

  return res;
}

// Example usage when running as main
// if (import.meta.main) {
//   const networkCtx = networkContext;

//   const res = await getPermittedAddresses(
//     {
//       tokenId:
//         "76136736151863037541847315168980811654782785653773679312890341037699996601290",
//     },
//     networkCtx
//   );
//   console.log("permittedAddresses", res);
// }
