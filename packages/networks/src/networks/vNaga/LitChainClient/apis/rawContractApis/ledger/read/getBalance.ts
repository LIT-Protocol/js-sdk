import { z } from 'zod';
import { logger } from '../../../../../../shared/logger';
import { DefaultNetworkConfig } from '../../../../../interfaces/NetworkContext';
import { createContractsManager } from '../../../../contract-manager/createContractsManager';
import { ExpectedAccountOrWalletClient } from '../../../../contract-manager/createContractsManager';

// Schema for validating the request
const getBalanceSchema = z.object({
  userAddress: z
    .string()
    .regex(/^0x[a-fA-F0-9]{40}$/, 'Invalid Ethereum address'),
});

export type GetBalanceRequest = z.infer<typeof getBalanceSchema>;

/**
 * Get balance for a user from the Ledger contract
 * @param request - Object containing userAddress
 * @param networkCtx - Network context for contract interactions
 * @param accountOrWalletClient - Account or wallet client for the transaction
 * @returns The user's balance as a bigint
 */
export async function getBalance(
  request: GetBalanceRequest,
  networkCtx: DefaultNetworkConfig,
  accountOrWalletClient: ExpectedAccountOrWalletClient
): Promise<bigint> {
  const validatedRequest = getBalanceSchema.parse(request);
  logger.debug({ validatedRequest });

  const { ledgerContract } = createContractsManager(
    networkCtx,
    accountOrWalletClient
  );

  const balance = await ledgerContract.read.balance([
    validatedRequest.userAddress,
  ]);
  return balance;
}
