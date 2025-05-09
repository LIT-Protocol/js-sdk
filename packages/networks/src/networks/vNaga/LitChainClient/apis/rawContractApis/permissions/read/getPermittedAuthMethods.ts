// import { networkContext } from "../../../_config";
import { z } from 'zod';
import { logger } from '../../../../../../shared/logger';
import { toBigInt } from '../../../../../../shared/utils/z-transformers';
import { DefaultNetworkConfig } from '../../../../../interfaces/NetworkContext';
import {
  createContractsManager,
  ExpectedAccountOrWalletClient,
} from '../../../../contract-manager/createContractsManager';

const getPermittedAuthMethodsSchema = z.object({
  tokenId: toBigInt,
});

type GetPermittedAuthMethodsRequest = z.input<
  typeof getPermittedAuthMethodsSchema
>;

// Define the auth method return type
export interface AuthMethod {
  authMethodType: bigint;
  id: `0x${string}`;
  userPubkey: `0x${string}`;
}

/**
 * Get permitted authentication methods for a PKP token
 * @param request - Object containing tokenId
 * @param networkCtx - Network context for contract interactions
 * @returns Array of permitted authentication methods for the PKP token
 */
export async function getPermittedAuthMethods(
  request: GetPermittedAuthMethodsRequest,
  networkCtx: DefaultNetworkConfig,
  accountOrWalletClient: ExpectedAccountOrWalletClient
): Promise<readonly AuthMethod[]> {
  const validatedRequest = getPermittedAuthMethodsSchema.parse(request);
  logger.debug({ validatedRequest });

  const { pkpPermissionsContract } = createContractsManager(
    networkCtx,
    accountOrWalletClient
  );
  const res = await pkpPermissionsContract.read.getPermittedAuthMethods([
    validatedRequest.tokenId,
  ]);

  return res;
}

// Example usage when running as main
// if (import.meta.main) {
//   const networkCtx = networkContext;

//   const res = await getPermittedAuthMethods(
//     {
//       tokenId:
//         "76136736151863037541847315168980811654782785653773679312890341037699996601290",
//     },
//     networkCtx
//   );
//   console.log("permittedAuthMethods", res);
// }
