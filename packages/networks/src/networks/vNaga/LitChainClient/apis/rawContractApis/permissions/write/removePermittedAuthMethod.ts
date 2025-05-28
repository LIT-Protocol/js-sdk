/**
 * removePermittedAuthMethod.ts
 *
 * Removes a permitted authentication method from a PKP token.
 * This revokes the authentication method's ability to control the PKP.
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

const removePermittedAuthMethodSchema = z.object({
  tokenId: toBigInt,
  authMethodType: toBigInt,
  id: z.string(), // bytes in the ABI, handled as string (hex format)
});

type RemovePermittedAuthMethodRequest = z.input<
  typeof removePermittedAuthMethodSchema
>;

/**
 * Removes a permitted authentication method from a PKP token
 * @param request - Object containing tokenId, authMethodType, and id
 * @param networkCtx - Network context for the transaction
 * @param accountOrWalletClient - Account or wallet client for signing
 * @returns Promise resolving to transaction details
 */
export async function removePermittedAuthMethod(
  request: RemovePermittedAuthMethodRequest,
  networkCtx: DefaultNetworkConfig,
  accountOrWalletClient: ExpectedAccountOrWalletClient
): Promise<LitTxVoid> {
  const validatedRequest = removePermittedAuthMethodSchema.parse(request);
  logger.debug({ validatedRequest }, 'Removing permitted auth method');

  console.log('🔥 REMOVE PERMITTED AUTH METHOD:', validatedRequest);

  const { pkpPermissionsContract, publicClient } = createContractsManager(
    networkCtx,
    accountOrWalletClient
  );

  const hash = await callWithAdjustedOverrides(
    pkpPermissionsContract,
    'removePermittedAuthMethod',
    [
      validatedRequest.tokenId,
      validatedRequest.authMethodType,
      validatedRequest.id,
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

//   const res = await removePermittedAuthMethod(
//     {
//       tokenId:
//         '76136736151863037541847315168980811654782785653773679312890341037699996601290',
//       authMethodType: 1, // AuthMethodType.EthWallet
//       id: '0x1234567890abcdef1234567890abcdef12345678',
//     },
//     networkContext,
//     accountOrWalletClient
//   );

//   console.log('res', res);
// }
