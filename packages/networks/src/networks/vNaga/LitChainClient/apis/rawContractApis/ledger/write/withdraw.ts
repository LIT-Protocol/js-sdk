import { z } from 'zod';
import { logger } from '../../../../../../shared/logger';
import { DefaultNetworkConfig } from '../../../../../interfaces/NetworkContext';
import { createContractsManager } from '../../../../contract-manager/createContractsManager';
import { ExpectedAccountOrWalletClient } from '../../../../contract-manager/createContractsManager';
import { LitTxVoid } from '../../../types';
import { callWithAdjustedOverrides } from '../../../utils/callWithAdjustedOverrides';
import { decodeLogs } from '../../../utils/decodeLogs';

// Schema for validating the request
const withdrawSchema = z.object({
  amountInWei: z.bigint().positive('Amount must be positive'),
});

export type WithdrawRequest = z.infer<typeof withdrawSchema>;

/**
 * Execute a withdrawal from the Ledger contract (after delay period)
 * @param request - Object containing amountInWei
 * @param networkCtx - Network context for contract interactions
 * @param accountOrWalletClient - Account or wallet client for the transaction
 * @returns Transaction result with hash, receipt and decoded logs
 */
export async function withdraw(
  request: WithdrawRequest,
  networkCtx: DefaultNetworkConfig,
  accountOrWalletClient: ExpectedAccountOrWalletClient
): Promise<LitTxVoid> {
  const validatedRequest = withdrawSchema.parse(request);
  logger.debug({ validatedRequest });

  const { ledgerContract, publicClient } = createContractsManager(
    networkCtx,
    accountOrWalletClient
  );
  
  const hash = await callWithAdjustedOverrides(
    ledgerContract,
    'withdraw',
    [validatedRequest.amountInWei]
  );

  const receipt = await publicClient.waitForTransactionReceipt({ hash });

  const decodedLogs = await decodeLogs(
    receipt.logs,
    networkCtx,
    accountOrWalletClient
  );

  return { hash, receipt, decodedLogs };
} 