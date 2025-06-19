import { z } from 'zod';
import { logger } from '../../../../../../shared/logger';
import { DefaultNetworkConfig } from '../../../../../interfaces/NetworkContext';
import { createContractsManager } from '../../../../contract-manager/createContractsManager';
import { ExpectedAccountOrWalletClient } from '../../../../contract-manager/createContractsManager';

// Schema for validating the request
const getWithdrawRequestSchema = z.object({
  userAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/, 'Invalid Ethereum address'),
});

export type GetWithdrawRequestRequest = z.infer<typeof getWithdrawRequestSchema>;

// Type for the withdraw request structure
export interface WithdrawRequest {
  timestamp: bigint;
  amount: bigint;
}

/**
 * Get latest withdraw request for a user from the Ledger contract
 * @param request - Object containing userAddress
 * @param networkCtx - Network context for contract interactions
 * @param accountOrWalletClient - Account or wallet client for the transaction
 * @returns The user's latest withdraw request
 */
export async function getWithdrawRequest(
  request: GetWithdrawRequestRequest,
  networkCtx: DefaultNetworkConfig,
  accountOrWalletClient: ExpectedAccountOrWalletClient
): Promise<WithdrawRequest> {
  const validatedRequest = getWithdrawRequestSchema.parse(request);
  logger.debug({ validatedRequest });

  const { ledgerContract } = createContractsManager(
    networkCtx,
    accountOrWalletClient
  );
  
  const withdrawRequest = await ledgerContract.read.latestWithdrawRequest([validatedRequest.userAddress]);
  return {
    timestamp: withdrawRequest.timestamp,
    amount: withdrawRequest.amount,
  };
} 