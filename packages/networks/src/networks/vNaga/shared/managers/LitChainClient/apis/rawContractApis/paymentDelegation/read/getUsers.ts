import { z } from 'zod';
import { logger } from '../../../../../../../../shared/logger';
import { DefaultNetworkConfig } from '../../../../../../../shared/interfaces/NetworkContext';
import { createContractsManager } from '../../../../../contract-manager/createContractsManager';
import { ExpectedAccountOrWalletClient } from '../../../../../contract-manager/createContractsManager';

// Schema for validating the request
const getUsersSchema = z.object({
  payerAddress: z
    .string()
    .regex(/^0x[a-fA-F0-9]{40}$/, 'Invalid Ethereum address'),
});

export type GetUsersRequest = z.infer<typeof getUsersSchema>;

/**
 * Get users for a payer from the PaymentDelegation contract
 * @param request - Object containing payerAddress
 * @param networkCtx - Network context for contract interactions
 * @param accountOrWalletClient - Account or wallet client for the transaction
 * @returns Array of user addresses
 */
export async function getUsers(
  request: GetUsersRequest,
  networkCtx: DefaultNetworkConfig,
  accountOrWalletClient: ExpectedAccountOrWalletClient
): Promise<string[]> {
  const validatedRequest = getUsersSchema.parse(request);
  logger.debug({ validatedRequest });

  const { paymentDelegationContract } = createContractsManager(
    networkCtx,
    accountOrWalletClient
  );

  const users = await paymentDelegationContract.read.getUsers([
    validatedRequest.payerAddress,
  ]);
  return users;
}
