import { z } from 'zod';
import { logger } from '../../../../../../../../shared/logger';
import { DefaultNetworkConfig } from '../../../../../../../shared/interfaces/NetworkContext';
import { createContractsManager } from '../../../../../contract-manager/createContractsManager';
import { ExpectedAccountOrWalletClient } from '../../../../../contract-manager/createContractsManager';
import { LitTxVoid } from '../../../types';
import { callWithAdjustedOverrides } from '../../../utils/callWithAdjustedOverrides';
import { decodeLogs } from '../../../utils/decodeLogs';

// Schema for validating the request
const depositForUserSchema = z.object({
  userAddress: z
    .string()
    .regex(/^0x[a-fA-F0-9]{40}$/, 'Invalid Ethereum address'),
  amountInWei: z.bigint().positive('Amount must be positive'),
});

export type DepositForUserRequest = z.infer<typeof depositForUserSchema>;

/**
 * Deposit funds for another user to the Ledger contract
 * @param request - Object containing userAddress and amountInWei
 * @param networkCtx - Network context for contract interactions
 * @param accountOrWalletClient - Account or wallet client for the transaction
 * @returns Transaction result with hash, receipt and decoded logs
 */
export async function depositForUser(
  request: DepositForUserRequest,
  networkCtx: DefaultNetworkConfig,
  accountOrWalletClient: ExpectedAccountOrWalletClient
): Promise<LitTxVoid> {
  const validatedRequest = depositForUserSchema.parse(request);
  logger.debug({ validatedRequest });

  const { ledgerContract, publicClient } = createContractsManager(
    networkCtx,
    accountOrWalletClient
  );

  const hash = await callWithAdjustedOverrides(
    ledgerContract,
    'depositForUser',
    [validatedRequest.userAddress],
    { value: validatedRequest.amountInWei }
  );

  const receipt = await publicClient.waitForTransactionReceipt({ hash });

  const decodedLogs = await decodeLogs(
    receipt.logs,
    networkCtx,
    accountOrWalletClient
  );

  return { hash, receipt, decodedLogs };
}
