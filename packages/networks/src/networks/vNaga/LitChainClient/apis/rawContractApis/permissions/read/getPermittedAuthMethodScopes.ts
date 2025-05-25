// import { networkContext } from "../../../_config";
import { z } from 'zod';
import { logger } from '../../../../../../shared/logger';
import { toBigInt } from '../../../../../../shared/utils/z-transformers';
import { DefaultNetworkConfig } from '../../../../../interfaces/NetworkContext';
import {
  createContractsManager,
  ExpectedAccountOrWalletClient,
} from '../../../../contract-manager/createContractsManager';

const getPermittedAuthMethodScopesSchema = z.object({
  tokenId: toBigInt,
  authMethodType: z.union([z.number(), z.bigint()]),
  authMethodId: z.string(),
  scopeId: z.number().optional(),
});

type GetPermittedAuthMethodScopesRequest = z.input<
  typeof getPermittedAuthMethodScopesSchema
>;

/**
 * Get permitted scopes for a specific authentication method of a PKP token
 * @param request - Object containing tokenId, authMethodType, authMethodId, and optional scopeId
 * @param networkCtx - Network context for contract interactions
 * @returns Array of boolean values indicating whether each scope is permitted
 */
export async function getPermittedAuthMethodScopes(
  request: GetPermittedAuthMethodScopesRequest,
  networkCtx: DefaultNetworkConfig,
  accountOrWalletClient: ExpectedAccountOrWalletClient
): Promise<readonly boolean[]> {
  const validatedRequest = getPermittedAuthMethodScopesSchema.parse(request);
  logger.debug({ validatedRequest });

  const { pkpPermissionsContract } = createContractsManager(
    networkCtx,
    accountOrWalletClient
  );
  const res = await pkpPermissionsContract.read.getPermittedAuthMethodScopes([
    validatedRequest.tokenId,
    BigInt(validatedRequest.authMethodType),
    validatedRequest.authMethodId as `0x${string}`,
    validatedRequest.scopeId !== undefined
      ? BigInt(validatedRequest.scopeId)
      : // 3 cus we only have 3 scopes (no permission, sign-anything, personal-sign)
        BigInt(3),
  ]);

  return res;
}

// Example usage when running as main
// if (import.meta.main) {
//   const networkCtx = networkContext;

//   const res = await getPermittedAuthMethodScopes(
//     {
//       tokenId:
//         "76136736151863037541847315168980811654782785653773679312890341037699996601290",
//       authMethodType: 1,
//       authMethodId: "0x1234567890abcdef1234567890abcdef12345678",
//       // scopeId: 0,
//     },
//     networkCtx
//   );
//   console.log("permittedAuthMethodScopes", res);
// }
