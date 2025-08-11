import { logger } from '../../../../../../shared/logger';
import { DefaultNetworkConfig } from '../../../../../interfaces/NetworkContext';
import { createContractsManager } from '../../../../contract-manager/createContractsManager';
import { ExpectedAccountOrWalletClient } from '../../../../contract-manager/createContractsManager';

/**
 * Get user withdraw delay from the Ledger contract
 * @param networkCtx - Network context for contract interactions
 * @param accountOrWalletClient - Account or wallet client for the transaction
 * @returns The withdraw delay in seconds as a bigint
 */
export async function getUserWithdrawDelay(
  networkCtx: DefaultNetworkConfig,
  accountOrWalletClient: ExpectedAccountOrWalletClient
): Promise<bigint> {
  logger.debug('Getting user withdraw delay');

  const { ledgerContract } = createContractsManager(
    networkCtx,
    accountOrWalletClient
  );

  const delay = await ledgerContract.read.userWithdrawDelay();
  return delay;
}
