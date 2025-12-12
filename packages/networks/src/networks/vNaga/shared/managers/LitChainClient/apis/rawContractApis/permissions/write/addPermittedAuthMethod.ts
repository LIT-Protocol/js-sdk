/**
 * addPermittedAuthMethod.ts
 *
 * Adds a permitted authentication method to a PKP token.
 * This allows the authentication method to control the PKP.
 */

import { toBigInt } from '../../../../../../../../shared/utils/z-transformers';
import { z } from 'zod';
import { logger } from '../../../../../../../../shared/logger';
import { DefaultNetworkConfig } from '../../../../../../../shared/interfaces/NetworkContext';
import {
  createContractsManager,
  ExpectedAccountOrWalletClient,
} from '../../../../../contract-manager/createContractsManager';
import { ScopeSchemaRaw } from '@lit-protocol/schemas';
import { LitTxVoid } from '../../../types';
import { callWithAdjustedOverrides } from '../../../utils/callWithAdjustedOverrides';
import { decodeLogs } from '../../../utils/decodeLogs';

const addPermittedAuthMethodSchema = z.object({
  tokenId: toBigInt,
  authMethodType: toBigInt,
  id: z.string(), // bytes in the ABI, handled as string (hex format)
  userPubkey: z.string(), // bytes in the ABI, handled as string (hex format)
  scopes: z.array(ScopeSchemaRaw),
});

type AddPermittedAuthMethodRequest = z.input<
  typeof addPermittedAuthMethodSchema
>;

/**
 * Adds a permitted authentication method to a PKP token
 * @param request - Object containing tokenId, authMethodType, id, userPubkey, and scopes
 * @param networkCtx - Network context for the transaction
 * @param accountOrWalletClient - Account or wallet client for signing
 * @returns Promise resolving to transaction details
 */
export async function addPermittedAuthMethod(
  request: AddPermittedAuthMethodRequest,
  networkCtx: DefaultNetworkConfig,
  accountOrWalletClient: ExpectedAccountOrWalletClient
): Promise<LitTxVoid> {
  const validatedRequest = addPermittedAuthMethodSchema.parse(request);
  logger.debug({ validatedRequest }, 'Adding permitted auth method');

  const { pkpPermissionsContract, publicClient } = createContractsManager(
    networkCtx,
    accountOrWalletClient
  );

  // Create the AuthMethod struct for the contract call
  const authMethod = {
    authMethodType: validatedRequest.authMethodType,
    id: validatedRequest.id,
    userPubkey: validatedRequest.userPubkey,
  };

  const hash = await callWithAdjustedOverrides(
    pkpPermissionsContract,
    'addPermittedAuthMethod',
    [validatedRequest.tokenId, authMethod, validatedRequest.scopes]
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

//   const res = await addPermittedAuthMethod(
//     {
//       tokenId:
//         '76136736151863037541847315168980811654782785653773679312890341037699996601290',
//       authMethodType: 1, // AuthMethodType.EthWallet
//       id: '0x1234567890abcdef1234567890abcdef12345678',
//       userPubkey: '0x04abcdef...',
//       scopes: ['sign-anything'],
//     },
//     networkContext,
//     accountOrWalletClient
//   );

//   console.log('res', res);
// }
