// import { networkContext } from "../../../_config";
import { NagaContext } from "services/lit/LitNetwork/vNaga/types";
import { toBigInt } from "services/lit/utils/z-transformers";
import { logger } from "utils/logger";
import { z } from "zod";
import { LitTxVoid } from "../../../types";
import { callWithAdjustedOverrides } from "../../../utils/callWithAdjustedOverrides";
import { createLitContracts } from "../../../utils/createLitContracts";
import { decodeLogs } from "../../../utils/decodeLogs";

const removePermittedAddressSchema = z.object({
  tokenId: toBigInt,
  address: z
    .string()
    .regex(/^0x[a-fA-F0-9]{40}$/)
    .transform((val): `0x${string}` => val as `0x${string}`),
});

type RemovePermittedAddressRequest = z.input<
  typeof removePermittedAddressSchema
>;

/**
 * Removes a permitted address from a PKP token
 * @param request - Object containing tokenId and address
 * @param networkCtx - Network context for the transaction
 * @returns Promise resolving to transaction details
 */
export async function removePermittedAddress(
  request: RemovePermittedAddressRequest,
  networkCtx: NagaContext
): Promise<LitTxVoid> {
  const validatedRequest = removePermittedAddressSchema.parse(request);
  logger.debug({ validatedRequest });

  const { pkpPermissionsContract, pkpNftContract, publicClient, walletClient } =
    createLitContracts(networkCtx);

  const hash = await callWithAdjustedOverrides(
    pkpPermissionsContract,
    "removePermittedAddress",
    [validatedRequest.tokenId, validatedRequest.address]
  );

  const receipt = await publicClient.waitForTransactionReceipt({ hash });

  const decodedLogs = await decodeLogs(receipt.logs, networkCtx);

  return { hash, receipt, decodedLogs };
}

// Example usage when running as main
// if (import.meta.main) {
//   const networkCtx = networkContext;

//   const res = await removePermittedAddress(
//     {
//       tokenId:
//         "76136736151863037541847315168980811654782785653773679312890341037699996601290",
//       address: "0x1234567890123456789012345678901234567890",
//     },
//     networkCtx
//   );

//   console.log("res", res);
// }
