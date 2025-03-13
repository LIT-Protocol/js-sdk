// import { networkContext } from "../../../_config";
import { z } from 'zod';
import { logger } from '../../../../../../../shared/logger';
import { toBigInt } from '../../../../../../../shared/utils/z-transformers';
import { NagaContext } from '../../../../../../types';
import { ScopeSchemaRaw } from '../../../../schemas/shared/ScopeSchema';
import { LitTxVoid } from '../../../types';
import { callWithAdjustedOverrides } from '../../../utils/callWithAdjustedOverrides';
import { createLitContracts } from '../../../utils/createLitContracts';
import { decodeLogs } from '../../../utils/decodeLogs';

const addPermittedAddressSchema = z.object({
  tokenId: toBigInt,
  address: z
    .string()
    .regex(/^0x[a-fA-F0-9]{40}$/)
    .transform((val): `0x${string}` => val as `0x${string}`),
  scopes: z.array(ScopeSchemaRaw),
});

type AddPermittedAddressRequest = z.input<typeof addPermittedAddressSchema>;

/**
 * Adds a permitted address to a PKP token
 * @param request - Object containing tokenId, address and scopes
 * @param networkCtx - Network context for the transaction
 * @returns Promise resolving to transaction details
 */
export async function addPermittedAddress(
  request: AddPermittedAddressRequest,
  networkCtx: NagaContext
): Promise<LitTxVoid> {
  const validatedRequest = addPermittedAddressSchema.parse(request);
  logger.debug({ validatedRequest });

  const { pkpPermissionsContract, pkpNftContract, publicClient, walletClient } =
    createLitContracts(networkCtx);

  pkpPermissionsContract.write.addPermittedAddress;

  const hash = await callWithAdjustedOverrides(
    pkpPermissionsContract,
    'addPermittedAddress',
    [
      validatedRequest.tokenId,
      validatedRequest.address,
      validatedRequest.scopes,
    ]
  );

  const receipt = await publicClient.waitForTransactionReceipt({ hash });

  const decodedLogs = await decodeLogs(receipt.logs, networkCtx);

  return { hash, receipt, decodedLogs };
}

// Example usage when running as main
// if (import.meta.main) {
//   const networkCtx = networkContext;

//   const res = await addPermittedAddress(
//     {
//       tokenId:
//         "76136736151863037541847315168980811654782785653773679312890341037699996601290",
//       address: "0x1234567890123456789012345678901234567890",
//       scopes: ["sign-anything"],
//     },
//     networkCtx
//   );

//   console.log("res", res);
// }
