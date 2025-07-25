/**
 * removePermittedAuthMethodScope.ts
 *
 * Removes a specific scope from a permitted authentication method for a PKP token.
 * This revokes the authentication method's ability to use a specific scope.
 */

import { z } from 'zod';
import { logger } from '../../../../../../shared/logger';
import { toBigInt } from '../../../../../../shared/utils/z-transformers';
import { DefaultNetworkConfig } from '../../../../../interfaces/NetworkContext';
import {
  createContractsManager,
  ExpectedAccountOrWalletClient,
} from '../../../../contract-manager/createContractsManager';
import { LitTxVoid } from '../../../types';
import { callWithAdjustedOverrides } from '../../../utils/callWithAdjustedOverrides';
import { decodeLogs } from '../../../utils/decodeLogs';

const removePermittedAuthMethodScopeSchema = z.object({
  tokenId: toBigInt,
  authMethodType: toBigInt,
  id: z.string(), // bytes in the ABI, handled as string (hex format)
  scopeId: toBigInt,
});

type RemovePermittedAuthMethodScopeRequest = z.input<
  typeof removePermittedAuthMethodScopeSchema
>;

/**
 * Removes a specific scope from a permitted authentication method for a PKP token
 * @param request - Object containing tokenId, authMethodType, id, and scopeId
 * @param networkCtx - Network context for the transaction
 * @param accountOrWalletClient - Account or wallet client for signing
 * @returns Promise resolving to transaction details
 */
export async function removePermittedAuthMethodScope(
  request: RemovePermittedAuthMethodScopeRequest,
  networkCtx: DefaultNetworkConfig,
  accountOrWalletClient: ExpectedAccountOrWalletClient
): Promise<LitTxVoid> {
  const validatedRequest = removePermittedAuthMethodScopeSchema.parse(request);
  logger.debug({ validatedRequest }, 'Removing permitted auth method scope');

  console.log('🔥 REMOVE PERMITTED AUTH METHOD SCOPE:', validatedRequest);

  const { pkpPermissionsContract, publicClient } = createContractsManager(
    networkCtx,
    accountOrWalletClient
  );

  const hash = await callWithAdjustedOverrides(
    pkpPermissionsContract,
    'removePermittedAuthMethodScope',
    [
      validatedRequest.tokenId,
      validatedRequest.authMethodType,
      validatedRequest.id,
      validatedRequest.scopeId,
    ]
  );

  const receipt = await publicClient.waitForTransactionReceipt({ hash });

  const decodedLogs = await decodeLogs(
    receipt.logs,
    networkCtx,
    accountOrWalletClient
  );

  return { hash, receipt, decodedLogs };
}

// Example usage when running as main
// if (import.meta.main) {
//   const networkCtx = await import('../../../../_config');
//   const { networkContext } = networkCtx;

//   const res = await removePermittedAuthMethodScope(
//     {
//       tokenId:
//         '76136736151863037541847315168980811654782785653773679312890341037699996601290',
//       authMethodType: 1, // AuthMethodType.EthWallet
//       id: '0x1234567890abcdef1234567890abcdef12345678',
//       scopeId: 1, // Scope.SignAnything
//     },
//     networkContext,
//     accountOrWalletClient
//   );

//   console.log('res', res);
// }
