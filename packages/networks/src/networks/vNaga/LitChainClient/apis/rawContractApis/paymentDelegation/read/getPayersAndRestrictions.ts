import { z } from 'zod';
import { logger } from '../../../../../../shared/logger';
import { DefaultNetworkConfig } from '../../../../../interfaces/NetworkContext';
import { createContractsManager } from '../../../../contract-manager/createContractsManager';
import { ExpectedAccountOrWalletClient } from '../../../../contract-manager/createContractsManager';
import { Restriction } from './getRestriction';

// Schema for validating the request
const getPayersAndRestrictionsSchema = z.object({
  userAddresses: z.array(z.string().regex(/^0x[a-fA-F0-9]{40}$/, 'Invalid Ethereum address')),
});

export type GetPayersAndRestrictionsRequest = z.infer<typeof getPayersAndRestrictionsSchema>;

export interface PayersAndRestrictionsResponse {
  payers: string[][];
  restrictions: Restriction[][];
}

/**
 * Get payers and restrictions for multiple users from the PaymentDelegation contract
 * @param request - Object containing array of userAddresses
 * @param networkCtx - Network context for contract interactions
 * @param accountOrWalletClient - Account or wallet client for the transaction
 * @returns Object containing arrays of payers and restrictions
 */
export async function getPayersAndRestrictions(
  request: GetPayersAndRestrictionsRequest,
  networkCtx: DefaultNetworkConfig,
  accountOrWalletClient: ExpectedAccountOrWalletClient
): Promise<PayersAndRestrictionsResponse> {
  const validatedRequest = getPayersAndRestrictionsSchema.parse(request);
  logger.debug({ validatedRequest });

  const { paymentDelegationContract } = createContractsManager(
    networkCtx,
    accountOrWalletClient
  );
  
  const [payers, restrictions] = await paymentDelegationContract.read.getPayersAndRestrictions([validatedRequest.userAddresses]);
  return { payers, restrictions };
}