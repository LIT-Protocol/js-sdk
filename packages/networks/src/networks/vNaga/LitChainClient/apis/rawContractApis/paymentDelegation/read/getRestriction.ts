import { z } from 'zod';
import { logger } from '../../../../../../shared/logger';
import { DefaultNetworkConfig } from '../../../../../interfaces/NetworkContext';
import { createContractsManager } from '../../../../contract-manager/createContractsManager';
import { ExpectedAccountOrWalletClient } from '../../../../contract-manager/createContractsManager';

// Schema for validating the request
const getRestrictionSchema = z.object({
  payerAddress: z
    .string()
    .regex(/^0x[a-fA-F0-9]{40}$/, 'Invalid Ethereum address'),
});

export type GetRestrictionRequest = z.infer<typeof getRestrictionSchema>;

export interface Restriction {
  totalMaxPrice: bigint;
  requestsPerPeriod: bigint;
  periodSeconds: bigint;
}

/**
 * Get restriction for a payer from the PaymentDelegation contract
 * @param request - Object containing payerAddress
 * @param networkCtx - Network context for contract interactions
 * @param accountOrWalletClient - Account or wallet client for the transaction
 * @returns Restriction object
 */
export async function getRestriction(
  request: GetRestrictionRequest,
  networkCtx: DefaultNetworkConfig,
  accountOrWalletClient: ExpectedAccountOrWalletClient
): Promise<Restriction> {
  const validatedRequest = getRestrictionSchema.parse(request);
  logger.debug({ validatedRequest });

  const { paymentDelegationContract } = createContractsManager(
    networkCtx,
    accountOrWalletClient
  );

  const restriction = await paymentDelegationContract.read.getRestriction([
    validatedRequest.payerAddress,
  ]);
  return restriction;
}
