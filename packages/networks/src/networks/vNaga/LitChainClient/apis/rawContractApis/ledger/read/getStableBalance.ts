import { z } from 'zod';
import { logger } from '../../../../../../shared/logger';
import { DefaultNetworkConfig } from '../../../../../interfaces/NetworkContext';
import { createContractsManager } from '../../../../contract-manager/createContractsManager';
import { ExpectedAccountOrWalletClient } from '../../../../contract-manager/createContractsManager';

// Schema for validating the request
const getStableBalanceSchema = z.object({
  userAddress: z
    .string()
    .regex(/^0x[a-fA-F0-9]{40}$/, 'Invalid Ethereum address'),
});

export type GetStableBalanceRequest = z.infer<typeof getStableBalanceSchema>;

/**
 * Get stable balance for a user from the Ledger contract
 * @param request - Object containing userAddress
 * @param networkCtx - Network context for contract interactions
 * @param accountOrWalletClient - Account or wallet client for the transaction
 * @returns The user's stable balance as a bigint
 */
export async function getStableBalance(
  request: GetStableBalanceRequest,
  networkCtx: DefaultNetworkConfig,
  accountOrWalletClient: ExpectedAccountOrWalletClient
): Promise<bigint> {
  const validatedRequest = getStableBalanceSchema.parse(request);
  logger.debug({ validatedRequest });

  const { ledgerContract } = createContractsManager(
    networkCtx,
    accountOrWalletClient
  );

  const stableBalance = await ledgerContract.read.stableBalance([
    validatedRequest.userAddress,
  ]);
  return stableBalance;
}
