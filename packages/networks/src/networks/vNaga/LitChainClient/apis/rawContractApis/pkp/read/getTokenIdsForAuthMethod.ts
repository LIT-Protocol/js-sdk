import { z } from 'zod';
import { logger } from '../../../../../../shared/logger';
import { DefaultNetworkConfig } from '../../../../../interfaces/NetworkContext';
import {
  createContractsManager,
  ExpectedAccountOrWalletClient,
} from '../../../../contract-manager/createContractsManager';

// Schema for the request
const getTokenIdsForAuthMethodSchema = z.object({
  authMethodType: z
    .union([z.number(), z.bigint()])
    .transform((val) => BigInt(val)),
  authMethodId: z.string().startsWith('0x'),
});

type GetTokenIdsForAuthMethodRequest = z.infer<
  typeof getTokenIdsForAuthMethodSchema
>;

/**
 * Retrieves token IDs associated with a specific authentication method
 * @param request - Object containing authMethodType and authMethodId
 * @param networkCtx - Network context for contract interactions
 * @param accountOrWalletClient - Account or wallet client for contract interaction
 * @returns Promise resolving to an array of token IDs as strings
 */
export async function getTokenIdsForAuthMethod(
  request: GetTokenIdsForAuthMethodRequest,
  networkCtx: DefaultNetworkConfig,
  accountOrWalletClient: ExpectedAccountOrWalletClient
): Promise<string[]> {
  const { authMethodType, authMethodId } =
    getTokenIdsForAuthMethodSchema.parse(request);

  logger.debug(
    { authMethodType, authMethodId },
    'Fetching token IDs for auth method'
  );

  // Create contract instances
  const { pkpPermissionsContract } = createContractsManager(
    networkCtx,
    accountOrWalletClient
  );

  // Ensure authMethodId is properly typed as hex string
  const typedAuthMethodId = authMethodId as `0x${string}`;

  try {
    // Call the contract to get the token IDs
    const result = await pkpPermissionsContract.read.getTokenIdsForAuthMethod([
      authMethodType,
      typedAuthMethodId,
    ]);

    // Convert the result array to strings
    const tokenIds = result.map((tokenId: bigint) => tokenId.toString());

    logger.debug(
      { authMethodType, authMethodId, tokenIds },
      'Token IDs for auth method fetched'
    );

    return tokenIds;
  } catch (error) {
    logger.error(
      { authMethodType, authMethodId, error },
      'Error fetching token IDs for auth method'
    );
    throw new Error(`Error fetching token IDs for auth method: ${error}`);
  }
}
