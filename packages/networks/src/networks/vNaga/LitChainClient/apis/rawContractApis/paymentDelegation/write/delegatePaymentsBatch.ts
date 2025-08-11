import { z } from 'zod';
import { logger } from '../../../../../../shared/logger';
import { DefaultNetworkConfig } from '../../../../../interfaces/NetworkContext';
import { createContractsManager } from '../../../../contract-manager/createContractsManager';
import { ExpectedAccountOrWalletClient } from '../../../../contract-manager/createContractsManager';
import { LitTxVoid } from '../../../types';
import { callWithAdjustedOverrides } from '../../../utils/callWithAdjustedOverrides';
import { decodeLogs } from '../../../utils/decodeLogs';

// Schema for validating the request
const delegatePaymentsBatchSchema = z.object({
  userAddresses: z.array(
    z.string().regex(/^0x[a-fA-F0-9]{40}$/, 'Invalid Ethereum address')
  ),
});

export type DelegatePaymentsBatchRequest = z.infer<
  typeof delegatePaymentsBatchSchema
>;

/**
 * Delegate payments to multiple users in batch
 * @param request - Object containing array of userAddresses
 * @param networkCtx - Network context for contract interactions
 * @param accountOrWalletClient - Account or wallet client for the transaction
 * @returns Transaction result with hash, receipt and decoded logs
 */
export async function delegatePaymentsBatch(
  request: DelegatePaymentsBatchRequest,
  networkCtx: DefaultNetworkConfig,
  accountOrWalletClient: ExpectedAccountOrWalletClient
): Promise<LitTxVoid> {
  const validatedRequest = delegatePaymentsBatchSchema.parse(request);
  logger.debug({ validatedRequest });

  const { paymentDelegationContract, publicClient } = createContractsManager(
    networkCtx,
    accountOrWalletClient
  );

  const hash = await callWithAdjustedOverrides(
    paymentDelegationContract,
    'delegatePaymentsBatch',
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
