import { z } from 'zod';
import { logger } from '../../../../../../../../shared/logger';
import { DefaultNetworkConfig } from '../../../../../../../shared/interfaces/NetworkContext';
import { createContractsManager } from '../../../../../contract-manager/createContractsManager';
import { ExpectedAccountOrWalletClient } from '../../../../../contract-manager/createContractsManager';
import { LitTxVoid } from '../../../types';
import { callWithAdjustedOverrides } from '../../../utils/callWithAdjustedOverrides';
import { decodeLogs } from '../../../utils/decodeLogs';

// Schema for validating the request
const undelegatePaymentsBatchSchema = z.object({
  userAddresses: z.array(
    z.string().regex(/^0x[a-fA-F0-9]{40}$/, 'Invalid Ethereum address')
  ),
});

export type UndelegatePaymentsBatchRequest = z.infer<
  typeof undelegatePaymentsBatchSchema
>;

/**
 * Undelegate payments from multiple users in batch
 * @param request - Object containing array of userAddresses
 * @param networkCtx - Network context for contract interactions
 * @param accountOrWalletClient - Account or wallet client for the transaction
 * @returns Transaction result with hash, receipt and decoded logs
 */
export async function undelegatePaymentsBatch(
  request: UndelegatePaymentsBatchRequest,
  networkCtx: DefaultNetworkConfig,
  accountOrWalletClient: ExpectedAccountOrWalletClient
): Promise<LitTxVoid> {
  const validatedRequest = undelegatePaymentsBatchSchema.parse(request);
  logger.debug({ validatedRequest });

  const { paymentDelegationContract, publicClient } = createContractsManager(
    networkCtx,
    accountOrWalletClient
  );

  const hash = await callWithAdjustedOverrides(
    paymentDelegationContract,
    'undelegatePaymentsBatch',
    [validatedRequest.userAddresses]
  );

  const receipt = await publicClient.waitForTransactionReceipt({ hash });

  const decodedLogs = await decodeLogs(
    receipt.logs,
    networkCtx,
    accountOrWalletClient
  );

  return { hash, receipt, decodedLogs };
}
