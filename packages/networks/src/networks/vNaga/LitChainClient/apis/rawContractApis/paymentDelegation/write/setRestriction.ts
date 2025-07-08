import { z } from 'zod';
import { logger } from '../../../../../../shared/logger';
import { DefaultNetworkConfig } from '../../../../../interfaces/NetworkContext';
import { createContractsManager } from '../../../../contract-manager/createContractsManager';
import { ExpectedAccountOrWalletClient } from '../../../../contract-manager/createContractsManager';
import { LitTxVoid } from '../../../types';
import { callWithAdjustedOverrides } from '../../../utils/callWithAdjustedOverrides';
import { decodeLogs } from '../../../utils/decodeLogs';

// Schema for validating the request
const setRestrictionSchema = z.object({
  restriction: z.object({
    totalMaxPrice: z.bigint(),
    requestsPerPeriod: z.bigint(),
    periodSeconds: z.bigint(),
  }),
});

export type SetRestrictionRequest = z.infer<typeof setRestrictionSchema>;

/**
 * Set payment restriction for the caller
 * @param request - Object containing restriction parameters
 * @param networkCtx - Network context for contract interactions
 * @param accountOrWalletClient - Account or wallet client for the transaction
 * @returns Transaction result with hash, receipt and decoded logs
 */
export async function setRestriction(
  request: SetRestrictionRequest,
  networkCtx: DefaultNetworkConfig,
  accountOrWalletClient: ExpectedAccountOrWalletClient
): Promise<LitTxVoid> {
  const validatedRequest = setRestrictionSchema.parse(request);
  logger.debug({ validatedRequest });

  const { paymentDelegationContract, publicClient } = createContractsManager(
    networkCtx,
    accountOrWalletClient
  );
  
  const hash = await callWithAdjustedOverrides(
    paymentDelegationContract,
    'setRestriction',
    [validatedRequest.restriction]
  );

  const receipt = await publicClient.waitForTransactionReceipt({ hash });

  const decodedLogs = await decodeLogs(
    receipt.logs,
    networkCtx,
    accountOrWalletClient
  );

  return { hash, receipt, decodedLogs };
}