/**
 * addPermittedAuthMethodScope.ts
 *
 * Adds a permitted authentication method scope to a PKP token.
 * This allows specific authentication methods to have specific scopes/permissions.
 */

import { z } from 'zod';
import { logger } from '../../../../../../../../shared/logger';
import { toBigInt } from '../../../../../../../../shared/utils/z-transformers';
import { DefaultNetworkConfig } from '../../../../../../../shared/interfaces/NetworkContext';
import {
  createContractsManager,
  ExpectedAccountOrWalletClient,
} from '../../../../../contract-manager/createContractsManager';
import { LitTxVoid } from '../../../types';
import { callWithAdjustedOverrides } from '../../../utils/callWithAdjustedOverrides';
import { decodeLogs } from '../../../utils/decodeLogs';

const addPermittedAuthMethodScopeSchema = z.object({
  tokenId: toBigInt,
  authMethodType: toBigInt,
  id: z.string(), // bytes in the ABI, but we'll handle as string
  scopeId: toBigInt,
});

type AddPermittedAuthMethodScopeRequest = z.input<
  typeof addPermittedAuthMethodScopeSchema
>;

/**
 * Adds a permitted authentication method scope to a PKP token
 * @param request - Object containing tokenId, authMethodType, id, and scopeId
 * @param networkCtx - Network context for the transaction
 * @param accountOrWalletClient - Account or wallet client for signing
 * @returns Promise resolving to transaction details
 */
export async function addPermittedAuthMethodScope(
  request: AddPermittedAuthMethodScopeRequest,
  networkCtx: DefaultNetworkConfig,
  accountOrWalletClient: ExpectedAccountOrWalletClient
): Promise<LitTxVoid> {
  const validatedRequest = addPermittedAuthMethodScopeSchema.parse(request);
  logger.debug({ validatedRequest }, 'Adding permitted auth method scope');

  const { pkpPermissionsContract, publicClient } = createContractsManager(
    networkCtx,
    accountOrWalletClient
  );

  const hash = await callWithAdjustedOverrides(
    pkpPermissionsContract,
    'addPermittedAuthMethodScope',
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
//   const networkCtx = networkContext;

//   const res = await addPermittedAuthMethodScope(
//     {
//       tokenId: "76136736151863037541847315168980811654782785653773679312890341037699996601290",
//       authMethodType: 1, // AuthMethodType.EthWallet
//       id: "0x1234567890abcdef1234567890abcdef12345678",
//       scopeId: 1, // Example scope ID
//     },
//     networkCtx,
//     accountOrWalletClient
//   );

//   console.log("res", res);
// }
