import { z } from 'zod';
import { logger } from '../../../../../../shared/logger';
import { DefaultNetworkConfig } from '../../../../../interfaces/NetworkContext';
import { createContractsManager } from '../../../../contract-manager/createContractsManager';
import { ExpectedAccountOrWalletClient } from '../../../../contract-manager/createContractsManager';

// Schema for validating the request
const getPayersSchema = z.object({
  userAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/, 'Invalid Ethereum address'),
});

export type GetPayersRequest = z.infer<typeof getPayersSchema>;

/**
 * Get payers for a user from the PaymentDelegation contract
 * @param request - Object containing userAddress
 * @param networkCtx - Network context for contract interactions
 * @param accountOrWalletClient - Account or wallet client for the transaction
 * @returns Array of payer addresses
 */
export async function getPayers(
  request: GetPayersRequest,
  networkCtx: DefaultNetworkConfig,
  accountOrWalletClient: ExpectedAccountOrWalletClient
): Promise<string[]> {
  const validatedRequest = getPayersSchema.parse(request);
  logger.debug({ validatedRequest });

  const { paymentDelegationContract } = createContractsManager(
    networkCtx,
    accountOrWalletClient
  );
  
  const payers = await paymentDelegationContract.read.getPayers([validatedRequest.userAddress]);
  return payers;
}