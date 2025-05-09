import { DefaultNetworkConfig } from '../../../../../interfaces/NetworkContext';
import { z } from 'zod';
import {
  createContractsManager,
  ExpectedAccountOrWalletClient,
} from '../../../../contract-manager/createContractsManager';
import { logger } from '../../../../../../shared/logger';

// Schema for the request
const getPubkeyByTokenIdSchema = z.object({
  tokenId: z.string(),
});

type GetPubkeyByTokenIdRequest = z.infer<typeof getPubkeyByTokenIdSchema>;

/**
 * Retrieves the public key associated with a PKP token ID
 * @param request - Object containing the token ID
 * @param networkCtx - Network context for contract interactions
 * @returns Promise resolving to the public key as a string
 */
export async function getPubkeyByTokenId(
  request: GetPubkeyByTokenIdRequest,
  networkCtx: DefaultNetworkConfig,
  accountOrWalletClient: ExpectedAccountOrWalletClient
): Promise<string> {
  const { tokenId } = getPubkeyByTokenIdSchema.parse(request);

  logger.debug({ tokenId }, 'Fetching public key by token ID');

  // Create contract instances
  const { pubkeyRouterContract } = createContractsManager(
    networkCtx,
    accountOrWalletClient
  );

  // Convert tokenId to bigint for contract call
  const tokenIdBigInt = BigInt(tokenId);

  // Call the contract to get the public key
  const result = await pubkeyRouterContract.read.getPubkey([tokenIdBigInt]);

  // Ensure the result is a string
  const publicKey = result.toString();

  logger.debug({ tokenId, publicKey }, 'Public key fetched');

  return publicKey;
}
