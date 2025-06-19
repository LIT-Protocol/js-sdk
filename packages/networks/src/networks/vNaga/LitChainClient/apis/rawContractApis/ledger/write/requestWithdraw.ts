import { z } from 'zod';
import { logger } from '../../../../../../shared/logger';
import { DefaultNetworkConfig } from '../../../../../interfaces/NetworkContext';
import { createContractsManager } from '../../../../contract-manager/createContractsManager';
import { ExpectedAccountOrWalletClient } from '../../../../contract-manager/createContractsManager';
import { LitTxVoid } from '../../../types';
import { callWithAdjustedOverrides } from '../../../utils/callWithAdjustedOverrides';
import { decodeLogs } from '../../../utils/decodeLogs';

// Schema for validating the request
const requestWithdrawSchema = z.object({
  amountInWei: z.bigint().positive('Amount must be positive'),
});

export type RequestWithdrawRequest = z.infer<typeof requestWithdrawSchema>;

/**
 * Request a withdrawal from the Ledger contract
 * @param request - Object containing amountInWei
 * @param networkCtx - Network context for contract interactions
 * @param accountOrWalletClient - Account or wallet client for the transaction
 * @returns Transaction result with hash, receipt and decoded logs
 */
export async function requestWithdraw(
  request: RequestWithdrawRequest,
  networkCtx: DefaultNetworkConfig,
  accountOrWalletClient: ExpectedAccountOrWalletClient
): Promise<LitTxVoid> {
  const validatedRequest = requestWithdrawSchema.parse(request);
  logger.debug({ validatedRequest });

  const { ledgerContract, publicClient } = createContractsManager(
    networkCtx,
    accountOrWalletClient
  );
  
  const hash = await callWithAdjustedOverrides(
    ledgerContract,
    'requestWithdraw',
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