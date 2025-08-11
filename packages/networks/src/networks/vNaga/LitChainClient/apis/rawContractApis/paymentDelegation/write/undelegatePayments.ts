import { z } from 'zod';
import { logger } from '../../../../../../shared/logger';
import { DefaultNetworkConfig } from '../../../../../interfaces/NetworkContext';
import { createContractsManager } from '../../../../contract-manager/createContractsManager';
import { ExpectedAccountOrWalletClient } from '../../../../contract-manager/createContractsManager';
import { LitTxVoid } from '../../../types';
import { callWithAdjustedOverrides } from '../../../utils/callWithAdjustedOverrides';
import { decodeLogs } from '../../../utils/decodeLogs';

// Schema for validating the request
const undelegatePaymentsSchema = z.object({
  userAddress: z
    .string()
    .regex(/^0x[a-fA-F0-9]{40}$/, 'Invalid Ethereum address'),
});

export type UndelegatePaymentsRequest = z.infer<
  typeof undelegatePaymentsSchema
>;

/**
 * Undelegate payments from a user
 * @param request - Object containing userAddress
 * @param networkCtx - Network context for contract interactions
 * @param accountOrWalletClient - Account or wallet client for the transaction
 * @returns Transaction result with hash, receipt and decoded logs
 */
export async function undelegatePayments(
  request: UndelegatePaymentsRequest,
  networkCtx: DefaultNetworkConfig,
  accountOrWalletClient: ExpectedAccountOrWalletClient
): Promise<LitTxVoid> {
  const validatedRequest = undelegatePaymentsSchema.parse(request);
  logger.debug({ validatedRequest });

  const { paymentDelegationContract, publicClient } = createContractsManager(
    networkCtx,
    accountOrWalletClient
  );

  const hash = await callWithAdjustedOverrides(
    paymentDelegationContract,
    'undelegatePayments',
    [validatedRequest.userAddress]
  );

  const receipt = await publicClient.waitForTransactionReceipt({ hash });

  const decodedLogs = await decodeLogs(
    receipt.logs,
    networkCtx,
    accountOrWalletClient
  );

  return { hash, receipt, decodedLogs };
}
